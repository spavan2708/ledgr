"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatRupees } from "@/lib/formatters";
import { runSimulator, PRESETS, type SimulatorInputs } from "@/lib/financial/futureSimulator";
import type { GoalInput } from "@/types/goals";

export default function SimulatorPage() {
  const { session } = useFinSyncSession();
  const plan = session?.financial_plan;
  const goalsInput = session?.goals || [];
  const baseAllocation = plan?.assetAllocation;

  const [inputs, setInputs] = useState<SimulatorInputs | null>(null);
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  // Initialize from actual plan
  useEffect(() => {
    if (baseAllocation && !inputs) {
      setInputs({
        horizonYears: 10,
        monthlyContribution: baseAllocation.investableMonthlyCapacity,
        annualStepUpPct: 5,
        expectedAnnualReturn: 12, // default approx
        annualVolatility: 15,
        inflationRate: 6,
        startingPortfolioValue: baseAllocation.portfolioHealth.totalValue
      });
    }
  }, [baseAllocation, inputs]);

  if (!plan || !baseAllocation) {
    return (
      <>
        <PageHeader title="Future Simulator" description="Explore how your wealth and goals could evolve under different assumptions." />
        <div className="mt-8">
          <EmptyState 
            title="Create a plan first" 
            description="You need to complete your financial profile and analyze your plan before running simulations." 
            action={<Link href="/profile" className="primary-button">Go to Profile</Link>} 
          />
        </div>
      </>
    );
  }

  if (!inputs) return null;

  const sim = runSimulator(inputs, plan, goalsInput, showMonteCarlo);
  const baseSim = runSimulator({ ...inputs, monthlyContribution: baseAllocation.investableMonthlyCapacity }, plan, goalsInput, false);

  const resetToPlan = () => {
    setInputs({
      horizonYears: 10,
      monthlyContribution: baseAllocation.investableMonthlyCapacity,
      annualStepUpPct: 5,
      expectedAnnualReturn: 12,
      annualVolatility: 15,
      inflationRate: 6,
      startingPortfolioValue: baseAllocation.portfolioHealth.totalValue
    });
    setShowMonteCarlo(false);
  };

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (p) setInputs({ ...inputs, ...p });
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-10 space-y-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-2">Future Simulator</h1>
          <p className="text-sm leading-6 text-slate-400">Explore how your wealth and goals could evolve under different assumptions.</p>
          <div className="mt-2 inline-block rounded bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
            Scenario only — your financial plan has not been changed.
          </div>
        </div>
        <button onClick={resetToPlan} className="secondary-button text-sm whitespace-nowrap">Reset to Current Plan</button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
          <Card title="Current Baseline">
            <p className="text-xs text-slate-500 mb-4">These values come from your current financial plan and cannot be edited here.</p>
            <div className="space-y-3 text-sm">
              <Row label="Current Portfolio" value={formatRupees(baseAllocation.portfolioHealth.totalValue)} highlight />
              <Row label="Investable Capacity" value={`${formatRupees(baseAllocation.investableMonthlyCapacity)}/mo`} highlight />
              {baseAllocation.investableMonthlyCapacity === 0 && (
                <div className="text-xs text-amber-400 mt-1">No current monthly investment capacity. The simulation below is hypothetical.</div>
              )}
              <Row label="Risk Factor" value={`${baseAllocation.riskFactor}/10 — ${baseAllocation.riskCategory}`} />
              <Row label="Total Goals" value={goalsInput.length.toString()} />
            </div>
          </Card>

          <Card title="Simulation Assumptions">
            <div className="mb-6 flex gap-2">
              <button onClick={() => applyPreset('conservative')} className="flex-1 rounded border border-white/10 bg-white/5 py-1 text-xs text-slate-300 hover:bg-white/10">Conservative</button>
              <button onClick={() => applyPreset('balanced')} className="flex-1 rounded border border-emerald-500/30 bg-emerald-500/10 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20">Balanced</button>
              <button onClick={() => applyPreset('growth')} className="flex-1 rounded border border-white/10 bg-white/5 py-1 text-xs text-slate-300 hover:bg-white/10">Growth</button>
            </div>

            <div className="space-y-5">
              <InputRange label="Simulation Period" value={inputs.horizonYears} unit="years" min={5} max={30} step={5} onChange={v => setInputs({ ...inputs, horizonYears: v })} />
              <InputRange label="Monthly Contribution" value={inputs.monthlyContribution} unit="₹" min={0} max={Math.max(500000, baseAllocation.investableMonthlyCapacity * 3)} step={1000} onChange={v => setInputs({ ...inputs, monthlyContribution: v })} />
              <InputRange label="Annual Step-up" value={inputs.annualStepUpPct} unit="%" min={0} max={20} step={1} onChange={v => setInputs({ ...inputs, annualStepUpPct: v })} />
              <InputRange label="Expected Annual Return" value={inputs.expectedAnnualReturn} unit="%" min={1} max={20} step={1} onChange={v => setInputs({ ...inputs, expectedAnnualReturn: v })} />
              <InputRange label="Annual Volatility" value={inputs.annualVolatility} unit="%" min={0} max={40} step={1} onChange={v => setInputs({ ...inputs, annualVolatility: v })} />
              <InputRange label="Inflation Rate" value={inputs.inflationRate} unit="%" min={0} max={10} step={1} onChange={v => setInputs({ ...inputs, inflationRate: v })} />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-8 min-w-0">
          
          <div className="grid gap-4 md:grid-cols-3">
            <StatBox label="Final Portfolio Value" value={formatRupees(sim.finalPortfolioValue)} highlight />
            <StatBox label="Total Contributions" value={formatRupees(sim.totalContributions)} />
            <StatBox label="Investment Growth" value={formatRupees(sim.totalInvestmentGrowth)} textClass="text-sky-400" />
          </div>

          <Card title="Future Wealth Projection">
            <div className="h-64 w-full mt-4">
              <SimpleLineChart data={sim.timeline} />
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Projected Portfolio Value over {inputs.horizonYears} years. Educational simulation only.</p>
          </Card>

          {inputs.monthlyContribution !== baseAllocation.investableMonthlyCapacity && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">What-if Contribution Analysis</h3>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-slate-300">Current Plan ({formatRupees(baseAllocation.investableMonthlyCapacity)}/mo): <strong className="text-white">{formatRupees(baseSim.finalPortfolioValue)}</strong></p>
                  <p className="text-sm text-slate-300 mt-1">Scenario ({formatRupees(inputs.monthlyContribution)}/mo): <strong className="text-emerald-400">{formatRupees(sim.finalPortfolioValue)}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Difference over {inputs.horizonYears} years</p>
                  <p className="text-2xl font-bold text-emerald-400">+{formatRupees(sim.finalPortfolioValue - baseSim.finalPortfolioValue)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-emerald-400/70">An additional {formatRupees(inputs.monthlyContribution - baseAllocation.investableMonthlyCapacity)}/month could potentially result in this more portfolio value.</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Goal Outlook & Shortfall">
              {sim.goalOutlook.goals.length === 0 ? (
                <p className="text-sm text-slate-400">No active goals to project.</p>
              ) : (
                <div className="space-y-5">
                  {sim.goalOutlook.goals.map(g => {
                    const shortfall = Math.max(0, g.inflation_adjusted_target - g.projected_value);
                    const originalTarget = goalsInput.find((gi: GoalInput) => gi.id === g.id)?.target_amount || 0;
                    return (
                      <div key={g.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-200">{g.name}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${g.status === "already_funded" ? "bg-emerald-500/20 text-emerald-400" : g.status === "on_track" ? "bg-emerald-500/20 text-emerald-400" : g.status === "needs_adjustment" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                            {g.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3 bg-black/20 p-2 rounded border border-white/5">
                          Timeline: {new Date().getFullYear() + Math.round(g.horizon_months / 12)} ({Math.round(g.horizon_months / 12)} years)
                          <div className="mt-1">Inflation impact: Today's {formatRupees(originalTarget)} may require approximately {formatRupees(g.inflation_adjusted_target)} in the future at {inputs.inflationRate}% inflation.</div>
                        </div>
                        <div className="text-sm text-slate-400 mb-1 flex justify-between">
                          <span>Future Target: <strong className="text-slate-300">{formatRupees(g.inflation_adjusted_target)}</strong></span>
                          <span>Projected: <strong className={shortfall > 0 ? "text-amber-400" : "text-emerald-400"}>{formatRupees(g.projected_value)}</strong></span>
                        </div>
                        {shortfall > 0 && (
                          <div className="mt-2 bg-amber-400/10 p-2 rounded text-xs text-amber-200/90 border border-amber-400/20">
                            Shortfall: <strong>{formatRupees(shortfall)}</strong>
                            <br/>Indicative additional contribution required: <strong>{formatRupees(g.required_monthly_contribution - g.planned_monthly_contribution)}/mo</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Monte Carlo Range Simulation">
              <p className="text-sm text-slate-400 mb-6">These scenarios illustrate a range of possible outcomes based on the selected assumptions; actual returns will vary.</p>
              
              {!showMonteCarlo ? (
                <div className="text-center py-6">
                  <button onClick={() => setShowMonteCarlo(true)} className="primary-button">Run Monte Carlo Simulation</button>
                </div>
              ) : sim.monteCarlo ? (
                <div className="space-y-4">
                  <Row label="P90 (Higher outcome)" value={formatRupees(sim.monteCarlo.p90)} highlight />
                  <Row label="P50 (Median outcome)" value={formatRupees(sim.monteCarlo.p50)} />
                  <Row label="P10 (Lower outcome)" value={formatRupees(sim.monteCarlo.p10)} />
                  <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <button onClick={() => { setShowMonteCarlo(false); setTimeout(() => setShowMonteCarlo(true), 10); }} className="text-xs text-slate-400 hover:text-white">Rerun Simulation</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">Calculating...</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Projected Allocation">
              <p className="text-sm text-slate-400 mb-4">Assuming target percentages remain constant.</p>
              <div className="space-y-2 text-sm">
                {Object.keys(sim.projectedAllocation).map(k => {
                  if (sim.projectedAllocation[k] === 0) return null;
                  const name = k === "cash" ? "Cash/Bank" : k === "fd" ? "Fixed Deposits" : k === "mutual_funds" ? "Mutual Funds" : k === "stocks" ? "Stocks/Equity" : k === "bonds" ? "Bonds/Debt" : "Gold";
                  return (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-300">{name} <span className="text-slate-500 text-xs">({baseAllocation.targetAllocation[k].toFixed(1)}%)</span></span>
                      <span className="font-bold text-white">{formatRupees(sim.projectedAllocation[k])}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Return Sensitivity">
              <p className="text-sm text-slate-400 mb-4">Impact of return assumptions over {inputs.horizonYears} years.</p>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-white/5">
                  <tr>
                    <th className="px-3 py-2 rounded-tl">Return</th>
                    <th className="px-3 py-2 text-right rounded-tr">Projected Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[inputs.expectedAnnualReturn - 4, inputs.expectedAnnualReturn - 2, inputs.expectedAnnualReturn, inputs.expectedAnnualReturn + 2, inputs.expectedAnnualReturn + 4].map(r => {
                    if (r <= 0) return null;
                    const rSim = runSimulator({ ...inputs, expectedAnnualReturn: r }, plan, goalsInput, false);
                    return (
                      <tr key={r} className={`border-b border-white/5 ${r === inputs.expectedAnnualReturn ? 'bg-emerald-500/10' : ''}`}>
                        <td className={`px-3 py-2 ${r === inputs.expectedAnnualReturn ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{r}%</td>
                        <td className={`px-3 py-2 text-right ${r === inputs.expectedAnnualReturn ? 'text-emerald-400 font-bold' : 'text-white'}`}>{formatRupees(rSim.finalPortfolioValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          <details className="group rounded-2xl border border-white/10 bg-white/[0.02] [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-300 uppercase tracking-widest text-sm">
              <span>How this simulation works</span>
              <span className="transition group-open:rotate-180 text-slate-500">▼</span>
            </summary>
            <div className="p-6 pt-0 text-sm text-slate-400 space-y-4">
              <p><strong>Deterministic Engine:</strong> Your starting portfolio is projected forward month by month. Each month, your contribution is added, and the portfolio grows according to the selected return assumption using monthly compounding: <code>(1 + Annual Return)^(1/12) - 1</code>.</p>
              <p><strong>Step-up:</strong> If an annual step-up is provided, your monthly contribution increases by that percentage every 12 months.</p>
              <p><strong>Inflation:</strong> Used exactly as configured in your goals. Today's target amounts are inflated forward to their future required amounts using the selected inflation rate.</p>
              <p><strong>Monte Carlo:</strong> When activated, runs 1,000 independent statistical simulations using your return and volatility assumptions to illustrate a realistic range of potential outcomes (P10 lower, P50 median, P90 higher).</p>
            </div>
          </details>

          <p className="text-center text-xs text-slate-500 pb-10">
            Educational simulation only. Actual investment returns, inflation, and outcomes will vary.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-sm">
      <h2 className="mb-5 font-bold text-emerald-300 uppercase tracking-widest text-sm">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, highlight, textClass }: { label: string; value: string; highlight?: boolean; textClass?: string }) {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'} p-4 text-center`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-emerald-400' : textClass || 'text-white'}`}>{value}</div>
    </div>
  );
}

function InputRange({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-emerald-400">{unit === '₹' ? formatRupees(value) : `${value}${unit}`}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 appearance-none cursor-pointer" />
    </div>
  );
}

// Minimal SVG Line Chart
function SimpleLineChart({ data }: { data: { year: number, portfolioValue: number }[] }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.portfolioValue), 1);
  const minVal = 0;
  
  const width = 1000;
  const height = 300;
  
  const getX = (i: number) => (i / Math.max(1, data.length - 1)) * width;
  const getY = (val: number) => height - ((val - minVal) / maxVal) * height;

  const points = data.map((d, i) => `${getX(i)},${getY(d.portfolioValue)}`).join(" ");

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-aspect-ratio-none">
        {/* Grid lines */}
        {[0, 0.5, 1].map(pct => (
          <line key={pct} x1="0" y1={height * pct} x2={width} y2={height * pct} stroke="currentColor" className="text-white/10" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {/* Fill area */}
        <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#gradient)" opacity="0.3" />
        {/* Line */}
        <polyline points={points} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Basic axis labels */}
      <div className="absolute top-0 left-2 text-[10px] text-slate-500">{formatRupees(maxVal)}</div>
      <div className="absolute bottom-0 left-2 text-[10px] text-slate-500">₹0</div>
      <div className="absolute -bottom-5 left-0 text-[10px] text-slate-500">Year 0</div>
      <div className="absolute -bottom-5 right-0 text-[10px] text-slate-500">Year {data[data.length-1].year}</div>
    </div>
  );
}
