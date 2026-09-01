"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { FinancialProfile, FinancialProfileResult } from "@/types/financial-profile";
import type { GoalInput, GoalSimulationResponse } from "@/types/goals";
import type { AgentProposal, ConversationMessage, FinSyncSession, SessionContext } from "@/types/session";
import type { User } from "@supabase/supabase-js";
import type { AccountProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/client";
import { getAccountProfile } from "@/lib/supabase/profile";
import type { TutorLevel } from "@/types/session";
import type { FinancialPlan } from "@/types/financial-plan";
import type { AnyHolding, MarketDataCache } from "@/types/holdings";

const STORAGE_KEY = "finsync.session.v1";
export const FINSYNC_STORAGE_KEYS = [STORAGE_KEY];
const empty = (): FinSyncSession => ({ version: 1, session_id: crypto.randomUUID(), profile_input: null, profile_analysis: null, financial_plan: null, declared_monthly_capacity: null, goals: [], goal_simulation: null, holdings: [], market_data: {}, conversation: [], proposals: [], tutor_completed_lessons: [], tutor_quiz_scores: {} });

interface Value { 
  session: FinSyncSession | null; 
  user: User | null; 
  accountProfile: AccountProfile | null; 
  setProfile: (input: FinancialProfile, plan?: FinancialPlan | null, analysis?: FinancialProfileResult | null) => void; 
  setGoals: (goals: GoalInput[], result: GoalSimulationResponse) => void; 
  setHoldings: (holdings: AnyHolding[]) => void;
  updateMarketData: (data: Record<string, MarketDataCache>) => void;
  addMessage: (message: ConversationMessage) => void; 
  applyProposal: (proposal: AgentProposal, context?: SessionContext) => void; 
  clearSession: () => void; 
  refreshAccount: () => Promise<void>; 
  setLastOnboardingStep: (step: number) => void;
  setProfileStatus: (status: NonNullable<FinSyncSession["profile_status"]>) => void;
  markLessonCompleted: (lessonId: string) => void;
  submitQuizScore: (quizId: string, score: number) => void;
  submitAssessmentScore: (levelId: string, score: number) => void;
  unlockTutorLevel: (level: TutorLevel) => void;
}

const Context = createContext<Value | null>(null);

export function FinSyncSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FinSyncSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);
  const refreshAccount = useCallback(async () => { const client = createClient(); if (!client) return; const { data } = await client.auth.getUser(); setUser(data.user); setAccountProfile(data.user ? await getAccountProfile(client, data.user.id) : null); }, []);
  useEffect(() => { 
    try { const raw = sessionStorage.getItem(STORAGE_KEY); const parsed: unknown = raw ? JSON.parse(raw) : null; setSession(parsed && typeof parsed === "object" && (parsed as { version?: unknown }).version === 1 ? parsed as FinSyncSession : empty()); } catch { setSession(empty()); }
  }, []);
  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);


  useEffect(() => { if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }, [session]);
  const setProfile = useCallback((input: FinancialProfile, plan?: FinancialPlan | null, analysis?: FinancialProfileResult | null) => setSession((s) => ({ ...(s ?? empty()), profile_input: input, financial_plan: plan ?? null, profile_analysis: analysis ?? null, declared_monthly_capacity: s?.declared_monthly_capacity ?? plan?.recommendations.investableMonthlyAmount ?? analysis?.metrics.estimated_monthly_investment_capacity ?? null })), []);
  const setGoals = useCallback((goals: GoalInput[], result: GoalSimulationResponse) => setSession((s) => ({ ...(s ?? empty()), goals, goal_simulation: result })), []);
  const setHoldings = useCallback((holdings: AnyHolding[]) => setSession((s) => ({ ...(s ?? empty()), holdings })), []);
  const updateMarketData = useCallback((data: Record<string, MarketDataCache>) => setSession((s) => ({ ...(s ?? empty()), market_data: { ...(s?.market_data ?? {}), ...data } })), []);
  const addMessage = useCallback((message: ConversationMessage) => setSession((s) => ({ ...(s ?? empty()), conversation: [...(s?.conversation ?? []), message], proposals: message.proposal ? [...(s?.proposals ?? []), message.proposal] : s?.proposals ?? [] })), []);
  const applyProposal = useCallback((proposal: AgentProposal, context?: SessionContext) => setSession((s) => ({ ...(s ?? empty()), ...(context ?? {}), proposals: (s?.proposals ?? []).map((p) => p.id === proposal.id ? proposal : p), conversation: (s?.conversation ?? []).map((m) => m.proposal?.id === proposal.id ? { ...m, proposal } : m) })), []);
  const clearSession = useCallback(() => { FINSYNC_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key)); setSession(empty()); }, []);
  const setLastOnboardingStep = useCallback((step: number) => setSession((s) => ({ ...(s ?? empty()), last_onboarding_step: step })), []);
  const setProfileStatus = useCallback((status: NonNullable<FinSyncSession["profile_status"]>) => setSession((s) => ({ ...(s ?? empty()), profile_status: status })), []);
  
  const markLessonCompleted = useCallback((lessonId: string) => setSession((s) => { const curr = s ?? empty(); const existing = curr.tutor_completed_lessons ?? []; if (existing.includes(lessonId)) return curr; return { ...curr, tutor_completed_lessons: [...existing, lessonId] }; }), []);
  const submitQuizScore = useCallback((quizId: string, score: number) => setSession((s) => { const curr = s ?? empty(); return { ...curr, tutor_quiz_scores: { ...(curr.tutor_quiz_scores ?? {}), [quizId]: score } }; }), []);
  const submitAssessmentScore = useCallback((levelId: string, score: number) => setSession((s) => { 
    const curr = s ?? empty(); 
    const currentHighest = curr.tutor_assessment_scores?.[levelId] ?? 0;
    const currentAttempts = curr.tutor_assessment_attempts?.[levelId] ?? 0;
    return { 
      ...curr, 
      tutor_assessment_scores: { ...(curr.tutor_assessment_scores ?? {}), [levelId]: Math.max(currentHighest, score) },
      tutor_assessment_attempts: { ...(curr.tutor_assessment_attempts ?? {}), [levelId]: currentAttempts + 1 }
    }; 
  }), []);
  const unlockTutorLevel = useCallback((level: TutorLevel) => setSession((s) => ({ ...(s ?? empty()), tutor_unlocked_level: level })), []);

  return <Context.Provider key={session?.session_id} value={{ session, user, accountProfile, setProfile, setGoals, setHoldings, updateMarketData, addMessage, applyProposal, clearSession, refreshAccount, setLastOnboardingStep, setProfileStatus, markLessonCompleted, submitQuizScore, submitAssessmentScore, unlockTutorLevel }}>{children}</Context.Provider>;
}
export function useFinSyncSession() { const value = useContext(Context); if (!value) throw new Error("FinSync session provider is missing"); return value; }

