"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { StockHolding } from "@/types/holdings";
import { searchStocks, getStockQuote, SearchResult, QuoteResponse } from "@/lib/marketData";

export default function AddStockPage() {
  const router = useRouter();
  const { session, setHoldings, updateMarketData } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setSelectedStock({ symbol: existing.ticker, name: existing.name, exchange: existing.exchange });
        setQuantity(existing.quantity.toString());
        setAvgPrice(existing.average_purchase_price.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setError("");
    setResults([]);
    try {
      const res = await searchStocks(query);
      if (res.length === 0) {
        setError("No matching companies found.");
      } else {
        setResults(res);
      }
    } catch (e: any) {
      setError(e.message || "Unable to connect to market data service.");
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectStock = async (stock: SearchResult) => {
    // Block direct index additions
    if (stock.symbol.startsWith('^')) {
      setError(`Cannot add index ${stock.symbol} directly. Actual ETFs/MFs that track this index can be held instead.`);
      return;
    }

    setSelectedStock(stock);
    setResults([]);
    try {
      const q = await getStockQuote(stock.symbol);
      setQuote(q);
      setAvgPrice(q.current_price.toString());
      updateMarketData({ [stock.symbol]: {
         symbol: stock.symbol,
         current_price: q.current_price,
         currency: q.currency,
         last_updated: q.last_updated,
         status: q.status
      }});
    } catch (e) {
      console.error(e);
      // Fallback
    }
  };

  const handleSave = () => {
    if (!selectedStock || !quantity || !avgPrice) return;
    
    const qty = parseFloat(quantity);
    const px = parseFloat(avgPrice);

    const holding: StockHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "stocks",
      name: selectedStock.name,
      ticker: selectedStock.symbol,
      exchange: selectedStock.exchange,
      quantity: qty,
      average_purchase_price: px,
      invested_value: qty * px,
      transactions: editId && session?.holdings.find(h => h.id === editId) ? (session.holdings.find(h => h.id === editId) as any).transactions || [] : [{ id: crypto.randomUUID(), date: new Date().toISOString(), type: 'buy', quantity: qty, price: px }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/stocks");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        â† Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Stock Holding</h1>
        <p className="text-slate-400">Search for a company to add to your equity portfolio.</p>
      </header>

      {!selectedStock ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
               type="text"
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Search company (e.g. Reliance, AAPL)"
               className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
            />
            <button type="submit" disabled={isSearching} className="primary-button">{isSearching ? "..." : "Search"}</button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded bg-rose-500/10 text-rose-400 text-sm font-semibold border border-rose-500/20">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
              {results.map(r => (
                <button 
                  key={r.symbol} 
                  onClick={() => selectStock(r)}
                  className="w-full text-left p-4 hover:bg-white/5 transition flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-white">{r.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{r.exchange}</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    {r.symbol}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
           <div className="flex justify-between items-start border-b border-white/10 pb-4">
             <div>
               <h2 className="text-xl font-bold text-white">{selectedStock.name}</h2>
               <div className="text-sm text-slate-400 mt-1">{selectedStock.exchange}: {selectedStock.symbol}</div>
             </div>
             <button onClick={() => setSelectedStock(null)} className="text-xs text-slate-500 hover:text-white">Change</button>
           </div>

           {quote && (
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
               <span className="text-sm text-emerald-400 font-bold">Current Market Price</span>
               <span className="text-xl font-bold text-white">{quote.currency} {quote.current_price.toFixed(2)}</span>
             </div>
           )}

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity Held {editId && "(Edit via transactions)"}</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 20"
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
                 min="0.0001"
                 step="any"
                 disabled={!!editId}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Average Purchase Price {editId && "(Edit via transactions)"}</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 1200"
                 value={avgPrice}
                 onChange={e => setAvgPrice(e.target.value)}
                 min="0.01"
                 step="any"
                 disabled={!!editId}
               />
             </div>
           </div>

           {quantity && avgPrice && (
             <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center text-sm">
               <span className="text-slate-400">Total Invested Value</span>
               <span className="font-bold text-white">â‚¹ {(parseFloat(quantity) * parseFloat(avgPrice)).toFixed(2)}</span>
             </div>
           )}

           <button onClick={handleSave} disabled={!quantity || !avgPrice} className="primary-button w-full mt-4">Save Holding</button>
        </div>
      )}
    </div>
  );
}
