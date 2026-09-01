from typing import Literal

from pydantic import BaseModel, Field


class MarketRegimeResponse(BaseModel):
    available: bool
    model_name: str
    model_version: str | None
    symbol: str
    index_name: str
    regime: str | None
    cluster_id: int | None
    similarity_score: float | None = Field(default=None, ge=0, le=1)
    as_of: str
    data_mode: Literal["live", "cached", "demo", "unavailable"]
    source: str
    latest_market_date: str | None
    key_characteristics: list[str]
    interpretation: str
    limitations: list[str]
    latest_features: dict[str, float | None]


class StockAnalysisRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=24, pattern=r"^[A-Za-z0-9.^&=-]+$")


class StockAgentAnalysis(BaseModel):
    agent: Literal["technical", "fundamental", "risk"]
    label: str
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    summary: str
    advantages: list[str]
    concerns: list[str]
    evidence: list[str]
    status: Literal["complete", "partial", "insufficient_data"]


class StockPricePoint(BaseModel):
    date: str
    close: float


class StockAnalysisResponse(BaseModel):
    symbol: str
    company_name: str
    currency: str
    current_price: float
    as_of: str
    data_source: str
    overall_score: int = Field(ge=0, le=100)
    risk_score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    stance: Literal["favourable", "mixed", "cautious", "insufficient_data"]
    summary: str
    advantages: list[str]
    concerns: list[str]
    agents: list[StockAgentAnalysis]
    market_regime: str | None
    price_history: list[StockPricePoint]
    limitations: list[str]


class MarketSnapshotItem(BaseModel):
    instrument: str
    symbol: str
    asset_class: Literal["equity", "gold", "currency", "commodity"]
    value: float | None
    unit: str
    change: float | None
    change_percent: float | None
    market_timestamp: str | None
    fetched_at: str
    freshness: Literal["latest_available", "delayed", "end_of_day", "cached", "unavailable"]
    provider: str
    error: str | None = None


class MarketNewsItem(BaseModel):
    headline: str
    source: str
    published_at: str | None
    affected_asset: str
    explanation: str
    url: str | None = None


class MarketOverviewResponse(BaseModel):
    fetched_at: str
    cache_age_seconds: int
    items: list[MarketSnapshotItem]
    news: list[MarketNewsItem]
    possible_factors: list[str]
    limitations: list[str]
