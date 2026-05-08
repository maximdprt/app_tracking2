"use client";
import { useDateStore } from "@/stores/useDateStore";
export function DateNavigator() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const setSelectedDate = useDateStore((s) => s.setSelectedDate);
  const setToday = useDateStore((s) => s.setToday);
  return (
    <div className="border-border text-text-soft flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs">
      <button type="button" onClick={setToday} className="hover:text-text">
        Aujourd&apos;hui
      </button>
      <input
        className="text-text bg-transparent outline-none"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
    </div>
  );
}
