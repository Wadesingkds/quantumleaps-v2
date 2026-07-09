-- ============================================================
-- QuantumLeaps Admin Panel — Schema Migration
-- Run in Supabase Dashboard > SQL Editor (VPS is Cloudflare-blocked)
-- ============================================================

-- 1. Audit log table (every risky admin action leaves a trail)
create table if not exists public.admin_audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid not null references auth.users(id),
  action      text not null,
  target_type text,
  target_id   text,
  before      jsonb,
  after       jsonb,
  reason      text,
  created_at  timestamptz default now()
);
create index if not exists idx_audit_actor on public.admin_audit_log(actor_id);
create index if not exists idx_audit_created on public.admin_audit_log(created_at desc);

-- 2. App settings (key/value, admin-editable)
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz default now()
);
insert into public.app_settings (key, value) values
  ('signup_enabled',  '{"enabled": true}'::jsonb),
  ('maintenance_mode', '{"enabled": false}'::jsonb),
  ('pro_price_idr',    '{"amount": 999000}'::jsonb),
  ('scan_rate_limit',  '{"per_min": 60}'::jsonb)
on conflict (key) do nothing;

-- 3. Feature flags
create table if not exists public.feature_flags (
  key         text primary key,
  enabled     boolean not null default false,
  description text,
  owner       text,
  rollout_pct int default 0 check (rollout_pct between 0 and 100),
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz default now()
);
-- Backfill: if table pre-existed with an older schema, add missing columns
alter table public.feature_flags add column if not exists description text;
alter table public.feature_flags add column if not exists owner text;
alter table public.feature_flags add column if not exists rollout_pct int default 0 check (rollout_pct between 0 and 100);
alter table public.feature_flags add column if not exists updated_by uuid references auth.users(id);
alter table public.feature_flags add column if not exists updated_at timestamptz default now();
insert into public.feature_flags (key, enabled, description, owner) values
  ('promo_banner',   false, 'Show discount banner on landing', 'admin'),
  ('beta_calculator', false, 'New calculator UI', 'admin')
on conflict (key) do nothing;

-- 4. RLS: only admins (is_admin OR tier=admin) can touch admin tables
alter table public.admin_audit_log enable row level security;
alter table public.app_settings    enable row level security;
alter table public.feature_flags   enable row level security;

-- safe, non-recursive admin check via a SQL function (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (p.is_admin = true or p.tier = 'admin')
  );
$$;

drop policy if exists "Admin read audit" on public.admin_audit_log;
create policy "Admin read audit" on public.admin_audit_log
  for select to authenticated using (public.is_admin_user());

drop policy if exists "Admin read settings" on public.app_settings;
create policy "Admin read settings" on public.app_settings
  for select to authenticated using (public.is_admin_user());
drop policy if exists "Admin write settings" on public.app_settings;
create policy "Admin write settings" on public.app_settings
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Admin read flags" on public.feature_flags;
create policy "Admin read flags" on public.feature_flags
  for select to authenticated using (public.is_admin_user());
drop policy if exists "Admin write flags" on public.feature_flags;
create policy "Admin write flags" on public.feature_flags
  for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

-- NOTE: the old recursive policies "Admins read all profiles" / "Admins update all profiles"
-- were already dropped (they caused HTTP 500). The is_admin_user() SECURITY DEFINER
-- function replaces them without recursion.
