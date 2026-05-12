import { describe, it, expect } from "vitest";
import {
  habitCompliance,
  weeklyScore,
  currentStreak,
  type HabitMetricLog,
} from "../calculations";

describe("habitCompliance", () => {
  it("ignore les off-days dans le dénominateur", () => {
    const logs: HabitMetricLog[] = [{ habit_id: "h1", log_date: "2026-05-05", value: 1 }];
    expect(habitCompliance(logs, ["2026-05-05"])).toBe(0);
  });

  it("moyenne 0..1 caps value", () => {
    const logs: HabitMetricLog[] = [{ habit_id: "h1", log_date: "2026-05-05", value: 1.5 }];
    expect(habitCompliance(logs, [])).toBe(100);
  });
});

describe("weeklyScore", () => {
  it("multi-habitudes moyenne", () => {
    const habits = [{ id: "a" }, { id: "b" }];
    const logs: HabitMetricLog[] = [
      { habit_id: "a", log_date: "2026-05-05", value: 1 },
      { habit_id: "b", log_date: "2026-05-05", value: 0 },
    ];
    const s = weeklyScore(habits, logs, []);
    expect(s).toBe(50);
  });
});

describe("currentStreak", () => {
  it("compte jours consécutifs finissant startDate", () => {
    const logs: HabitMetricLog[] = [
      { habit_id: "h1", log_date: "2026-05-04", value: 1 },
      { habit_id: "h1", log_date: "2026-05-03", value: 1 },
      { habit_id: "h1", log_date: "2026-05-02", value: 0 },
    ];
    expect(currentStreak("h1", logs, "2026-05-04")).toBe(2);
  });
});
