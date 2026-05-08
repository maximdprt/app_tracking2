import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader title="Programme" subtitle={`Plan: ${programId}`} />
      <Card>
        <p className="text-text-soft text-sm">Structure semaine et exercices planifies.</p>
        <Button className="mt-4">Lancer ce jour</Button>
      </Card>
    </div>
  );
}
