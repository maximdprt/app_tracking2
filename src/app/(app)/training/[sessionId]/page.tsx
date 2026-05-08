import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div className="space-y-6">
      <PageHeader title="Session" subtitle={`ID: ${sessionId}`} />
      <Card>
        <p className="text-text-soft text-sm">Exercise logger detail arrive en sprint suivant.</p>
      </Card>
    </div>
  );
}
