"use client";

import { useState, type FormEvent } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";

const api = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

interface TutorAIHelperProps {
  lessonTitle: string;
  concept: string;
  level: string;
}

export function TutorAIHelper({ lessonTitle, concept, level }: TutorAIHelperProps) {
  const { session } = useFinSyncSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversation, setConversation] = useState<{ role: "user" | "assistant", content: string }[]>([]);

  if (!session) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    setConversation(prev => [...prev, { role: "user", content: message }]);
    setBusy(true);

    try {
      const response = await fetch(`${api()}/api/v1/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.session_id,
          message: `[TUTOR MODE: Help me understand ${lessonTitle}] ${message}`,
          context: {
            tutor_mode: true,
            current_level: level,
            lesson_title: lessonTitle,
            concept_text: concept,
            // Pass standard session stuff to satisfy API if it expects it
            profile_input: null,
            profile_analysis: null,
            financial_plan: null,
            declared_monthly_capacity: null,
            goals: [],
            goal_simulation: null,
            holdings: [],
            market_data: {}
          }
        })
      });
      const body = await response.json();
      if (!response.ok) throw new Error("Helper request failed");
      setConversation(prev => [...prev, { role: "assistant", content: body.message }]);
    } catch {
      setConversation(prev => [...prev, { role: "assistant", content: "The tutor assistant is unavailable right now." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(!open)} className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-400 hover:bg-sky-500/20">
        Need Help? Ask AI Tutor
      </button>

      {open && (
        <aside className="fixed bottom-20 right-5 z-40 flex max-h-[75vh] w-[min(420px,calc(100vw-2.5rem))] flex-col rounded-2xl border border-white/15 bg-slate-950 p-4 shadow-2xl">
          <div className="flex justify-between">
            <strong className="text-white">AI Tutor Assistant</strong>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400">Close</button>
          </div>
          <div className="my-4 space-y-3 overflow-y-auto min-h-[200px]">
            {conversation.length === 0 && (
              <p className="text-sm text-slate-500">Ask for simpler explanations, more examples, or hints for the current concept.</p>
            )}
            {conversation.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 text-sm ${m.role === "user" ? "ml-8 bg-sky-400/10 text-sky-100" : "mr-5 bg-white/5 text-slate-200"}`}>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {["Explain in simpler words", "Give me another example", "I don't understand this"].map(hint => (
              <button key={hint} type="button" onClick={() => setInput(hint)} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10">{hint}</button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} className="goal-input flex-1" placeholder="Ask AI Tutor…" />
            <button disabled={busy} className="primary-button">Send</button>
          </form>
        </aside>
      )}
    </>
  );
}
