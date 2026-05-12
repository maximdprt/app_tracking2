"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ChevronLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import { toUserMessage } from "@/lib/errors";
import { weeklyScore } from "@/features/habits/calculations";
import type { Database } from "@/types/database";
import { DEFAULT_HABITS_V3 } from "@/features/habits/default-habits";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type HabitLogRow = Database["public"]["Tables"]["habit_logs"]["Row"];

function weekDates(anchor: Date): string[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "yyyy-MM-dd"));
}

function cellClass(v: number | null | undefined, off: boolean): string {
  if (off)
    return "border border-(--lift-border-divider) bg-(--lift-bg-secondary) opacity-45";
  if (v === undefined || v === null) return "border border-(--lift-border-default) bg-(--lift-bg-card)";
  const n = Number(v);
  if (n >= 1) return "border border-(--lift-accent-primary) bg-(--lift-accent-primary)";
  if (n >= 0.5) return "border border-(--lift-text-tertiary) bg-(--lift-text-tertiary)";
  return "border border-(--lift-border-strong) bg-(--lift-bg-card)";
}

export default function HabitsMatrixPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const anchor = new Date();

  const week = weekDates(anchor);

  const habitsQuery = useQuery({
    queryKey: ["habits-matrix", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const sb = createClient();
      const { data, error } = await sb
        .from("habits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HabitRow[];
    },
  });

  const logsQuery = useQuery({
    queryKey: ["habit-logs-matrix", user?.id, week[0], week[6]],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const sb = createClient();
      const { data, error } = await sb
        .from("habit_logs")
        .select("*")
        .eq("user_id", user!.id)
        .gte("log_date", week[0]!)
        .lte("log_date", week[6]!);
      if (error) throw error;
      return (data ?? []) as HabitLogRow[];
    },
  });

  const offDaysQuery = useQuery({
    queryKey: ["habit-off-days", user?.id, week[0], week[6]],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const sb = createClient();
      const { data, error } = await sb
        .from("habit_off_days")
        .select("off_date")
        .eq("user_id", user!.id)
        .gte("off_date", week[0]!)
        .lte("off_date", week[6]!);
      if (error) throw error;
      return (data ?? []).map((r) => r.off_date);
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: {
      habitId: string;
      log_date: string;
      value: number;
    }) => {
      const sb = createClient();
      const { error } = await sb.from("habit_logs").upsert(
        {
          habit_id: payload.habitId,
          user_id: user!.id,
          log_date: payload.log_date,
          value: payload.value,
          status: payload.value >= 1 ? "done" : "partial",
        } satisfies Database["public"]["Tables"]["habit_logs"]["Insert"],
        { onConflict: "habit_id,log_date" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["habit-logs-matrix"] });
    },
    onError: (e) => toast.error(toUserMessage(e)),
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const sb = createClient();
      const rows = DEFAULT_HABITS_V3.map((h) => ({
        user_id: user!.id,
        habit_name: h.nom,
        category: "routine",
        target_frequency: h.target,
      }));
      const { error } = await sb.from("habits").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Habitudes par défaut ajoutées");
      void queryClient.invalidateQueries({ queryKey: ["habits-matrix"] });
    },
    onError: (e) => toast.error(toUserMessage(e)),
  });

  const habits = habitsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const offDays = offDaysQuery.data ?? [];

  const score = weeklyScore(
    habits.map((h) => ({ id: h.id })),
    logs.map((l) => ({ habit_id: l.habit_id, log_date: l.log_date, value: l.value })),
    offDays,
  );

  function valueAt(habitId: string, d: string): number | null {
    const hit = logs.find((l) => l.habit_id === habitId && l.log_date === d);
    return hit?.value ?? null;
  }

  function cycleValue(habitId: string, d: string): void {
    const cur = valueAt(habitId, d) ?? 0;
    let next = 0;
    if (cur < 0.5) next = 0.5;
    else if (cur < 1) next = 1;
    else next = 0;
    upsertMutation.mutate({ habitId, log_date: d, value: next });
  }

  if (!user) return null;

  return (
    <div className="space-y-10 pb-28">
      <Link
        href={ROUTES.habits}
        className="inline-flex items-center gap-1 text-xs text-muted hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour habits quotidiens
      </Link>

      <PageHeader title="Routine" subtitle="Vue matrice — tape une case pour 0 → ½ → ✓." />

      <Card className="border-(--lift-border-default) bg-(--lift-bg-inverse) text-(--lift-text-inverse) md-elevation-1">
        <CardHeader>
          <CardTitle className="lift-display-lg text-(--lift-text-inverse)">
            {score.toFixed(1)}%
          </CardTitle>
          <CardDescription className="text-[color-mix(in_srgb,var(--lift-text-inverse)_72%,transparent)]">
            Score hebdomadaire · semaine du {week[0]} au {week[6]}
          </CardDescription>
        </CardHeader>
      </Card>

      {habitsQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : habits.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucune habitude</CardTitle>
            <CardDescription>Importe les 8 routines Lift par défaut.</CardDescription>
          </CardHeader>
          <Button onClick={() => seedMutation.mutate()} loading={seedMutation.isPending}>
            <Plus className="h-4 w-4" /> Initialiser
          </Button>
        </Card>
      ) : (
        <Card className="overflow-x-auto border-(--lift-border-subtle)">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-(--lift-border-subtle) bg-(--lift-bg-secondary)">
                <th className="sticky left-0 z-10 bg-(--lift-bg-secondary) px-2 py-3 text-muted">
                  Jour
                </th>
                {habits.map((h) => (
                  <th key={h.id} className="px-2 py-3 font-medium">
                    <span className="line-clamp-2">{h.habit_name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {week.map((d) => (
                <tr key={d} className="border-b border-(--lift-border-subtle)">
                  <td className="sticky left-0 z-10 bg-(--lift-bg-card) px-2 py-2 whitespace-nowrap text-muted">
                    {format(new Date(`${d}T12:00:00`), "EEE d", { locale: fr })}
                    {offDays.includes(d) ? " · off" : ""}
                  </td>
                  {habits.map((h) => {
                    const off = offDays.includes(d);
                    const v = valueAt(h.id, d);
                    return (
                      <td key={h.id} className="p-2 text-center">
                        <button
                          type="button"
                          disabled={off || upsertMutation.isPending}
                          onClick={() => cycleValue(h.id, d)}
                          className={`mx-auto grid h-6 w-6 place-items-center rounded-md ${cellClass(v, off)}`}
                          aria-label={`${h.habit_name} ${d}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
