export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export const PROTECTED_ROUTES = ["/setup", "/dashboard", "/profile", "/goals", "/simulator", "/portfolio", "/market", "/insights", "/assistant", "/activity", "/notifications", "/settings"] as const;
export const AUTH_ROUTES = ["/login", "/signup"] as const;
export function isProtectedPath(pathname: string) { return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)); }
export function safeRedirect(target: string | null, fallback = "/dashboard") { return target && target.startsWith("/") && !target.startsWith("//") && !target.includes(":") ? target : fallback; }
