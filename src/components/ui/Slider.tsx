"use client";

import { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function Slider({ value, onChange, min, max, step = 1, unit, className }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  function handleSlider(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  function handleNumber(e: ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (Number.isNaN(n)) return;
    onChange(Math.min(max, Math.max(min, n)));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <input
          type="number"
          value={value}
          onChange={handleNumber}
          min={min}
          max={max}
          step={step}
          className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-right font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {unit ? <span className="text-xs text-muted">{unit}</span> : null}
      </div>
      <div className="relative h-2 rounded-full bg-surface-2">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          value={value}
          onChange={handleSlider}
          min={min}
          max={max}
          step={step}
          className="absolute left-0 top-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
