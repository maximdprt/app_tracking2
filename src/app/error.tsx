"use client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="border-border bg-surface w-full max-w-md rounded-2xl border p-6 text-center">
        <h2 className="text-2xl font-semibold">Erreur serveur</h2>
        <p className="text-text-soft mt-2 text-sm">
          Une erreur est survenue. Reessaie dans un instant.
        </p>
        <Button className="mt-4" onClick={reset}>
          Reessayer
        </Button>
      </div>
    </div>
  );
}
