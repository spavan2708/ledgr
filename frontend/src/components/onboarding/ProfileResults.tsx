"use client";

import Link from "next/link";
import { formatRupees } from "@/lib/formatters";
import type { ComparativeStrategy, FinancialProfileResult, MLPersona, RatioDetail } from "@/types/financial-profile";
import { MarketContextCard } from "./MarketContextCard";

interface ProfileResultsProps { result: FinancialProfileResult; onEdit: () => void; }

export function ProfileResults({ result, onEdit }: ProfileResultsProps) {
  const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true";
  const metrics = result.metrics;
  const suggested = chooseSuggestedStrategy(result);
  const alternatives = result.comparative_strategies.filter((strategy) => strategy.name !== suggested.name);
  const strength = result.positive_factors[0] ?? "Your profile now gives you a measurable financial baseline.";
  const concern = result.risk_factors[0] ?? "No immediate high-priority concern was identified from the reported figures.";
  const immediateAction = result.suggested_next_actions[0] ?? "Review this profile whenever your income, expenses, assets, or liabilities change.";
  const retained = Math.max(0, metrics.net_cash_flow - suggested.investable_amount);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Your financial digital profile</p><h1 className="mt-2 text-3xl font-bold text-white sm:text-5xl">Your financial picture, simplified.</h1></div>
        <button type="button" onClick={onEdit} className="secondary-button">Edit profile</button>
      </header>

      <section className="result-card overflow-hidden !p-0">
        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-5">
            <div className="score-ring" style={{ "--score": `${result.financial_health_score * 3.6}deg` } as React.CSSProperties}><div><strong>{result.financial_health_score}</strong><span>/100</span></div></div>
            <div><p className="max-w-44 text-xs leading-5 text-slate-500">FinSync Adaptive Health Score</p><h2 className="mt-1 text-2xl font-bold text-white">{result.health_label}</h2></div>
          </div>
          <div className="lg:border-l lg:border-white/10 lg:pl-8"><p className="text-base leading-7 text-slate-200">{plainSummary(result)}</p><p className="mt-2 text-sm leading-6 text-slate-500">This is a proprietary educational indicator built from your reported financial ratios.</p></div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4"><PrimaryMetric label="Monthly net cash flow" value={formatRupees(metrics.net_cash_flow)} /><PrimaryMetric label="Investment capacity" value={formatRupees(metrics.estimated_monthly_investment_capacity)} /><PrimaryMetric label="Net worth" value={formatRupees(metrics.net_worth)} /><PrimaryMetric label="Emergency coverage" value={metrics.emergency_fund_coverage_months === null ? "Not available" : `${metrics.emergency_fund_coverage_months.toFixed(1)} months`} /></div>
      </section>

      <MLPersonaCard persona={result.ml_persona} showDebug={showDebug} />
      <MarketContextCard showDebug={showDebug} />

      {result.warnings.length > 0 && <aside aria-label="Important profile warnings" className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5"><h2 className="flex items-center gap-2 font-bold text-amber-200"><span aria-hidden="true">!</span> Important checks</h2><ul className="mt-2 space-y-1 text-sm leading-6 text-amber-100/80">{result.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></aside>}

      <section className="mt-6 grid gap-3 md:grid-cols-3"><Highlight label="Biggest strength" text={strength} tone="positive" /><Highlight label="Most important concern" text={concern} tone="concern" /><Highlight label="Immediate action" text={immediateAction} tone="action" /></section>
      <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 sm:flex-row sm:items-center"><div><h2 className="font-bold text-white">Ready to test your goals?</h2><p className="mt-1 text-sm text-slate-400">Use your estimated {formatRupees(metrics.estimated_monthly_investment_capacity)} monthly capacity in the goal simulator.</p></div><Link href={`/goals?capacity=${metrics.estimated_monthly_investment_capacity}`} className="primary-button justify-center">Plan Your Goals →</Link></section>

      <section className="mt-12">
        <SectionHeader title="Suggested starting point" description="A deterministic scenario selected from your reserve coverage, debt service, net worth, and reported preferences." />
        <article className="rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-sky-400/5 p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950">FinSync Suggested Starting Point</span><h3 className="mt-4 text-3xl font-bold text-white">{suggested.name}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{suggested.summary}</p></div><div className="sm:text-right"><p className="text-xs text-slate-500">Illustrative monthly amount</p><p className="mt-1 text-3xl font-bold text-emerald-300">{formatRupees(suggested.investable_amount)}</p><p className="mt-1 text-xs text-slate-500">{suggested.risk_level} scenario risk</p></div></div>
          <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4"><StrategyFact label="Why selected" text={strategyReason(result, suggested)} /><StrategyFact label="Retained monthly" text={`${formatRupees(retained)} for reserves and other priorities`} /><StrategyFact label="Main benefit" text={suggested.advantages[0]} /><StrategyFact label="Main trade-off" text={suggested.trade_offs[0]} /></div>
        </article>
        <details className="disclosure mt-4"><summary>Compare alternatives <span aria-hidden="true">＋</span></summary><div className="grid gap-4 border-t border-white/10 p-5 md:grid-cols-2">{alternatives.map((strategy) => <AlternativeStrategy key={strategy.name} strategy={strategy} netCashFlow={metrics.net_cash_flow} />)}</div></details>
      </section>

      <section className="mt-12">
        <details className="disclosure"><summary><span><strong>View detailed financial metrics</strong><small>Seven recognized ratios with interpretations and calculation details</small></span><span aria-hidden="true">＋</span></summary><div className="grid gap-4 border-t border-white/10 p-5 md:grid-cols-2 lg:grid-cols-3">{result.ratios.map((ratio) => <RatioCard key={ratio.key} ratio={ratio} />)}</div></details>
        <details className="disclosure mt-4"><summary><span><strong>See how your score was calculated</strong><small>Every point remains traceable to a ratio or reported input</small></span><span aria-hidden="true">＋</span></summary><div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2">{result.score_explanations.map((item) => <div key={item.name} className="rounded-xl bg-black/20 p-4"><div className="flex justify-between gap-4 text-sm font-semibold text-white"><span>{item.name}</span><span>{item.score}/{item.max_score}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{item.explanation}</p></div>)}</div></details>
      </section>

      {showDebug && <details className="disclosure mt-4"><summary><span><strong>Debug: model features</strong><small>Normalized API features; no ML inference is performed</small></span><span aria-hidden="true">＋</span></summary><dl className="grid gap-2 border-t border-white/10 p-5 sm:grid-cols-3">{Object.entries(result.model_features).map(([key, value]) => <div key={key} className="rounded-lg bg-black/20 p-3 text-xs"><dt className="text-slate-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 font-mono text-slate-200">{value === null ? "null" : value}</dd></div>)}</dl></details>}

      <footer className="mx-auto mt-8 max-w-3xl border-t border-white/10 pt-6 text-center text-xs leading-5 text-slate-600">FinSync provides deterministic educational simulations, not guaranteed returns or regulated investment advice. Reference ranges are general guidelines and may vary by household, goal, location, and professional methodology.</footer>
    </div>
  );
}

function chooseSuggestedStrategy(result: FinancialProfileResult): ComparativeStrategy {
  const { emergency_fund_coverage_months: coverage, debt_service_ratio: debtService, net_worth: netWorth } = result.metrics;
  let name: ComparativeStrategy["name"] = "Balanced Progress";
  if (coverage === null || coverage < 3 || (debtService !== null && debtService > 0.30) || netWorth < 0) name = "Safety First";
  else if (coverage >= 6 && (debtService === null || debtService <= 0.20) && result.profile.income_stability >= 4 && result.profile.investment_horizon_years >= 10 && result.profile.volatility_comfort >= 4) name = "Growth Focused";
  return result.comparative_strategies.find((strategy) => strategy.name === name) ?? result.comparative_strategies[0];
}

function strategyReason(result: FinancialProfileResult, strategy: ComparativeStrategy): string {
  const coverage = result.metrics.emergency_fund_coverage_months;
  if (strategy.name === "Safety First" && (coverage === null || coverage < 3)) return "Emergency coverage is below three months, so building resilience takes priority.";
  if (strategy.name === "Safety First" && result.metrics.net_worth < 0) return "Liabilities exceed assets, so strengthening the balance sheet takes priority.";
  if (strategy.name === "Safety First") return "Debt-service pressure is high, so preserving flexibility takes priority.";
  if (strategy.name === "Growth Focused") return "Reserves, debt service, stability, horizon, and volatility comfort support the higher-allocation comparison.";
  return "Your reserve and debt position support progress while retaining meaningful monthly flexibility.";
}

function plainSummary(result: FinancialProfileResult): string {
  const cashFlow = result.metrics.net_cash_flow > 0 ? "positive monthly cash flow" : "monthly outgo that meets or exceeds income";
  const reserve = result.metrics.emergency_fund_coverage_months;
  const reserveText = reserve === null ? "reserve coverage cannot be measured from the current inputs" : reserve >= 6 ? "your emergency reserve is fully funded against the six-month guideline" : `your emergency reserve covers ${reserve.toFixed(1)} months of essentials`;
  return `Your ${result.health_label.toLowerCase()} profile reflects ${cashFlow}. ${reserveText.charAt(0).toUpperCase()}${reserveText.slice(1)}.`;
}

function MLPersonaCard({ persona, showDebug }: { persona: MLPersona; showDebug: boolean }) {
  if (!persona.available) return <aside className="mt-5 rounded-2xl border border-slate-400/15 bg-white/[0.025] p-5"><div className="flex items-center gap-3"><span className="rounded-full bg-slate-400/10 px-3 py-1 text-xs font-bold text-slate-400">Prototype ML model</span><h2 className="font-bold text-slate-200">Financial persona unavailable</h2></div><p className="mt-3 text-sm leading-6 text-slate-500">Your deterministic analysis is complete and unaffected. The optional pattern-classification model is currently unavailable.</p>{showDebug && <p className="mt-3 font-mono text-xs text-slate-600">{persona.limitations.join(" · ")}</p>}</aside>;
  return <section className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="rounded-full bg-violet-300 px-3 py-1 text-xs font-bold text-violet-950">Prototype ML model</span><p className="mt-4 text-xs font-bold uppercase tracking-wider text-violet-300">ML Financial Persona</p><h2 className="mt-1 text-2xl font-bold text-white">{persona.persona}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{personaInterpretation(persona.persona)}</p></div><ul className="space-y-2 rounded-xl bg-black/15 p-4 text-sm text-slate-300 sm:min-w-72">{persona.key_characteristics.map((item) => <li key={item} className="flex gap-2"><span className="text-violet-300" aria-hidden="true">•</span>{item}</li>)}</ul></div><p className="mt-5 border-t border-violet-300/10 pt-4 text-xs leading-5 text-slate-500">Comparative pattern classification trained on synthetic prototype profiles. It does not change FinSync’s deterministic metrics, score, safeguards, or suggested strategy.</p>{showDebug && <dl className="mt-4 grid gap-2 rounded-xl bg-black/20 p-4 text-xs sm:grid-cols-4"><DebugItem label="Model" value={persona.model_name} /><DebugItem label="Version" value={persona.model_version ?? "unknown"} /><DebugItem label="Cluster" value={String(persona.cluster_id)} /><DebugItem label="Similarity (not probability)" value={persona.similarity_score?.toFixed(4) ?? "unavailable"} /></dl>}</section>;
}

function personaInterpretation(persona: string | null): string {
  const interpretations: Record<string, string> = {
    "Liquidity-Constrained Planner": "Your pattern is most similar to profiles prioritizing accessible reserves and near-term financial flexibility.",
    "Debt-Priority Rebuilder": "Your pattern is most similar to profiles balancing recurring debt pressure with balance-sheet rebuilding.",
    "Balanced Wealth Builder": "Your pattern is most similar to profiles with broadly balanced saving, liquidity, debt, and long-term readiness.",
    "Long-Horizon Growth Builder": "Your pattern is most similar to profiles combining a longer horizon with stronger saving and investment readiness.",
    "High-Income Low-Savings Planner": "Your pattern is most similar to stable-income profiles whose current outflows limit savings conversion.",
    "Early-Stage Foundation Builder": "Your pattern is most similar to profiles still establishing savings, solvency, and investment experience.",
    "Resilient Conservative Saver": "Your pattern is most similar to reserve-focused profiles emphasizing stability and financial resilience.",
  };
  return interpretations[persona ?? ""] ?? "Your reported features align most closely with this synthetic prototype pattern.";
}

function DebugItem({ label, value }: { label: string; value: string }) { return <div><dt className="text-slate-600">{label}</dt><dd className="mt-1 font-mono text-slate-300">{value}</dd></div>; }

function SectionHeader({ title, description }: { title: string; description: string }) { return <header className="mb-5"><h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p></header>; }
function PrimaryMetric({ label, value }: { label: string; value: string }) { return <div className="border-white/10 p-4 even:border-l sm:border-l sm:first:border-l-0 sm:p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 break-words text-base font-bold text-white sm:text-lg">{value}</p></div>; }
function Highlight({ label, text, tone }: { label: string; text: string; tone: "positive" | "concern" | "action" }) { const styles = { positive: "text-emerald-300 bg-emerald-400", concern: "text-amber-300 bg-amber-400", action: "text-sky-300 bg-sky-400" }; return <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className={`text-xs font-bold uppercase tracking-wider ${styles[tone].split(" ")[0]}`}>{label}</p><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p></article>; }
function StrategyFact({ label, text }: { label: string; text: string }) { return <div><h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h4><p className="mt-2 text-sm leading-6 text-slate-200">{text}</p></div>; }
function AlternativeStrategy({ strategy, netCashFlow }: { strategy: ComparativeStrategy; netCashFlow: number }) { return <article className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex justify-between gap-4"><div><h3 className="font-bold text-white">{strategy.name}</h3><p className="mt-1 text-xs text-slate-500">{strategy.risk_level} scenario risk</p></div><p className="text-lg font-bold text-emerald-300">{formatRupees(strategy.investable_amount)}</p></div><p className="mt-4 text-sm leading-6 text-slate-400">{strategy.summary}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-600">Retained monthly</dt><dd className="mt-1 text-slate-300">{formatRupees(Math.max(0, netCashFlow - strategy.investable_amount))}</dd></div><div><dt className="text-slate-600">Main trade-off</dt><dd className="mt-1 leading-5 text-slate-300">{strategy.trade_offs[0]}</dd></div></dl></article>; }

function RatioCard({ ratio }: { ratio: RatioDetail }) {
  const value = ratio.value === null ? "Not available" : ratio.unit === "percentage" ? `${(ratio.value * 100).toFixed(1)}%` : `${ratio.value.toFixed(1)} months`;
  const status = ratioStatus(ratio);
  return <article className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-white">{ratio.display_name}</h3><span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${status.tone}`}>{status.label}</span></div><span className="text-lg font-bold text-emerald-300">{value}</span></div><p className="mt-4 text-sm leading-6 text-slate-300">{ratio.interpretation}</p><details className="mt-4 border-t border-white/10 pt-3"><summary className="cursor-pointer text-xs font-semibold text-slate-400">How this was calculated</summary><div className="mt-3 space-y-2 text-xs leading-5 text-slate-500"><p><strong className="text-slate-400">Formula:</strong> {ratio.formula_description}</p><p><strong className="text-slate-400">General reference:</strong> {ratio.reference_range_used}</p><p>{ratio.disclaimer}</p></div></details></article>;
}

function ratioStatus(ratio: RatioDetail): { label: string; tone: string } {
  if (ratio.value === null) return { label: "Unavailable", tone: "bg-slate-400/10 text-slate-400" };
  const onTrack = ratio.key === "savings_ratio" ? ratio.value >= 0.20 : ratio.key === "expense_ratio" ? ratio.value <= 0.50 : ratio.key === "debt_service_ratio" ? ratio.value <= 0.30 : ratio.key === "debt_to_asset_ratio" ? ratio.value <= 0.50 : ratio.key === "solvency_ratio" ? ratio.value >= 0.50 : ratio.key === "liquidity_ratio" ? ratio.value >= 6 : ratio.value >= 3;
  return onTrack ? { label: "On track", tone: "bg-emerald-400/10 text-emerald-300" } : { label: "Needs attention", tone: "bg-amber-400/10 text-amber-300" };
}
