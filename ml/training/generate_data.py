import argparse
from pathlib import Path

import numpy as np
import pandas as pd

FEATURE_NAMES = [
    "savings_ratio", "expense_ratio", "debt_service_ratio", "debt_to_asset_ratio",
    "solvency_ratio", "liquidity_months", "emergency_fund_months", "income_stability",
    "dependents", "investment_horizon_years", "volatility_comfort", "investment_experience",
]
RANDOM_SEED = 20260830

# Means describe five diagnostic-only synthetic archetypes. Values match the
# normalized 0..1 feature contract returned by the deterministic engine.
ARCHETYPES = {
    "low_liquidity_limited_reserves": [0.18, 0.68, 0.22, 0.48, 0.46, 0.10, 0.08, 0.48, 0.28, 0.35, 0.28, 0.25],
    "high_recurring_debt_burden": [0.10, 0.58, 0.72, 0.78, 0.20, 0.20, 0.18, 0.55, 0.38, 0.32, 0.30, 0.30],
    "stable_balanced_finances": [0.55, 0.42, 0.20, 0.30, 0.72, 0.55, 0.52, 0.82, 0.22, 0.58, 0.52, 0.55],
    "long_horizon_growth_capacity": [0.72, 0.34, 0.12, 0.20, 0.82, 0.68, 0.65, 0.86, 0.15, 0.88, 0.82, 0.78],
    "strong_income_weak_savings": [0.14, 0.78, 0.18, 0.32, 0.65, 0.38, 0.28, 0.88, 0.30, 0.55, 0.48, 0.44],
}


def generate_synthetic_profiles(rows: int = 5000, seed: int = RANDOM_SEED, missing_rate: float = 0.015) -> pd.DataFrame:
    """Return bounded synthetic profiles; archetype labels are diagnostics only."""
    if rows < 5000:
        raise ValueError("Prototype training data must contain at least 5,000 profiles")
    rng = np.random.default_rng(seed)
    labels = list(ARCHETYPES)
    assignments = np.arange(rows) % len(labels)
    rng.shuffle(assignments)
    data = np.empty((rows, len(FEATURE_NAMES)), dtype=float)
    for row_index, archetype_index in enumerate(assignments):
        mean = np.asarray(ARCHETYPES[labels[int(archetype_index)]])
        noise = rng.normal(0, 0.075, len(FEATURE_NAMES))
        # Correlated variation prevents perfectly spherical prototype groups.
        shared = rng.normal(0, 0.035)
        data[row_index] = np.clip(mean + noise + shared, 0, 1)
    missing = rng.random(data.shape) < missing_rate
    data[missing] = np.nan
    frame = pd.DataFrame(data, columns=FEATURE_NAMES)
    frame["archetype_label"] = [labels[int(index)] for index in assignments]
    return frame


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic FinSync prototype profiles.")
    parser.add_argument("--output", type=Path, default=Path("ml/data/synthetic_profiles.csv"))
    parser.add_argument("--rows", type=int, default=5000)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    frame = generate_synthetic_profiles(args.rows, args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(args.output, index=False)
    print(f"Wrote {len(frame)} synthetic profiles to {args.output}")
    print("Synthetic prototype data only; unsuitable for real-world accuracy claims.")


if __name__ == "__main__":
    main()
