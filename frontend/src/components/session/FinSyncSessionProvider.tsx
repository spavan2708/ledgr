"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { FinancialProfile, FinancialProfileResult } from "@/types/financial-profile";
import type { GoalInput, GoalSimulationResponse } from "@/types/goals";
import type { AgentProposal, ConversationMessage, FinSyncSession, SessionContext } from "@/types/session";
import type { User } from "@supabase/supabase-js";
import type { AccountProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/client";
import { getAccountProfile } from "@/lib/supabase/profile";

const STORAGE_KEY = "finsync.session.v1";
export const FINSYNC_STORAGE_KEYS = [STORAGE_KEY];
const empty = (): FinSyncSession => ({ version: 1, session_id: crypto.randomUUID(), profile_input: null, profile_analysis: null, declared_monthly_capacity: null, goals: [], goal_simulation: null, conversation: [], proposals: [] });

interface Value { session: FinSyncSession | null; user: User | null; accountProfile: AccountProfile | null; setProfile: (input: FinancialProfile, analysis: FinancialProfileResult) => void; setGoals: (goals: GoalInput[], result: GoalSimulationResponse) => void; addMessage: (message: ConversationMessage) => void; applyProposal: (proposal: AgentProposal, context?: SessionContext) => void; clearSession: () => void; refreshAccount: () => Promise<void>; }
const Context = createContext<Value | null>(null);

export function FinSyncSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FinSyncSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);
  const refreshAccount = useCallback(async () => { const client = createClient(); if (!client) return; const { data } = await client.auth.getUser(); setUser(data.user); setAccountProfile(data.user ? await getAccountProfile(client, data.user.id) : null); }, []);
  useEffect(() => { // Browser storage is intentionally hydrated only after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const raw = sessionStorage.getItem(STORAGE_KEY); const parsed: unknown = raw ? JSON.parse(raw) : null; setSession(parsed && typeof parsed === "object" && (parsed as { version?: unknown }).version === 1 ? parsed as FinSyncSession : empty()); } catch { setSession(empty()); }
  }, []);
  useEffect(() => {
    // Auth is an external cookie-backed store; hydrate its current identity after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAccount();
  }, [refreshAccount]);
  useEffect(() => { if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }, [session]);
  const setProfile = useCallback((input: FinancialProfile, analysis: FinancialProfileResult) => setSession((s) => ({ ...(s ?? empty()), profile_input: input, profile_analysis: analysis, declared_monthly_capacity: s?.declared_monthly_capacity ?? analysis.metrics.estimated_monthly_investment_capacity })), []);
  const setGoals = useCallback((goals: GoalInput[], result: GoalSimulationResponse) => setSession((s) => ({ ...(s ?? empty()), goals, goal_simulation: result })), []);
  const addMessage = useCallback((message: ConversationMessage) => setSession((s) => ({ ...(s ?? empty()), conversation: [...(s?.conversation ?? []), message], proposals: message.proposal ? [...(s?.proposals ?? []), message.proposal] : s?.proposals ?? [] })), []);
  const applyProposal = useCallback((proposal: AgentProposal, context?: SessionContext) => setSession((s) => ({ ...(s ?? empty()), ...(context ?? {}), proposals: (s?.proposals ?? []).map((p) => p.id === proposal.id ? proposal : p), conversation: (s?.conversation ?? []).map((m) => m.proposal?.id === proposal.id ? { ...m, proposal } : m) })), []);
  const clearSession = useCallback(() => { FINSYNC_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key)); setSession(empty()); }, []);
  return <Context.Provider key={session?.session_id} value={{ session, user, accountProfile, setProfile, setGoals, addMessage, applyProposal, clearSession, refreshAccount }}>{children}</Context.Provider>;
}
export function useFinSyncSession() { const value = useContext(Context); if (!value) throw new Error("FinSync session provider is missing"); return value; }
