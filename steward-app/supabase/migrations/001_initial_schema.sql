-- ============================================================
-- Steward: The Civic Maintenance Engine - Database Schema
-- Supabase (PostgreSQL) - Initial Migration
-- ============================================================

-- Enable PostGIS for geospatial queries (distance-based task lookup)
create extension if not exists postgis;

-- ============================================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data.
-- A row is auto-created on sign-up via a trigger.
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  avatar_url    text,
  civic_credits integer not null default 0,
  tasks_completed integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Row-Level Security
alter table public.profiles enable row level security;

-- Anyone can read profiles (leaderboard, public info)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- 2. TASKS TABLE
-- Represents a civic maintenance task pinned on the map.
-- ============================================================

-- Effort level enum for color-coded pins
create type public.effort_level as enum ('easy', 'medium', 'hard');

-- Task status lifecycle
create type public.task_status as enum ('open', 'in_progress', 'completed', 'expired');

create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text not null,
  latitude        double precision not null,
  longitude       double precision not null,
  location_name   text,                          -- optional human-readable address
  effort          public.effort_level not null default 'easy',
  reward_points   integer not null default 10,   -- Civic Credits awarded on completion
  estimated_minutes integer not null default 15,
  status          public.task_status not null default 'open',
  claimed_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Row-Level Security
alter table public.tasks enable row level security;

-- Anyone can view open tasks
create policy "Tasks are viewable by everyone"
  on public.tasks for select
  using (true);

-- Any authenticated user can create tasks
create policy "Authenticated users can create tasks"
  on public.tasks for insert
  with check (auth.uid() = created_by);

-- Task creator or the claimer can update a task
create policy "Creator or claimer can update task"
  on public.tasks for update
  using (auth.uid() = created_by or auth.uid() = claimed_by);

-- ============================================================
-- 3. SUBMISSIONS TABLE
-- Proof-of-work: before/after photo pairs for task completion.
-- ============================================================
create type public.submission_status as enum ('pending', 'approved', 'rejected');

create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  task_id         uuid not null references public.tasks(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  before_photo_url text not null,
  after_photo_url  text not null,
  notes           text,
  status          public.submission_status not null default 'pending',
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- Row-Level Security
alter table public.submissions enable row level security;

-- Users can view their own submissions
create policy "Users can view own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

-- Task creators can view submissions for their tasks
create policy "Task creators can view submissions"
  on public.submissions for select
  using (
    auth.uid() in (
      select created_by from public.tasks where id = task_id
    )
  );

-- Authenticated users can create submissions
create policy "Authenticated users can submit"
  on public.submissions for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 4. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || left(new.id::text, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_timestamp();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_timestamp();

-- Award civic credits when a submission is approved
create or replace function public.award_credits_on_approval()
returns trigger as $$
begin
  if new.status = 'approved' and old.status != 'approved' then
    -- Credit the user
    update public.profiles
    set civic_credits = civic_credits + (
      select reward_points from public.tasks where id = new.task_id
    ),
    tasks_completed = tasks_completed + 1
    where id = new.user_id;

    -- Mark the task as completed
    update public.tasks
    set status = 'completed'
    where id = new.task_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_submission_approved
  after update on public.submissions
  for each row execute function public.award_credits_on_approval();

-- ============================================================
-- 5. INDEXES for performance
-- ============================================================
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_location on public.tasks(latitude, longitude);
create index idx_tasks_created_by on public.tasks(created_by);
create index idx_submissions_task on public.submissions(task_id);
create index idx_submissions_user on public.submissions(user_id);

-- ============================================================
-- 6. STORAGE BUCKET (run via Supabase dashboard or CLI)
-- ============================================================
-- Create a public bucket called "task-photos" in Supabase Storage.
-- Storage policy: authenticated users can upload, everyone can read.
--
-- insert into storage.buckets (id, name, public)
-- values ('task-photos', 'task-photos', true);
