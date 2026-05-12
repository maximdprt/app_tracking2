"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/client";
import { createSession, getPrograms } from "@/services/supabase/queries/workouts";
import { useUser } from "@/hooks/useUser";
import { todayISO } from "@/utils/dates";
import { toUserMessage } from "@/lib/errors";

export default function TrainingStartPage() {
  const router = useRouter();
  const { data: user } = useUser();
  const [name, setName] = useState("Séance libre");

  const programsQuery = useQuery({
    queryKey: ["programs", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getPrograms(supabase, user.id);
    },
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      if (!user?.id) throw new Error("Unauthorized");
      const session = await createSession(supabase, {
        user_id: user.id,
        session_date: todayISO(),
        workout_name: name || "Séance libre",
        status: "planned",
      });
      return session;
    },
    onSuccess: (session) => {
      toast.success("Séance démarrée");
      router.push(`${ROUTES.training}/${session.id}`);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  return (
    <div className="space-y-10">
      <Link
        href={ROUTES.training}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour
      </Link>

      <PageHeader
        title="Démarrer une séance"
        subtitle="Choisis une séance libre ou un jour de programme."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Séance libre</CardTitle>
              <CardDescription>Démarre vide, ajoute tes exercices à la volée.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            <div>
              <Label>Nom de la séance</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button
              onClick={() => startMutation.mutate()}
              loading={startMutation.isPending}
              size="lg"
              className="w-full"
            >
              <Zap className="h-4 w-4" />
              Démarrer
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Mes programmes</CardTitle>
              <CardDescription>Lance un jour planifié.</CardDescription>
            </div>
          </CardHeader>
          {programsQuery.isLoading ? (
            <Skeleton className="h-24" />
          ) : programsQuery.data && programsQuery.data.length > 0 ? (
            <div className="space-y-2">
              {programsQuery.data.map((p) => (
                <Link
                  key={p.id}
                  href={`${ROUTES.trainingPrograms}/${p.id}`}
                  className="block rounded-xl border border-border bg-surface-2 p-3 hover:border-border-strong"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description ? (
                    <p className="text-[10px] text-muted">{p.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 py-6 text-center text-xs text-muted">
              Aucun programme pour le moment
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
