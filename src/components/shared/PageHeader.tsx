import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6 sm:mb-8 sm:pb-8",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="md-display-small font-normal tracking-tight text-text sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl md-body-large text-text-soft">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
