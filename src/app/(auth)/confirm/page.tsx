import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ConfirmPage() {
  return (
    <Card>
      <h2 className="text-2xl font-semibold">Confirme ton email</h2>
      <p className="text-text-soft mt-2 text-sm">
        On t&apos;a envoye un lien de confirmation. Ouvre ton email puis reconnecte-toi.
      </p>
      <div className="mt-5">
        <Link href="/login">
          <Button variant="secondary">Retour a la connexion</Button>
        </Link>
      </div>
    </Card>
  );
}
