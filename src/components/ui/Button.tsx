import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surfaceElevated border border-border",
  ghost: "bg-transparent",
  danger: "bg-error",
};

export function Button({ label, onPress, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 items-center justify-center rounded-xl px-4 ${variantStyles[variant]} ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
    >
      <Text className="text-base font-semibold text-text">{label}</Text>
    </Pressable>
  );
}
