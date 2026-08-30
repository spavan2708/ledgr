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
