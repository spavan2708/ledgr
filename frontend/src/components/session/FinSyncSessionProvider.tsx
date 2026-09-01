"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { FinancialProfile, FinancialProfileResult } from "@/types/financial-profile";
import type { GoalInput, GoalSimulationResponse } from "@/types/goals";
import type { AgentProposal, ConversationMessage, FinSyncSession, SessionContext } from "@/types/session";
import type { FinancialPlan } from "@/types/financial-plan";
import type { AnyHolding, MarketDataCache } from "@/types/holdings";
import type { GoldPriceResponse } from "@/lib/marketData";

const GUEST_STORAGE_KEY = "finsync.session.guest";
const empty = (): FinSyncSession => ({ version: 1, session_id: crypto.randomUUID(), profile_input: null, profile_analysis: null, financial_plan: null, declared_monthly_capacity: null, goals: [], goal_simulation: null, holdings: [], market_data: {}, conversation: [], proposals: [] });

function readCachedState() {
  try {
    const raw = sessionStorage.getItem(GUEST_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" && (parsed as { version?: unknown }).version === 1 ? parsed as FinSyncSession : null;
  } catch { return null; }
}

interface Value { 
  session: FinSyncSession | null; 
  user: any | null; 
  accountProfile: any | null; 
  setProfile: (input: FinancialProfile, plan?: FinancialPlan | null, analysis?: FinancialProfileResult | null) => void; 
  setGoals: (goals: GoalInput[], result: GoalSimulationResponse) => void; 
  setHoldings: (holdings: AnyHolding[]) => void;
  updateMarketData: (data: Record<string, MarketDataCache>) => void;
  updateGoldData: (data: GoldPriceResponse) => void;
  addMessage: (message: ConversationMessage) => void; 
  applyProposal: (proposal: AgentProposal, context?: SessionContext) => void; 
  clearSession: () => void; 
  refreshAccount: () => Promise<void>; 
  setLastOnboardingStep: (step: number) => void;
  setProfileStatus: (status: NonNullable<FinSyncSession["profile_status"]>) => void;
  markLessonCompleted: (lessonId: string) => void;
  submitQuizScore: (lessonId: string, score: number) => void;
  submitAssessmentScore: (levelId: string, score: number) => void;
}

const Context = createContext<Value | null>(null);

export function FinSyncSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FinSyncSession | null>(null);
  
  // Dummy user/profile properties to avoid breaking the rest of the app that expects them to exist (but can be null)
  const user = { id: "guest", email: "guest@finsync.local" };
  const accountProfile = { id: "guest", display_name: "Guest User", onboarding_completed: true };

  const refreshAccount = useCallback(async () => {
    const cachedState = readCachedState();
    setSession(cachedState ?? empty());
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void refreshAccount().catch(() => undefined); });
  }, [refreshAccount]);

  const hasGold = session?.holdings.some((holding) => (holding.asset_category as string) === "gold") ?? false;
  
  // Global Gold data fetcher
  useEffect(() => {
    if (!hasGold) return;
    
    let active = true;
    const fetchGold = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/v1/market/gold");
        if (res.ok && active) {
           const data = await res.json() as GoldPriceResponse;
           setSession(s => s ? { ...s, gold_data: data } : s);
        }
      } catch {
        // Silent fail for background poller
      }
    };
    fetchGold();
    const interval = setInterval(fetchGold, 5 * 60 * 1000); // 5 mins
    return () => { active = false; clearInterval(interval); };
  }, [hasGold]);

  useEffect(() => {
    if (!session) return;
    sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const setProfile = useCallback((input: FinancialProfile, plan?: FinancialPlan | null, analysis?: FinancialProfileResult | null) => setSession((s) => ({ ...(s ?? empty()), profile_input: input, financial_plan: plan ?? null, profile_analysis: analysis ?? null, declared_monthly_capacity: s?.declared_monthly_capacity ?? plan?.recommendations.investableMonthlyAmount ?? analysis?.metrics.estimated_monthly_investment_capacity ?? null })), []);
  const setGoals = useCallback((goals: GoalInput[], result: GoalSimulationResponse) => setSession((s) => ({ ...(s ?? empty()), goals, goal_simulation: result })), []);
  const setHoldings = useCallback((holdings: AnyHolding[]) => setSession((s) => ({ ...(s ?? empty()), holdings })), []);
  const updateMarketData = useCallback((data: Record<string, MarketDataCache>) => setSession((s) => ({ ...(s ?? empty()), market_data: { ...(s?.market_data ?? {}), ...data } })), []);
  const updateGoldData = useCallback((data: GoldPriceResponse) => setSession((s) => ({ ...(s ?? empty()), gold_data: data })), []);
  const addMessage = useCallback((message: ConversationMessage) => setSession((s) => ({ ...(s ?? empty()), conversation: [...(s?.conversation ?? []), message], proposals: message.proposal ? [...(s?.proposals ?? []), message.proposal] : s?.proposals ?? [] })), []);
  const applyProposal = useCallback((proposal: AgentProposal, context?: SessionContext) => setSession((s) => ({ ...(s ?? empty()), ...(context ?? {}), proposals: (s?.proposals ?? []).map((p) => p.id === proposal.id ? proposal : p), conversation: (s?.conversation ?? []).map((m) => m.proposal?.id === proposal.id ? { ...m, proposal } : m) })), []);
  
  const clearSession = useCallback(() => {
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setSession(empty());
  }, []);
  
  const setLastOnboardingStep = useCallback((step: number) => setSession((s) => ({ ...(s ?? empty()), last_onboarding_step: step })), []);
  const setProfileStatus = useCallback((status: NonNullable<FinSyncSession["profile_status"]>) => setSession((s) => ({ ...(s ?? empty()), profile_status: status })), []);
  
  return (
    <Context.Provider 
      key={session?.session_id} 
      value={{ 
        session, user, accountProfile, setProfile, setGoals, setHoldings, updateMarketData, updateGoldData, addMessage, applyProposal, clearSession, refreshAccount, setLastOnboardingStep, setProfileStatus,
        markLessonCompleted: () => {},
        submitQuizScore: () => {},
        submitAssessmentScore: () => {}
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useFinSyncSession() { const value = useContext(Context); if (!value) throw new Error("FinSync session provider is missing"); return value; }

