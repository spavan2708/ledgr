from pathlib import Path

import numpy as np
import pytest

from app.ml.inference import FinancialPersonaService
from app.schemas.profile import ModelFeatures
from ml.training.generate_data import FEATURE_NAMES, RANDOM_SEED, generate_synthetic_profiles
from ml.training.train_model import train


@pytest.fixture(scope="module")
def trained_artifacts(tmp_path_factory: pytest.TempPathFactory) -> Path:
    artifact_dir = tmp_path_factory.mktemp("persona-artifacts")
    train(generate_synthetic_profiles(rows=5000, seed=RANDOM_SEED), artifact_dir)
    return artifact_dir


def test_synthetic_generation_is_reproducible() -> None:
    first = generate_synthetic_profiles(rows=5000, seed=RANDOM_SEED)
    second = generate_synthetic_profiles(rows=5000, seed=RANDOM_SEED)
    assert first.equals(second)


def test_synthetic_features_and_bounds() -> None:
    data = generate_synthetic_profiles(rows=5000)
    assert list(data.columns) == [*FEATURE_NAMES, "archetype_label"]
    values = data[FEATURE_NAMES].to_numpy()
    assert np.nanmin(values) >= 0
    assert np.nanmax(values) <= 1
    assert len(data) >= 5000


def test_training_and_artifact_loading(trained_artifacts: Path) -> None:
    service = FinancialPersonaService(trained_artifacts)
    assert service.available
    assert service.metadata is not None
    assert 3 <= service.metadata["selected_cluster_count"] <= 7
    assert service.metadata["feature_names"] == FEATURE_NAMES


def test_prediction_structure_and_similarity(trained_artifacts: Path) -> None:
    service = FinancialPersonaService(trained_artifacts)
    result = service.predict(_features())
    assert result.available is True
    assert result.persona
    assert result.cluster_id is not None
    assert result.model_version == "1.0.0"
    assert result.similarity_score is not None and 0 <= result.similarity_score <= 1
    assert len(result.key_characteristics) == 3
    assert result.limitations


def test_null_features_are_imputed(trained_artifacts: Path) -> None:
    features = _features()
    features.savings_ratio = None
    features.liquidity_months = None
    result = FinancialPersonaService(trained_artifacts).predict(features)
    assert result.available is True
    assert result.persona


def test_missing_artifact_returns_unavailable_without_failure(tmp_path: Path) -> None:
    result = FinancialPersonaService(tmp_path / "missing").predict(_features())
    assert result.available is False
    assert result.persona is None
    assert any("unavailable" in item.lower() or "no such file" in item.lower() for item in result.limitations)


def _features() -> ModelFeatures:
    return ModelFeatures(savings_ratio=0.55, expense_ratio=0.40, debt_service_ratio=0.18, debt_to_asset_ratio=0.25, solvency_ratio=0.75, liquidity_months=0.55, emergency_fund_months=0.50, income_stability=0.8, dependents=0.1, investment_horizon_years=0.6, volatility_comfort=0.6, investment_experience=0.5)
