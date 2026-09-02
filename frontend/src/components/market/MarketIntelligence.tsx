"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketRegime } from "@/types/financial-profile";

const FEATURES = [
  ["return_21d", "1-month return", "signed"], ["return_63d", "3-month return", "signed"],
  ["volatility_21d", "1M annualized volatility", "unsigned"], ["distance_ma_200d", "Distance from 200-day average", "signed"],
  ["max_drawdown_63d", "Drawdown from 3-month peak", "signed"], ["positive_days_21d", "Positive days (1 month)", "unsigned"],
] as const;

const percent = (value: number | null | undefined, signed = true) => value == null || !Number.isFinite(value) ? "Unavailable" : new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 1, signDisplay: signed ? "exceptZero" : "never" }).format(value);
const date = (value: string | null) => {
  if (!value) return "Unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
};
const tone = (value: number | null | undefined, kind: string) => value == null ? "text-slate-300" : kind === "unsigned" ? "text-sky-300" : value > .001 ? "text-emerald-300" : value < -.001 ? "text-rose-300" : "text-slate-300";

export function MarketIntelligence() {
  const [context, setContext] = useState<MarketRegime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/market/regime?mode=live`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Request failed");
      setContext(await response.json() as MarketRegime);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("Market data is temporarily unavailable. Please try again in a moment.");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, [baseUrl]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${baseUrl}/api/v1/market/regime?mode=live`, { cache: "no-store", signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Request failed"); return response.json() as Promise<MarketRegime>; })
      .then(setContext)
      .catch(requestError => { if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError("Market data is temporarily unavailable. Please try again in a moment."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [baseUrl]);

  if (loading && !context) return <LoadingState />;
  if (error || !context?.available) return <section className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center" aria-live="polite"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-400/10 text-xl text-slate-300">!</div><h2 className="mt-5 text-xl font-bold text-white">Market context unavailable</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">{error || context?.interpretation}</p><button type="button" onClick={() => void load()} className="secondary-button mt-6">Try again</button><p className="mt-5 text-xs text-slate-600">Your financial profile and plan are unaffected.</p></section>;
  const modeTone = context.data_mode === "cached" ? "bg-amber-400/10 text-amber-300" : "bg-sky-400/10 text-sky-300";
  const modeLabel = context.data_mode === "cached" ? "Cached" : context.data_mode === "demo" ? "Demonstration data" : "Latest available";

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/[0.09] via-white/[0.025] to-emerald-400/[0.04] p-6 sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Closest historical regime</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${modeTone}`}>{modeLabel}</span></div><h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">Historical pattern match: {context.regime}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{context.interpretation}</p></div><button type="button" disabled={loading} onClick={() => void load()} className="secondary-button shrink-0 disabled:cursor-wait disabled:opacity-60">{loading ? "Checking…" : "Check for updates"}</button></div>
      <dl className="relative mt-6 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-4"><Fact label="Index" value={`${context.index_name} (${context.symbol})`} /><Fact label="Market date" value={date(context.latest_market_date)} /><Fact label="Fetched" value={new Date(context.as_of).toLocaleString("en-IN")} /><Fact label="Source" value={context.source} /></dl>
    </section>
    <section><div className="mb-4"><h2 className="text-lg font-bold text-white">Market signals</h2><p className="mt-1 text-sm text-slate-500">Trailing indicators used to classify the current historical pattern.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([key, label, kind]) => { const value = context.latest_features[key]; return <article key={key} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-2 text-xl font-bold tabular-nums ${tone(value, kind)}`}>{percent(value, kind === "signed")}</p><SignalBar value={value} kind={kind} label={label} /></article>; })}</div></section>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><h2 className="text-lg font-bold text-white">What defines this environment</h2><ul className="mt-5 space-y-3">{context.key_characteristics.map(item => <li key={item} className="flex gap-3 rounded-xl bg-black/15 p-4 text-sm leading-6 text-slate-300"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />{item}</li>)}</ul></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="text-lg font-bold text-white">How to read this</h2><p className="mt-3 text-sm leading-6 text-slate-400">ledgr compares recent NIFTY 50 indicators with recurring patterns in historical data. The closest cluster becomes the environment label.</p><dl className="mt-4 space-y-3 border-t border-white/10 pt-4"><Fact label="Model" value={`${context.model_name}${context.model_version ? ` · ${context.model_version}` : ""}`} /><Fact label="Similarity to nearest historical cluster" value={context.similarity_score == null ? "Unavailable" : `${Math.round(context.similarity_score * 100)}%`} /></dl>{context.similarity_score != null && <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-label="Similarity to nearest historical cluster" aria-valuenow={Math.round(context.similarity_score * 100)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-sky-400" style={{ width: `${context.similarity_score * 100}%` }} /></div>}<p className="mt-3 text-xs leading-5 text-slate-600">This measures cluster proximity. It is not forecast probability or confidence that the market will rise.</p></section>
    </div>
    <details className="disclosure"><summary><span><strong className="text-sm">Methodology and limitations</strong><small>Data delays, caching, regime, similarity, and confidence</small></span><span className="text-xl text-slate-500">+</span></summary><div className="border-t border-white/10 px-5 py-5"><ul className="space-y-2 text-sm leading-6 text-slate-400"><li>• Yahoo/yfinance values may be delayed or end-of-day; provider timestamps and cache status are shown where available.</li><li>• Snapshot calls respect server-side caching and checking for updates does not bypass rate limits.</li><li>• Regimes are nearest historical clusters, not absolute market states or forecasts.</li><li>• Similarity measures distance to a cluster, not probability of a future outcome.</li><li>• Research confidence measures evidence coverage and agreement, not the chance that prices rise.</li>{context.limitations.map(item => <li key={item}>• {item}</li>)}</ul></div></details>
    <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.045] p-5"><p className="text-sm font-semibold text-amber-200">Context, not a call to action</p><p className="mt-1 text-xs leading-5 text-slate-400">Market regimes are historical pattern labels—not forecasts, recommendations, or trade signals. They never alter your deterministic ledgr plan.</p></div>
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-200">{value}</dd></div>; }
function SignalBar({ value, kind, label }: { value: number | null | undefined; kind: string; label: string }) { if (value == null) return null; const magnitude = kind === "unsigned" ? Math.min(100, Math.abs(value) * 100) : Math.min(50, Math.abs(value) * 200); if (kind === "unsigned") return <div className="mt-3"><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-sky-400" style={{ width: `${magnitude}%` }} /></div><div className="mt-1 flex justify-between text-[9px] text-slate-700"><span>0%</span><span>100%</span></div></div>; return <div className="mt-3"><div className="relative h-1.5 rounded-full bg-white/[0.07]" role="img" aria-label={`${label}: ${percent(value)}`}><div className="absolute inset-y-0 left-1/2 w-px bg-white/20" /><div className={`absolute inset-y-0 rounded-full ${value >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} style={value >= 0 ? { left: "50%", width: `${magnitude}%` } : { right: "50%", width: `${magnitude}%` }} /></div><div className="mt-1 flex justify-between text-[9px] text-slate-700"><span>−25%</span><span>0</span><span>+25%</span></div></div>; }
function LoadingState() { return <div className="space-y-5" aria-live="polite" aria-label="Loading market intelligence"><div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.035]" /><div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2].map(item => <div key={item} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]" />)}</div><span className="sr-only">Loading market intelligence</span></div>; }
