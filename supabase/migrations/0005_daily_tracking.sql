-- Sommeil quotidien
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  hours numeric not null check (hours >= 0 and hours <= 24),
  quality integer check (quality between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- Pas quotidiens
create table if not exists public.steps_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  steps integer not null check (steps >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- Historique de poids corporel
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  weight numeric not null check (weight > 0 and weight < 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- Indexes
create index if not exists idx_sleep_logs_user_date on public.sleep_logs(user_id, log_date desc);
create index if not exists idx_steps_logs_user_date on public.steps_logs(user_id, log_date desc);
create index if not exists idx_weight_logs_user_date on public.weight_logs(user_id, log_date desc);

-- RLS
alter table public.sleep_logs enable row level security;
alter table public.steps_logs enable row level security;
alter table public.weight_logs enable row level security;

-- Idempotent : permet de relancer le script sans erreur 42710 (policy already exists)
drop policy if exists "sleep_logs_owner" on public.sleep_logs;
drop policy if exists "steps_logs_owner" on public.steps_logs;
drop policy if exists "weight_logs_owner" on public.weight_logs;

create policy "sleep_logs_owner" on public.sleep_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "steps_logs_owner" on public.steps_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weight_logs_owner" on public.weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Triggers updated_at (réutilise public.set_updated_at de 0004)
drop trigger if exists trg_sleep_logs_updated_at on public.sleep_logs;
create trigger trg_sleep_logs_updated_at before update on public.sleep_logs for each row execute function public.set_updated_at();
drop trigger if exists trg_steps_logs_updated_at on public.steps_logs;
create trigger trg_steps_logs_updated_at before update on public.steps_logs for each row execute function public.set_updated_at();
drop trigger if exists trg_weight_logs_updated_at on public.weight_logs;
create trigger trg_weight_logs_updated_at before update on public.weight_logs for each row execute function public.set_updated_at();
