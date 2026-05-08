"use client";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
export default function TrainingPage() {
  const sessions = useWorkoutSession().data ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Entrainement" subtitle="Suivi de tes seances" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Seances recentes" value={sessions.length} />
        <StatCard label="Frequence 7j" value={Math.min(7, sessions.length)} suffix="jours" />
        <StatCard label="Volume semaine" value={Math.round(sessions.length * 850)} suffix="kg" />
      </div>
      <div className="flex gap-2">
        <Link href="/training/start">
          <Button>Demarrer une seance</Button>
        </Link>
        <Link href="/training/programs">
          <Button variant="secondary">Programmes</Button>
        </Link>
      </div>
      {sessions.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aucune seance"
          description="Commence ta premiere seance pour alimenter les stats."
        />
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="hover:border-border-strong transition-all duration-200"
            >
              <p className="text-text-soft text-sm">{session.session_date}</p>
              <p className="mt-1 text-lg font-semibold">{session.workout_name ?? "Seance"}</p>
              <p className="text-text-soft text-xs">{session.status}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
