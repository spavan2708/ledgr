"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";
import { DonutChart } from "@/components/ui/DonutChart";
import { AssetCategoryType } from "@/types/holdings";

export default function PortfolioPage() {
  const { session } = useFinSyncSession();
  const router = useRouter();
  const plan = session?.financial_plan;
  const holdings = session?.holdings || [];
  const marketData = session?.market_data || {};
  const goldData = session?.gold_data;

  const valuation = calculatePortfolioValuation(holdings, marketData, goldData);
  const totalValue = valuation.totalCurrentValue;

  const categoryColors: Record<AssetCategoryType, string> = {
    stocks: "#3b82f6", // blue
    mutual_funds: "#8b5cf6", // purple
    fd: "#f59e0b", // amber
    bonds: "#10b981", // emerald
    gold: "#eab308", // yellow
    cash: "#64748b", // slate
    other: "#a8a29e" // stone
  };

  const categoryNames: Record<AssetCategoryType, string> = {
    stocks: "Stocks / Equity",
    mutual_funds: "Mutual Funds",
    fd: "Fixed Deposits",
    bonds: "Bonds / Debt",
    gold: "Gold",
    cash: "Cash / Bank",
    other: "Other Assets"
  };

  const slices = (Object.keys(valuation.categoryValues) as AssetCategoryType[])
    .map(key => ({
      id: key,
      label: categoryNames[key],
      value: valuation.categoryValues[key].currentValue,
      color: categoryColors[key],
      onClick: () => router.push(`/portfolio/${key}`)
    }))
    .filter(slice => slice.value > 0);

  const isOnboarding = !session?.profile_analysis;
  const canAnalyze = !!session?.goal_simulation;

  return (
    <div className="mx-auto w-full max-w-5xl py-10 space-y-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-2">Portfolio Allocation</h1>
          <p className="text-sm leading-6 text-slate-400">Detailed breakdown of your asset allocation strategy and portfolio health.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/portfolio/manage" className="primary-button text-xs py-1.5">+ Manage Investments</Link>
           {isOnboarding && (
             canAnalyze ? (
               <Link href="/profile/analyze" className="secondary-button text-xs py-1.5 border-emerald-500 text-emerald-400">
                 Continue to Analyse &rarr;
               </Link>
             ) : (
               <Link href="/goals" className="secondary-button text-xs py-1.5 border-emerald-500 text-emerald-400">
                 Continue to Goals &rarr;
               </Link>
             )
           )}
        </div>
      </header>

      {holdings.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-white mb-2">No investments added yet</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            You can add your existing holdings now, or skip this step and add them later. FinSync will analyze your goals regardless.
          </p>
          <div className="flex items-center justify-center gap-4">
             <Link href="/portfolio/manage" className="primary-button">+ Add Investment</Link>
             {isOnboarding && (
               canAnalyze ? (
                 <Link href="/profile/analyze" className="secondary-button">Continue to Analyse &rarr;</Link>
               ) : (
                 <Link href="/goals" className="secondary-button">Continue to Goals &rarr;</Link>
               )
             )}
          </div>
        </div>
      )}

      {holdings.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          
          {/* LEFT COLUMN: VISUALIZATION */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="w-full mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm text-center">Current Allocation</h2>
            <DonutChart 
              slices={slices} 
              totalLabel="Total Portfolio" 
              totalValue={formatRupees(totalValue)}
            />
            <p className="mt-8 text-xs text-slate-500 text-center w-full max-w-sm">
              Click on any category to view individual holdings and performance details.
            </p>
          </section>

          {/* RIGHT COLUMN: SUMMARY STATS */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-emerald-300 uppercase tracking-widest text-sm">Portfolio Summary</h2>
              <div className="space-y-4">
                <Row label="Total Portfolio Value" value={formatRupees(totalValue)} highlight />
                <Row label="Total Invested Value" value={formatRupees(valuation.totalInvestedValue)} />
                <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-slate-400">Overall Gain/Loss</span>
                  <span className={`font-medium ${valuation.totalGainLoss > 0 ? "text-emerald-400" : valuation.totalGainLoss < 0 ? "text-rose-400" : "text-white"}`}>
                    {`${valuation.totalGainLoss > 0 ? '+' : ''}${formatRupees(valuation.totalGainLoss)} (${valuation.totalGainLossPercentage.toFixed(2)}%)`}
                  </span>
                </div>
              </div>
            </section>

            {plan?.assetAllocation && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-emerald-300 uppercase tracking-widest text-sm">Target vs Current</h2>
                <div className="space-y-3">
                  {(Object.keys(plan.assetAllocation.targetAllocation) as AssetCategoryType[]).map(key => {
                    const targetPct = plan.assetAllocation!.targetAllocation[key];
                    if (targetPct === 0 && (!slices.find(s => s.id === key))) return null;
                    
                    const currentPct = totalValue > 0 ? (valuation.categoryValues[key].currentValue / totalValue) * 100 : 0;
                    const diff = currentPct - targetPct;
                    
                    return (
                      <div key={key} className="flex flex-col gap-1 py-2 border-b border-white/5 last:border-0">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{categoryNames[key]}</span>
                          <span className="text-slate-500 text-xs">Target: {targetPct.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs items-center mt-1">
                          <span className="font-bold text-white">{currentPct.toFixed(1)}%</span>
                          {Math.abs(diff) > 2 ? (
                            <span className={diff > 0 ? "text-amber-400" : "text-sky-400"}>
                              {diff > 0 ? "Overweight" : "Underweight"} ({Math.abs(diff).toFixed(1)}%)
                            </span>
                          ) : (
                            <span className="text-emerald-400">Near Target</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
      
      {isOnboarding && (
         <div className="mt-8 flex justify-end">
            {canAnalyze ? (
              <Link href="/profile/analyze" className="primary-button !py-4 px-10 text-lg">
                Confirm & Continue to Analyse &rarr;
              </Link>
            ) : (
              <Link href="/goals" className="primary-button !py-4 px-10 text-lg">
                Continue to Goals &rarr;
              </Link>
            )}
         </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "font-bold text-white text-lg" : "font-medium text-white"}>{value}</span>
    </div>
  );
}
