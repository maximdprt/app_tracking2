"use client";

import Link from "next/link";
import { ChevronLeft, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/client";
import { getPrograms } from "@/services/supabase/queries/workouts";
import { useUser } from "@/hooks/useUser";

export default function ProgramsPage() {
  const { data: user } = useUser();
  const programsQuery = useQuery({
    queryKey: ["programs", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getPrograms(supabase, user.id);
    },
  });

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.training}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour
      </Link>

      <PageHeader title="Mes programmes" subtitle="Plans d'entraînement structurés." />

      {programsQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : programsQuery.data && programsQuery.data.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {programsQuery.data.map((p) => (
            <Link key={p.id} href={`${ROUTES.trainingPrograms}/${p.id}`}>
              <Card className="h-full cursor-pointer hover:border-border-strong">
                <CardHeader>
                  <div>
                    <CardTitle>{p.name}</CardTitle>
                    {p.description ? <CardDescription>{p.description}</CardDescription> : null}
                  </div>
                </CardHeader>
                <p className="text-[10px] text-muted">
                  {p.is_active ? "Actif" : "Archivé"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="Aucun programme"
          description="Crée ton premier programme pour structurer tes semaines."
        />
      )}
    </div>
  );
}
