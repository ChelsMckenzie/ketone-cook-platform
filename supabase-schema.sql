-- Supabase schema for KetoMate (https://ketomate.co.za)
-- Paste this into the Supabase SQL editor and run it.
-- Safe to re-run: uses IF NOT EXISTS and drops policies before recreating.

-- 1) Enum types (kept minimal)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'location_type') then
    create type public.location_type as enum ('rural', 'semi_urban', 'city');
  end if;

  if not exists (select 1 from pg_type where typname = 'activity_level') then
    create type public.activity_level as enum (
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active'
    );
  end if;
end
$$;

-- 2) Profile table (no categories)
-- One row per auth user; primary key matches auth.users.id
create table if not exists public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  user_name text,
  full_name text,
  email text not null,
  dob date,
  gender text,
  last_period_end date,
  location_type public.location_type,
  address text,
  activity_level public.activity_level,
  fasting_goal int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profile_email on public.profile (email);

-- 3) Recipes table (no categories beyond a simple text category column)
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profile (id) on delete set null,
  title text not null,
  ingredients jsonb not null,
  instructions text,
  cooking_time int,
  difficulty text,
  category text,
  macros jsonb
);

create index if not exists idx_recipes_user_id on public.recipes (user_id);
create index if not exists idx_recipes_created_at on public.recipes (created_at);

-- 4) Updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profile_updated_at on public.profile;
create trigger trg_profile_updated_at
before update on public.profile
for each row
execute function public.set_updated_at();

-- Recipes currently do not have updated_at; add if desired later.

-- 5) Row Level Security (RLS)
alter table public.profile enable row level security;
alter table public.recipes enable row level security;

-- Profile: only the owner can read/write their row
drop policy if exists "Profile select own" on public.profile;
create policy "Profile select own"
  on public.profile
  for select
  using (auth.uid() = id);

drop policy if exists "Profile insert own" on public.profile;
create policy "Profile insert own"
  on public.profile
  for insert
  with check (auth.uid() = id);

drop policy if exists "Profile update own" on public.profile;
create policy "Profile update own"
  on public.profile
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Recipes: owner can CRUD; no public recipes yet (you can add later)
drop policy if exists "Recipes select own" on public.recipes;
create policy "Recipes select own"
  on public.recipes
  for select
  using (auth.uid() = user_id);

drop policy if exists "Recipes insert own" on public.recipes;
create policy "Recipes insert own"
  on public.recipes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Recipes update own" on public.recipes;
create policy "Recipes update own"
  on public.recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Recipes delete own" on public.recipes;
create policy "Recipes delete own"
  on public.recipes
  for delete
  using (auth.uid() = user_id);

