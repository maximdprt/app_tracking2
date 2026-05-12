"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface ToggleGroupProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
} as const;

const SIZES = {
  sm: "p-2 text-xs",
  md: "p-3 text-sm",
  lg: "p-4 text-base",
} as const;

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  size = "md",
  className,
}: ToggleGroupProps<T>) {
  return (
    <div className={cn("grid gap-2", COLS[columns], className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-xl border text-left transition-all",
              SIZES[size],
              active
                ? "border-primary bg-primary-soft text-text shadow-[inset_0_0_0_1px_rgba(163,230,53,0.3)]"
                : "border-border bg-surface-2 text-text-soft hover:border-border-strong hover:text-text",
            )}
          >
            <div className="flex items-center gap-2">
              {opt.icon ? <span className="text-base">{opt.icon}</span> : null}
              <span className="font-medium">{opt.label}</span>
            </div>
            {opt.description ? (
              <p
                className={cn(
                  "mt-1 text-xs",
                  active ? "text-text-soft" : "text-muted",
                )}
              >
                {opt.description}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
