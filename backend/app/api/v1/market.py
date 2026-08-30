from typing import Literal

from fastapi import APIRouter, Query

from app.ml.market_regime.inference import get_market_regime
from app.schemas.market import MarketRegimeResponse

router = APIRouter(prefix="/market", tags=["market context"])


@router.get("/regime", response_model=MarketRegimeResponse)
def market_regime(mode: Literal["live", "demo"] = Query(default="live")) -> MarketRegimeResponse:
    return get_market_regime(mode)
