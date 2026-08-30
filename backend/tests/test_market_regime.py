from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.market.provider import DEFAULT_DEMO, YFinanceMarketDataProvider
from app.ml.market_regime.inference import MarketRegimeService
from app.ml.market_regime.features import FEATURE_NAMES, engineer_features
from ml.market_regime.fixtures.create_demo_fixture import create_demo_history
from ml.market_regime.features import engineer_features as engineer_training_features
from ml.market_regime.training.train_model import train

client = TestClient(app)


@pytest.fixture(scope="module")
def demo_prices() -> pd.DataFrame:
    return create_demo_history()


@pytest.fixture(scope="module")
def trained_market_artifacts(tmp_path_factory: pytest.TempPathFactory, demo_prices: pd.DataFrame) -> Path:
    artifact_dir = tmp_path_factory.mktemp("market-artifacts")
    train(demo_prices, artifact_dir, "Deterministic automated-test fixture")
    return artifact_dir


def test_feature_formulas(demo_prices: pd.DataFrame) -> None:
    features = engineer_features(demo_prices)
    latest = features.iloc[-1]
    close = demo_prices["Close"]
    daily = close.pct_change(fill_method=None)
    assert latest["return_5d"] == pytest.approx(close.iloc[-1] / close.iloc[-6] - 1)
    assert latest["return_21d"] == pytest.approx(close.iloc[-1] / close.iloc[-22] - 1)
    assert latest["return_63d"] == pytest.approx(close.iloc[-1] / close.iloc[-64] - 1)
    assert latest["volatility_21d"] == pytest.approx(daily.iloc[-21:].std(ddof=0) * np.sqrt(252))
    assert latest["distance_ma_200d"] == pytest.approx(close.iloc[-1] / close.iloc[-200:].mean() - 1)
    assert latest["max_drawdown_63d"] == pytest.approx(close.iloc[-1] / close.iloc[-63:].max() - 1)
    assert latest["positive_days_21d"] == pytest.approx((daily.iloc[-21:] > 0).mean())


def test_features_are_deterministic_and_have_no_lookahead(demo_prices: pd.DataFrame) -> None:
    first = engineer_features(demo_prices)
    second = engineer_features(demo_prices)
    pd.testing.assert_frame_equal(first, second)
    cutoff = 400
    prefix = engineer_features(demo_prices.iloc[:cutoff])
    full_at_cutoff = first[first["Date"] <= demo_prices.iloc[cutoff - 1]["Date"]]
    pd.testing.assert_series_equal(prefix.iloc[-1][FEATURE_NAMES], full_at_cutoff.iloc[-1][FEATURE_NAMES], check_names=False)
    pd.testing.assert_frame_equal(first, engineer_training_features(demo_prices))


def test_model_training_and_artifact_loading(trained_market_artifacts: Path) -> None:
    service = MarketRegimeService(trained_market_artifacts, YFinanceMarketDataProvider(demo_path=DEFAULT_DEMO))
    assert service.pipeline is not None
    assert service.metadata is not None
    assert 3 <= service.metadata["selected_cluster_count"] <= 6
    assert service.metadata["feature_names"] == FEATURE_NAMES


def test_demo_prediction_structure_and_similarity(trained_market_artifacts: Path) -> None:
    result = MarketRegimeService(trained_market_artifacts).predict_latest("demo")
    assert result.available is True
    assert result.data_mode == "demo"
    assert result.regime
    assert result.cluster_id is not None
    assert result.similarity_score is not None and 0 <= result.similarity_score <= 1
    assert len(result.key_characteristics) == 3
    assert set(result.latest_features) == set(FEATURE_NAMES)


def test_live_provider_failure_falls_back_to_labeled_demo(tmp_path: Path, monkeypatch) -> None:
    provider = YFinanceMarketDataProvider(cache_path=tmp_path / "missing.csv", demo_path=DEFAULT_DEMO)
    monkeypatch.setattr(provider, "_download", lambda: (_ for _ in ()).throw(RuntimeError("offline")))
    result = provider.get("live")
    assert result.data_mode == "demo"
    assert "demo" in result.source.lower()


def test_missing_artifact_is_safe(tmp_path: Path) -> None:
    result = MarketRegimeService(tmp_path / "missing").predict_latest("demo")
    assert result.available is False
    assert result.data_mode == "demo"
    assert any("artifact" in item.lower() for item in result.limitations)


def test_market_api_demo_and_validation() -> None:
    response = client.get("/api/v1/market/regime?mode=demo")
    assert response.status_code == 200
    assert response.json()["data_mode"] == "demo"
    assert client.get("/api/v1/market/regime?mode=invalid").status_code == 422


def test_profile_analysis_is_independent_of_market_service(monkeypatch) -> None:
    monkeypatch.setattr("app.ml.market_regime.inference.get_market_regime", lambda mode: (_ for _ in ()).throw(RuntimeError("market unavailable")))
    from tests.test_profile import HEALTHY_PROFILE
    response = client.post("/api/v1/profile/analyze", json=HEALTHY_PROFILE)
    assert response.status_code == 200
    assert response.json()["metrics"]["investable_surplus"] == 115000
