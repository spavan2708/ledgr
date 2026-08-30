# FinSync authentication foundation

Supabase owns passwords, email verification, recovery, OAuth sessions, and persistent identity. The browser uses `@supabase/ssr`; Next.js `proxy.ts` refreshes cookies and guards protected routes. The callback accepts only the authorization code and chooses a fixed `/setup` or `/dashboard` destination, avoiding open redirects.

FastAPI currently keeps the established profile, market, goal, and agent prototype endpoints public for compatibility. `/api/v1/me` is protected and validates the Bearer JWT against the configured Supabase JWKS, issuer, expiry, and optional audience. Existing endpoints can adopt the same dependency when persistence moves server-side.

Apply `supabase/migrations/202608300001_create_profiles.sql` in the Supabase project, configure the site URL and allowed redirect URLs, and enable Google plus email/password providers. Never use a service-role key in the frontend.
