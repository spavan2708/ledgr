"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";
import { buildInvestmentContext } from "@/lib/investment/context";
import ReactMarkdown from "react-markdown";

const api = () => (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function InvestmentChatbot() {
  const { session } = useFinSyncSession();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "What is an index fund?",
    "Explain diversification",
    "What is P/E ratio?",
    "Stocks vs mutual funds?"
  ];

  const financial_context = session ? buildInvestmentContext(session as any) : undefined;
  const hasContext = !!financial_context?.income || !!financial_context?.allocations?.current;

  const storageKey = session?.session_id 
    ? `finsync-investment-chat-history:${session.session_id}` 
    : "finsync-investment-chat-history";

  // Load history on mount
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversation(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse investment chat history", e);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save history on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (conversation.length > 0) {
        window.sessionStorage.setItem(storageKey, JSON.stringify(conversation));
      } else {
        window.sessionStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error("Failed to save investment chat history", e);
    }
  }, [conversation, isLoaded, storageKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, busy]);

  const submitMessage = async (message: string) => {
    if (!message.trim() || busy) return;
    
    setInput("");
    const newConversation = [...conversation, { role: "user" as const, content: message }];
    setConversation(newConversation);
    setBusy(true);

    try {
      const response = await fetch(`${api()}/api/v1/investment-chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          history: newConversation.slice(0, -1), // Send previous history (excluding the message we just sent, which goes in the message field)
          financial_context: financial_context
        })
      });
      
      const body = await response.json();
      if (!response.ok) throw new Error("Chat request failed");
      
      const reply = String(body.reply).replace(/FinSync/gi, "ledgr");
      setConversation(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setConversation(prev => [...prev, { role: "assistant", content: "I'm sorry, I am currently unavailable. Please try again later." }]);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setConversation([]);
    }
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[800px] w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl"></span> ledgr assistant
          </h2>
          <p className="text-xs text-slate-400">Ask general investment and personal finance questions.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasContext && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Using your ledgr financial plan
            </div>
          )}
          {conversation.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-xs text-slate-400 hover:text-white transition-colors border border-white/10 rounded-lg px-3 py-1 hover:bg-white/5"
            >
              Clear chat
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {conversation.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400">
            <div className="text-4xl"></div>
            <p className="max-w-md">I am your ledgr assistant. I can explain financial concepts, asset classes, and market terminology.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg">
              {starterPrompts.map(prompt => (
                <button 
                  key={prompt} 
                  type="button" 
                  onClick={() => submitMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:border-white/20 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${m.role === "user" ? "bg-emerald-500/20 text-emerald-100 rounded-tr-none" : "bg-white/5 text-slate-200 rounded-tl-none"}`}>
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="react-markdown-container space-y-3 [&>p]:leading-relaxed [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mt-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-4 [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&_strong]:text-white [&_strong]:font-semibold [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded [&_code]:text-emerald-300">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-white/5 text-slate-400 rounded-tl-none flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse animation-delay-200" style={{ animationDelay: "200ms" }}>●</span>
              <span className="animate-pulse animation-delay-400" style={{ animationDelay: "400ms" }}>●</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-slate-900 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown}
            maxLength={2000} 
            rows={input.split("\n").length > 1 ? Math.min(input.split("\n").length, 5) : 1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all custom-scrollbar" 
            placeholder="Ask about investing concepts..." 
          />
          <button 
            type="submit"
            disabled={busy || !input.trim()} 
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors h-[46px]"
          >
            Send
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Educational purposes only. Not personalized financial advice.
        </p>
      </div>
    </div>
  );
}
