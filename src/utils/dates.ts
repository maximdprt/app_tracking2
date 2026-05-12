import { format, parseISO, startOfDay, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export function todayISO(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

export function formatDateLong(iso: string): string {
  return format(parseISO(iso), "EEEE d MMMM yyyy", { locale: fr });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: fr });
}

export function formatDateRelative(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Aujourd'hui";
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (iso === yesterday) return "Hier";
  return formatDateLong(iso);
}

export function lastNDaysISO(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    out.push(format(subDays(now, i), "yyyy-MM-dd"));
  }
  return out;
}
