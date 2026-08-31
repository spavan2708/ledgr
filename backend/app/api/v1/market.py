import yfinance as yf
from typing import Literal

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from app.ml.market_regime.inference import get_market_regime
from app.schemas.market import MarketRegimeResponse

router = APIRouter(prefix="/market", tags=["market data"])

@router.get("/regime", response_model=MarketRegimeResponse)
def market_regime(mode: Literal["live", "demo"] = Query(default="live")) -> MarketRegimeResponse:
    return get_market_regime(mode)

class QuoteResponse(BaseModel):
    symbol: str
    current_price: float
    currency: str
    last_updated: str
    status: Literal["live", "delayed", "stale", "unavailable"]

@router.get("/quote")
def get_quote(symbol: str) -> QuoteResponse:
    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1d")
        if history.empty:
            raise HTTPException(status_code=404, detail="Symbol data unavailable")
        
        # Get the closing price
        price = float(history["Close"].iloc[-1])
        # Simple timezone-naive ISO string for now
        last_updated = history.index[-1].isoformat()
        
        return QuoteResponse(
            symbol=symbol,
            current_price=price,
            currency="INR", # Defaulting assuming Indian context or yfinance metadata
            last_updated=last_updated,
            status="live"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str

# Simple mock search for now since yfinance doesn't natively expose a good generic search API easily,
# but we can do a simplistic lookup or static map if needed. Wait, does yfinance have a search?
# Actually, yfinance has no native text-based search endpoint that's reliable without using Yahoo's internal APIs.
# We will use Yahoo Finance's internal API for search:
import requests
import logging
logger = logging.getLogger(__name__)

@router.get("/search")
def search_stocks(query: str):
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10&newsCount=0"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        results = []
        for quote in data.get("quotes", []):
            if quote.get("isYahooFinance") and quote.get("quoteType") != "INDEX":
                results.append(SearchResult(
                    symbol=quote.get("symbol", ""),
                    name=quote.get("shortname") or quote.get("longname") or quote.get("symbol", ""),
                    exchange=quote.get("exchange", "")
                ))
        return results
    except requests.exceptions.RequestException as e:
        logger.error(f"Yahoo Finance API error: {e}")
        raise HTTPException(status_code=503, detail="External market data service unavailable")
    except Exception as e:
        logger.exception("Unexpected error in search_stocks")
        raise HTTPException(status_code=500, detail="Internal server error")

class MFQuoteResponse(BaseModel):
    isin: str
    current_nav: float
    date: str
    status: Literal["live", "delayed", "stale", "unavailable"]

# Cache for AMFI data to prevent hammering
AMFI_CACHE = {"data": {}, "last_fetched": None}

@router.get("/mf-nav")
def get_mf_nav(isin: str) -> MFQuoteResponse:
    from datetime import datetime, timezone, timedelta
    
    now = datetime.now(timezone.utc)
    # Refresh cache if older than 12 hours or empty
    if not AMFI_CACHE["last_fetched"] or (now - AMFI_CACHE["last_fetched"]) > timedelta(hours=12):
        try:
            res = requests.get("https://www.amfiindia.com/spages/NAVAll.txt", timeout=10)
            res.raise_for_status()
            lines = res.text.split("\n")
            
            new_data = {}
            for line in lines:
                parts = line.split(";")
                if len(parts) >= 6 and parts[0].strip().isdigit():
                    code = parts[0].strip()
                    isin_val = parts[1].strip() or parts[2].strip() or code
                    scheme_name = parts[3].strip()
                    
                    try:
                        # NAV is the second to last element, Date is the last
                        nav = float(parts[-2].strip())
                        date = parts[-1].strip()
                        if isin_val:
                            new_data[isin_val] = {"nav": nav, "date": date, "name": scheme_name}
                    except ValueError:
                        continue
                        
            if new_data:
                AMFI_CACHE["data"] = new_data
                AMFI_CACHE["last_fetched"] = now
                
        except Exception as e:
            if not AMFI_CACHE["data"]:
                raise HTTPException(status_code=500, detail=f"Failed to fetch AMFI data: {e}")
                
    if isin not in AMFI_CACHE["data"]:
        # Fallback to scheme code if provided as ISIN parameter
        raise HTTPException(status_code=404, detail="Mutual fund not found in AMFI data")
        
    fund_data = AMFI_CACHE["data"][isin]
    return MFQuoteResponse(
        isin=isin,
        current_nav=fund_data["nav"],
        date=fund_data["date"],
        status="live"
    )

class MFSearchResult(BaseModel):
    isin: str
    name: str

@router.get("/mf-search")
def search_mf(query: str):
    # Ensure cache is populated
    if not AMFI_CACHE["last_fetched"]:
        try:
            get_mf_nav("dummy")
        except HTTPException:
            pass

    query_lower = query.lower()
    results = []
    
    for isin, data in AMFI_CACHE["data"].items():
        if query_lower in data["name"].lower() or query_lower in isin.lower():
            results.append(MFSearchResult(isin=isin, name=data["name"]))
            if len(results) >= 20:
                break
                
    return results

import os

class GoldPriceResponse(BaseModel):
    success: bool
    currency: str
    unit: str
    prices: dict
    timestamp: str
    source: str

GOLD_CACHE = {"data": None, "last_fetched": None}

@router.get("/gold", response_model=GoldPriceResponse)
def get_gold_price() -> GoldPriceResponse:
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    
    if GOLD_CACHE["last_fetched"] and GOLD_CACHE["data"] and (now - GOLD_CACHE["last_fetched"]) < timedelta(minutes=15):
        return GOLD_CACHE["data"]
        
    api_key = os.getenv("GOLD_API_KEY")
    if not api_key:
        if GOLD_CACHE["data"]:
            return GOLD_CACHE["data"]
        raise HTTPException(status_code=500, detail="GOLD_API_KEY not configured")
        
    try:
        # Mock integration for testing without a real key
        if api_key == "mock":
            gold_data = GoldPriceResponse(
                success=True,
                currency="INR",
                unit="gram",
                prices={
                    "22K": 6500.0,
                    "24K": 7100.0
                },
                timestamp=now.isoformat(),
                source="GoldAPI (Mock)"
            )
            GOLD_CACHE["data"] = gold_data
            GOLD_CACHE["last_fetched"] = now
            return gold_data

        headers = {
            "x-access-token": api_key,
            "Content-Type": "application/json"
        }
        res = requests.get("https://www.goldapi.io/api/XAU/INR", headers=headers, timeout=10)
        res.raise_for_status()
        data = res.json()
        
        gold_data = GoldPriceResponse(
            success=True,
            currency="INR",
            unit="gram",
            prices={
                "22K": data.get("price_gram_22k"),
                "24K": data.get("price_gram_24k")
            },
            timestamp=now.isoformat(),
            source="GoldAPI"
        )
        
        GOLD_CACHE["data"] = gold_data
        GOLD_CACHE["last_fetched"] = now
        return gold_data
    except Exception as e:
        logger.error(f"Gold API error: {e}")
        if GOLD_CACHE["data"]:
            return GOLD_CACHE["data"]
        raise HTTPException(status_code=500, detail="Gold price unavailable. Please try again.")
