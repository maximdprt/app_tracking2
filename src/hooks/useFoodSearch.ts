import { useEffect, useState } from "react";
import type { FoodItem } from "@/src/types/food";
import { searchFoodItems } from "@/src/services/food.service";
import { toErrorMessage } from "@/src/utils/errors";

export function useFoodSearch(query: string) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!query.trim()) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await searchFoodItems(query);
        setItems(result);
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [query]);

  return { items, loading, error };
}
