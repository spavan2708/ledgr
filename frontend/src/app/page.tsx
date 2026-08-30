async function getBackendStatus() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Backend returned an error");
    }

    return await response.json();
  } catch {
    return {
      status: "offline",
      service: "finsync-backend",
    };
  }
}

export default async function Home() {
  const backend = await getBackendStatus();
  const connected = backend.status === "healthy";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Agentic Wealth Intelligence
        </p>

        <h1 className="text-6xl font-bold tracking-tight">FinSync</h1>

        <p className="mt-4 text-slate-400">
          Your life and wealth, in sync.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-black/20 p-4">
          <span
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-emerald-400" : "bg-red-400"
            }`}
          />

          <span className="text-sm text-slate-300">
            Backend {connected ? "connected" : "offline"}
          </span>
        </div>
      </section>
    </main>
  );
}