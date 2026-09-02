"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketRegime } from "@/types/financial-profile";

export function MarketContextCard({ showDebug }: { showDebug: boolean }) {
  const [context, setContext] = useState<MarketRegime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/market/regime?mode=live`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Market context request failed");
      setContext((await response.json()) as MarketRegime);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("Market context is temporarily unavailable. Your financial profile is unaffected.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${baseUrl}/api/v1/market/regime?mode=live`, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Market context request failed");
        return response.json() as Promise<MarketRegime>;
      })
      .then(setContext)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setError("Market context is temporarily unavailable. Your financial profile is unaffected.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [baseUrl]);

  if (loading && !context) return <section aria-live="polite" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5"><p className="text-sm text-slate-400">Loading broad-market context…</p></section>;
  if (error || !context || !context.available) return <section className="mt-5 rounded-2xl border border-slate-400/15 bg-white/[0.025] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Market Context</p><h2 className="mt-1 font-bold text-slate-200">Currently unavailable</h2></div><button type="button" onClick={() => void refresh()} className="secondary-button">Retry</button></div><p className="mt-3 text-sm leading-6 text-slate-500">{error || context?.interpretation}</p>{showDebug && context && <p className="mt-3 font-mono text-xs text-slate-600">{context.limitations.join(" · ")}</p>}</section>;

  return <section className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-wider text-sky-300">Market Context</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${context.data_mode === "live" ? "bg-emerald-400/15 text-emerald-300" : context.data_mode === "cached" ? "bg-amber-400/15 text-amber-300" : "bg-violet-400/15 text-violet-300"}`}>{context.data_mode.toUpperCase()} data</span></div><h2 className="mt-2 text-2xl font-bold text-white">{context.regime}</h2><p className="mt-1 text-xs text-slate-500">{context.index_name} · latest market date {context.latest_market_date}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{context.interpretation}</p></div><button type="button" disabled={loading} onClick={() => void refresh()} className="secondary-button disabled:cursor-wait disabled:opacity-60">{loading ? "Refreshing…" : "Refresh"}</button></div><ul className="mt-5 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">{context.key_characteristics.map((item) => <li key={item} className="rounded-xl bg-black/15 p-3"><span className="mr-2 text-sky-300" aria-hidden="true">•</span>{item}</li>)}</ul><p className="mt-4 border-t border-sky-300/10 pt-4 text-xs leading-5 text-slate-500">Historical broad-index pattern classification only—not a forecast, price prediction, recommendation, or trade signal. It does not change your ledgr strategy.</p>{showDebug && <div className="mt-4 rounded-xl bg-black/20 p-4 text-xs"><dl className="grid gap-2 sm:grid-cols-4"><Debug label="Model version" value={context.model_version ?? "unknown"} /><Debug label="Cluster" value={String(context.cluster_id)} /><Debug label="Similarity (not confidence)" value={context.similarity_score?.toFixed(4) ?? "unavailable"} /><Debug label="Source" value={context.source} /></dl><details className="mt-4 border-t border-white/10 pt-3"><summary className="cursor-pointer font-semibold text-slate-400">Latest engineered features</summary><dl className="mt-3 grid gap-2 sm:grid-cols-3">{Object.entries(context.latest_features).map(([key, value]) => <Debug key={key} label={key.replaceAll("_", " ")} value={value === null ? "null" : value.toFixed(6)} />)}</dl></details><p className="mt-3 text-slate-600">Retrieved {context.as_of}</p></div>}</section>;
}

function Debug({ label, value }: { label: string; value: string }) { return <div><dt className="text-slate-600">{label}</dt><dd className="mt-1 break-words font-mono text-slate-300">{value}</dd></div>; }
