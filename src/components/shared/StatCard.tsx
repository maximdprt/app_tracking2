import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card>
      <p className="text-text-soft text-sm">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        <AnimatedNumber value={value} />
        {suffix ? ` ${suffix}` : ""}
      </p>
    </Card>
  );
}
