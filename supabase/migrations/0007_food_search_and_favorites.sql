-- ─────────────────────────────────────────────────────────────────────────────
-- 0007 — Recherche full-text + fuzzy food_items, aliments favoris, custom foods
-- À appliquer via : supabase db push  OR  SQL Editor Supabase Dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- Fuzzy match (tolérant aux fautes de frappe)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index GIN trigrammes sur le nom (fallback si l'index tsvector ne matche pas)
CREATE INDEX IF NOT EXISTS idx_food_items_nom_trgm
  ON public.food_items USING gin (nom gin_trgm_ops);

-- ─── RPC recherche full-text français ────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_food_items(query text, limit_n int DEFAULT 20)
RETURNS TABLE (
  id          text,
  nom         text,
  calories_100g  numeric,
  proteines_100g numeric,
  glucides_100g  numeric,
  lipides_100g   numeric,
  sucres_100g    numeric,
  fibres_100g    numeric,
  sel_100g       numeric,
  source         text,
  rank           real
) AS $$
  SELECT
    fi.id,
    fi.nom,
    fi.calories_100g,
    fi.proteines_100g,
    fi.glucides_100g,
    fi.lipides_100g,
    COALESCE(fi.sucres_100g, 0)  AS sucres_100g,
    COALESCE(fi.fibres_100g, 0)  AS fibres_100g,
    COALESCE(fi.sel_100g,    0)  AS sel_100g,
    fi.source,
    GREATEST(
      ts_rank(
        to_tsvector('french', fi.nom),
        plainto_tsquery('french', query)
      ),
      similarity(fi.nom, query)
    ) AS rank
  FROM public.food_items fi
  WHERE
    to_tsvector('french', fi.nom) @@ plainto_tsquery('french', query)
    OR fi.nom ILIKE '%' || query || '%'
    OR similarity(fi.nom, query) > 0.25
  ORDER BY
    rank DESC,
    -- Prioriser CIQUAL (données françaises) sur USDA (traduction)
    CASE fi.source
      WHEN 'CIQUAL_2020_ANSES'        THEN 1
      WHEN 'FITNESS_CUSTOM_GENERIC'   THEN 2
      ELSE                                 3
    END,
    length(fi.nom)
  LIMIT limit_n;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Aliments favoris par utilisateur ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_food_favorites (
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id text REFERENCES public.food_items(id) ON DELETE CASCADE,
  added_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, food_item_id)
);

ALTER TABLE public.user_food_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_food_favorites_self" ON public.user_food_favorites;
CREATE POLICY "user_food_favorites_self"
  ON public.user_food_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Aliments personnalisés ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_custom_foods (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom             text         NOT NULL,
  calories_100g   numeric(7,2) NOT NULL CHECK (calories_100g >= 0),
  proteines_100g  numeric(6,2) NOT NULL DEFAULT 0 CHECK (proteines_100g >= 0),
  glucides_100g   numeric(6,2) NOT NULL DEFAULT 0 CHECK (glucides_100g >= 0),
  lipides_100g    numeric(6,2) NOT NULL DEFAULT 0 CHECK (lipides_100g >= 0),
  sucres_100g     numeric(6,2)           DEFAULT 0,
  fibres_100g     numeric(6,2)           DEFAULT 0,
  sel_100g        numeric(6,2)           DEFAULT 0,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE public.user_custom_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_custom_foods_self" ON public.user_custom_foods;
CREATE POLICY "user_custom_foods_self"
  ON public.user_custom_foods
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_custom_foods_user
  ON public.user_custom_foods (user_id);

-- ─── Vue des récents (10 derniers aliments logués) ───────────────────────────
-- Utilisée pour la section "Récents" de la page Ajouter un repas

CREATE OR REPLACE VIEW public.v_recent_food_items AS
  SELECT DISTINCT ON (mi.user_id, mi.food_item_id)
    mi.user_id,
    mi.food_item_id,
    fi.nom,
    fi.calories_100g,
    fi.proteines_100g,
    fi.glucides_100g,
    fi.lipides_100g,
    COALESCE(fi.sucres_100g, 0)  AS sucres_100g,
    COALESCE(fi.fibres_100g, 0)  AS fibres_100g,
    COALESCE(fi.sel_100g,    0)  AS sel_100g,
    fi.source,
    mi.created_at                AS last_used_at
  FROM public.meal_ingredients mi
  JOIN public.food_items fi ON fi.id = mi.food_item_id::text
  WHERE mi.food_item_id IS NOT NULL
  ORDER BY mi.user_id, mi.food_item_id, mi.created_at DESC;
