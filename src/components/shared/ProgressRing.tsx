"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

function centerClassForSize(size: number): string {
  if (size >= 135) return "lift-display-lg";
  if (size >= 105) return "lift-display-md";
  return "lift-display-sm";
}

function sublabelClass(sublabel: string | undefined): string {
  if (!sublabel) return "lift-label-sm text-muted";
  return sublabel.length <= 2 ? "lift-label-sm text-muted" : "lift-label-md text-muted";
}

export function ProgressRing({
  value,
  max,
  size = 120,
  stroke = 10,
  color = "var(--color-primary)",
  trackColor,
  showLabel = true,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const ratio = max === 0 ? 0 : clamped / max;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);
  const percentage = Math.round(ratio * 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? "color-mix(in srgb, var(--lift-text-primary) 9%, transparent)"}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          strokeDasharray={circumference}
        />
      </svg>
      {showLabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn(centerClassForSize(size), "tracking-tight text-text")}>
            {label ?? `${percentage}%`}
          </span>
          {sublabel ? <span className={cn(sublabelClass(sublabel), "mt-0.5")}>{sublabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
