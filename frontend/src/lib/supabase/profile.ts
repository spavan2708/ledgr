import type { SupabaseClient } from "@supabase/supabase-js";

export interface AccountProfile { id: string; display_name: string; occupation: string | null; country: string; preferred_currency: string; onboarding_completed: boolean; created_at?: string; updated_at?: string; }
export interface AccountProfileInput { display_name: string; occupation: string; country: string; preferred_currency: string; onboarding_completed: boolean; }
export function validateAccountProfile(input: AccountProfileInput) {
  const errors: Partial<Record<keyof AccountProfileInput, string>> = {};
  if (input.display_name.trim().length < 2) errors.display_name = "Enter at least two characters.";
  if (!input.country.trim()) errors.country = "Select or enter a country.";
  if (!/^[A-Z]{3}$/.test(input.preferred_currency)) errors.preferred_currency = "Use a three-letter currency code.";
  return errors;
}
export async function getAccountProfile(client: SupabaseClient, id: string) { const { data, error } = await client.from("profiles").select("*").eq("id", id).maybeSingle(); if (error) throw error; return data as AccountProfile | null; }
export async function saveAccountProfile(client: SupabaseClient, id: string, input: AccountProfileInput) { const { data, error } = await client.from("profiles").upsert({ id, ...input }).select("*").single(); if (error) throw error; return data as AccountProfile; }

