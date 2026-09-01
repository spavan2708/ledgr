"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";
import type { AssetCategoryType, AnyHolding } from "@/types/holdings";
import { syncHoldingsToProfile } from "@/lib/financial/syncHoldings";
import { generateFinancialPlan } from "@/lib/financial/engine";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const { session, setHoldings, setProfile } = useFinSyncSession();
  const [deleteTarget, setDeleteTarget] = useState<AnyHolding | null>(null);

  const holdings = session?.holdings || [];
  const marketData = session?.market_data || {};

  const valuation = calculatePortfolioValuation(holdings, marketData);
  const catKey = category as AssetCategoryType;
  const catData = valuation.categoryValues[catKey];

  if (!catData) {
    return <div className="text-center p-10 text-white">Category not found</div>;
  }

  const catHoldings = valuation.holdingsWithValuation.filter(h => h.asset_category === catKey);

  const categoryNames: Record<AssetCategoryType, string> = {
    stocks: "Stocks / Equity",
    mutual_funds: "Mutual Funds",
    fd: "Fixed Deposits",
    bonds: "Bonds / Debt",

    cash: "Cash / Bank",
    other: "Other Assets"
  };

  const handleDeleteHolding = (holding: AnyHolding) => {
    if (!session) return;
    const newHoldings = holdings.filter(h => h.id !== holding.id);
    setHoldings(newHoldings);

    if (session.profile_input) {
      const newProfile = syncHoldingsToProfile(newHoldings, marketData, session.profile_input);
      const plan = generateFinancialPlan(newProfile);
      if (session.financial_plan?.unifiedRiskFactor) plan.unifiedRiskFactor = session.financial_plan.unifiedRiskFactor;
      if (session.financial_plan?.assetAllocation) plan.assetAllocation = session.financial_plan.assetAllocation; 
      setProfile(newProfile, plan, session.profile_analysis);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl py-10 space-y-8">
      <Link href="/portfolio" className="text-emerald-400 text-sm hover:underline flex items-center gap-2 mb-4">
        ← Back to Portfolio
      </Link>

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-2">{categoryNames[catKey]}</h1>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/portfolio/add/${catKey === 'stocks' ? 'stock' : catKey === 'mutual_funds' ? 'mf' : catKey}`} className="primary-button text-xs py-1.5">+ Add {categoryNames[catKey]}</Link>
        </div>
      </header>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
         <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-xs text-slate-400 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-white">{formatRupees(catData.currentValue)}</div>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-xs text-slate-400 mb-1">Total Invested</div>
            <div className="text-xl font-bold text-slate-300">{formatRupees(catData.investedValue)}</div>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-xs text-slate-400 mb-1">Overall Gain/Loss</div>
            <div className={`text-xl font-bold ${catData.gainLoss > 0 ? "text-emerald-400" : catData.gainLoss < 0 ? "text-rose-400" : "text-white"}`}>
              {catData.gainLoss > 0 ? '+' : ''}{formatRupees(catData.gainLoss)}
            </div>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <div className="text-xs text-slate-400 mb-1">Gain/Loss %</div>
            <div className={`text-xl font-bold ${catData.gainLossPercentage > 0 ? "text-emerald-400" : catData.gainLossPercentage < 0 ? "text-rose-400" : "text-white"}`}>
              {catData.gainLossPercentage > 0 ? '+' : ''}{catData.gainLossPercentage.toFixed(2)}%
            </div>
         </div>
      </div>

      {catHoldings.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.02]">
          <p className="text-slate-400">No {categoryNames[catKey]} holdings yet.</p>
          <Link href={`/portfolio/manage?category=${catKey}`} className="primary-button mt-4 inline-block">Add your first holding</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {catHoldings.map(h => (
            <div key={h.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-white">{h.name}</h3>
                  {h.asset_category === 'stocks' && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">{h.exchange}: {h.ticker}</span>}
                  {h.asset_category === 'mutual_funds' && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{h.amc}</span>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {h.asset_category === 'stocks' && (
                    <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity Held</div><div className="text-sm font-semibold text-slate-200">{h.calculatedQuantity}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Price</div><div className="text-sm font-semibold text-white">{formatRupees(marketData[h.ticker]?.current_price || h.average_purchase_price)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Cost Basis</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.calculatedInvested)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Value</div><div className="text-sm font-semibold text-emerald-300">{formatRupees(h.currentValue)}</div></div>
                    </>
                  )}
                  {h.asset_category === 'mutual_funds' && (
                    <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Units Held</div><div className="text-sm font-semibold text-slate-200">{h.calculatedQuantity}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Latest NAV</div><div className="text-sm font-semibold text-white">{formatRupees(marketData[h.scheme]?.current_price || h.average_purchase_nav)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Cost Basis</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.calculatedInvested)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Value</div><div className="text-sm font-semibold text-emerald-300">{formatRupees(h.currentValue)}</div></div>
                    </>
                  )}
                  {h.asset_category === 'cash' && (
                     <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Balance</div><div className="text-sm font-semibold text-white">{formatRupees(h.currentValue)}</div></div>
                  )}
                  {h.asset_category === 'fd' && (
                    <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Principal</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.calculatedInvested)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Interest</div><div className="text-sm font-semibold text-slate-200">{h.interest_rate}%</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Maturity</div><div className="text-sm font-semibold text-white">{h.maturity_date ? new Date(h.maturity_date).toLocaleDateString() : 'N/A'}</div></div>
                    </>
                  )}
                  {h.asset_category === 'bonds' && (
                     <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity Held</div><div className="text-sm font-semibold text-slate-200">{h.calculatedQuantity}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Invested / Cost Basis</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.calculatedInvested)}</div></div>
                     </>
                  )}

                  {h.asset_category === 'other' && (
                     <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Est Value</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.estimated_value)}</div></div>
                     </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-between min-w-[120px] gap-4">
                <div className="text-right">
                   {(h.asset_category === 'stocks' || h.asset_category === 'mutual_funds') && (
                     <>
                       <div className={`font-bold text-lg ${h.gainLoss > 0 ? "text-emerald-400" : h.gainLoss < 0 ? "text-rose-400" : "text-white"}`}>
                         {h.gainLoss > 0 ? '+' : ''}{formatRupees(h.gainLoss)}
                       </div>
                       <div className={`text-xs ${h.gainLossPercentage > 0 ? "text-emerald-400" : h.gainLossPercentage < 0 ? "text-rose-400" : "text-slate-400"}`}>
                         {h.gainLossPercentage > 0 ? '+' : ''}{h.gainLossPercentage.toFixed(2)}%
                       </div>
                     </>
                   )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/portfolio/${catKey}/${h.id}`} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors">Details</Link>
                    <button 
                      onClick={() => setDeleteTarget(h)} 
                      className="border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                    >
                      Delete
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Delete Investment</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{deleteTarget.name}</strong>? This action cannot be undone and will permanently remove this holding and all associated transaction history.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="secondary-button text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHolding(deleteTarget)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs py-2 px-4 transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

