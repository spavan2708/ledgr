import argparse
import json
from datetime import datetime, timezone
from itertools import permutations
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.impute import SimpleImputer
from sklearn.metrics import adjusted_rand_score, calinski_harabasz_score, davies_bouldin_score, silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ml.market_regime.features import FEATURE_NAMES, engineer_features

SEED = 20260830
STABILITY_SEEDS = [20260830, 20260831, 20260832]
MODEL_VERSION = "1.0.0"


def build_pipeline(clusters: int, seed: int = SEED) -> Pipeline:
    return Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler()), ("kmeans", KMeans(n_clusters=clusters, random_state=seed, n_init=20))])


def evaluate_candidates(features: pd.DataFrame) -> tuple[int, dict[str, dict[str, float]]]:
    results: dict[str, dict[str, float]] = {}
    for clusters in range(3, 7):
        labels_by_seed: list[np.ndarray] = []
        transformed: np.ndarray | None = None
        for seed in STABILITY_SEEDS:
            pipeline = build_pipeline(clusters, seed)
            labels_by_seed.append(pipeline.fit_predict(features))
            if seed == SEED:
                transformed = pipeline[:-1].transform(features)
        assert transformed is not None
        base = labels_by_seed[0]
        stability = np.mean([adjusted_rand_score(base, labels) for labels in labels_by_seed[1:]])
        results[str(clusters)] = {
            "silhouette_score": round(float(silhouette_score(transformed, base, sample_size=min(2000, len(features)), random_state=SEED)), 6),
            "davies_bouldin_score": round(float(davies_bouldin_score(transformed, base)), 6),
            "calinski_harabasz_score": round(float(calinski_harabasz_score(transformed, base)), 6),
            "seed_stability_ari": round(float(stability), 6),
        }
    candidates = list(range(3, 7))
    directions = [("silhouette_score", True), ("davies_bouldin_score", False), ("calinski_harabasz_score", True), ("seed_stability_ari", True)]
    aggregate = {candidate: 0 for candidate in candidates}
    for metric, higher in directions:
        ordered = sorted(candidates, key=lambda k: ((-1 if higher else 1) * results[str(k)][metric], k))
        for rank, candidate in enumerate(ordered):
            aggregate[candidate] += rank
    selected = min(candidates, key=lambda k: (aggregate[k], -results[str(k)]["silhouette_score"], -results[str(k)]["seed_stability_ari"], k))
    return selected, results


def assign_regime_names(centroids: np.ndarray) -> dict[str, str]:
    i = {name: position for position, name in enumerate(FEATURE_NAMES)}
    scores = {
        "Stable Growth": lambda c: 2*c[i["return_63d"]] - c[i["volatility_63d"]] + c[i["distance_ma_200d"]] + c[i["positive_days_21d"]],
        "Volatile Growth": lambda c: 1.5*c[i["return_63d"]] + c[i["volatility_63d"]] + c[i["distance_ma_50d"]],
        "Sideways / Low Momentum": lambda c: -abs(c[i["return_21d"]]) - abs(c[i["distance_ma_50d"]]) - .4*c[i["volatility_21d"]],
        "Defensive / High-Volatility Decline": lambda c: -2*c[i["return_63d"]] + 1.5*c[i["volatility_63d"]] - c[i["max_drawdown_63d"]] - c[i["distance_ma_200d"]],
        "Recovery / Improving Momentum": lambda c: 2*c[i["return_21d"]] - c[i["return_63d"]] + c[i["positive_days_21d"]],
        "Mixed / Transition": lambda c: -abs(c[i["return_63d"]]) + c[i["volatility_21d"]] - abs(c[i["distance_ma_200d"]]),
    }
    core = ["Stable Growth", "Volatile Growth", "Sideways / Low Momentum", "Defensive / High-Volatility Decline"]
    names = core if len(centroids) <= 4 else [*core, "Recovery / Improving Momentum"] if len(centroids) == 5 else list(scores)
    best = max(permutations(sorted(names), len(centroids)), key=lambda assignment: (sum(float(scores[name](centroids[cluster])) for cluster, name in enumerate(assignment)), assignment))
    return {str(cluster): name for cluster, name in enumerate(best)}


def train(prices: pd.DataFrame, artifact_dir: Path, source: str) -> dict[str, Any]:
    engineered = engineer_features(prices)
    split_index = int(len(engineered) * 0.8)
    train_frame, test_frame = engineered.iloc[:split_index], engineered.iloc[split_index:]
    selected, evaluations = evaluate_candidates(train_frame[FEATURE_NAMES])
    pipeline = build_pipeline(selected)
    train_labels = pipeline.fit_predict(train_frame[FEATURE_NAMES])
    train_transformed = pipeline[:-1].transform(train_frame[FEATURE_NAMES])
    centers_scaled = pipeline.named_steps["kmeans"].cluster_centers_
    distances = np.linalg.norm(train_transformed - centers_scaled[train_labels], axis=1)
    radii = {str(cluster): round(float(np.percentile(distances[train_labels == cluster], 95)), 6) for cluster in range(selected)}
    centroids_array = pipeline.named_steps["scaler"].inverse_transform(centers_scaled)
    centroids = {str(cluster): {name: round(float(value), 8) for name, value in zip(FEATURE_NAMES, row, strict=True)} for cluster, row in enumerate(centroids_array)}
    test_labels = pipeline.predict(test_frame[FEATURE_NAMES])
    test_transformed = pipeline[:-1].transform(test_frame[FEATURE_NAMES])
    oos = {"observations": len(test_frame), "cluster_counts": {str(cluster): int((test_labels == cluster).sum()) for cluster in range(selected)}}
    if len(set(test_labels)) > 1:
        oos["silhouette_score"] = round(float(silhouette_score(test_transformed, test_labels)), 6)
    metadata: dict[str, Any] = {
        "model_name": "market-regime-kmeans", "model_version": MODEL_VERSION,
        "feature_names": FEATURE_NAMES, "selected_cluster_count": selected,
        "centroids": centroids, "regime_by_cluster": assign_regime_names(centroids_array),
        "cluster_distance_p95": radii, "random_seed": SEED,
        "stability_seeds": STABILITY_SEEDS, "evaluation_metrics": evaluations,
        "selection_rule": "Lowest aggregate rank across silhouette, Davies–Bouldin, Calinski–Harabasz, and multi-seed ARI stability; ties use silhouette, stability, then smaller k.",
        "training_timestamp": datetime.now(timezone.utc).isoformat(), "data_source": source,
        "symbol": "^NSEI", "history_start": engineered["Date"].min().date().isoformat(),
        "history_end": engineered["Date"].max().date().isoformat(), "usable_observations": len(engineered),
        "training_period": {"start": train_frame["Date"].min().date().isoformat(), "end": train_frame["Date"].max().date().isoformat(), "observations": len(train_frame)},
        "temporal_split_date": test_frame["Date"].min().date().isoformat(), "out_of_sample_diagnostics": oos,
    }
    artifact_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, artifact_dir / "market_regime_pipeline.joblib")
    (artifact_dir / "market_regime_metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the NIFTY 50 market-regime model.")
    parser.add_argument("--data", type=Path, default=Path("ml/market_regime/data/nifty50_history.csv"))
    parser.add_argument("--artifact-dir", type=Path, default=Path("ml/market_regime/artifacts"))
    parser.add_argument("--demo", action="store_true", help="Train from the bundled demo snapshot instead of cached history.")
    args = parser.parse_args()
    path = Path("ml/market_regime/fixtures/nifty50_demo.csv") if args.demo else args.data
    if not path.exists():
        raise SystemExit(f"Missing {path}; download historical data first or pass --demo")
    source = "Bundled deterministic demo snapshot" if args.demo else "Yahoo Finance via yfinance (^NSEI)"
    metadata = train(pd.read_csv(path), args.artifact_dir, source)
    print(json.dumps({key: metadata[key] for key in ("selected_cluster_count", "history_start", "history_end", "usable_observations", "temporal_split_date", "evaluation_metrics", "regime_by_cluster")}, indent=2))


if __name__ == "__main__":
    main()
