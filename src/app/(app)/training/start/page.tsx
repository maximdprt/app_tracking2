import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
export default function TrainingStartPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Demarrer une seance" subtitle="Choisis un programme ou seance libre" />
      <Card>
        <p className="text-text-soft text-sm">Mode rapide</p>
        <p className="mt-2">Lance une seance libre puis log tes exercices.</p>
        <Link href="/training/programs" className="mt-4 inline-block">
          <Button>Voir les programmes</Button>
        </Link>
      </Card>
    </div>
  );
}
