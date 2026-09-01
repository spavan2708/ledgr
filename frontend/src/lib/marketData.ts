export interface QuoteResponse {
  symbol: string;
  current_price: number;
  currency: string;
  last_updated: string;
  status: "live" | "delayed" | "stale" | "unavailable";
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface MFQuoteResponse {
  isin: string;
  current_nav: number;
  date: string;
  status: "live" | "delayed" | "stale" | "unavailable";
}

export interface MFSearchResult {
  isin: string;
  name: string;
}

const api = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function getStockQuote(symbol: string): Promise<QuoteResponse> {
  const res = await fetch(`${api()}/api/v1/market/quote?symbol=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query) return [];
  const res = await fetch(`${api()}/api/v1/market/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    if (res.status >= 500) throw new Error("Market data service is temporarily unavailable.");
    throw new Error("Unable to connect to market data service.");
  }
  return res.json();
}

export async function getMFNav(isin: string): Promise<MFQuoteResponse> {
  const res = await fetch(`${api()}/api/v1/market/mf-nav?isin=${encodeURIComponent(isin)}`);
  if (!res.ok) throw new Error("Failed to fetch NAV");
  return res.json();
}

export async function searchMF(query: string): Promise<MFSearchResult[]> {
  if (!query) return [];
  const res = await fetch(`${api()}/api/v1/market/mf-search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    if (res.status >= 500) throw new Error("Market data service is temporarily unavailable.");
    throw new Error("Unable to connect to market data service.");
  }
  return res.json();
}

export interface GoldPriceResponse {
  success: boolean;
  currency: string;
  unit: string;
  prices: { "22K": number; "24K": number };
  timestamp: string;
  source: string;
}

export async function getGoldPrice(): Promise<GoldPriceResponse> {
  const res = await fetch(`${api()}/api/v1/market/gold`);
  if (!res.ok) {
    throw new Error("Gold price unavailable. Please try again.");
  }
  return res.json();
}

export interface StockAgentAnalysis {
  agent: "technical" | "fundamental" | "risk";
  label: string;
  score: number;
  confidence: number;
  summary: string;
  advantages: string[];
  concerns: string[];
  evidence: string[];
  status: "complete" | "partial" | "insufficient_data";
}

export interface StockAnalysisResponse {
  symbol: string; company_name: string; currency: string; current_price: number; as_of: string; data_source: string;
  overall_score: number; risk_score: number; confidence: number;
  stance: "favourable" | "mixed" | "cautious" | "insufficient_data";
  summary: string; advantages: string[]; concerns: string[]; agents: StockAgentAnalysis[];
  market_regime: string | null; price_history: { date: string; close: number }[]; limitations: string[];
}

export async function analyzeStock(symbol: string): Promise<StockAnalysisResponse> {
  const res = await fetch(`${api()}/api/v1/market/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol }) });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || "Stock analysis is temporarily unavailable.");
  }
  return res.json();
}

export interface MarketSnapshotItem { instrument: string; symbol: string; asset_class: "equity" | "gold" | "currency" | "commodity"; value: number | null; unit: string; change: number | null; change_percent: number | null; market_timestamp: string | null; fetched_at: string; freshness: "latest_available" | "delayed" | "end_of_day" | "cached" | "unavailable"; provider: string; error: string | null; }
export interface MarketNewsItem { headline: string; source: string; published_at: string | null; affected_asset: string; explanation: string; url: string | null; }
export interface MarketOverviewResponse { fetched_at: string; cache_age_seconds: number; items: MarketSnapshotItem[]; news: MarketNewsItem[]; possible_factors: string[]; limitations: string[]; }
export async function getMarketOverview(): Promise<MarketOverviewResponse> { const res = await fetch(`${api()}/api/v1/market/overview`, { cache: "no-store" }); if (!res.ok) throw new Error("Market data temporarily unavailable."); return res.json(); }
