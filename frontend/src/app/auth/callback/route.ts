import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=invalid_callback", url.origin));
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?error=auth_not_configured", url.origin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=invalid_callback", url.origin));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?error=invalid_callback", url.origin));
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
  return NextResponse.redirect(new URL(profile?.onboarding_completed ? "/dashboard" : "/setup", url.origin));
}

