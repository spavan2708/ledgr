"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { MutualFundHolding } from "@/types/holdings";
import { searchMF, getMFNav, MFSearchResult, MFQuoteResponse } from "@/lib/marketData";

export default function AddMFPage() {
  const router = useRouter();
  const { session, setHoldings, updateMarketData } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setSelectedFund({ name: existing.name, isin: existing.scheme });
        setUnits(existing.units.toString());
        setAvgNav(existing.average_purchase_nav.toString());
        if (existing.folio) setFolio(existing.folio);
        if (existing.purchase_date) setPurchaseDate(existing.purchase_date.split("T")[0]);
      }
    }
  }, [editId, session?.holdings]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MFSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedFund, setSelectedFund] = useState<MFSearchResult | null>(null);
  const [quote, setQuote] = useState<MFQuoteResponse | null>(null);
  
  const [units, setUnits] = useState("");
  const [avgNav, setAvgNav] = useState("");
  const [folio, setFolio] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setError("");
    setResults([]);
    try {
      const res = await searchMF(query);
      if (res.length === 0) {
        setError("No matching mutual funds found.");
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

  const selectFund = async (fund: MFSearchResult) => {
    setSelectedFund(fund);
    setResults([]);
    try {
      const q = await getMFNav(fund.isin);
      setQuote(q);
      setAvgNav(q.current_nav.toString());
      updateMarketData({ [fund.isin]: {
         symbol: fund.isin,
         current_price: q.current_nav,
         currency: "INR",
         last_updated: q.date,
         status: q.status
      }});
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    if (!selectedFund || !units || !avgNav || !purchaseDate) return;
    
    const qty = parseFloat(units);
    const px = parseFloat(avgNav);

    const holding: MutualFundHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "mutual_funds",
      name: selectedFund.name,
      notes: folio ? `Folio: ${folio}` : undefined,
      amc: selectedFund.name.split(" ")[0], // naive extraction
      scheme: selectedFund.isin,
      units: qty,
      average_purchase_nav: px,
      invested_value: qty * px,
      transactions: editId && session?.holdings.find(h => h.id === editId) ? (session.holdings.find(h => h.id === editId) as any).transactions || [] : [{ id: crypto.randomUUID(), date: new Date(purchaseDate).toISOString(), type: 'buy', quantity: qty, price: px }],
      created_at: new Date(purchaseDate).toISOString(),
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/mutual_funds");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        â† Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Mutual Fund</h1>
        <p className="text-slate-400">Search for a mutual fund scheme by name.</p>
      </header>

      {!selectedFund ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
               type="text"
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Search fund (e.g. HDFC Flexi Cap)"
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
            <div className="mt-6 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 max-h-96 overflow-y-auto">
              {results.map(r => (
                <button 
                  key={r.isin} 
                  onClick={() => selectFund(r)}
                  className="w-full text-left p-4 hover:bg-white/5 transition flex flex-col items-start gap-1"
                >
                  <div className="font-bold text-white text-sm">{r.name}</div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    ISIN: {r.isin}
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
               <h2 className="text-lg font-bold text-white leading-tight">{selectedFund.name}</h2>
               <div className="text-sm text-slate-400 mt-2">ISIN: {selectedFund.isin}</div>
             </div>
             <button onClick={() => setSelectedFund(null)} className="text-xs text-slate-500 hover:text-white shrink-0">Change</button>
           </div>

           {quote && (
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
               <span className="text-sm text-emerald-400 font-bold">Latest NAV ({quote.date})</span>
               <span className="text-xl font-bold text-white">â‚¹ {quote.current_nav.toFixed(4)}</span>
             </div>
           )}

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Units Held</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 125.4"
                 value={units}
                 onChange={e => setUnits(e.target.value)}
                 min="0.0001"
                 step="any"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Average Purchase NAV</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 50.2"
                 value={avgNav}
                 onChange={e => setAvgNav(e.target.value)}
                 min="0.01"
                 step="any"
               />
             </div>
           </div>

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Folio Number (Optional)</label>
               <input 
                 type="text" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                 placeholder="e.g. 1012345678"
                 value={folio}
                 onChange={e => setFolio(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                 value={purchaseDate}
                 onChange={e => setPurchaseDate(e.target.value)}
                 required
               />
             </div>
           </div>

           {units && avgNav && (
             <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center text-sm">
               <span className="text-slate-400">Total Invested Value</span>
               <span className="font-bold text-white">â‚¹ {(parseFloat(units) * parseFloat(avgNav)).toFixed(2)}</span>
             </div>
           )}

           <button onClick={handleSave} disabled={!units || !avgNav} className="primary-button w-full mt-4">Save Holding</button>
        </div>
      )}
    </div>
  );
}
