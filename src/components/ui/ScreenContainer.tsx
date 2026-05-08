import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
}

export function ScreenContainer({ children }: ScreenContainerProps) {
  return <SafeAreaView className="flex-1 bg-background px-4 py-3">{children}</SafeAreaView>;
}
