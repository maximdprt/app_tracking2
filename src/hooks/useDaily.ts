"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import {
  getSleepByDate,
  getSleepRange,
  getStepsByDate,
  getStepsRange,
  getWeightByDate,
  getWeightHistoryReal,
  getLatestWeight,
  upsertSleep,
  upsertSteps,
  upsertWeight,
} from "@/services/supabase/queries/daily";
import type { Database } from "@/types/database";
import { useUser } from "@/hooks/useUser";

type SleepInsert = Database["public"]["Tables"]["sleep_logs"]["Insert"];
type StepsInsert = Database["public"]["Tables"]["steps_logs"]["Insert"];
type WeightInsert = Database["public"]["Tables"]["weight_logs"]["Insert"];

// ─── Sleep ───────────────────────────────────────────────────────────────────

export function useSleep(date: string) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["sleep", user?.id ?? null, date],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      if (!user?.id) return null;
      return getSleepByDate(createClient(), user.id, date);
    },
  });
}

export function useSleepRange(days: number) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["sleep-range", user?.id ?? null, days],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      if (!user?.id) return [];
      return getSleepRange(createClient(), user.id, days);
    },
  });
}

export function useUpsertSleep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SleepInsert) => upsertSleep(createClient(), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep"] });
      queryClient.invalidateQueries({ queryKey: ["sleep-range"] });
    },
  });
}

// ─── Steps ───────────────────────────────────────────────────────────────────

export function useSteps(date: string) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["steps", user?.id ?? null, date],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      if (!user?.id) return null;
      return getStepsByDate(createClient(), user.id, date);
    },
  });
}

export function useStepsRange(days: number) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["steps-range", user?.id ?? null, days],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      if (!user?.id) return [];
      return getStepsRange(createClient(), user.id, days);
    },
  });
}

export function useUpsertSteps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StepsInsert) => upsertSteps(createClient(), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      queryClient.invalidateQueries({ queryKey: ["steps-range"] });
    },
  });
}

// ─── Weight ──────────────────────────────────────────────────────────────────

export function useWeight(date: string) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["weight", user?.id ?? null, date],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      if (!user?.id) return null;
      return getWeightByDate(createClient(), user.id, date);
    },
  });
}

export function useWeightHistoryLogs(days?: number) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["weight-logs", user?.id ?? null, days],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      if (!user?.id) return [];
      return getWeightHistoryReal(createClient(), user.id, days);
    },
  });
}

export function useLatestWeight() {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["weight-latest", user?.id ?? null],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      if (!user?.id) return null;
      return getLatestWeight(createClient(), user.id);
    },
  });
}

export function useUpsertWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WeightInsert) => upsertWeight(createClient(), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight"] });
      queryClient.invalidateQueries({ queryKey: ["weight-logs"] });
      queryClient.invalidateQueries({ queryKey: ["weight-latest"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
