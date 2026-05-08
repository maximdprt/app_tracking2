import { LineChart } from "react-native-gifted-charts";

interface ProgressChartProps {
  points: Array<{ value: number }>;
}

export function ProgressChart({ points }: ProgressChartProps) {
  return <LineChart data={points} color="#00E676" thickness={2} hideDataPoints />;
}
