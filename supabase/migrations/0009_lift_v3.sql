-- ═══════════════════════════════════════════════════════════════════════════
-- 0009_lift_v3 — consentements, coach persistant, habits off-days, exercise lib, api_usage
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── GDPR consent audit trail ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted      boolean NOT NULL,
  ip_hash      text,
  user_agent   text,
  granted_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consent_log_self_insert" ON public.consent_log;
CREATE POLICY "consent_log_self_insert"
  ON public.consent_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "consent_log_self_select" ON public.consent_log;
CREATE POLICY "consent_log_self_select"
  ON public.consent_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ─── Coach persistant ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content     text NOT NULL,
  tokens_in   int,
  tokens_out  int,
  tool_calls  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created
  ON public.chat_messages(thread_id, created_at);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_threads_self" ON public.chat_threads;
CREATE POLICY "chat_threads_self"
  ON public.chat_threads FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_self" ON public.chat_messages;
CREATE POLICY "chat_messages_self"
  ON public.chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.id = chat_messages.thread_id AND ct.user_id = auth.uid()
    )
  );

-- ─── Habitudes « off days » ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_off_days (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  off_date date NOT NULL,
  reason  text,
  PRIMARY KEY (user_id, off_date)
);
ALTER TABLE public.habit_off_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "habit_off_days_self" ON public.habit_off_days;
CREATE POLICY "habit_off_days_self"
  ON public.habit_off_days FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Étend habits + unicité log par jour ──────────────────────────────────────
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS icon text DEFAULT 'ti-circle';

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS habit_position int NOT NULL DEFAULT 0;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS target_per_day numeric DEFAULT 1;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS unit text;

DROP INDEX IF EXISTS idx_habit_logs_habit_day;

-- Déduplique les logs pour pouvoir appliquer l’unicité (habit_id, log_date)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY habit_id, log_date ORDER BY updated_at DESC) AS rn
  FROM public.habit_logs
)
DELETE FROM public.habit_logs h
USING ranked r
WHERE h.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_habit_logs_habit_day
  ON public.habit_logs (habit_id, log_date);

-- ─── Bibliothèque d'exercices (référentiel Lift V3) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.lift_exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom               text NOT NULL,
  muscle_primary    text NOT NULL,
  muscles_secondary text[] DEFAULT '{}',
  equipment         text,
  difficulty        text,
  video_url         text,
  cues              text[],
  is_compound       boolean DEFAULT false
);

ALTER TABLE public.lift_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lift_exercises_public_read" ON public.lift_exercises;
CREATE POLICY "lift_exercises_public_read"
  ON public.lift_exercises FOR SELECT TO authenticated USING (true);

INSERT INTO public.lift_exercises (nom, muscle_primary, muscles_secondary, is_compound, equipment)
VALUES
  ('Squat nuque',       'Cuisses', ARRAY['Dos','Abdos'], true,  'Barre olympique'),
  ('Développé couché',  'Poitrine', ARRAY['Triceps'],    true,  'Barre'),
  ('Soulevé de terre',  'Dos',      ARRAY['Cuisses','Abdos'], true, 'Barre'),
  ('Traction pronation','Dos',      ARRAY['Biceps'],   false, 'Poids corporel'),
  ('Développé haltères','Épaules',  ARRAY['Triceps'],  false, 'Haltères'),
  ('Rowing barre',      'Dos',      ARRAY['Biceps'],   false, 'Barre'),
  ('Presse siège cuisses','Cuisses', ARRAY[]::text[], true, 'Machine'),
  ('Leg curl couché','Ischio-jambiers', ARRAY[]::text[], false, 'Machine'),
  ('Extension mollets','Mollets', ARRAY[]::text[], false, 'Machine'),
  ('Curl EZ','Biceps',  ARRAY['Avant-bras'],         false,'Barre EZ');

-- ─── Coûts API Mistral agrégés (monitoring métier phase 10) ─────────────────────
CREATE TABLE IF NOT EXISTS public.api_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind       text NOT NULL,
  model      text NOT NULL,
  tokens_in  int DEFAULT 0,
  tokens_out int DEFAULT 0,
  cost_hint  numeric(12, 6),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created ON public.api_usage(created_at DESC);

ALTER TABLE public.api_usage DISABLE ROW LEVEL SECURITY;
