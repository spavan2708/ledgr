import numpy as np
import pandas as pd

FEATURE_NAMES = [
    "return_5d", "return_21d", "return_63d", "volatility_21d",
    "volatility_63d", "distance_ma_50d", "distance_ma_200d",
    "max_drawdown_63d", "positive_days_21d",
]


def engineer_features(prices: pd.DataFrame) -> pd.DataFrame:
    """Build trailing-only features from a Date/Close frame.

    Returns are close_t / close_(t-n) - 1. Volatility is the population
    standard deviation of daily returns times sqrt(252). Moving-average
    distance is close / trailing mean - 1. Drawdown is close divided by the
    trailing 63-day maximum minus 1. Consistency is the trailing fraction of
    positive daily returns. No negative shifts or future values are used.
    """
    frame = prices[["Date", "Close"]].copy()
    frame["Date"] = pd.to_datetime(frame["Date"], utc=True).dt.tz_localize(None)
    frame = frame.sort_values("Date").drop_duplicates("Date", keep="last")
    close = pd.to_numeric(frame["Close"], errors="coerce")
    daily = close.pct_change(fill_method=None)
    frame["return_5d"] = close / close.shift(5) - 1
    frame["return_21d"] = close / close.shift(21) - 1
    frame["return_63d"] = close / close.shift(63) - 1
    frame["volatility_21d"] = daily.rolling(21).std(ddof=0) * np.sqrt(252)
    frame["volatility_63d"] = daily.rolling(63).std(ddof=0) * np.sqrt(252)
    frame["distance_ma_50d"] = close / close.rolling(50).mean() - 1
    frame["distance_ma_200d"] = close / close.rolling(200).mean() - 1
    frame["max_drawdown_63d"] = close / close.rolling(63).max() - 1
    frame["positive_days_21d"] = daily.gt(0).rolling(21).mean()
    return frame[["Date", "Close", *FEATURE_NAMES]].dropna(subset=FEATURE_NAMES).reset_index(drop=True)
