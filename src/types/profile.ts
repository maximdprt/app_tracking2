import type { EntityBase } from "@/src/types/common";

export interface Profile extends EntityBase {
  user_id: string;
  goal_type: string | null;
  target_daily_calories: number | null;
}
