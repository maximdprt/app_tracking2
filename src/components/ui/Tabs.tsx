"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps<T extends string> {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ options, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex gap-1 rounded-xl border border-border bg-surface p-1", className)}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              active ? "text-text" : "text-text-soft hover:text-text",
            )}
          >
            {active ? (
              <motion.span
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg bg-surface-2"
                transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
