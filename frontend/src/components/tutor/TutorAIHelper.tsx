"use client";

import { useState, type FormEvent } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { buildTutorFinancialContext, buildTutorLearningContext } from "@/lib/tutor/aiContext";

const api = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

interface TutorAIHelperProps {
  lessonTitle: string;
  concept: string;
  level: string;
}

type AIMode = "ADAPT_LEARNING" | "EXPLAIN_FINANCES";

export function TutorAIHelper({ lessonTitle, concept, level }: TutorAIHelperProps) {
  const { session } = useFinSyncSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AIMode>("ADAPT_LEARNING");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversation, setConversation] = useState<{ role: "user" | "assistant", content: string }[]>([]);

  if (!session) return null;

  const starterPrompts = mode === "ADAPT_LEARNING" 
    ? ["Explain in simpler words", "Give me another example", "I don't understand this"]
    : ["Explain my current portfolio.", "Why is my portfolio allocated this way?", "What is my largest expense?", "Why is my savings rate what it is?", "Explain my emergency fund.", "Why is my risk score what it is?", "How are my goals progressing?", "Explain my future simulator result."];

  const modeDescription = mode === "ADAPT_LEARNING"
    ? "Adapts teaching based on your learning progress."
    : "Explains your actual ledgr financial state.";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    setConversation(prev => [...prev, { role: "user", content: message }]);
    setBusy(true);

    try {
      // Build precise AI context using dedicated helper functions depending on mode
      const financial_context = mode === "EXPLAIN_FINANCES" ? buildTutorFinancialContext(session as any) : undefined;
      const learning_context = mode === "ADAPT_LEARNING" ? buildTutorLearningContext(session as any, level, lessonTitle) : undefined;

      const questionPrefix = mode === "EXPLAIN_FINANCES"
        ? `[EXPLAIN MY FINANCES]`
        : `[ADAPT MY LEARNING: Help me understand ${lessonTitle} - Concept: ${concept}]`;

      const response = await fetch(`${api()}/api/v1/tutor/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `${questionPrefix} ${message}`,
          level: level,
          lesson: lessonTitle,
          financial_context,
          learning_context
        })
      });
      const body = await response.json();
      if (!response.ok) throw new Error("Helper request failed");
      setConversation(prev => [...prev, { role: "assistant", content: body.answer }]);
    } catch {
      setConversation(prev => [...prev, { role: "assistant", content: "The tutor assistant is unavailable right now." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(!open)} className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-400 hover:bg-sky-500/20 transition-colors">
        Need Help? Ask AI Tutor
      </button>

      {open && (
        <aside className="fixed bottom-20 right-5 z-40 flex max-h-[85vh] w-[min(480px,calc(100vw-2.5rem))] flex-col rounded-2xl border border-white/15 bg-slate-950 p-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <strong className="text-white">Finance Tutor AI</strong>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-white transition-colors">Close</button>
          </div>
          
          <div className="flex gap-2 mb-2 p-1 bg-white/5 rounded-lg">
            <button 
              type="button" 
              onClick={() => setMode("ADAPT_LEARNING")} 
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === "ADAPT_LEARNING" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Adapt My Learning
            </button>
            <button 
              type="button" 
              onClick={() => setMode("EXPLAIN_FINANCES")} 
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === "EXPLAIN_FINANCES" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Explain My Finances
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 px-1">{modeDescription}</p>

          <div className="my-2 space-y-3 overflow-y-auto min-h-[250px] flex-1 pr-2 custom-scrollbar">
            {conversation.length === 0 && (
              <p className="text-sm text-slate-500 mt-2">How can I help you today?</p>
            )}
            {conversation.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 text-sm ${m.role === "user" ? "ml-8 bg-sky-400/10 text-sky-100" : "mr-5 bg-white/5 text-slate-200"}`}>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {starterPrompts.map(hint => (
              <button key={hint} type="button" onClick={() => setInput(hint)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:border-white/20 transition-colors">{hint}</button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all" placeholder="Ask AI Tutor…" />
            <button disabled={busy} className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors">Send</button>
          </form>
        </aside>
      )}
    </>
  );
}
