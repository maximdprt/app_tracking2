"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import {
  getDailyCalories,
  getSessionFrequency,
  getWeeklyVolume,
  getWeightHistory,
} from "@/services/supabase/queries/stats";

type Period = "7" | "30" | "90" | "365";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7", label: "7j" },
  { value: "30", label: "30j" },
  { value: "90", label: "90j" },
  { value: "365", label: "1 an" },
];

/** Thème chart unifié — noir/beige, sans couleurs vives hors macros */
const CHART_THEME = {
  stroke: "var(--color-text)",
  fill: "var(--color-text)",
  grid: {
    stroke: "var(--color-border)",
    strokeDasharray: "0",
    strokeOpacity: 0.5,
  },
  axis: {
    fontSize: 11,
    fontFamily: "Inter, system-ui, sans-serif",
    fill: "var(--color-muted)",
    letterSpacing: "0.04em",
  },
  tooltip: {
    contentStyle: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "12px",
      padding: "8px 12px",
      fontSize: "13px",
      color: "var(--color-text)",
    },
  },
} as const;

const CHART_GRID = CHART_THEME.grid.stroke;
const CHART_LINE = CHART_THEME.stroke;

export default function StatsPage() {
  const { data: user } = useUser();
  const [period, setPeriod] = useState<Period>("30");
  const days = Number(period);
  const weeks = Math.ceil(days / 7);

  const volumeQuery = useQuery({
    queryKey: ["stats-volume", user?.id ?? null, weeks],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getWeeklyVolume(supabase, user.id, weeks);
    },
  });

  const caloriesQuery = useQuery({
    queryKey: ["stats-calories", user?.id ?? null, days],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getDailyCalories(supabase, user.id, days);
    },
  });

  const frequencyQuery = useQuery({
    queryKey: ["stats-frequency", user?.id ?? null, days],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getSessionFrequency(supabase, user.id, days);
    },
  });

  const weightQuery = useQuery({
    queryKey: ["stats-weight", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getWeightHistory(supabase, user.id);
    },
  });

  return (
    <div className="space-y-10">
      <PageHeader
        title="Statistiques"
        subtitle="Vue d'ensemble de ta progression"
        actions={<Tabs<Period> value={period} onChange={setPeriod} options={PERIODS} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weight */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Poids corporel</CardTitle>
              <CardDescription>Évolution dans le temps</CardDescription>
            </div>
          </CardHeader>
          {weightQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : weightQuery.data && weightQuery.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weightQuery.data}>
                <CartesianGrid stroke={CHART_GRID} strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={CHART_THEME.axis}
                  tickFormatter={(v: string) => format(parseISO(v), "d MMM", { locale: fr })}
                />
                <YAxis tick={CHART_THEME.axis} domain={["auto", "auto"]} />
                <Tooltip contentStyle={CHART_THEME.tooltip.contentStyle} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={CHART_LINE}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_LINE }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="Aucune donnée de poids" />
          )}
        </Card>

        {/* Volume */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Volume hebdomadaire</CardTitle>
              <CardDescription>Total kg soulevés par semaine</CardDescription>
            </div>
          </CardHeader>
          {volumeQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : volumeQuery.data && volumeQuery.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volumeQuery.data}>
                <CartesianGrid stroke={CHART_GRID} strokeOpacity={0.5} />
                <XAxis
                  dataKey="week"
                  tick={CHART_THEME.axis}
                  tickFormatter={(v: string) => format(parseISO(v), "d MMM", { locale: fr })}
                />
                <YAxis tick={CHART_THEME.axis} />
                <Tooltip contentStyle={CHART_THEME.tooltip.contentStyle} />
                <Bar dataKey="volume" fill={CHART_LINE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="Pas encore de séances loggées" />
          )}
        </Card>

        {/* Calories trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Calories quotidiennes</CardTitle>
              <CardDescription>Tendance kcal jour par jour</CardDescription>
            </div>
          </CardHeader>
          {caloriesQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : caloriesQuery.data && caloriesQuery.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={caloriesQuery.data}>
                <defs>
                  <linearGradient id="statsCaloriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_LINE} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={CHART_LINE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={CHART_THEME.axis}
                  tickFormatter={(v: string) => format(parseISO(v), "d MMM", { locale: fr })}
                />
                <YAxis tick={CHART_THEME.axis} />
                <Tooltip contentStyle={CHART_THEME.tooltip.contentStyle} />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke={CHART_LINE}
                  strokeWidth={1.5}
                  fill="url(#statsCaloriesGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty label="Pas encore de repas loggés" />
          )}
        </Card>

        {/* Frequency heatmap */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fréquence des séances</CardTitle>
              <CardDescription>Régularité sur la période</CardDescription>
            </div>
          </CardHeader>
          {frequencyQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : frequencyQuery.data && frequencyQuery.data.length > 0 ? (
            <FrequencyHeatmap data={frequencyQuery.data} days={days} />
          ) : (
            <ChartEmpty label="Pas encore de séances complétées" />
          )}
        </Card>
      </div>
    </div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="grid h-60 place-items-center lift-body-sm text-muted">
      <p>{label}</p>
    </div>
  );
}

function FrequencyHeatmap({ data, days }: { data: { date: string; count: number }[]; days: number }) {
  // Build a Set of dates with count
  const map = new Map(data.map((d) => [d.date, d.count]));
  // Build cells from oldest to today
  const cells: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = format(d, "yyyy-MM-dd");
    cells.push({ date: iso, count: map.get(iso) ?? 0 });
  }

  function intensity(c: number) {
    if (c === 0) return "bg-surface-2";
    if (c === 1) return "bg-[color-mix(in_srgb,var(--color-text)_12%,var(--color-surface))]";
    if (c === 2) return "bg-[color-mix(in_srgb,var(--color-text)_28%,var(--color-surface))]";
    return "bg-[color-mix(in_srgb,var(--color-text)_55%,var(--color-surface))]";
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            className={`aspect-square rounded-sm ${intensity(c.count)}`}
            title={`${c.date} · ${c.count} séance${c.count > 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 lift-body-sm text-muted">
        <span>Moins</span>
        <div className="flex gap-0.5">
          <div className="h-2 w-2 rounded-sm bg-surface-2" />
          <div className="h-2 w-2 rounded-sm bg-[color-mix(in_srgb,var(--color-text)_12%,var(--color-surface))]" />
          <div className="h-2 w-2 rounded-sm bg-[color-mix(in_srgb,var(--color-text)_28%,var(--color-surface))]" />
          <div className="h-2 w-2 rounded-sm bg-[color-mix(in_srgb,var(--color-text)_55%,var(--color-surface))]" />
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
}
