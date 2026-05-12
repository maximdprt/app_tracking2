-- ─────────────────────────────────────────────────────────────────────────────
-- 0008 — workout_metrics (e1RM, volume) + user_streaks (gamification)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Métriques par exercice (Phase 4) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workout_metrics (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name   text        NOT NULL,
  session_id      uuid        REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  session_date    date        NOT NULL,
  top_set_kg      numeric(6,2),         -- charge max de la séance pour cet exercice
  top_set_reps    int,                  -- reps correspondantes
  e1rm_kg         numeric(6,2),         -- e1RM calculé via Epley
  volume_kg       numeric(10,2),        -- sets × reps × poids
  sets_count      int,
  rpe_avg         numeric(3,1),         -- RPE moyen sur les séries
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_metrics_self" ON public.workout_metrics;
CREATE POLICY "workout_metrics_self"
  ON public.workout_metrics
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_metrics_user_exercise
  ON public.workout_metrics (user_id, exercise_name, session_date DESC);

-- ─── Streaks & gamification (Phase 5) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id               uuid  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  food_log_current      int   NOT NULL DEFAULT 0,
  food_log_longest      int   NOT NULL DEFAULT 0,
  workout_current       int   NOT NULL DEFAULT 0,
  workout_longest       int   NOT NULL DEFAULT 0,
  last_food_log_date    date,
  last_workout_date     date,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_streaks_self" ON public.user_streaks;
CREATE POLICY "user_streaks_self"
  ON public.user_streaks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Fonction de mise à jour des streaks ─────────────────────────────────────
-- Appelée depuis le client après chaque log repas ou séance terminée.

CREATE OR REPLACE FUNCTION upsert_streak(
  p_user_id   uuid,
  p_type      text,   -- 'food' | 'workout'
  p_date      date
) RETURNS void AS $$
DECLARE
  v_last   date;
  v_cur    int;
  v_longest int;
BEGIN
  INSERT INTO public.user_streaks (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_type = 'food' THEN
    SELECT last_food_log_date, food_log_current, food_log_longest
      INTO v_last, v_cur, v_longest
      FROM public.user_streaks WHERE user_id = p_user_id;

    IF v_last IS NULL OR p_date > v_last THEN
      IF v_last IS NOT NULL AND p_date - v_last = 1 THEN
        v_cur := v_cur + 1;
      ELSIF v_last IS NULL OR p_date - v_last > 1 THEN
        v_cur := 1;
      END IF;
      v_longest := GREATEST(v_longest, v_cur);
      UPDATE public.user_streaks SET
        food_log_current   = v_cur,
        food_log_longest   = v_longest,
        last_food_log_date = p_date,
        updated_at         = now()
      WHERE user_id = p_user_id;
    END IF;

  ELSIF p_type = 'workout' THEN
    SELECT last_workout_date, workout_current, workout_longest
      INTO v_last, v_cur, v_longest
      FROM public.user_streaks WHERE user_id = p_user_id;

    IF v_last IS NULL OR p_date > v_last THEN
      IF v_last IS NOT NULL AND p_date - v_last = 1 THEN
        v_cur := v_cur + 1;
      ELSIF v_last IS NULL OR p_date - v_last > 1 THEN
        v_cur := 1;
      END IF;
      v_longest := GREATEST(v_longest, v_cur);
      UPDATE public.user_streaks SET
        workout_current   = v_cur,
        workout_longest   = v_longest,
        last_workout_date = p_date,
        updated_at        = now()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
