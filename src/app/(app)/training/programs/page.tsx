import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
export default function ProgramsPage() {
  const programs = [
    { id: "ppl", name: "PPL 5 jours" },
    { id: "fullbody", name: "Full Body 3 jours" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Programmes" subtitle="Templates et plans actifs" />
      <div className="grid gap-3 md:grid-cols-2">
        {programs.map((program) => (
          <Link key={program.id} href={`/training/programs/${program.id}`}>
            <Card className="hover:border-border-strong transition-all duration-200">
              <p className="text-lg font-semibold">{program.name}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
