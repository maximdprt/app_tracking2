import type { EntityBase } from "@/src/types/common";

export interface WorkoutSession extends EntityBase {
  user_id: string;
  session_date: string;
  workout_name: string;
  status: "planned" | "completed" | "skipped";
}

export interface ExerciseSet extends EntityBase {
  performed_exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe: number;
}
