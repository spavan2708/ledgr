"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { BondHolding } from "@/types/holdings";

export default function AddBondPage() {
  const router = useRouter();
  const { session, setHoldings } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setName(existing.name);
        setQuantity(existing.quantity.toString());
        setPurchasePrice(existing.purchase_price.toString());
        setFaceValue(existing.face_value.toString());
        if (existing.coupon_rate) setCouponRate(existing.coupon_rate.toString());
        if (existing.purchase_date) setPurchaseDate(existing.purchase_date.split("T")[0]);
        if (existing.maturity_date) setMaturityDate(existing.maturity_date.split("T")[0]);
        if (existing.current_price) setCurrentPrice(existing.current_price.toString());
      }
    }
  }, [editId, session?.holdings]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [faceValue, setFaceValue] = useState("");
  const [couponRate, setCouponRate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [maturityDate, setMaturityDate] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !purchasePrice || !faceValue) return;
    if (!name || !quantity || !purchasePrice || !faceValue || !purchaseDate) return;

    const qty = parseFloat(quantity);
    const px = parseFloat(purchasePrice);
    const fv = parseFloat(faceValue);
    const cp = currentPrice ? parseFloat(currentPrice) : px;
    const cr = couponRate ? parseFloat(couponRate) : undefined;

    if (isNaN(qty) || qty <= 0 || isNaN(px) || px <= 0 || isNaN(fv) || fv <= 0 || isNaN(cp) || cp < 0 || (cr !== undefined && (isNaN(cr) || cr < 0))) {
      alert("Please enter valid positive numeric values.");
      return;
    }

    if (maturityDate && new Date(maturityDate) <= new Date(purchaseDate)) {
      alert("Maturity date must be after purchase date.");
      return;
    }

    const holding: BondHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "bonds",
      name,
      quantity: qty,
      purchase_price: px,
      current_price: cp,
      face_value: fv,
      coupon_rate: cr,
      purchase_date: new Date(purchaseDate).toISOString(),
      maturity_date: maturityDate ? new Date(maturityDate).toISOString() : undefined,
      created_at: new Date().toISOString(),
      transactions: editId && session?.holdings.find(h => h.id === editId) ? (session.holdings.find(h => h.id === editId) as any).transactions || [] : [{ id: crypto.randomUUID(), date: new Date(purchaseDate).toISOString(), type: 'buy', quantity: qty, price: px }],
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/bonds");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        â†  Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Bond / Debt Instrument</h1>
        <p className="text-slate-400">Track corporate bonds, government securities, and other debt.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bond Name / ISIN</label>
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
               placeholder="e.g. NHAI Tax Free Bond"
               value={name}
               onChange={e => setName(e.target.value)}
               required
             />
           </div>

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 100"
                 value={quantity}
                 onChange={e => setQuantity(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase Price (per unit)</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 1020"
                 value={purchasePrice}
                 onChange={e => setPurchasePrice(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Face Value (per unit)</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 1000"
                 value={faceValue}
                 onChange={e => setFaceValue(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coupon Rate (%)</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="Optional"
                 value={couponRate}
                 onChange={e => setCouponRate(e.target.value)}
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
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Maturity Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                 value={maturityDate}
                 onChange={e => setMaturityDate(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Estimated Price (per unit)</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="Leave empty if unknown"
                 value={currentPrice}
                 onChange={e => setCurrentPrice(e.target.value)}
                 min="1"
                 step="any"
               />
             </div>
           </div>

           {quantity && purchasePrice && (
             <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center text-sm">
               <span className="text-slate-400">Total Invested Value</span>
               <span className="font-bold text-white">â‚¹ {(parseFloat(quantity) * parseFloat(purchasePrice)).toFixed(2)}</span>
             </div>
           )}

           <button type="submit" disabled={!name || !quantity || !purchasePrice || !faceValue} className="primary-button w-full mt-4">Save Holding</button>
        </form>
      </div>
    </div>
  );
}
