create table if not exists public.user_financial_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_financial_states enable row level security;
drop policy if exists "Users select own financial state" on public.user_financial_states;
create policy "Users select own financial state" on public.user_financial_states for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own financial state" on public.user_financial_states;
create policy "Users insert own financial state" on public.user_financial_states for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own financial state" on public.user_financial_states;
create policy "Users update own financial state" on public.user_financial_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own financial state" on public.user_financial_states;
create policy "Users delete own financial state" on public.user_financial_states for delete to authenticated using ((select auth.uid()) = user_id);

drop trigger if exists user_financial_states_set_updated_at on public.user_financial_states;
create trigger user_financial_states_set_updated_at before update on public.user_financial_states for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare requested_name text;
begin
  requested_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
  insert into public.profiles (id, display_name, occupation, country, preferred_currency, onboarding_completed)
  values (new.id, coalesce(requested_name, split_part(coalesce(new.email, 'FinSync member'), '@', 1)), null, 'India', 'INR', false)
  on conflict (id) do nothing;
  insert into public.user_financial_states (user_id, data) values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, occupation, country, preferred_currency, onboarding_completed)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(email, 'FinSync member'), '@', 1)), null, 'India', 'INR', false
from auth.users on conflict (id) do nothing;
insert into public.user_financial_states (user_id, data)
select id, '{}'::jsonb from auth.users on conflict (user_id) do nothing;
