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
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.15)_0%,transparent_70%)]">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-text">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-text-soft">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
