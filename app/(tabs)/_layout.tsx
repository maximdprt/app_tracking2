import { Tabs } from "expo-router";
import { Activity, Apple, Gauge, ListTodo, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#141416", borderTopColor: "#2A2A2E" },
        tabBarActiveTintColor: "#00E676",
        tabBarInactiveTintColor: "#A0A0A8",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Gauge color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="sport"
        options={{ title: "Sport", tabBarIcon: ({ color, size }) => <Activity color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="food"
        options={{ title: "Food", tabBarIcon: ({ color, size }) => <Apple color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="habits"
        options={{ title: "Habits", tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
