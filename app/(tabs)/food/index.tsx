import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FoodSearchItem, MealSummary } from "@/src/components/food";
import { Button, EmptyState, Input, Loading, Screen } from "@/src/components/ui";
import { useFoodSearch } from "@/src/hooks/useFoodSearch";
import { useFoodStore } from "@/src/stores/food.store";
import { toErrorMessage } from "@/src/utils/errors";

export default function FoodScreen() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { items, loading } = useFoodSearch(query);
  const { selectedFood, grams, macros, setSelectedFood, setGrams } = useFoodStore();

  const hasResults = useMemo(() => items.length > 0, [items.length]);

  const onSelectFood = (food: (typeof items)[number]) => {
    try {
      setSelectedFood(food);
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    }
  };

  return (
    <Screen>
      <ScrollView>
        <View className="gap-4 pb-16">
        <Text className="text-2xl font-bold text-text">Food V1</Text>
        <Input label="Recherche aliment" value={query} onChangeText={setQuery} placeholder="Ex: Riz, Poulet, Avoine..." />

        {loading ? <Loading /> : null}
        {!loading && query.trim().length > 0 && !hasResults ? (
          <EmptyState title="Aucun aliment trouve" description="Verifie le nom ou essaye un autre mot-cle." />
        ) : null}

        <View className="gap-2">
          {items.map((item) => (
            <FoodSearchItem key={item.id} item={item} onPress={onSelectFood} />
          ))}
        </View>

        {selectedFood ? (
          <View className="gap-3 rounded-xl border border-border bg-surface p-3">
            <Text className="text-base font-semibold text-text">{selectedFood.nom}</Text>
            <Input
              label="Grammes"
              keyboardType="numeric"
              value={String(grams)}
              onChangeText={(value) => setGrams(Number(value) || 0)}
            />
            {macros ? <MealSummary macros={macros} /> : null}
          </View>
        ) : (
          <EmptyState title="Selectionne un aliment" description="Choisis un aliment dans la liste pour calculer ses macros." />
        )}

        {error ? <Text className="text-sm text-error">{error}</Text> : null}
        <Button
          label="TODO: Ajouter ingredient au repas"
          onPress={() => setError("TODO: brancher creation repas + meal_ingredients.")}
          variant="secondary"
        />
        </View>
      </ScrollView>
    </Screen>
  );
}
