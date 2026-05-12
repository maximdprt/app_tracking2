"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bed, Footprints, Scale } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { DateNavigator } from "@/components/shared/DateNavigator";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useSleep, useSleepRange, useSteps, useStepsRange, useWeight, useWeightHistoryLogs, useUpsertSleep, useUpsertSteps, useUpsertWeight } from "@/hooks/useDaily";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { useDateStore } from "@/stores/useDateStore";
import { toUserMessage } from "@/lib/errors";
import { formatDateShort, todayISO } from "@/utils/dates";

const QUALITY_OPTIONS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😴", label: "Mauvais" },
  { value: 2, emoji: "😐", label: "Moyen" },
  { value: 3, emoji: "🙂", label: "Correct" },
  { value: 4, emoji: "😊", label: "Bon" },
  { value: 5, emoji: "🌟", label: "Excellent" },
];

export default function HabitsPage() {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const selectedDate = useDateStore((s) => s.selectedDate);

  const sleepQuery = useSleep(selectedDate);
  const stepsQuery = useSteps(selectedDate);
  const weightQuery = useWeight(selectedDate);
  const sleepRangeQuery = useSleepRange(30);
  const stepsRangeQuery = useStepsRange(30);
  const weightHistoryQuery = useWeightHistoryLogs(30);

  const upsertSleep = useUpsertSleep();
  const upsertSteps = useUpsertSteps();
  const upsertWeight = useUpsertWeight();

  // Sleep state
  const [sleepHours, setSleepHours] = useState<number>(
    sleepQuery.data?.hours ?? profile?.average_sleep_hours ?? 7,
  );
  const [sleepQuality, setSleepQuality] = useState<number>(
    sleepQuery.data?.quality ?? 3,
  );

  // Steps state
  const [stepsValue, setStepsValue] = useState<number>(
    stepsQuery.data?.steps ?? profile?.average_steps ?? 8000,
  );

  // Weight state
  const [weightValue, setWeightValue] = useState<number>(
    weightQuery.data?.weight ?? profile?.weight ?? 70,
  );

  // Pre-fill when data loads
  const sleepLoaded = sleepQuery.data !== undefined;
  const stepsLoaded = stepsQuery.data !== undefined;
  const weightLoaded = weightQuery.data !== undefined;

  function getSleepInitialValue() {
    if (sleepLoaded) return sleepQuery.data?.hours ?? profile?.average_sleep_hours ?? 7;
    return profile?.average_sleep_hours ?? 7;
  }

  function getStepsInitialValue() {
    if (stepsLoaded) return stepsQuery.data?.steps ?? profile?.average_steps ?? 8000;
    return profile?.average_steps ?? 8000;
  }

  function getWeightInitialValue() {
    if (weightLoaded) return weightQuery.data?.weight ?? profile?.weight ?? 70;
    return profile?.weight ?? 70;
  }

  // Derived values
  const previousWeight = weightHistoryQuery.data
    ? [...weightHistoryQuery.data].reverse().find((w: { log_date: string }) => w.log_date < selectedDate)
    : undefined;
  const weightDelta = previousWeight ? weightValue - previousWeight.weight : null;
  const isWeightLossGoal = profile?.goal_type === "weight_loss";
  const weightDeltaGood =
    weightDelta !== null
      ? isWeightLossGoal
        ? weightDelta <= 0
        : weightDelta >= 0
      : null;

  async function handleSaveSleep() {
    if (!user?.id) return;
    try {
      await upsertSleep.mutateAsync({
        user_id: user.id,
        log_date: selectedDate,
        hours: sleepHours,
        quality: sleepQuality,
      });
      toast.success("Sommeil enregistré ✓");
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  async function handleSaveSteps() {
    if (!user?.id) return;
    try {
      await upsertSteps.mutateAsync({
        user_id: user.id,
        log_date: selectedDate,
        steps: stepsValue,
      });
      toast.success("Pas enregistrés ✓");
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  async function handleSaveWeight() {
    if (!user?.id) return;
    try {
      await upsertWeight.mutateAsync({
        user_id: user.id,
        log_date: selectedDate,
        weight: weightValue,
      });
      toast.success("Poids enregistré ✓");
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Suivi quotidien"
        subtitle="Sommeil · Pas · Poids"
        actions={<DateNavigator />}
      />

      {/* Input cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sleep card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-primary" />
                Sommeil
              </CardTitle>
              <CardDescription>Durée et qualité de la nuit</CardDescription>
            </div>
            {sleepQuery.data ? (
              <Badge variant="success">Enregistré</Badge>
            ) : null}
          </CardHeader>

          {sleepQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-8" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-text-soft">Durée (heures)</p>
                <Slider
                  value={sleepLoaded ? sleepHours : getSleepInitialValue()}
                  onChange={(v) => setSleepHours(v)}
                  min={0}
                  max={12}
                  step={0.25}
                  unit="h"
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-text-soft">Qualité</p>
                <div className="flex gap-1">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSleepQuality(opt.value)}
                      title={opt.label}
                      className={`flex-1 rounded-lg border py-2 text-xl transition-colors ${
                        sleepQuality === opt.value
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-surface hover:border-border-strong"
                      }`}
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSaveSleep}
                loading={upsertSleep.isPending}
                disabled={!isToday && selectedDate > todayISO()}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </Card>

        {/* Steps card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Footprints className="h-4 w-4 text-primary" />
                Pas
              </CardTitle>
              <CardDescription>Activité pédestre du jour</CardDescription>
            </div>
            {stepsQuery.data ? (
              <Badge variant="success">Enregistré</Badge>
            ) : null}
          </CardHeader>

          {stepsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-8" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-text-soft">Nombre de pas</p>
                <Input
                  type="number"
                  value={stepsLoaded ? stepsValue : getStepsInitialValue()}
                  onChange={(e) => setStepsValue(Number(e.target.value) || 0)}
                  min={0}
                  max={100000}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[1000, 2000, 5000].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setStepsValue((prev) => prev + delta)}
                    className="rounded-lg border border-border bg-surface px-3 py-1 text-xs text-text-soft hover:border-border-strong hover:text-text"
                  >
                    +{delta.toLocaleString()}
                  </button>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={handleSaveSteps}
                loading={upsertSteps.isPending}
                disabled={!isToday && selectedDate > todayISO()}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </Card>

        {/* Weight card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Poids
              </CardTitle>
              <CardDescription>Pesée corporelle</CardDescription>
            </div>
            {weightQuery.data ? (
              <Badge variant="success">Enregistré</Badge>
            ) : null}
          </CardHeader>

          {weightQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-8" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-text-soft">Poids (kg)</p>
                <Slider
                  value={weightLoaded ? weightValue : getWeightInitialValue()}
                  onChange={(v) => setWeightValue(v)}
                  min={30}
                  max={200}
                  step={0.1}
                  unit="kg"
                />
              </div>
              {weightDelta !== null ? (
                <p
                  className={`text-xs ${
                    weightDeltaGood ? "text-success" : "text-danger"
                  }`}
                >
                  {weightDelta > 0 ? "+" : ""}
                  {weightDelta.toFixed(1)} kg vs mesure précédente
                </p>
              ) : null}
              <Button
                className="w-full"
                onClick={handleSaveWeight}
                loading={upsertWeight.isPending}
                disabled={!isToday && selectedDate > todayISO()}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sleep chart — §10.2 : bleu #60A5FA (var --color-info) */}
        <Card>
          <CardHeader>
            <CardTitle>Sommeil — 30 jours</CardTitle>
          </CardHeader>
          {sleepRangeQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={sleepRangeQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="log_date"
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  tickFormatter={(v: string) => formatDateShort(v)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 12]}
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  unit="h"
                />
                <Tooltip
                  contentStyle={{
                    background: "#16181B",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    color: "#F5F5F5",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`${v as number}h`, "Sommeil"]}
                  labelFormatter={(l) => formatDateShort(l as string)}
                />
                <ReferenceLine
                  y={7}
                  stroke="var(--color-muted)"
                  strokeDasharray="4 4"
                  label={{ value: "7h", fill: "var(--color-muted)", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#60A5FA" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Steps chart — §10.2 : lime primary */}
        <Card>
          <CardHeader>
            <CardTitle>Pas — 30 jours</CardTitle>
          </CardHeader>
          {stepsRangeQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stepsRangeQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="log_date"
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  tickFormatter={(v: string) => formatDateShort(v)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted)" }} />
                <Tooltip
                  contentStyle={{
                    background: "#16181B",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    color: "#F5F5F5",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [(v as number).toLocaleString(), "Pas"]}
                  labelFormatter={(l) => formatDateShort(l as string)}
                />
                <ReferenceLine
                  y={8000}
                  stroke="var(--color-muted)"
                  strokeDasharray="4 4"
                  label={{ value: "8k", fill: "var(--color-muted)", fontSize: 10 }}
                />
                <Bar dataKey="steps" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Weight chart — §10.2 : lime primary, dot r:3, activeDot r:5 */}
        <Card>
          <CardHeader>
            <CardTitle>Poids — 30 jours</CardTitle>
          </CardHeader>
          {weightHistoryQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightHistoryQuery.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="log_date"
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  tickFormatter={(v: string) => formatDateShort(v)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--color-muted)" }}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{
                    background: "#16181B",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "12px",
                    color: "#F5F5F5",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`${v as number} kg`, "Poids"]}
                  labelFormatter={(l) => formatDateShort(l as string)}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-primary)" }}
                  activeDot={{ r: 5, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
