"use client";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
export default function HabitsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Habitudes" subtitle="Bientot disponible" />
      <Card className="text-center">
        <div className="border-border mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border bg-[linear-gradient(135deg,rgba(163,230,53,0.16)_0%,transparent_60%)]">
          <Sparkles className="text-primary h-7 w-7" />
        </div>
        <h3 className="text-2xl font-semibold">Habitudes — Bientot disponible</h3>
        <p className="text-text-soft mt-2 text-sm">
          Sommeil, hydratation, pas, meditation, mobilite — bientot dans ta routine.
        </p>
        <div className="mt-6 grid gap-2 md:grid-cols-5">
          {["Sommeil", "Hydratation", "Pas", "Meditation", "Mobilite"].map((label) => (
            <div
              key={label}
              className="border-border bg-surface-2 text-text-soft rounded-xl border p-3 text-sm opacity-70 blur-[0.2px]"
            >
              {label}
            </div>
          ))}
        </div>
        <Button className="mt-6" onClick={() => toast.success("Note ✓")}>
          Me prevenir au lancement
        </Button>
      </Card>
    </div>
  );
}
