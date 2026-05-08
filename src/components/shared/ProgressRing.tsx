"use client";

import { motion } from "framer-motion";

export function ProgressRing({
  value,
  max,
  color = "#A3E635",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(value, max));
  const ratio = max === 0 ? 0 : clamped / max;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
        fill="none"
      />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        strokeDasharray={circumference}
      />
      <text x="50" y="56" textAnchor="middle" className="fill-text text-xs">
        {Math.round(ratio * 100)}%
      </text>
    </svg>
  );
}
