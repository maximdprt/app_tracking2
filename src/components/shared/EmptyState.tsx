import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--lift-text-primary)_14%,transparent)_0%,transparent_70%)]">
        <Icon className="h-6 w-6 stroke-[1.5] text-[var(--lift-text-primary)]" />
      </div>
      <h3 className="lift-title-md text-text">{title}</h3>
      {description ? <p className="mt-1 max-w-sm lift-body-sm text-text-soft">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
