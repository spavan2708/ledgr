import Link from "next/link";

interface BackendStatus { status: string; service: string; }

async function getBackendStatus(): Promise<BackendStatus> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!response.ok) throw new Error("Backend returned an error");
    return (await response.json()) as BackendStatus;
  } catch {
    return { status: "offline", service: "finsync-backend" };
  }
}

export default async function Home() {
  const backend = await getBackendStatus();
  const connected = backend.status === "healthy";
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-white">
      <div className="ambient-glow" />
      <section className="relative mx-auto flex w-full max-w-6xl flex-col">
        <nav className="flex items-center justify-between"><span className="text-2xl font-bold tracking-tight">Fin<span className="text-emerald-400">Sync</span></span><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-rose-400"}`} /><span className="text-xs text-slate-400">Backend {connected ? "connected" : "offline"}</span></div></nav>
        <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.15fr_.85fr]">
          <div><p className="eyebrow">Financial clarity, built around you</p><h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-7xl">Turn your finances into a <span className="text-gradient">clear next step.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Create a private financial digital profile and see your cash flow, resilience, investing capacity, and practical priorities in one transparent view.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><Link href="/onboarding" className="primary-button justify-center !px-6 !py-4">Create Your Financial Profile <span aria-hidden="true">→</span></Link><span className="text-sm text-slate-500">Takes about 5 minutes · No account required</span></div></div>
          <div className="relative"><div className="hero-card"><div className="mb-7 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Your financial health</p><p className="mt-2 text-2xl font-bold">One view. Clear priorities.</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/10 text-xl text-emerald-300">↗</div></div><div className="grid grid-cols-2 gap-3"><PreviewMetric label="Cash flow" value="Mapped" /><PreviewMetric label="Safety net" value="Measured" /><PreviewMetric label="Debt load" value="Explained" /><PreviewMetric label="Next actions" value="Prioritized" /></div><div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100/80">Every score is rules-based, transparent, and derived only from the information you provide.</div></div></div>
        </div>
        <footer className="flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-600 sm:flex-row"><span>Educational simulations, not regulated investment advice.</span><span>Phase 1 · Financial Digital Profile</span></footer>
      </section>
    </main>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-200">{value}</p></div>; }
