import { AssetAllocationResult } from "@/lib/financial/assetAllocation";
import { formatRupees } from "@/lib/formatters";

interface AssetAllocationCardProps {
  allocation: AssetAllocationResult;
}

export function AssetAllocationCard({ allocation }: AssetAllocationCardProps) {
  return (
    <Card title={`Asset Allocation (Factor: ${allocation.riskFactor}/10 — ${allocation.riskCategory})`}>
      {/* 1. Investable Capacity */}
      <div className="mb-6 border-b border-white/5 pb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">1. Investable Capacity</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
            <div className="text-slate-400 text-xs uppercase mb-1">Monthly Surplus</div>
            <div className="text-lg font-bold text-slate-300">{formatRupees(allocation.monthlySurplus)}</div>
          </div>
          <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
            <div className="text-slate-400 text-xs uppercase mb-1">Emergency Reserve</div>
            <div className="text-lg font-bold text-amber-300">-{formatRupees(allocation.emergencyContribution)}</div>
          </div>
          <div className="rounded-xl bg-emerald-900/20 p-3 text-center border border-emerald-500/20">
            <div className="text-emerald-400/80 text-xs uppercase mb-1">Available to Invest</div>
            <div className="text-xl font-bold text-emerald-400">{formatRupees(allocation.investableMonthlyCapacity)}</div>
          </div>
        </div>
      </div>

      {/* 2 & 3. Target and Current Allocation */}
      <div className="mb-6 border-b border-white/5 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">3. Your Current Portfolio</h3>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
            {allocation.entries.every(e => e.currentPercentage === 0) ? "2. Suggested Future Target" : "2. Target Allocation"}
          </h3>
        </div>
        
        {allocation.entries.every(e => e.currentPercentage === 0) && (
          <div className="my-2 rounded bg-sky-400/10 p-2 text-xs text-sky-300 text-center border border-sky-400/20">
            No existing investment allocation.
          </div>
        )}

        <div className="mt-3 space-y-2">
          {allocation.entries.map(e => {
            const name = e.assetClass === "cash" ? "Cash/Bank" : e.assetClass === "fd" ? "Fixed Deposits" : e.assetClass === "mutual_funds" ? "Mutual Funds" : e.assetClass === "stocks" ? "Stocks/Equity" : e.assetClass === "bonds" ? "Bonds/Debt" : "Gold";
            const hasInvestments = !allocation.entries.every(x => x.currentPercentage === 0);
            
            return (
              <div key={e.assetClass} className="flex items-center text-sm border-t border-white/5 pt-2">
                <div className="w-1/4 font-medium text-slate-300 text-xs">{name}</div>
                <div className="w-1/4 text-center">
                  <span className="text-white">{hasInvestments ? `${Math.round(e.currentPercentage)}%` : "-"}</span>
                </div>
                <div className="w-1/4 text-center">
                  {hasInvestments && e.status !== "N/A" && (
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${e.status === "Overweight" ? "bg-amber-500/20 text-amber-400" : e.status === "Underweight" ? "bg-sky-500/20 text-sky-400" : "text-emerald-500"}`}>
                      {e.status}
                    </span>
                  )}
                </div>
                <div className="w-1/4 text-right">
                  <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-1 rounded">{Math.round(e.targetPercentage)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. New Money Allocation */}
      <div className="mb-6 border-b border-white/5 pb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">4. Where New Money Goes</h3>
        {allocation.allocationStatus === "unavailable" ? (
          <div className="rounded-xl bg-slate-800/50 p-4 text-center text-sm text-slate-400">
            You currently have no surplus available for new investments. Focus on managing expenses and debt.
          </div>
        ) : (
          <div className="space-y-2">
            {allocation.entries.map(e => {
              if (e.newMoneyAmount <= 0) return null;
              const name = e.assetClass === "cash" ? "Cash/Bank" : e.assetClass === "fd" ? "Fixed Deposits" : e.assetClass === "mutual_funds" ? "Mutual Funds" : e.assetClass === "stocks" ? "Stocks/Equity" : e.assetClass === "bonds" ? "Bonds/Debt" : "Gold";
              return (
                <div key={e.assetClass} className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded">
                  <span className="text-sm text-slate-300">{name}</span>
                  <span className="font-bold text-white text-sm">{formatRupees(e.newMoneyAmount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Why */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">5. Why (Deterministic Analysis)</h3>
        <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
          {allocation.rationale.map((reason, i) => (
            <li key={i} className="leading-relaxed">{reason}</li>
          ))}
          {allocation.constraints.map((constraint, i) => (
            <li key={`c-${i}`} className="leading-relaxed text-amber-400/80">{constraint}</li>
          ))}
        </ul>
      </div>

    </Card>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm mb-8">
      <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">{title}</h2>
      {children}
    </section>
  );
}
