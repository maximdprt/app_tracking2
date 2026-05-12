"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger/10">
          <AlertCircle className="h-6 w-6 text-danger" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Une erreur est survenue</h1>
        <p className="text-sm text-text-soft">
          Désolé, quelque chose s'est mal passé. Tu peux réessayer maintenant.
        </p>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
