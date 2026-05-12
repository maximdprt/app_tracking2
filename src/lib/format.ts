export function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`;
}

export function formatGrams(value: number): string {
  return `${Math.round(value)} g`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export function truncateEmail(email: string, max = 22): string {
  if (email.length <= max) return email;
  return `${email.slice(0, max - 1)}…`;
}
