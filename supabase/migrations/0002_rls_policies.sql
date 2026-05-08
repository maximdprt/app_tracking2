alter table public.users_profiles enable row level security;
alter table public.workout_programs enable row level security;
alter table public.workout_days enable row level security;
alter table public.planned_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.performed_exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.food_items enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ingredients enable row level security;
alter table public.daily_summaries enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "food_items_public_read" on public.food_items for select using (true);

create policy "users_profiles_owner" on public.users_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_programs_owner" on public.workout_programs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_days_owner" on public.workout_days for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "planned_exercises_owner" on public.planned_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sessions_owner" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "performed_exercises_owner" on public.performed_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_sets_owner" on public.exercise_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_owner" on public.meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meal_ingredients_owner" on public.meal_ingredients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_summaries_owner" on public.daily_summaries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits_owner" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habit_logs_owner" on public.habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
