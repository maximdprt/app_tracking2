"use client";

import { motion } from "framer-motion";

interface MacroProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  /** Couleur CSS de remplissage — par défaut noir (var(--color-text)).
   *  Utiliser uniquement les vars macro du système : --color-protein, --color-carbs, --color-fats */
  color?: string;
}

/** Barre de progression individuelle pour un macro-nutriment.
 *  Label uppercase + valeur/cible + barre animée. */
export function MacroProgressBar({
  label,
  value,
  max,
  unit = "g",
  color,
}: MacroProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="lift-label">{label}</span>
        <span className="lift-body-soft lift-num text-right tabular-nums">
          <strong className="text-text font-medium">{Math.round(value)}</strong>
          <span className="text-muted"> / {Math.round(max)}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color ?? "var(--color-text)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
