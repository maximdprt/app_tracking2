import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function ConfirmPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Vérifie tes emails</h2>
        <p className="mt-2 text-sm text-text-soft">
          On vient de t'envoyer un lien de confirmation. Ouvre-le pour activer ton compte
          et te connecter.
        </p>
      </div>
      <Link href={ROUTES.login}>
        <Button variant="secondary" className="w-full" size="lg">
          Aller à la connexion
        </Button>
      </Link>
    </div>
  );
}
