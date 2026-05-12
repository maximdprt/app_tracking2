import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** Trois tailles selon le niveau hiérarchique de l'info :
 *  lg  = KPI hero (lift-display-xl)
 *  md  = KPI secondaire (lift-display-lg) — défaut
 *  sm  = stat compact dans une grille (lift-display-md)
 */
export type StatCardSize = "sm" | "md" | "lg";

const SIZE_VALUE: Record<StatCardSize, string> = {
  lg: "lift-display-xl",
  md: "lift-display-lg",
  sm: "lift-display-md",
};

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  delta?: number;
  size?: StatCardSize;
  className?: string;
}

/** Composant inline — pas de Card wrapper.
 *  Entourer d'une <Card> explicitement si besoin. */
export function StatCard({
  label,
  value,
  suffix,
  delta,
  size = "md",
  className,
}: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="lift-label">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={SIZE_VALUE[size]}>{value}</span>
        {suffix ? <span className="lift-body-soft">{suffix}</span> : null}
      </div>
      {delta !== undefined ? (
        <div
          className={cn(
            "inline-flex items-center gap-1 lift-body-sm font-medium",
            isPositive ? "text-success" : "text-danger",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3 stroke-[1.5]" />
          ) : (
            <TrendingDown className="h-3 w-3 stroke-[1.5]" />
          )}
          {Math.abs(delta).toFixed(1)}%
        </div>
      ) : null}
    </div>
  );
}
