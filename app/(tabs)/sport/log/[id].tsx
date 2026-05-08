import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function LogSessionScreen() {
  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-xl text-text">Log seance</Text>
        <Input label="Poids" value="" onChangeText={(value) => value} keyboardType="numeric" />
        <Input label="Reps" value="" onChangeText={(value) => value} keyboardType="numeric" />
        <Input label="RPE" value="" onChangeText={(value) => value} keyboardType="numeric" />
        <Button label="Ajouter set" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}
