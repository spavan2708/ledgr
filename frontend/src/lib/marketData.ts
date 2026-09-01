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

// Removed gold api calls
