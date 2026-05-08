import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Lift",
  slug: "lift",
  scheme: "lift",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  plugins: ["expo-router", "expo-secure-store", "expo-image-picker"],
  experiments: {
    typedRoutes: true,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0A0A0B",
    },
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
