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
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        {icon ? <span className="text-text-soft">{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tracking-tight text-text">
          <AnimatedNumber value={value} decimals={decimals} />
        </span>
        {suffix ? <span className="text-sm text-text-soft">{suffix}</span> : null}
      </div>
      {delta !== undefined ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-success" : "text-danger",
          )}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
          {deltaLabel ? <span className="text-muted">· {deltaLabel}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}
