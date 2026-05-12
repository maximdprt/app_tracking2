import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/services/supabase/client";
import { addFavorite, removeFavorite } from "@/services/supabase/queries/foods";
import { useFoodFavoritesQuery } from "@/hooks/useFoodSearch";
import { useUser } from "@/hooks/useUser";
import type { FoodItem } from "@/types/domain";

export function useFoodFavorites() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const favQuery = useFoodFavoritesQuery(user?.id);

  const favoriteIds = new Set((favQuery.data ?? []).map((f: FoodItem) => f.id));

  const toggleMutation = useMutation({
    mutationFn: async ({ foodItemId, isFav }: { foodItemId: string; isFav: boolean }) => {
      if (!user?.id) throw new Error("Non authentifié");
      const supabase = createClient();
      if (isFav) {
        await removeFavorite(supabase, user.id, foodItemId);
      } else {
        await addFavorite(supabase, user.id, foodItemId);
      }
    },
    onSuccess: (_, { isFav }) => {
      toast.success(isFav ? "Retiré des favoris" : "Ajouté aux favoris");
      queryClient.invalidateQueries({ queryKey: ["food-favorites"] });
    },
    onError: () => toast.error("Impossible de modifier le favori"),
  });

  function toggle(foodItemId: string) {
    toggleMutation.mutate({ foodItemId, isFav: favoriteIds.has(foodItemId) });
  }

  return {
    favorites: favQuery.data ?? [],
    favoriteIds,
    isLoading: favQuery.isLoading,
    toggle,
  };
}
