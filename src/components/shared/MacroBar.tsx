"use client";

import { motion } from "framer-motion";

interface MacroBarProps {
  protein: number;
  carbs: number;
  fats: number;
  showLegend?: boolean;
}

export function MacroBar({ protein, carbs, fats, showLegend = true }: MacroBarProps) {
  const total = Math.max(1, protein + carbs + fats);
  const pP = (protein / total) * 100;
  const pC = (carbs / total) * 100;
  const pF = (fats / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full bg-protein"
          initial={{ width: 0 }}
          animate={{ width: `${pP}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="h-full bg-carbs"
          initial={{ width: 0 }}
          animate={{ width: `${pC}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
        />
        <motion.div
          className="h-full bg-fats"
          initial={{ width: 0 }}
          animate={{ width: `${pF}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />
      </div>
      {showLegend ? (
        <div className="flex justify-between font-mono text-[10px] text-text-soft">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-protein" />
            P {Math.round(protein)}g
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-carbs" />
            G {Math.round(carbs)}g
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-fats" />
            L {Math.round(fats)}g
          </span>
        </div>
      ) : null}
    </div>
  );
}
