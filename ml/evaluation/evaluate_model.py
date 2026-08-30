import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Print saved FinSync persona model evaluation results.")
    parser.add_argument("--metadata", type=Path, default=Path("ml/artifacts/financial_persona_metadata.json"))
    args = parser.parse_args()
    metadata = json.loads(args.metadata.read_text())
    print(json.dumps({key: metadata[key] for key in ("model_name", "model_version", "dataset_type", "selected_cluster_count", "selection_rule", "evaluation_metrics", "diagnostic_archetype_adjusted_rand_score")}, indent=2))


if __name__ == "__main__":
    main()
