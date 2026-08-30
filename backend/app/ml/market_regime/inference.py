import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.market.provider import SYMBOL, YFinanceMarketDataProvider
from app.schemas.market import MarketRegimeResponse
from app.ml.market_regime.features import engineer_features

MODEL_NAME = "market-regime-kmeans"
ROOT = Path(__file__).resolve().parents[4]
DEFAULT_ARTIFACT_DIR = ROOT / "ml" / "market_regime" / "artifacts"
LIMITATIONS = [
    "This is historical pattern classification, not a market forecast.",
    "It does not recommend buying, selling, selecting securities, or changing allocation.",
    "Regimes simplify continuous market behavior and may change as new data arrives.",
]


class MarketRegimeService:
    def __init__(self, artifact_dir: Path = DEFAULT_ARTIFACT_DIR, provider: YFinanceMarketDataProvider | None = None) -> None:
        self.provider = provider or YFinanceMarketDataProvider()
        self.pipeline: Any | None = None
        self.metadata: dict[str, Any] | None = None
        self.load_error: str | None = None
        try:
            self.metadata = json.loads((artifact_dir / "market_regime_metadata.json").read_text())
            self.pipeline = joblib.load(artifact_dir / "market_regime_pipeline.joblib")
            if list(self.pipeline.feature_names_in_) != list(self.metadata["feature_names"]):
                raise ValueError("Artifact feature order does not match metadata")
        except Exception as exc:
            self.pipeline = None
            self.metadata = None
            self.load_error = str(exc)

    def predict_latest(self, mode: str = "live") -> MarketRegimeResponse:
        now = datetime.now(timezone.utc).isoformat()
        try:
            market = self.provider.get(mode)
        except Exception as exc:
            return self._unavailable(now, f"Market data unavailable: {exc}")
        if self.pipeline is None or self.metadata is None:
            return self._unavailable(now, f"Model artifact unavailable: {self.load_error}", market.data_mode, market.source, market.latest_market_date)
        try:
            engineered = engineer_features(market.prices)
            if engineered.empty:
                raise ValueError("Insufficient trailing history for 200-day features")
            ordered = list(self.metadata["feature_names"])
            latest = engineered.iloc[-1]
            row = pd.DataFrame([[latest[name] for name in ordered]], columns=ordered)
            cluster = int(self.pipeline.predict(row)[0])
            transformed = self.pipeline[:-1].transform(row)[0]
            center = self.pipeline.named_steps["kmeans"].cluster_centers_[cluster]
            distance = float(np.linalg.norm(transformed - center))
            radius = max(float(self.metadata["cluster_distance_p95"][str(cluster)]), 1e-9)
            similarity = round(max(0.0, min(1.0, 1 - distance / (1.5 * radius))), 4)
            regime = self.metadata["regime_by_cluster"][str(cluster)]
            features = {name: round(float(latest[name]), 8) for name in ordered}
            limitations = [*LIMITATIONS]
            if mode == "live" and market.data_mode != "live":
                limitations.append(f"Live retrieval was unavailable; clearly labeled {market.data_mode} data was used instead.")
            return MarketRegimeResponse(available=True, model_name=MODEL_NAME, model_version=self.metadata["model_version"], symbol=SYMBOL, index_name="NIFTY 50", regime=regime, cluster_id=cluster, similarity_score=similarity, as_of=market.retrieval_timestamp, data_mode=market.data_mode, source=market.source, latest_market_date=market.latest_market_date, key_characteristics=_characteristics(features), interpretation=_interpretation(regime), limitations=limitations, latest_features=features)
        except Exception as exc:
            return self._unavailable(now, f"Market regime inference unavailable: {exc}", market.data_mode, market.source, market.latest_market_date)

    def _unavailable(self, now: str, reason: str, mode: str = "unavailable", source: str = "Unavailable", latest: str | None = None) -> MarketRegimeResponse:
        return MarketRegimeResponse(available=False, model_name=MODEL_NAME, model_version=self.metadata.get("model_version") if self.metadata else None, symbol=SYMBOL, index_name="NIFTY 50", regime=None, cluster_id=None, similarity_score=None, as_of=now, data_mode=mode, source=source, latest_market_date=latest, key_characteristics=[], interpretation="Broad-market context is currently unavailable; your financial profile remains unaffected.", limitations=[*LIMITATIONS, reason], latest_features={})


def _characteristics(features: dict[str, float]) -> list[str]:
    candidates = [
        (abs(features["return_63d"]), "Medium-term momentum is positive" if features["return_63d"] >= 0 else "Medium-term momentum is negative"),
        (features["volatility_63d"], "Recent volatility is elevated" if features["volatility_63d"] >= 0.20 else "Recent volatility is moderate"),
        (abs(features["distance_ma_200d"]), "The index is above its 200-day average" if features["distance_ma_200d"] >= 0 else "The index is below its 200-day average"),
        (abs(features["max_drawdown_63d"]), "The index remains below its recent peak" if features["max_drawdown_63d"] < -0.03 else "Recent drawdown is limited"),
        (abs(features["positive_days_21d"] - .5), "Positive days have recently been more consistent" if features["positive_days_21d"] >= .5 else "Positive days have recently been less consistent"),
    ]
    return [text for _, text in sorted(candidates, key=lambda item: -item[0])[:3]]


def _interpretation(regime: str) -> str:
    descriptions = {
        "Stable Growth": "Recent broad-market behavior most closely resembles a positive, comparatively stable growth regime.",
        "Volatile Growth": "Recent broad-market behavior most closely resembles positive momentum accompanied by elevated variability.",
        "Sideways / Low Momentum": "Recent broad-market behavior most closely resembles a sideways environment with limited momentum.",
        "Defensive / High-Volatility Decline": "Recent broad-market behavior most closely resembles a defensive environment with weaker momentum and elevated volatility.",
        "Recovery / Improving Momentum": "Recent broad-market behavior most closely resembles an improving-momentum transition.",
        "Mixed / Transition": "Recent broad-market behavior most closely resembles a mixed transitional environment.",
    }
    return descriptions.get(regime, "Recent broad-market indicators most closely resemble this historical cluster.")


_service: MarketRegimeService | None = None


def get_market_regime(mode: str = "live") -> MarketRegimeResponse:
    global _service
    if _service is None:
        _service = MarketRegimeService()
    return _service.predict_latest(mode)
