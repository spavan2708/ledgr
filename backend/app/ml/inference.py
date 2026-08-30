import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.schemas.profile import MLPersona, ModelFeatures

MODEL_NAME = "financial-persona-kmeans"
LIMITATIONS = [
    "Prototype model trained on synthetic profiles",
    "Not validated for real-world financial advice",
    "Pattern classification only; deterministic safeguards remain authoritative",
]
DEFAULT_ARTIFACT_DIR = Path(__file__).resolve().parents[3] / "ml" / "artifacts"


def unavailable_persona(reason: str = "ML model artifact is unavailable") -> MLPersona:
    return MLPersona(available=False, model_name=MODEL_NAME, model_version=None, persona=None, cluster_id=None, similarity_score=None, key_characteristics=[], limitations=[*LIMITATIONS, reason])


class FinancialPersonaService:
    def __init__(self, artifact_dir: Path = DEFAULT_ARTIFACT_DIR) -> None:
        self.artifact_dir = artifact_dir
        self.pipeline: Any | None = None
        self.metadata: dict[str, Any] | None = None
        self.load_error: str | None = None
        self._load()

    def _load(self) -> None:
        try:
            metadata = json.loads((self.artifact_dir / "financial_persona_metadata.json").read_text())
            pipeline = joblib.load(self.artifact_dir / "financial_persona_pipeline.joblib")
            if list(metadata["feature_names"]) != list(pipeline.feature_names_in_):
                raise ValueError("Artifact feature order does not match metadata")
            self.metadata = metadata
            self.pipeline = pipeline
        except (FileNotFoundError, KeyError, ValueError, OSError, json.JSONDecodeError) as exc:
            self.load_error = str(exc)

    @property
    def available(self) -> bool:
        return self.pipeline is not None and self.metadata is not None

    def predict(self, features: ModelFeatures) -> MLPersona:
        if not self.available or self.pipeline is None or self.metadata is None:
            return unavailable_persona(self.load_error or "ML model artifact is unavailable")
        ordered = list(self.metadata["feature_names"])
        feature_values = features.model_dump()
        if set(ordered) != set(feature_values):
            return unavailable_persona("ML feature schema does not match the trained artifact")
        row_values = np.array([feature_values[name] if feature_values[name] is not None else np.nan for name in ordered], dtype=float)
        row = pd.DataFrame([row_values], columns=ordered)
        cluster_id = int(self.pipeline.predict(row)[0])
        transformed = self.pipeline[:-1].transform(row)
        centroid = self.pipeline.named_steps["kmeans"].cluster_centers_[cluster_id]
        distance = float(np.linalg.norm(transformed[0] - centroid))
        radius = max(float(self.metadata["cluster_distance_p95"][str(cluster_id)]), 1e-9)
        similarity = round(max(0.0, min(1.0, 1.0 - distance / (radius * 1.5))), 4)
        return MLPersona(
            available=True,
            model_name=MODEL_NAME,
            model_version=self.metadata["model_version"],
            persona=self.metadata["persona_by_cluster"][str(cluster_id)],
            cluster_id=cluster_id,
            similarity_score=similarity,
            key_characteristics=_characteristics(ordered, row_values, self.metadata["centroids"][str(cluster_id)]),
            limitations=LIMITATIONS,
        )


def _characteristics(feature_names: list[str], values: np.ndarray, centroid: dict[str, float]) -> list[str]:
    descriptions = {
        "savings_ratio": ("Strong monthly savings pattern", "Limited monthly savings pattern"),
        "expense_ratio": ("Higher essential-expense share", "Lower essential-expense share"),
        "debt_service_ratio": ("Higher recurring debt burden", "Lower recurring debt burden"),
        "debt_to_asset_ratio": ("Higher liabilities relative to assets", "Lower liabilities relative to assets"),
        "solvency_ratio": ("Stronger asset-backed solvency", "Limited asset-backed solvency"),
        "liquidity_months": ("Stronger liquid-asset coverage", "Limited liquid-asset coverage"),
        "emergency_fund_months": ("Stronger emergency reserve pattern", "Limited emergency reserve pattern"),
        "income_stability": ("More stable income pattern", "More variable income pattern"),
        "dependents": ("Higher dependent responsibilities", "Lower dependent responsibilities"),
        "investment_horizon_years": ("Longer investment horizon", "Shorter investment horizon"),
        "volatility_comfort": ("Higher volatility comfort", "Lower volatility comfort"),
        "investment_experience": ("More investing experience", "Limited investing experience"),
    }
    candidates: list[tuple[float, str]] = []
    for index, name in enumerate(feature_names):
        value = values[index]
        if np.isnan(value):
            value = float(centroid[name])
        centroid_value = float(centroid[name])
        # Rank characteristics that are both distinctive for the learned
        # centroid and closely matched by this profile.
        contribution = 0.65 * (1 - abs(float(value) - centroid_value)) + 0.35 * abs(centroid_value - 0.5)
        direction_value = (float(value) + centroid_value) / 2
        candidates.append((contribution, descriptions[name][0 if direction_value >= 0.5 else 1]))
    candidates.sort(key=lambda item: (-item[0], item[1]))
    return [description for _, description in candidates[:3]]


_persona_service: FinancialPersonaService | None = None


def get_persona_service() -> FinancialPersonaService:
    global _persona_service
    if _persona_service is None:
        _persona_service = FinancialPersonaService()
    return _persona_service


def predict_persona(features: ModelFeatures) -> MLPersona:
    try:
        return get_persona_service().predict(features)
    except Exception as exc:  # ML must never prevent deterministic analysis.
        return unavailable_persona(f"ML inference failed: {exc}")
