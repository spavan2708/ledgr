import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--metadata", type=Path, default=Path("ml/market_regime/artifacts/market_regime_metadata.json"))
    args = parser.parse_args()
    metadata = json.loads(args.metadata.read_text())
    keys = ["model_name", "model_version", "data_source", "history_start", "history_end", "usable_observations", "training_period", "temporal_split_date", "selected_cluster_count", "selection_rule", "evaluation_metrics", "out_of_sample_diagnostics", "regime_by_cluster"]
    print(json.dumps({key: metadata[key] for key in keys}, indent=2))


if __name__ == "__main__":
    main()
