create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  exercise text not null check (exercise in ('push_up', 'squat', 'bicep_curl', 'shoulder_press', 'lunge', 'jumping_jack', 'plank', 'unknown')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  repetitions integer not null default 0,
  incorrect_repetitions integer not null default 0,
  accuracy numeric not null default 100,
  calories numeric not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;

create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read their workouts"
  on public.workouts for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their workouts"
  on public.workouts for insert
  with check (auth.uid()::text = user_id);

create index if not exists workouts_user_started_idx on public.workouts(user_id, started_at desc);
create index if not exists workouts_exercise_idx on public.workouts(exercise);
