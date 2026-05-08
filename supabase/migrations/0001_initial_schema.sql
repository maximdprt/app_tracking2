create extension if not exists pgcrypto;

create table if not exists public.users_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  height numeric,
  weight numeric,
  age integer,
  sex text,
  experience_level text,
  goal_type text,
  goal_duration_weeks integer,
  training_frequency integer,
  average_steps integer,
  average_sleep_hours numeric,
  current_daily_calories integer,
  target_daily_calories integer,
  target_protein numeric,
  target_carbs numeric,
  target_fats numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  workout_name text,
  is_rest_day boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  target_sets integer,
  target_reps integer,
  target_weight numeric,
  rest_time_seconds integer,
  order_index integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid references public.workout_days(id) on delete set null,
  session_date date not null,
  workout_name text,
  status text not null default 'planned' check (status in ('planned','completed','skipped')),
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performed_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_name text not null,
  order_index integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  performed_exercise_id uuid not null references public.performed_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_number integer not null,
  weight numeric,
  reps integer,
  rpe numeric,
  is_completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  aliases text[] not null default '{}',
  category text,
  calories_per_100g numeric not null,
  protein_per_100g numeric not null,
  carbs_per_100g numeric not null,
  fats_per_100g numeric not null,
  fiber_per_100g numeric,
  sugar_per_100g numeric,
  salt_per_100g numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.food_items add column if not exists name text;
alter table public.food_items add column if not exists aliases text[] not null default '{}';
alter table public.food_items add column if not exists category text;
alter table public.food_items add column if not exists calories_per_100g numeric;
alter table public.food_items add column if not exists protein_per_100g numeric;
alter table public.food_items add column if not exists carbs_per_100g numeric;
alter table public.food_items add column if not exists fats_per_100g numeric;
alter table public.food_items add column if not exists fiber_per_100g numeric;
alter table public.food_items add column if not exists sugar_per_100g numeric;
alter table public.food_items add column if not exists salt_per_100g numeric;
alter table public.food_items add column if not exists created_at timestamptz not null default now();
alter table public.food_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_type text not null,
  photo_url text,
  total_calories numeric not null default 0,
  total_protein numeric not null default 0,
  total_carbs numeric not null default 0,
  total_fats numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_ingredients (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- HYPOTHESE: la table food_items existante utilise id en text sur ce projet.
  food_item_id text references public.food_items(id) on delete set null,
  custom_food_name text,
  grams numeric not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fats numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  summary_date date not null,
  sport_summary text,
  food_summary text,
  global_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, summary_date)
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_name text not null,
  category text,
  target_frequency integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  status text,
  value numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_profiles_user_id on public.users_profiles(user_id);
create index if not exists idx_workout_programs_user_id on public.workout_programs(user_id);
create index if not exists idx_workout_days_user_id on public.workout_days(user_id);
create index if not exists idx_planned_exercises_user_id on public.planned_exercises(user_id);
create index if not exists idx_workout_sessions_user_id on public.workout_sessions(user_id);
create index if not exists idx_workout_sessions_session_date on public.workout_sessions(session_date);
create index if not exists idx_performed_exercises_user_id on public.performed_exercises(user_id);
create index if not exists idx_exercise_sets_user_id on public.exercise_sets(user_id);
create index if not exists idx_meals_user_id on public.meals(user_id);
create index if not exists idx_meals_meal_date on public.meals(meal_date);
create index if not exists idx_meal_ingredients_user_id on public.meal_ingredients(user_id);
create index if not exists idx_daily_summaries_user_id on public.daily_summaries(user_id);
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habit_logs_user_id on public.habit_logs(user_id);
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'food_items' and column_name = 'name'
  ) then
    execute 'create index if not exists idx_food_items_name on public.food_items(name)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'food_items' and column_name = 'category'
  ) then
    execute 'create index if not exists idx_food_items_category on public.food_items(category)';
  end if;
end $$;
