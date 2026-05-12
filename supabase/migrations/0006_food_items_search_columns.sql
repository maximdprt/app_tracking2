-- Colonnes attendues par la recherche / matching IA (`src/services/supabase/queries/foods.ts`).
-- Si tu as recréé `food_items` sans `nom`, cette migration l’ajoute sans casser les lignes existantes.

alter table public.food_items add column if not exists nom text;

-- `name` existe déjà dans 0001 ; cette ligne sécurise les bases créées ailleurs sans migration complète.
alter table public.food_items add column if not exists name text;
