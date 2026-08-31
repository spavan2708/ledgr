"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { formatRupees } from "@/lib/formatters";
import type { FinancialPlan, AssetCategory } from "@/types/financial-plan";
import { UnifiedRiskFactorCard } from "@/components/results/UnifiedRiskFactorCard";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function DashboardPage() {
  const { session } = useFinSyncSession();
  const router = useRouter();

  const plan = session?.financial_plan;

  if (!plan) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-20 text-center">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Overview</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">Your adaptive financial plan will come together here.</p>
        </div>
        <div className="w-full space-y-4 rounded-2xl border border-white/10 bg-black/20 p-10 text-center shadow-xl shadow-black/50">
          <h3 className="text-xl font-bold text-white">Build your Financial Digital Profile</h3>
          <p className="mt-2 text-sm text-slate-400 mb-6">Add your financial inputs to calculate transparent ratios, capacity, a FinSync score, and an ML pattern persona.</p>
          <Link href="/profile" className="primary-button">Complete profile</Link>
        </div>
      </div>
    );
  }

  const {
    calculations: calc,
    emergencyFund: emergency,
    debt,
    riskProfile: risk,
    allocation,
    recommendations: recs,
    healthScore: health
  } = plan;

  return (
    <div className="mx-auto w-full max-w-5xl py-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Overview</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">Your current financial position and recommended plan.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/profile" className="secondary-button text-sm">Edit Profile</Link>
          <Link href="/goals" className="secondary-button text-sm">Edit Goals</Link>
        </div>
      </header>

      {/* 1. Health Score */}
      <section className="mb-8 rounded-3xl border border-white/10 bg-black/20 p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-12">
          <div className="flex flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-400/20">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-emerald-400/10" />
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="289.026" strokeDashoffset={289.026 - (289.026 * health.score) / 100} className="text-emerald-400 transition-all duration-1000 ease-out" strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-bold text-white">{health.score}</span>
              </div>
            </div>
            <h2 className="mt-4 text-lg font-bold text-emerald-300">{health.rating}</h2>
          </div>
          
          <div className="mt-8 flex-1 md:mt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Key Factors</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <ul className="space-y-3">
                  {health.positiveFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">+</span> {factor}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <ul className="space-y-3">
                  {health.negativeFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-amber-400">-</span> {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* 2. Monthly Summary */}
          <Card title="Monthly Cash Flow">
            <Row label="Total Income" value={formatRupees(calc.totalMonthlyIncome)} highlight />
            <Row label="Essential Expenses" value={`- ${formatRupees(calc.totalEssentialExpenses)}`} />
            <Row label="Discretionary Expenses" value={`- ${formatRupees(calc.totalDiscretionaryExpenses)}`} />
            <Row label="Debt Payments" value={`- ${formatRupees(calc.totalDebtPayments)}`} />
            <div className="mt-4 border-t border-white/10 pt-4">
              <Row label="Monthly Surplus" value={formatRupees(calc.monthlySurplus)} highlight={calc.monthlySurplus > 0} />
            </div>
          </Card>

          {/* 3. Emergency Fund */}
          <Card title="Emergency Fund">
            <Row label="Target Coverage" value={`${emergency.targetMonths} months`} />
            <Row label="Current Coverage" value={`${emergency.emergencyFundCoverageMonths.toFixed(1)} months`} />
            <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div 
                className={`h-full ${emergency.isSufficient ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                style={{ width: `${Math.min(100, (emergency.emergencyFundCoverageMonths / emergency.targetMonths) * 100)}%` }} 
              />
            </div>
            <Row label="Current Savings" value={formatRupees(emergency.emergencyFundTarget - emergency.emergencyFundGap)} />
            <Row label="Target Amount" value={formatRupees(emergency.emergencyFundTarget)} />
            {!emergency.isSufficient && (
              <div className="mt-4 rounded-xl bg-amber-400/10 p-4">
                <p className="text-sm text-amber-200">
                  <span className="font-bold">Required top-up: {formatRupees(emergency.emergencyFundGap)}</span>
                  <br />We recommend a <span className="font-bold">{formatRupees(emergency.recommendedMonthlyContribution)} / month</span> contribution.
                </p>
                <div className="mt-3 text-xs text-amber-200/80 italic">
                  This contribution is reserved BEFORE investing.
                </div>
              </div>
            )}
          </Card>

          {/* 4. Debt Summary */}
          <Card title="Debt Summary">
            <Row label="Outstanding Liabilities" value={formatRupees(calc.totalLiabilities)} />
            <Row label="Debt-to-Income Ratio" value={formatPercent(debt.debtPaymentRatio)} />
            <Row label="Debt-to-Asset Ratio" value={formatPercent(debt.debtToAssetRatio)} />
            {debt.warning && (
              <p className="mt-4 text-sm text-amber-400">{debt.warning}</p>
            )}
          </Card>

          {/* Unified Financial Risk Factor */}
          {session.profile_input && (
            <UnifiedRiskFactorCard 
              profile={session.profile_input} 
              goals={session.goal_simulation || null} 
              monthlySurplus={calc.monthlySurplus}
            />
          )}

          {/* Goal Summary */}
          {session?.goal_simulation && (
            <Card title="Goals Summary">
              <p className="mb-6 text-sm text-slate-400">Deterministic projection of your planned goals against available capacity.</p>
              
              <div className="space-y-4">
                {session.goal_simulation.goals.map((g) => (
                  <div key={g.id} className="border-t border-white/5 pt-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-200">{g.name}</span>
                      {g.status === "already_funded" ? <span className="text-emerald-400 text-xs">Funded</span> : 
                       g.status === "on_track" ? <span className="text-emerald-400 text-xs">On Track</span> : 
                       g.status === "needs_adjustment" ? <span className="text-amber-400 text-xs">Needs Adjust.</span> : 
                       <span className="text-rose-400 text-xs">Unfeasible</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2">
                      <div>Target: <span className="text-slate-300">{formatRupees(g.inflation_adjusted_target)}</span></div>
                      <div className="text-right">Projected: <span className="text-slate-300">{formatRupees(g.projected_value)}</span></div>
                      <div>Timeline: <span className="text-slate-300">{Math.round(g.horizon_months / 12)} years</span></div>
                      <div className="text-right">Monthly: <span className="text-slate-300">{formatRupees(g.planned_monthly_contribution)}</span></div>
                    </div>
                    {g.capacity_status === "unfunded" && <p className="mt-2 text-xs text-rose-400">Monthly capacity insufficient.</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Compact Asset Allocation */}
        {plan.assetAllocation && (
          <Card title="Asset Allocation">
            <div className="space-y-4">
              <Row label="Risk Factor" value={`${plan.assetAllocation.riskFactor}/10 — ${plan.assetAllocation.riskCategory}`} highlight />
              <Row label="Available to invest" value={`${formatRupees(plan.assetAllocation.investableMonthlyCapacity)}/month`} highlight />
              
              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-semibold text-white mb-2">Current vs Target:</p>
                {plan.assetAllocation.portfolioHealth.totalValue === 0 ? (
                  <p className="text-sm text-slate-400">New Investor — No existing portfolio.</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {plan.assetAllocation.portfolioHealth.underweight.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Underweight</span>
                        <span className="text-sky-300 font-medium text-right">{plan.assetAllocation.portfolioHealth.underweight.join(", ")}</span>
                      </div>
                    )}
                    {plan.assetAllocation.portfolioHealth.overweight.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Overweight</span>
                        <span className="text-amber-300 font-medium text-right">{plan.assetAllocation.portfolioHealth.overweight.join(", ")}</span>
                      </div>
                    )}
                    {plan.assetAllocation.portfolioHealth.underweight.length === 0 && plan.assetAllocation.portfolioHealth.overweight.length === 0 && (
                      <p className="text-slate-400">Portfolio is fully balanced.</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link href="/portfolio" className="text-emerald-400 font-semibold text-sm hover:text-emerald-300 flex items-center gap-1">
                  View Portfolio detailed plan 
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>
            </div>
          </Card>
        )}

          {/* 8. Action Plan */}
          <Card title="Prioritized Action Plan">
            <ol className="space-y-6">
              {!emergency.isSufficient && (
                <li className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-400">1</div>
                  <div>
                    <h4 className="font-bold text-white">Build your emergency fund</h4>
                    <p className="mt-1 text-sm text-slate-400">Direct {formatRupees(emergency.recommendedMonthlyContribution)} monthly to reach your {emergency.targetMonths}-month safety net.</p>
                  </div>
                </li>
              )}
              {debt.warning && (
                <li className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-400">{!emergency.isSufficient ? 2 : 1}</div>
                  <div>
                    <h4 className="font-bold text-white">Manage debt burden</h4>
                    <p className="mt-1 text-sm text-slate-400">Prioritize paying down high-cost liabilities to reduce your payment ratio.</p>
                  </div>
                </li>
              )}
              {plan.assetAllocation && plan.assetAllocation.investableMonthlyCapacity > 0 && (
                <li className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-400">{!emergency.isSufficient && debt.warning ? 3 : (!emergency.isSufficient || debt.warning) ? 2 : 1}</div>
                  <div>
                    <h4 className="font-bold text-white">Start monthly investments</h4>
                    <p className="mt-1 text-sm text-slate-400">Automate your {formatRupees(plan.assetAllocation.investableMonthlyCapacity)} investable capacity into the target allocation.</p>
                  </div>
                </li>
              )}
              <li className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-400">{(!emergency.isSufficient ? 1 : 0) + (debt.warning ? 1 : 0) + ((plan.assetAllocation?.investableMonthlyCapacity || 0) > 0 ? 1 : 0) + 1}</div>
                <div>
                  <h4 className="font-bold text-white">Gradually balance portfolio</h4>
                  <p className="mt-1 text-sm text-slate-400">Direct future additions to underweight categories instead of selling existing assets.</p>
                </div>
              </li>
            </ol>
          </Card>

        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
      <h2 className="mb-6 font-bold text-emerald-300 uppercase tracking-widest text-sm">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</span>
    </div>
  );
}
