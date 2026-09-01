from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from time import monotonic
from typing import Any

import yfinance as yf

from app.schemas.market import MarketNewsItem, MarketOverviewResponse, MarketSnapshotItem

SNAPSHOT_TTL_SECONDS = 300
INSTRUMENTS = [
    ("NIFTY 50", "^NSEI", "equity", "points"),
    ("SENSEX", "^BSESN", "equity", "points"),
    ("Gold", "GC=F", "gold", "USD/oz"),
    ("USD/INR", "INR=X", "currency", "INR per USD"),
    ("Crude oil", "CL=F", "commodity", "USD/barrel"),
]
_cache: tuple[float, MarketOverviewResponse] | None = None
_lock = Lock()


def _iso(value: Any) -> str | None:
    try: return value.to_pydatetime().astimezone(timezone.utc).isoformat()
    except Exception: return None


def _snapshot(name: str, symbol: str, asset_class: str, unit: str, fetched_at: str) -> MarketSnapshotItem:
    try:
        history = yf.Ticker(symbol).history(period="5d", interval="1d", auto_adjust=False)
        closes = history["Close"].dropna()
        if closes.empty: raise ValueError("No recent values returned")
        value = float(closes.iloc[-1]); previous = float(closes.iloc[-2]) if len(closes) > 1 else None
        change = value - previous if previous is not None else None
        change_percent = change / previous * 100 if previous else None
        return MarketSnapshotItem(instrument=name, symbol=symbol, asset_class=asset_class, value=round(value, 4), unit=unit,
            change=round(change, 4) if change is not None else None, change_percent=round(change_percent, 3) if change_percent is not None else None,
            market_timestamp=_iso(closes.index[-1]), fetched_at=fetched_at, freshness="end_of_day", provider="Yahoo Finance via yfinance")
    except Exception:
        return MarketSnapshotItem(instrument=name, symbol=symbol, asset_class=asset_class, value=None, unit=unit, change=None,
            change_percent=None, market_timestamp=None, fetched_at=fetched_at, freshness="unavailable", provider="Yahoo Finance via yfinance",
            error="Market data temporarily unavailable")


def _news(fetched_at: str) -> list[MarketNewsItem]:
    try: records = yf.Ticker("^NSEI").news or []
    except Exception: return []
    result: list[MarketNewsItem] = []
    for raw in records[:6]:
        content = raw.get("content", raw) if isinstance(raw, dict) else {}
        title = content.get("title")
        if not title: continue
        provider = content.get("provider") or {}
        canonical = content.get("canonicalUrl") or content.get("clickThroughUrl") or {}
        summary = content.get("summary") or "A current market headline that may be relevant to broad-market movement."
        result.append(MarketNewsItem(headline=str(title), source=str(provider.get("displayName") or raw.get("publisher") or "Yahoo Finance"),
            published_at=content.get("pubDate") or fetched_at, affected_asset="Broad market", explanation=str(summary)[:280],
            url=canonical.get("url") or raw.get("link")))
    return result


def get_market_overview() -> MarketOverviewResponse:
    global _cache
    now = monotonic()
    with _lock:
        if _cache and now - _cache[0] < SNAPSHOT_TTL_SECONDS:
            age = int(now - _cache[0]); cached = _cache[1].model_copy(deep=True); cached.cache_age_seconds = age
            cached.items = [item.model_copy(update={"freshness": "cached"}) if item.freshness != "unavailable" else item for item in cached.items]
            return cached
    fetched_at = datetime.now(timezone.utc).isoformat()
    items = [_snapshot(*definition, fetched_at) for definition in INSTRUMENTS]
    news = _news(fetched_at)
    available = [item for item in items if item.value is not None]
    leaders = sorted(available, key=lambda item: abs(item.change_percent or 0), reverse=True)[:2]
    factors = [f"{item.instrument} moved {item.change_percent:+.2f}%; current headlines may offer possible contributing factors, but do not establish causality." for item in leaders if item.change_percent is not None]
    response = MarketOverviewResponse(fetched_at=fetched_at, cache_age_seconds=0, items=items, news=news, possible_factors=factors,
        limitations=["Yahoo Finance is an unofficial provider and values may be delayed or end-of-day.", "Market headlines indicate possible context; they do not prove why a price moved.", "Unavailable instruments are not replaced with simulated values.", "Snapshot requests are cached for five minutes to respect provider limits."])
    with _lock: _cache = (now, response)
    return response
