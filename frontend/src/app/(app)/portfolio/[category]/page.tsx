"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import { calculatePortfolioValuation } from "@/lib/financial/portfolioValuation";
import type { AssetCategoryType, AnyHolding } from "@/types/holdings";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const { session } = useFinSyncSession();

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
    gold: "Gold",
    cash: "Cash / Bank",
    other: "Other Assets"
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
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</div><div className="text-sm font-semibold text-slate-200">{h.quantity}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Price</div><div className="text-sm font-semibold text-white">{formatRupees(marketData[h.ticker]?.current_price || h.average_purchase_price)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Invested</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.invested_value)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Value</div><div className="text-sm font-semibold text-emerald-300">{formatRupees(h.currentValue)}</div></div>
                    </>
                  )}
                  {h.asset_category === 'mutual_funds' && (
                    <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Units</div><div className="text-sm font-semibold text-slate-200">{h.units}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Latest NAV</div><div className="text-sm font-semibold text-white">{formatRupees(marketData[h.scheme]?.current_price || h.average_purchase_nav)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Invested</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.invested_value)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Current Value</div><div className="text-sm font-semibold text-emerald-300">{formatRupees(h.currentValue)}</div></div>
                    </>
                  )}
                  {h.asset_category === 'cash' && (
                     <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Balance</div><div className="text-sm font-semibold text-white">{formatRupees(h.balance)}</div></div>
                  )}
                  {h.asset_category === 'fd' && (
                    <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Principal</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.principal)}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Interest</div><div className="text-sm font-semibold text-slate-200">{h.interest_rate}%</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Maturity</div><div className="text-sm font-semibold text-white">{h.maturity_date}</div></div>
                    </>
                  )}
                  {h.asset_category === 'bonds' && (
                     <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</div><div className="text-sm font-semibold text-slate-200">{h.quantity}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Invested</div><div className="text-sm font-semibold text-slate-300">{formatRupees(h.quantity * h.purchase_price)}</div></div>
                     </>
                  )}
                  {h.asset_category === 'gold' && (
                     <>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Quantity</div><div className="text-sm font-semibold text-slate-200">{h.quantity} {h.unit_name}</div></div>
                      <div><div className="text-[10px] text-slate-500 uppercase tracking-wider">Type</div><div className="text-sm font-semibold text-slate-300 capitalize">{h.gold_type}</div></div>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
