import { useDateStore } from "@/stores/useDateStore";

export function useToday() {
  const selectedDate = useDateStore((state) => state.selectedDate);
  return { selectedDate };
}
