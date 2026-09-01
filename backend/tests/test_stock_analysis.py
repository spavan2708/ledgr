import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class FakeTicker:
    info = {
        "longName": "Example Industries", "currency": "INR", "trailingPE": 21,
        "priceToBook": 3.2, "profitMargins": .18, "returnOnEquity": .19,
        "revenueGrowth": .12, "debtToEquity": 42, "beta": 1.05,
    }

    def history(self, **_kwargs):
        index = pd.date_range("2025-09-01", periods=252, freq="B")
        close = np.linspace(100, 132, len(index)) + np.sin(np.arange(len(index)) / 8)
        return pd.DataFrame({"Close": close, "Volume": np.full(len(index), 1_000_000)}, index=index)


def test_three_agent_stock_analysis(monkeypatch) -> None:
    monkeypatch.setattr("app.market.stock_analysis.yf.Ticker", lambda _symbol: FakeTicker())
    monkeypatch.setattr("app.market.stock_analysis.get_market_regime", lambda _mode: type("Regime", (), {"regime": "Stable Growth"})())
    response = client.post("/api/v1/market/analyze", json={"symbol": "TEST.NS"})
    assert response.status_code == 200
    body = response.json()
    assert body["company_name"] == "Example Industries"
    assert {agent["agent"] for agent in body["agents"]} == {"technical", "fundamental", "risk"}
    assert 0 <= body["overall_score"] <= 100
    assert 0 <= body["risk_score"] <= 100
    assert body["confidence"] > 0
    assert body["market_regime"] == "Stable Growth"
    assert len(body["price_history"]) >= 100


def test_stock_analysis_validates_symbol() -> None:
    assert client.post("/api/v1/market/analyze", json={"symbol": "bad symbol!"}).status_code == 422


def test_market_overview_keeps_partial_failures(monkeypatch) -> None:
    from app.market import overview
    overview._cache = None
    original = overview._snapshot
    monkeypatch.setattr(overview, "_snapshot", lambda name, symbol, asset_class, unit, fetched: original(name, symbol, asset_class, unit, fetched) if False else overview.MarketSnapshotItem(instrument=name, symbol=symbol, asset_class=asset_class, value=None if name == "Crude oil" else 100, unit=unit, change=None if name == "Crude oil" else 1, change_percent=None if name == "Crude oil" else 1, market_timestamp=None, fetched_at=fetched, freshness="unavailable" if name == "Crude oil" else "end_of_day", provider="Yahoo Finance via yfinance", error="Market data temporarily unavailable" if name == "Crude oil" else None))
    monkeypatch.setattr(overview, "_news", lambda _fetched: [])
    response = client.get("/api/v1/market/overview")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 5
    assert next(item for item in items if item["instrument"] == "Gold")["value"] == 100
    assert next(item for item in items if item["instrument"] == "Crude oil")["freshness"] == "unavailable"
