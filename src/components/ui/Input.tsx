import { Text, TextInput, View } from "react-native";

interface InputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric" | "email-address";
}

export function Input({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
}: InputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-textSecondary">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        className="min-h-11 rounded-xl border border-border bg-surfaceElevated px-4 py-3 text-text"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#6B6B73"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
      />
    </View>
  );
}
