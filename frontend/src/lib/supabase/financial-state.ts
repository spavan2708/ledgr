import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinSyncSession } from "@/types/session";

export async function getFinancialState(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from("user_financial_states").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const value: unknown = data?.data;
  return value && typeof value === "object" && (value as { version?: unknown }).version === 1 ? value as FinSyncSession : null;
}

export async function saveFinancialState(client: SupabaseClient, userId: string, state: FinSyncSession) {
  const { error } = await client.from("user_financial_states").upsert({ user_id: userId, data: state }, { onConflict: "user_id" });
  if (error) throw error;
}
