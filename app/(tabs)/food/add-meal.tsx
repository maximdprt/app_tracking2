import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function AddMealScreen() {
  const [photoUri, setPhotoUri] = useState("");
  const [query, setQuery] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled) setPhotoUri(result.assets[0]?.uri ?? "");
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Ajouter un repas</Text>
        <Button label="Ajouter une photo" onPress={() => void pickImage()} />
        {photoUri ? <Text className="text-textSecondary">Photo selectionnee</Text> : null}
        <Input label="Rechercher un aliment" value={query} onChangeText={setQuery} />
        <Input label="Grammes" value="100" onChangeText={(value) => value} keyboardType="numeric" />
        <Button label="Enregistrer" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}
