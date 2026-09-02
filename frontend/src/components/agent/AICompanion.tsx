"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { formatRupees } from "@/lib/formatters";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import type { AgentProposal, ProposalChange } from "@/types/session";
import { isProtectedPath } from "@/lib/supabase/config";

const api = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export function AICompanion({ inline = false }: { inline?: boolean }) {
  const { session, addMessage, applyProposal, clearSession } = useFinSyncSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  if (!session || !isProtectedPath(pathname) || pathname === "/setup") return null;
  if (!inline && pathname === "/assistant") return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;

    setInput("");
    addMessage({ role: "user", content: message });
    setBusy(true);

    try {
      const response = await fetch(`${api()}/api/v1/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          message,
          context: buildContext(session),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error("Assistant request failed");
      addMessage({ role: "assistant", content: body.message, proposal: body.proposal ?? undefined });
    } catch {
      addMessage({ role: "assistant", content: "The assistant is unavailable. Your session was not changed." });
    } finally {
      setBusy(false);
    }
  };

  const decide = async (proposal: AgentProposal, action: "approve" | "reject") => {
    try {
      const response = await fetch(`${api()}/api/v1/agent/proposals/${proposal.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.session_id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error("Proposal request failed");
      applyProposal(body.proposal, body.context ?? undefined);
    } catch {
      addMessage({ role: "assistant", content: "That proposal could not be updated. Your session was not changed." });
    }
  };

  const clear = () => {
    if (!confirm("Clear all ledgr data from this browser session? Other websites and unrelated session data will remain untouched.")) return;
    clearSession();
    setOpen(false);
    router.push("/onboarding");
  };

  const panel = (
    <section aria-label="ledgr assistant chat" className={`flex flex-col border border-black bg-white ${inline ? "min-h-[620px] rounded-2xl" : "fixed bottom-20 right-5 z-40 max-h-[75vh] w-[min(420px,calc(100vw-2.5rem))] rounded-2xl shadow-2xl"}`}>
      <header className="flex items-center justify-between border-b border-black p-4">
        <div>
          <strong className="text-black">ledgr assistant</strong>
          <p className="mt-1 text-xs text-black">Your financial planning assistant</p>
        </div>
        <button type="button" onClick={clear} className="text-xs font-semibold text-black underline underline-offset-4">Clear Session</button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {session.conversation.length === 0 && (
          <div className="mx-auto max-w-lg py-16 text-center">
            <h2 className="text-xl font-bold text-black">How can I help with your plan?</h2>
            <p className="mt-3 text-sm leading-6 text-black">Ask why a strategy was suggested, preview a supported profile or goal change, or review your current financial context.</p>
          </div>
        )}
        {session.conversation.map((message, index) => (
          <div key={index} className={`rounded-xl border border-black p-3 text-sm leading-6 ${message.role === "user" ? "ml-8 bg-black text-white" : "mr-5 bg-white text-black"}`}>
            <p>{message.content}</p>
            {message.proposal && <Proposal proposal={message.proposal} decide={decide} />}
          </div>
        ))}
        {busy && <p className="text-sm font-semibold text-black">ledgr assistant is responding...</p>}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-black p-4">
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={4000} className="goal-input" placeholder="Ask ledgr" aria-label="Message ledgr assistant" />
        <button type="submit" disabled={busy || !input.trim()} className="primary-button disabled:cursor-not-allowed disabled:opacity-50">Send</button>
      </form>
    </section>
  );

  if (inline) return panel;

  return (
    <>
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="fixed bottom-5 right-5 z-40 rounded-full bg-black px-5 py-3 font-bold text-white shadow-xl">ledgr assistant</button>
      {open && panel}
    </>
  );
}

function buildContext(session: NonNullable<ReturnType<typeof useFinSyncSession>["session"]>) {
  return {
    profile_input: session.profile_input,
    profile_analysis: session.profile_analysis,
    declared_monthly_capacity: session.declared_monthly_capacity,
    goals: session.goals,
    goal_simulation: session.goal_simulation,
  };
}

function Proposal({ proposal, decide }: { proposal: AgentProposal; decide: (proposal: AgentProposal, action: "approve" | "reject") => void }) {
  return (
    <section className="mt-3 border-t border-black pt-3">
      <strong>{proposal.summary}</strong>
      <ul className="mt-2 space-y-1">
        {proposal.changes.map((change) => <li key={change.field}>{change.label}: {show(change, change.old_value)} to {show(change, change.new_value)}</li>)}
      </ul>
      {proposal.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <button onClick={() => decide(proposal, "approve")} type="button" className="primary-button">Approve</button>
          <button onClick={() => decide(proposal, "reject")} type="button" className="secondary-button">Reject</button>
        </div>
      ) : <p className="mt-2 capitalize text-black">{proposal.status}</p>}
    </section>
  );
}

function show(change: ProposalChange, value: unknown): string {
  if (value === null || value === undefined) return "Not set";
  if (change.format === "currency" && typeof value === "number") return formatRupees(value);
  if (change.format === "percentage" && typeof value === "number") return `${value}%`;
  if (change.format === "months" && typeof value === "number") return `${value} months`;
  if (change.format === "status") return String(value).replaceAll("_", " ");
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
