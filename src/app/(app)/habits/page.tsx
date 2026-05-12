"use client";

import { Bed, Droplet, Flower2, Footprints, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";

const FUTURE_HABITS = [
  { icon: Bed, label: "Sommeil", description: "Suivi qualité & durée" },
  { icon: Droplet, label: "Hydratation", description: "Litres consommés" },
  { icon: Footprints, label: "Pas", description: "Activité quotidienne" },
  { icon: Flower2, label: "Méditation", description: "Minutes de calme" },
  { icon: Sparkles, label: "Mobilité", description: "Étirements quotidiens" },
];

export default function HabitsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Habitudes" subtitle="Construis tes routines saines." />

      <Card className="bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.08)_0%,transparent_60%)]">
        <div className="mx-auto max-w-md space-y-6 py-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Bientôt disponible</h2>
            <p className="mt-2 text-sm text-text-soft">
              Sommeil, hydratation, pas, méditation, mobilité — tout ce qui te rapproche de ta
              meilleure version, dans une routine fluide.
            </p>
          </div>
          <Button onClick={() => toast.success("On te tient au courant ✓")}>
            Me prévenir au lancement
          </Button>
        </div>
      </Card>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">Aperçu</p>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {FUTURE_HABITS.map(({ icon: Icon, label, description }) => (
            <Card
              key={label}
              className="opacity-60 transition-opacity hover:opacity-80"
            >
              <CardHeader>
                <div>
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
                <Icon className="h-4 w-4 text-text-soft" />
              </CardHeader>
              <div className="h-2 w-full rounded-full bg-surface-2">
                <div className="h-full w-1/3 rounded-full bg-text-soft/20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
