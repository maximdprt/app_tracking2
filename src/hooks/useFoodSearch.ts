import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/services/supabase/client";
import { searchFoodsRPC, getRecentFoodItems, getUserFavorites } from "@/services/supabase/queries/foods";
import { useUser } from "@/hooks/useUser";

/** Recherche debounced (250 ms) via RPC pg_trgm/tsvector, fallback ilike. */
export function useFoodSearch(query: string, limit = 20) {
  const debouncedQuery = useDebounce(query, 250);

  return useQuery({
    queryKey: ["foods-search", debouncedQuery, limit],
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60 * 60 * 1000,
    queryFn: () => {
      const supabase = createClient();
      return searchFoodsRPC(supabase, debouncedQuery, limit);
    },
  });
}

/** 10 derniers aliments logués par l'utilisateur. */
export function useRecentFoods(limit = 10) {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["foods-recent", user?.id, limit],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: () => {
      const supabase = createClient();
      return getRecentFoodItems(supabase, user!.id, limit);
    },
  });
}

/** Favoris de l'utilisateur courant. */
export function useFoodFavoritesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ["food-favorites", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: () => {
      const supabase = createClient();
      return getUserFavorites(supabase, userId!);
    },
  });
}
