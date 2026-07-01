-- Add membership tier + admin column to profiles
-- Run in Supabase Dashboard > SQL Editor

-- Add is_admin column (default false)
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Add tier column: 'free' | 'pro' | 'admin'
-- is_pro stays for backward compat; tier is source of truth
alter table public.profiles
  add column if not exists tier text default 'free' check (tier in ('free', 'pro', 'admin'));

-- Backfill: existing is_pro=true → tier='pro'
update public.profiles set tier = 'pro' where is_pro = true and tier = 'free';

-- Index for admin queries
create index if not exists idx_profiles_tier on public.profiles(tier);
create index if not exists idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;

-- Admin RLS: admins can read all profiles
create policy "Admins read all profiles"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Admin RLS: admins can update any profile's tier/is_pro/is_admin
create policy "Admins update all profiles"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
