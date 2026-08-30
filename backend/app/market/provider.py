import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

SYMBOL = "^NSEI"
SOURCE = "Yahoo Finance via yfinance"
ROOT = Path(__file__).resolve().parents[3]
DEFAULT_CACHE = ROOT / "ml" / "market_regime" / "data" / "nifty50_history.csv"
DEFAULT_DEMO = ROOT / "ml" / "market_regime" / "fixtures" / "nifty50_demo.csv"


@dataclass
class MarketData:
    prices: pd.DataFrame
    source: str
    retrieval_timestamp: str
    latest_market_date: str
    data_mode: str


class YFinanceMarketDataProvider:
    def __init__(self, cache_path: Path = DEFAULT_CACHE, demo_path: Path = DEFAULT_DEMO, timeout: int = 10) -> None:
        self.cache_path = cache_path
        self.demo_path = demo_path
        self.timeout = timeout

    def get(self, mode: str = "live") -> MarketData:
        if mode == "demo":
            return self._demo()
        try:
            return self._download()
        except Exception:
            if self.cache_path.exists():
                return self._cached()
            return self._demo()

    def _download(self) -> MarketData:
        import yfinance as yf  # Lazy: startup and demo mode survive optional-provider failure.

        raw = yf.download(SYMBOL, period="10y", interval="1d", auto_adjust=False, progress=False, timeout=self.timeout, threads=False)
        if raw.empty:
            raise RuntimeError("Provider returned no NIFTY 50 history")
        close = raw["Adj Close"] if "Adj Close" in raw else raw["Close"]
        if isinstance(close, pd.DataFrame):
            close = close.iloc[:, 0]
        frame = pd.DataFrame({"Date": close.index, "Close": close.to_numpy()}).dropna()
        now = datetime.now(timezone.utc).isoformat()
        self.cache_path.parent.mkdir(parents=True, exist_ok=True)
        frame.to_csv(self.cache_path, index=False)
        self.cache_path.with_suffix(".metadata.json").write_text(json.dumps({"source": SOURCE, "symbol": SYMBOL, "retrieval_timestamp": now, "latest_market_date": _latest(frame)}, indent=2) + "\n")
        return MarketData(frame, SOURCE, now, _latest(frame), "live")

    def _cached(self) -> MarketData:
        frame = pd.read_csv(self.cache_path)
        metadata_path = self.cache_path.with_suffix(".metadata.json")
        metadata = json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
        return MarketData(frame, metadata.get("source", SOURCE), metadata.get("retrieval_timestamp", self._mtime()), _latest(frame), "cached")

    def _demo(self) -> MarketData:
        frame = pd.read_csv(self.demo_path)
        return MarketData(frame, "Bundled deterministic NIFTY-like demo snapshot", datetime.fromtimestamp(self.demo_path.stat().st_mtime, timezone.utc).isoformat(), _latest(frame), "demo")

    def _mtime(self) -> str:
        return datetime.fromtimestamp(self.cache_path.stat().st_mtime, timezone.utc).isoformat()


def _latest(frame: pd.DataFrame) -> str:
    return pd.to_datetime(frame["Date"]).max().date().isoformat()
