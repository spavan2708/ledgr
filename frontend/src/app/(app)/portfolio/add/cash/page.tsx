"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { CashHolding } from "@/types/holdings";

export default function AddCashPage() {
  const router = useRouter();
  const { session, setHoldings } = useFinSyncSession();
  
  const [bank, setBank] = useState("");
  const [balance, setBalance] = useState("");

  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setBank(existing.name);
        setBalance(existing.balance.toString());
      }
    }
  }, [editId, session?.holdings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || !balance) return;

    const bal = parseFloat(balance);
    if (isNaN(bal) || bal < 0) {
      alert("Please enter a valid positive balance.");
      return;
    }

    const holding: CashHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "cash",
      name: bank,
      balance: bal,
      total_deposited: bal,
      total_withdrawn: 0,
      transactions: editId && session?.holdings.find(h => h.id === editId) ? (session.holdings.find(h => h.id === editId) as any).transactions || [] : [{ id: crypto.randomUUID(), date: new Date().toISOString(), type: 'deposit', quantity: bal, price: 1 }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/cash");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        â† Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Cash / Bank Balance</h1>
        <p className="text-slate-400">Track your savings, current, and emergency accounts.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bank / Account Name</label>
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
               placeholder="e.g. HDFC Savings Account"
               value={bank}
               onChange={e => setBank(e.target.value)}
               required
             />
           </div>
           
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Balance</label>
             <input 
               type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
               placeholder="e.g. 500000"
               value={balance}
               onChange={e => setBalance(e.target.value)}
               required
             />
           </div>

           <button type="submit" disabled={!bank || !balance} className="primary-button w-full mt-4">Save Holding</button>
        </form>
      </div>
    </div>
  );
}
