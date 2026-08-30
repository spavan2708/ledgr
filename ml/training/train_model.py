import argparse
import json
from itertools import permutations
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import adjusted_rand_score, calinski_harabasz_score, davies_bouldin_score, silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ml.training.generate_data import FEATURE_NAMES, RANDOM_SEED, generate_synthetic_profiles

MODEL_VERSION = "1.0.0"
MODEL_NAME = "financial-persona-kmeans"


def build_pipeline(cluster_count: int, seed: int = RANDOM_SEED) -> Pipeline:
    preprocessing = ColumnTransformer([("numeric", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), FEATURE_NAMES)], verbose_feature_names_out=False)
    return Pipeline([("preprocessing", preprocessing), ("kmeans", KMeans(n_clusters=cluster_count, random_state=seed, n_init=20))])


def evaluate_candidates(features: pd.DataFrame, seed: int = RANDOM_SEED) -> tuple[int, dict[str, dict[str, float]]]:
    evaluations: dict[str, dict[str, float]] = {}
    for clusters in range(3, 8):
        pipeline = build_pipeline(clusters, seed)
        labels = pipeline.fit_predict(features)
        transformed = pipeline[:-1].transform(features)
        evaluations[str(clusters)] = {
            "silhouette_score": round(float(silhouette_score(transformed, labels, sample_size=min(2000, len(features)), random_state=seed)), 6),
            "davies_bouldin_score": round(float(davies_bouldin_score(transformed, labels)), 6),
            "calinski_harabasz_score": round(float(calinski_harabasz_score(transformed, labels)), 6),
        }
    # Deterministic rank aggregation: highest silhouette and Calinski–Harabasz,
    # plus lowest Davies–Bouldin. Ties favor silhouette, then smaller k.
    candidates = list(range(3, 8))
    silhouette_rank = {k: rank for rank, k in enumerate(sorted(candidates, key=lambda k: (-evaluations[str(k)]["silhouette_score"], k)))}
    davies_rank = {k: rank for rank, k in enumerate(sorted(candidates, key=lambda k: (evaluations[str(k)]["davies_bouldin_score"], k)))}
    calinski_rank = {k: rank for rank, k in enumerate(sorted(candidates, key=lambda k: (-evaluations[str(k)]["calinski_harabasz_score"], k)))}
    selected = min(candidates, key=lambda k: (silhouette_rank[k] + davies_rank[k] + calinski_rank[k], -evaluations[str(k)]["silhouette_score"], k))
    return selected, evaluations


def _centroids_original_scale(pipeline: Pipeline) -> np.ndarray:
    scaler = pipeline.named_steps["preprocessing"].named_transformers_["numeric"].named_steps["scaler"]
    return scaler.inverse_transform(pipeline.named_steps["kmeans"].cluster_centers_)


def assign_persona_names(centroids: np.ndarray) -> dict[str, str]:
    index = {name: position for position, name in enumerate(FEATURE_NAMES)}
    definitions = {
        "Liquidity-Constrained Planner": lambda c: (1-c[index["liquidity_months"]]) + (1-c[index["emergency_fund_months"]]),
        "Debt-Priority Rebuilder": lambda c: 1.2 * (c[index["debt_service_ratio"]] + c[index["debt_to_asset_ratio"]] + (1-c[index["solvency_ratio"]])),
        "Balanced Wealth Builder": lambda c: 1 - np.mean(np.abs(c - 0.55)),
        "Long-Horizon Growth Builder": lambda c: c[index["savings_ratio"]] + c[index["investment_horizon_years"]] + c[index["volatility_comfort"]] + c[index["investment_experience"]],
        "High-Income Low-Savings Planner": lambda c: (1-c[index["savings_ratio"]]) + c[index["expense_ratio"]] + c[index["income_stability"]],
        "Early-Stage Foundation Builder": lambda c: (1-c[index["investment_experience"]]) + (1-c[index["solvency_ratio"]]) + (1-c[index["savings_ratio"]]),
        "Resilient Conservative Saver": lambda c: c[index["liquidity_months"]] + c[index["emergency_fund_months"]] + c[index["income_stability"]] + (1-c[index["volatility_comfort"]]),
    }
    core_names = ["Liquidity-Constrained Planner", "Debt-Priority Rebuilder", "Balanced Wealth Builder", "Long-Horizon Growth Builder", "High-Income Low-Savings Planner"]
    names = sorted(core_names if len(centroids) <= 5 else [*core_names, "Early-Stage Foundation Builder"] if len(centroids) == 6 else list(definitions))
    # Exhaustively maximize the total centroid/name fit (at most 7! options).
    # This avoids arbitrary cluster IDs and avoids greedy assignment conflicts.
    best_names = max(
        permutations(names, len(centroids)),
        key=lambda assignment: (
            sum(float(definitions[name](centroids[cluster])) for cluster, name in enumerate(assignment)),
            tuple(assignment),
        ),
    )
    return {str(cluster): name for cluster, name in enumerate(best_names)}


def train(data: pd.DataFrame, artifact_dir: Path, seed: int = RANDOM_SEED) -> dict[str, Any]:
    features = data[FEATURE_NAMES]
    selected, evaluations = evaluate_candidates(features, seed)
    pipeline = build_pipeline(selected, seed)
    labels = pipeline.fit_predict(features)
    transformed = pipeline[:-1].transform(features)
    centers = pipeline.named_steps["kmeans"].cluster_centers_
    distances = np.linalg.norm(transformed - centers[labels], axis=1)
    radii = {str(cluster): round(float(np.percentile(distances[labels == cluster], 95)), 6) for cluster in range(selected)}
    centroids_array = _centroids_original_scale(pipeline)
    centroids = {str(cluster): {name: round(float(value), 6) for name, value in zip(FEATURE_NAMES, row, strict=True)} for cluster, row in enumerate(centroids_array)}
    metadata: dict[str, Any] = {
        "model_name": MODEL_NAME, "model_version": MODEL_VERSION,
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_type": "synthetic prototype; unsuitable for real-world accuracy claims",
        "training_rows": len(data), "random_seed": seed, "selected_cluster_count": selected,
        "selection_rule": "Lowest aggregate rank across silhouette (higher), Davies–Bouldin (lower), and Calinski–Harabasz (higher); ties use silhouette then smaller k.",
        "feature_names": FEATURE_NAMES, "evaluation_metrics": evaluations,
        "centroids": centroids, "persona_by_cluster": assign_persona_names(centroids_array),
        "cluster_distance_p95": radii,
        "diagnostic_archetype_adjusted_rand_score": round(float(adjusted_rand_score(data["archetype_label"], labels)), 6),
    }
    artifact_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, artifact_dir / "financial_persona_pipeline.joblib")
    (artifact_dir / "financial_persona_metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the FinSync synthetic financial persona model.")
    parser.add_argument("--data", type=Path, default=Path("ml/data/synthetic_profiles.csv"))
    parser.add_argument("--artifact-dir", type=Path, default=Path("ml/artifacts"))
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    data = pd.read_csv(args.data) if args.data.exists() else generate_synthetic_profiles(seed=args.seed)
    metadata = train(data, args.artifact_dir, args.seed)
    print(json.dumps({"selected_cluster_count": metadata["selected_cluster_count"], "evaluation_metrics": metadata["evaluation_metrics"], "persona_by_cluster": metadata["persona_by_cluster"]}, indent=2))


if __name__ == "__main__":
    main()
