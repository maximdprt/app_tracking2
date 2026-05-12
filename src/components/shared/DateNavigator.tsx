"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useDateStore } from "@/stores/useDateStore";
import { todayISO, formatDateRelative } from "@/utils/dates";

export function DateNavigator() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);
  const setToday = useDateStore((s) => s.setToday);

  function shift(days: number) {
    const next = format(addDays(parseISO(selectedDate), days), "yyyy-MM-dd");
    setSelectedDate(next);
  }

  const isToday = selectedDate === todayISO();
  const label = isToday
    ? "Aujourd'hui"
    : format(parseISO(selectedDate), "EEEE d MMM", { locale: fr });

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="rounded-lg p-1.5 text-text-soft hover:bg-surface-2 hover:text-text"
        aria-label="Jour précédent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 px-2">
        <Calendar className="h-3.5 w-3.5 text-muted" />
        <span className="text-sm font-medium capitalize text-text">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => shift(1)}
        className="rounded-lg p-1.5 text-text-soft hover:bg-surface-2 hover:text-text"
        aria-label="Jour suivant"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {!isToday ? (
        <button
          type="button"
          onClick={setToday}
          className="ml-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft"
        >
          Aujourd'hui
        </button>
      ) : null}
    </div>
  );
}

export { formatDateRelative };
