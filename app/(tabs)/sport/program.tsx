import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function ProgramScreen() {
  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Programme hebdo</Text>
        <Input label="Nom du programme" value="Full Body" onChangeText={(value) => value} />
        <Button label="Sauvegarder" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}
