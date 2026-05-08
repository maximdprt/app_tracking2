import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface MacroRingProps {
  value: number;
  target: number;
  label: string;
}

export function MacroRing({ value, target, label }: MacroRingProps) {
  const radius = 54;
  const strokeWidth = 12;
  const normalizedTarget = target > 0 ? target : 1;
  const progress = Math.min(1, Math.max(0, value / normalizedTarget));
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - circumference * progress;

  return (
    <View className="items-center justify-center">
      <Svg width={140} height={140}>
        <Circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#2A2A2E"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={70}
          cy={70}
          r={radius}
          stroke="#00E676"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-sm text-textSecondary">{label}</Text>
        <Text className="text-lg font-semibold text-text">
          {Math.round(value)} / {Math.round(target)}
        </Text>
      </View>
    </View>
  );
}
