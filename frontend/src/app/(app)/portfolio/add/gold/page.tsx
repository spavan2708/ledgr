"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { GoldHolding } from "@/types/holdings";
import { getGoldPrice, GoldPriceResponse } from "@/lib/marketData";

export default function AddGoldPage() {
  const router = useRouter();
  const { session, setHoldings } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [purity, setPurity] = useState<"22K" | "24K">("24K");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [marketData, setMarketData] = useState<GoldPriceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing metadata if editing
  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setPurity(existing.gold_type === "22K" ? "22K" : "24K");
        setQuantity(existing.quantity.toString());
      }
    }
  }, [editId, session?.holdings]);

  // Fetch Gold Price continuously
  useEffect(() => {
    let active = true;
    const fetchGold = async () => {
      try {
        setError(null);
        const data = await getGoldPrice();
        if (active) {
          setMarketData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to fetch gold price");
          setLoading(false);
        }
      }
    };
    
    fetchGold();
    const interval = setInterval(fetchGold, 30000); // 30s refresh while on page
    return () => { active = false; clearInterval(interval); };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !purchasePrice) return;

    const qty = parseFloat(quantity);
    const px = parseFloat(purchasePrice);
    if (isNaN(qty) || qty <= 0 || isNaN(px) || px <= 0) {
      alert("Please enter a valid positive quantity and price.");
      return;
    }

    const currentPrice = marketData ? marketData.prices[purity] : px;

    const holding: GoldHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "gold",
      name: `${purity} Gold`, // Automatic generic naming
      gold_type: purity,
      quantity: qty,
      unit_name: "grams",
      average_purchase_price: px,
      invested_value: qty * px,
      created_at: new Date().toISOString(),
      transactions: editId && session?.holdings.find(h => h.id === editId) 
        ? (session.holdings.find(h => h.id === editId) as any).transactions || [] 
        : [{ id: crypto.randomUUID(), date: new Date(date).toISOString(), type: 'buy', quantity: qty, price: px }],
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/gold");
  };

  const currentPrice = marketData ? marketData.prices[purity] : 0;
  const parsedQty = parseFloat(quantity);
  const parsedPx = parseFloat(purchasePrice);
  const isValidQty = !isNaN(parsedQty) && parsedQty > 0;
  const isValidPx = !isNaN(parsedPx) && parsedPx > 0;

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        &larr; Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Gold Investment</h1>
        <p className="text-slate-400">Track physical gold based on live market pricing.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gold Purity</label>
               <select 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                 disabled={!!editId} // Purity must remain attached to holding
                 value={purity}
                 onChange={e => setPurity(e.target.value as any)}
               >
                 <option value="24K">24K</option>
                 <option value="22K">22K</option>
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity (grams)</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 50"
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
                 required
               />
             </div>
           </div>

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase Price per gram</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 6500"
                 value={purchasePrice}
                 onChange={e => setPurchasePrice(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase Date</label>
               <input 
                 type="date"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 value={date}
                 onChange={e => setDate(e.target.value)}
                 required
               />
             </div>
           </div>

           {/* Market Price Display */}
           <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5 space-y-3">
             <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Current {purity} Price</span>
                   {loading ? (
                     <span className="text-sm text-emerald-400 animate-pulse">Fetching live quote...</span>
                   ) : error ? (
                     <span className="text-sm text-rose-400">{error}</span>
                   ) : (
                     <span className="font-bold text-lg text-white">₹ {currentPrice?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / gram</span>
                   )}
                </div>
                {marketData && !loading && (
                   <div className="text-right">
                     <span className="text-[10px] uppercase font-bold text-slate-500 block">Source: {marketData.source}</span>
                     <span className="text-xs text-slate-400">Last updated: {new Date(marketData.timestamp).toLocaleTimeString()}</span>
                   </div>
                )}
             </div>

             <div className="flex justify-between items-center pt-1">
               <span className="text-slate-400 text-sm">Purchase Value</span>
               <span className="font-bold text-white text-xl">
                 {isValidQty && currentPrice ? `₹ ${(parsedQty * currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹ 0.00"}
               </span>
             </div>
           </div>

           <button type="submit" disabled={!isValidQty || !isValidPx || !currentPrice || loading || !!error} className="primary-button w-full mt-4">
             Save Gold Holding
           </button>
        </form>
      </div>
    </div>
  );
}
