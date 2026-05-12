import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
          <Compass className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-sm text-text-soft">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link href={ROUTES.dashboard}>
          <Button>Retour au dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
