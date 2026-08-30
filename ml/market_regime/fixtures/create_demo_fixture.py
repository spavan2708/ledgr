from pathlib import Path

import numpy as np
import pandas as pd

SEED = 20260830


def create_demo_history(rows: int = 520) -> pd.DataFrame:
    """Create a fixed broad-index-like history for offline demos and tests."""
    rng = np.random.default_rng(SEED)
    dates = pd.bdate_range("2023-01-02", periods=rows)
    segments = [(150, 0.00055, 0.007), (120, -0.00015, 0.014), (130, 0.00005, 0.006), (120, -0.00035, 0.018)]
    returns = np.concatenate([rng.normal(mean, volatility, length) for length, mean, volatility in segments])[:rows]
    close = 18000 * np.exp(np.cumsum(returns))
    return pd.DataFrame({"Date": dates, "Close": close.round(2)})


def main() -> None:
    output = Path(__file__).with_name("nifty50_demo.csv")
    create_demo_history().to_csv(output, index=False)
    print(f"Wrote deterministic demo snapshot to {output}")


if __name__ == "__main__":
    main()
