"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManagePortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-2xl py-10 space-y-8">
      <Link href="/portfolio" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        ← Back to Portfolio
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Manage Investments</h1>
        <p className="text-slate-400">Select an asset type to add to your ledgr portfolio.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
         <Link href="/portfolio/add/stock" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-blue-400 transition">Stocks / Equity</div>
             <div className="text-xs text-slate-400 mt-1">Live market pricing</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
         
         <Link href="/portfolio/add/mf" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-purple-400 transition">Mutual Funds</div>
             <div className="text-xs text-slate-400 mt-1">Live NAV tracking</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
         
         <Link href="/portfolio/add/cash" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-emerald-400 transition">Cash / Bank</div>
             <div className="text-xs text-slate-400 mt-1">Savings & Emergency</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
         
         <Link href="/portfolio/add/fd" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-amber-400 transition">Fixed Deposits</div>
             <div className="text-xs text-slate-400 mt-1">Guaranteed returns</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
         
         <Link href="/portfolio/add/bond" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-indigo-400 transition">Bonds / Debt</div>
             <div className="text-xs text-slate-400 mt-1">Corporate & Govt</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
         

         <Link href="/portfolio/add/other" className="flex items-center p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group">
           <div className="flex-1">
             <div className="font-bold text-white group-hover:text-slate-300 transition">Other Asset</div>
             <div className="text-xs text-slate-400 mt-1">Property, Collectibles, Manual Valuation</div>
           </div>
           <div className="text-2xl opacity-50"></div>
         </Link>
      </div>
    </div>
  );
}
