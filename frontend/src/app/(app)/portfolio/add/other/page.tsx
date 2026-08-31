"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { OtherAssetHolding } from "@/types/holdings";

export default function AddOtherPage() {
  const router = useRouter();
  const { session, setHoldings } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setName(existing.name);
        setDescription(existing.description || "");
        setEstimatedValue(existing.estimated_value?.toString() || "");
        setPurchaseValue(existing.purchase_value?.toString() || "");
      }
    }
  }, [editId, session?.holdings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !estimatedValue || !date) return;

    const estVal = parseFloat(estimatedValue);
    const purVal = purchaseValue ? parseFloat(purchaseValue) : estVal; // Fallback to estVal if no purchase value provided

    if (isNaN(estVal) || estVal < 0 || isNaN(purVal) || purVal <= 0) {
      alert("Please enter valid positive numeric values.");
      return;
    }

    const holding: OtherAssetHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "other",
      name,
      description,
      estimated_value: estVal,
      purchase_value: purVal,
      created_at: new Date().toISOString(),
      transactions: editId && session?.holdings.find(h => h.id === editId) 
        ? (session.holdings.find(h => h.id === editId) as any).transactions || [] 
        : [{ id: crypto.randomUUID(), date: new Date(date).toISOString(), type: 'buy', quantity: 1, price: purVal }],
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/other");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        &larr; Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{editId ? "Edit" : "Add"} Other Asset</h1>
        <p className="text-slate-400">Track property, real estate, collectibles, or unlisted investments.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asset Name</label>
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
               placeholder="e.g. Bangalore Apartment"
               value={name}
               onChange={e => setName(e.target.value)}
               required
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
             <textarea 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
               placeholder="Brief details about the asset..."
               value={description}
               onChange={e => setDescription(e.target.value)}
               rows={3}
             />
           </div>

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Purchase / Acquisition Value</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 12000000"
                 value={purchaseValue}
                 onChange={e => setPurchaseValue(e.target.value)}
               />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Estimated Value</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 15000000"
                 value={estimatedValue}
                 onChange={e => setEstimatedValue(e.target.value)}
                 required
               />
               <p className="text-xs text-slate-500 mt-2">Used as the live portfolio value.</p>
             </div>
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Acquisition Date</label>
             <input 
               type="date" 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
               value={date}
               onChange={e => setDate(e.target.value)}
               required
             />
           </div>

           <button type="submit" disabled={!name || !estimatedValue || !date} className="primary-button w-full mt-4">Save Holding</button>
        </form>
      </div>
    </div>
  );
}
