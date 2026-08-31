"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { FixedDepositHolding } from "@/types/holdings";

export default function AddFDPage() {
  const router = useRouter();
  const { session, setHoldings } = useFinSyncSession();
  
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  useEffect(() => {
    if (editId && session?.holdings) {
      const existing = session.holdings.find(h => h.id === editId) as any;
      if (existing) {
        setInstitution(existing.institution);
        setPrincipal(existing.principal.toString());
        setRate(existing.interest_rate.toString());
        if (existing.start_date) setStartDate(existing.start_date.split("T")[0]);
        if (existing.maturity_date) setMaturityDate(existing.maturity_date.split("T")[0]);
        if (existing.accrued_interest) setAccruedInterest(existing.accrued_interest.toString());
        setCompounding(existing.compounding_frequency);
      }
    }
  }, [editId, session?.holdings]);

  const [institution, setInstitution] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [accruedInterest, setAccruedInterest] = useState("");
  const [compounding, setCompounding] = useState<"monthly" | "quarterly" | "half_yearly" | "yearly" | "at_maturity">("quarterly");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !principal || !rate || !startDate || !maturityDate) return;
    
    if (new Date(maturityDate) <= new Date(startDate)) {
      alert("Maturity date must be after the start date.");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const ai = accruedInterest ? parseFloat(accruedInterest) : undefined;

    if (isNaN(p) || p <= 0 || isNaN(r) || r < 0 || (ai !== undefined && (isNaN(ai) || ai < 0))) {
      alert("Please enter valid numeric values.");
      return;
    }

    const holding: FixedDepositHolding = {
      id: editId || crypto.randomUUID(),
      asset_category: "fd",
      name: `${institution} FD`,
      institution,
      principal: p,
      interest_rate: r,
      start_date: new Date(startDate).toISOString(),
      maturity_date: new Date(maturityDate).toISOString(),
      compounding_frequency: compounding,
      accrued_interest: ai,
      status: "active",
      created_at: new Date().toISOString(),
      transactions: editId && session?.holdings.find(h => h.id === editId) ? (session.holdings.find(h => h.id === editId) as any).transactions || [] : [{ id: crypto.randomUUID(), date: new Date(startDate).toISOString(), type: 'deposit', quantity: p, price: 1 }],
      updated_at: new Date().toISOString()
    };

    setHoldings(editId ? session!.holdings.map(h => h.id === editId ? holding : h) : [...(session?.holdings || []), holding]);
    router.push("/portfolio/fd");
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio/manage" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        â†  Back to Manage
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add Fixed Deposit</h1>
        <p className="text-slate-400">Track guaranteed returns from banks and post offices.</p>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bank / Institution</label>
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
               placeholder="e.g. SBI, Post Office"
               value={institution}
               onChange={e => setInstitution(e.target.value)}
               required
             />
           </div>
           
           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Principal Amount</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 100000"
                 value={principal}
                 onChange={e => setPrincipal(e.target.value)}
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interest Rate (%)</label>
               <input 
                 type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 7.1"
                 value={rate}
                 onChange={e => setRate(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                 value={startDate}
                 onChange={e => setStartDate(e.target.value)}
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
                 required
               />
             </div>
           </div>

           <div className="grid gap-4 md:grid-cols-2">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interest Payout</label>
               <select 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                 value={compounding}
                 onChange={e => setCompounding(e.target.value as any)}
               >
                 <option value="monthly">Monthly</option>
                 <option value="quarterly">Quarterly</option>
                 <option value="half_yearly">Half Yearly</option>
                 <option value="yearly">Yearly</option>
                 <option value="at_maturity">At Maturity (Cumulative)</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Accrued Interest (Optional)</label>
               <input 
                 type="number" 
                 className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!editId}
                 placeholder="e.g. 5000"
                 value={accruedInterest}
                 onChange={e => setAccruedInterest(e.target.value)}
                 min="0"
                 step="any"
               />
             </div>
           </div>

           <button type="submit" disabled={!institution || !principal || !rate || !startDate || !maturityDate} className="primary-button w-full mt-4">Save Holding</button>
        </form>
      </div>
    </div>
  );
}
