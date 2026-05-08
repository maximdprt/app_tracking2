export type SummaryType = "sport_weekly" | "food_daily" | "global";

export interface AiSummaryRequest {
  type: SummaryType;
  context: Record<string, unknown>;
}
