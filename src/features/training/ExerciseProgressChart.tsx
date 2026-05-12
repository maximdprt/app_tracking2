"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dumbbell } from "lucide-react";
import { createClient } from "@/services/supabase/client";
import { getExerciseHistory } from "@/services/supabase/queries/exercises";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateShort } from "@/utils/dates";

interface ExerciseProgressChartProps {
  exerciseName: string;
  userId: string;
}

export function ExerciseProgressChart({ exerciseName, userId }: ExerciseProgressChartProps) {
  const historyQuery = useQuery({
    queryKey: ["exercise-history", userId, exerciseName],
    enabled: Boolean(userId) && Boolean(exerciseName),
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient();
      return getExerciseHistory(supabase, userId, exerciseName, 20);
    },
  });

  if (historyQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  const data = historyQuery.data ?? [];

  if (data.length < 2) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Pas encore assez de données"
        description="Logge au moins 2 séances avec cet exercice pour voir ta progression."
      />
    );
  }

  // Sort ascending by date
  const sorted = [...data].sort((a, b) => a.session_date.localeCompare(b.session_date));

  const best = sorted.reduce(
    (acc, d) => ({
      weight: Math.max(acc.weight, d.max_weight),
      date: d.max_weight > acc.weight ? d.session_date : acc.date,
    }),
    { weight: 0, date: "" },
  );

  const oldest = sorted[0]!;
  const newest = sorted[sorted.length - 1]!;
  const weightGain = newest.max_weight - oldest.max_weight;
  const sessionCount = sorted.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs text-text-soft">
        <span>
          <span className="font-mono text-text">{best.weight} kg</span> meilleur poids
          {best.date ? ` · le ${formatDateShort(best.date)}` : ""}
        </span>
        {weightGain !== 0 ? (
          <span className={weightGain > 0 ? "text-success" : "text-danger"}>
            {weightGain > 0 ? "+" : ""}
            {weightGain.toFixed(1)} kg en {sessionCount} séances
          </span>
        ) : null}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sorted}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="session_date"
            tick={{ fontSize: 10, fill: "var(--color-muted)" }}
            tickFormatter={(v: string) => formatDateShort(v)}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="weight"
            tick={{ fontSize: 10, fill: "var(--color-muted)" }}
            unit=" kg"
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fontSize: 10, fill: "var(--color-muted)" }}
          />
          <Tooltip
            contentStyle={{
              background: "#16181B",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              color: "#F5F5F5",
              fontSize: "12px",
            }}
            formatter={(v, name) => [
              name === "max_weight" ? `${v as number} kg` : (v as number),
              name === "max_weight" ? "Poids max" : "Volume max",
            ]}
            labelFormatter={(l) => formatDateShort(l as string)}
          />
          <Legend
            formatter={(value: string) =>
              value === "max_weight" ? "Poids max (kg)" : "Volume max"
            }
          />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="max_weight"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-primary)" }}
            activeDot={{ r: 5, fill: "var(--color-primary)" }}
          />
          <Line
            yAxisId="volume"
            type="monotone"
            dataKey="max_volume"
            stroke="var(--color-muted)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-muted)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
