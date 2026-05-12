import { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  decimals?: number;
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix,
  delta,
  deltaLabel,
  icon,
  decimals = 0,
  className,
}: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;
  return (
    <Card className={cn("hover:border-border-strong", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="lift-label-md text-muted">{label}</p>
        {icon ? <span className="text-text-soft [&_svg]:stroke-[1.5]">{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="lift-display-md text-text">
          <AnimatedNumber value={value} decimals={decimals} />
        </span>
        {suffix ? <span className="lift-body-sm text-muted">{suffix}</span> : null}
      </div>
      {delta !== undefined ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 lift-body-sm font-medium",
            isPositive ? "text-success" : "text-danger",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3 stroke-[1.5]" />
          ) : (
            <TrendingDown className="h-3 w-3 stroke-[1.5]" />
          )}
          {Math.abs(delta).toFixed(1)}%
          {deltaLabel ? <span className="text-muted">· {deltaLabel}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}
