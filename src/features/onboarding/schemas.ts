import { z } from "zod";

export const personalSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().min(13).max(100),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
});

export const activitySchema = z.object({
  trainingFrequency: z.number().min(0).max(7),
  averageSteps: z.number().min(0).max(40000),
  averageSleepHours: z.number().min(3).max(12),
});

export const goalSchema = z.object({
  goalType: z.enum(["weight_loss", "recomposition", "maintenance", "muscle_gain", "performance"]),
  goalDurationWeeks: z.number().min(4).max(52),
});
