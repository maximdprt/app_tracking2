create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'users_profiles','workout_programs','workout_days','planned_exercises','workout_sessions',
    'performed_exercises','exercise_sets','food_items','meals','meal_ingredients',
    'daily_summaries','habits','habit_logs'
  ]
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%s;', t, t);
    execute format('create trigger trg_%s_updated_at before update on public.%s for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;
