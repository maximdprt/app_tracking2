"use client";

import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/client";
import { getDailyCalories } from "@/services/supabase/queries/stats";
import { useUser } from "@/hooks/useUser";
import { useDateStore } from "@/stores/useDateStore";
import { useRouter } from "next/navigation";
import { formatDateLong } from "@/utils/dates";

export default function NutritionHistoryPage() {
  const { data: user } = useUser();
  const router = useRouter();
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);

  const historyQuery = useQuery({
    queryKey: ["nutrition-history", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getDailyCalories(supabase, user.id, 30);
    },
  });

  const data = (historyQuery.data ?? []).slice().reverse();

  return (
    <div className="space-y-10">
      <Link
        href={ROUTES.nutrition}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour
      </Link>
      <PageHeader title="Historique" subtitle="30 derniers jours suivis" />

      {historyQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucun historique"
          description="Commence à logger tes repas pour bâtir ton historique."
        />
      ) : (
        <div className="space-y-2">
          {data.map((day) => (
            <Card
              key={day.date}
              className="flex cursor-pointer items-center justify-between hover:border-border-strong"
              onClick={() => {
                setSelectedDate(day.date);
                router.push(ROUTES.nutrition);
              }}
            >
              <div>
                <p className="lift-body capitalize">{formatDateLong(day.date)}</p>
                <p className="lift-label">
                  P {Math.round(day.protein)}g · G {Math.round(day.carbs)}g · L{" "}
                  {Math.round(day.fats)}g
                </p>
              </div>
              <p className="lift-display-md lift-num">{Math.round(day.calories)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
