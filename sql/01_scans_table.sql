-- Scan history table
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  swing_high numeric not null,
  swing_low numeric not null,
  timeframe text not null,
  levels jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.scans enable row level security;

-- Users can only read their own scans
create policy "Users can view own scans"
  on public.scans
  for select
  using (auth.uid() = user_id);

-- Users can insert their own scans
create policy "Users can insert own scans"
  on public.scans
  for insert
  with check (auth.uid() = user_id);

-- Index for faster queries
create index scans_user_id_created_at_idx on public.scans(user_id, created_at desc);
