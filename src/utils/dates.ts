import { format } from "date-fns";

export function toISODate(value: Date): string {
  return format(value, "yyyy-MM-dd");
}

export function formatHumanDate(value: string): string {
  return format(new Date(value), "dd MMM yyyy");
}
