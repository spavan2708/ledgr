import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ROUTES, getSupabaseConfig, isProtectedPath } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config) return isProtectedPath(request.nextUrl.pathname) ? NextResponse.redirect(new URL("/login", request.url)) : response;
  const supabase = createServerClient(config.url, config.key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user && isProtectedPath(path)) return NextResponse.redirect(new URL("/login", request.url));
  if (user && AUTH_ROUTES.some((route) => path === route)) return NextResponse.redirect(new URL("/dashboard", request.url));
  if (user && isProtectedPath(path) && path !== "/setup") {
    const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
    if (!profile?.onboarding_completed) return NextResponse.redirect(new URL("/setup", request.url));
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
