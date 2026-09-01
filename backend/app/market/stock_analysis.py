from __future__ import annotations

from datetime import datetime, timezone
from math import isfinite
from typing import Any

import numpy as np
import pandas as pd
import yfinance as yf
from fastapi import HTTPException

from app.ml.market_regime.inference import get_market_regime
from app.schemas.market import StockAgentAnalysis, StockAnalysisResponse


def _number(value: Any) -> float | None:
    try:
        result = float(value)
        return result if isfinite(result) else None
    except (TypeError, ValueError):
        return None


def _bounded(value: float) -> int:
    return round(max(0, min(100, value)))


def _pct(value: float | None) -> str:
    return "unavailable" if value is None else f"{value * 100:+.1f}%"


def _technical(close: pd.Series, volume: pd.Series) -> StockAgentAnalysis:
    daily = close.pct_change(fill_method=None).dropna()
    r20 = close.iloc[-1] / close.iloc[-21] - 1 if len(close) >= 21 else None
    r60 = close.iloc[-1] / close.iloc[-61] - 1 if len(close) >= 61 else None
    ma50 = close.tail(50).mean() if len(close) >= 50 else None
    ma200 = close.tail(200).mean() if len(close) >= 200 else None
    volatility = daily.tail(60).std(ddof=0) * np.sqrt(252) if len(daily) >= 20 else None
    drawdown = close.iloc[-1] / close.tail(252).max() - 1
    delta = close.diff(); gains = delta.clip(lower=0).rolling(14).mean(); losses = -delta.clip(upper=0).rolling(14).mean()
    rsi = _number((100 - 100 / (1 + gains / losses)).iloc[-1]) if len(close) >= 15 else None
    score = 50.0
    score += 12 if r20 is not None and r20 > .03 else -12 if r20 is not None and r20 < -.03 else 0
    score += 12 if r60 is not None and r60 > .07 else -12 if r60 is not None and r60 < -.07 else 0
    score += 9 if ma50 is not None and close.iloc[-1] > ma50 else -9 if ma50 is not None else 0
    score += 9 if ma200 is not None and close.iloc[-1] > ma200 else -9 if ma200 is not None else 0
    score -= 8 if volatility is not None and volatility > .40 else 0
    advantages, concerns = [], []
    (advantages if (r60 or 0) > 0 else concerns).append(f"Three-month price return is {_pct(r60)}")
    if ma200 is not None: (advantages if close.iloc[-1] >= ma200 else concerns).append(f"Price is {'above' if close.iloc[-1] >= ma200 else 'below'} its 200-day average")
    if volatility is not None and volatility > .40: concerns.append(f"Annualized recent volatility is elevated at {volatility * 100:.1f}%")
    evidence = [f"One-month return: {_pct(r20)}", f"Three-month return: {_pct(r60)}", f"Drawdown from one-year peak: {_pct(drawdown)}"]
    if rsi is not None: evidence.append(f"RSI(14): {rsi:.1f}")
    available = sum(item is not None for item in (r20, r60, ma50, ma200, volatility, rsi))
    return StockAgentAnalysis(agent="technical", label="Technical", score=_bounded(score), confidence=_bounded(35 + available * 10), summary="Price behavior is assessed from momentum, trend, volatility and drawdown.", advantages=advantages, concerns=concerns, evidence=evidence, status="complete" if available >= 5 else "partial")


def _fundamental(info: dict[str, Any]) -> StockAgentAnalysis:
    pe, pb = _number(info.get("trailingPE")), _number(info.get("priceToBook"))
    margin, roe = _number(info.get("profitMargins")), _number(info.get("returnOnEquity"))
    growth, debt = _number(info.get("revenueGrowth")), _number(info.get("debtToEquity"))
    metrics = (pe, pb, margin, roe, growth, debt); available = sum(item is not None for item in metrics)
    if not available:
        return StockAgentAnalysis(agent="fundamental", label="Fundamental", score=50, confidence=0, summary="Fundamental data was unavailable, so no company-quality conclusion was produced.", advantages=[], concerns=["Valuation and financial-statement metrics are unavailable"], evidence=[], status="insufficient_data")
    score = 50.0; advantages, concerns, evidence = [], [], []
    if pe is not None: score += 8 if 0 < pe <= 25 else -8 if pe <= 0 or pe > 50 else 0; evidence.append(f"Trailing P/E: {pe:.1f}")
    if pb is not None: score += 5 if 0 < pb <= 4 else -5 if pb > 8 else 0; evidence.append(f"Price-to-book: {pb:.1f}")
    if margin is not None: score += 12 if margin >= .15 else -10 if margin < .05 else 0; (advantages if margin >= .15 else concerns if margin < .05 else evidence).append(f"Profit margin: {margin * 100:.1f}%")
    if roe is not None: score += 12 if roe >= .15 else -8 if roe < .08 else 0; (advantages if roe >= .15 else concerns if roe < .08 else evidence).append(f"Return on equity: {roe * 100:.1f}%")
    if growth is not None: score += 12 if growth >= .10 else -8 if growth < 0 else 0; (advantages if growth >= .10 else concerns if growth < 0 else evidence).append(f"Revenue growth: {growth * 100:+.1f}%")
    if debt is not None: score += 8 if debt < 50 else -12 if debt > 150 else 0; (advantages if debt < 50 else concerns if debt > 150 else evidence).append(f"Debt-to-equity: {debt:.1f}%")
    return StockAgentAnalysis(agent="fundamental", label="Fundamental", score=_bounded(score), confidence=_bounded(20 + available * 12), summary="Company quality and valuation are assessed from available provider fundamentals.", advantages=advantages, concerns=concerns, evidence=evidence, status="complete" if available >= 5 else "partial")


def _risk(close: pd.Series, info: dict[str, Any], regime: str | None) -> StockAgentAnalysis:
    daily = close.pct_change(fill_method=None).dropna(); volatility = _number(daily.tail(60).std(ddof=0) * np.sqrt(252)); drawdown = _number(close.iloc[-1] / close.tail(252).max() - 1)
    beta, debt = _number(info.get("beta")), _number(info.get("debtToEquity")); risk = 35.0; concerns, advantages = [], []
    if volatility is not None: risk += 20 if volatility > .45 else 10 if volatility > .30 else -5; (concerns if volatility > .30 else advantages).append(f"Annualized volatility: {volatility * 100:.1f}%")
    if drawdown is not None: risk += 18 if drawdown < -.30 else 9 if drawdown < -.15 else -4; (concerns if drawdown < -.15 else advantages).append(f"Drawdown from one-year peak: {drawdown * 100:.1f}%")
    if beta is not None: risk += 10 if beta > 1.3 else -5 if beta < .8 else 0; (concerns if beta > 1.3 else advantages if beta < .8 else concerns).append(f"Market beta: {beta:.2f}")
    if debt is not None and debt > 150: risk += 12; concerns.append(f"Debt-to-equity is high at {debt:.1f}%")
    if regime and ("Defensive" in regime or "Volatile" in regime): risk += 8; concerns.append(f"Broad-market regime is {regime}")
    confidence = _bounded(30 + sum(item is not None for item in (volatility, drawdown, beta, debt)) * 13 + (8 if regime else 0))
    risk_score = _bounded(risk)
    return StockAgentAnalysis(agent="risk", label="Risk", score=100 - risk_score, confidence=confidence, summary=f"Observed market and company risk is {'high' if risk_score >= 65 else 'moderate' if risk_score >= 40 else 'lower'}.", advantages=advantages, concerns=concerns, evidence=[f"Risk score: {risk_score}/100", f"Market regime: {regime or 'unavailable'}"], status="complete" if confidence >= 65 else "partial")


def analyze_stock(symbol: str) -> StockAnalysisResponse:
    normalized = symbol.strip().upper(); ticker = yf.Ticker(normalized)
    try:
        history = ticker.history(period="1y", auto_adjust=True)
        if history.empty or "Close" not in history: raise HTTPException(status_code=404, detail="Historical data is unavailable for this symbol")
        info = ticker.info or {}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=503, detail="Market data provider is temporarily unavailable") from exc
    close = history["Close"].dropna(); volume = history.get("Volume", pd.Series(index=history.index, dtype=float)).fillna(0)
    if len(close) < 21: raise HTTPException(status_code=422, detail="Insufficient price history for analysis")
    try: regime = get_market_regime("live").regime
    except Exception: regime = None
    # Preserve a deliberate research sequence: price behavior first, company
    # fundamentals second, and risk assessment last using the preceding context.
    agents = [_technical(close, volume), _fundamental(info), _risk(close, info, regime)]
    technical, fundamental, risk_agent = agents
    completed = [agent for agent in agents if agent.status != "insufficient_data"]
    confidence = _bounded(sum(agent.confidence for agent in agents) / 3 - (3 - len(completed)) * 12)
    overall = _bounded(technical.score * .35 + fundamental.score * .40 + risk_agent.score * .25)
    risk_score = 100 - risk_agent.score
    stance = "insufficient_data" if confidence < 30 else "favourable" if overall >= 70 and risk_score < 65 else "mixed" if overall >= 45 else "cautious"
    advantages = list(dict.fromkeys(item for agent in agents for item in agent.advantages))[:6]
    concerns = list(dict.fromkeys(item for agent in agents for item in agent.concerns))[:6]
    sampled = close.iloc[::max(1, len(close) // 120)]
    history_points = [{"date": index.date().isoformat(), "close": round(float(value), 2)} for index, value in sampled.items()]
    if history_points[-1]["date"] != close.index[-1].date().isoformat(): history_points.append({"date": close.index[-1].date().isoformat(), "close": round(float(close.iloc[-1]), 2)})
    return StockAnalysisResponse(symbol=normalized, company_name=str(info.get("longName") or info.get("shortName") or normalized), currency=str(info.get("currency") or "INR"), current_price=float(close.iloc[-1]), as_of=datetime.now(timezone.utc).isoformat(), data_source="Yahoo Finance via yfinance", overall_score=overall, risk_score=risk_score, confidence=confidence, stance=stance, summary=f"The three-agent evidence is {stance}. This is a research classification, not a personalized instruction to buy or sell.", advantages=advantages, concerns=concerns, agents=agents, market_regime=regime, price_history=history_points, limitations=["Scores use generic research thresholds and are not personalized investment advice.", "Yahoo Finance data may be delayed, incomplete, or revised.", "Past price patterns and current fundamentals do not predict future returns.", "Review current filings, valuation context, and your own risk capacity before acting."])
