/** Clé localStorage : n'initialise PostHog que si `=== "true"` (RGPD). */
export const LIFT_ANALYTICS_LOCAL_KEY = "lift_allow_analytics";

export function readAnalyticsConsentFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LIFT_ANALYTICS_LOCAL_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeAnalyticsConsentFlag(allow: boolean): void {
  try {
    window.localStorage.setItem(LIFT_ANALYTICS_LOCAL_KEY, allow ? "true" : "false");
  } catch {
    /* ignorer */
  }
}
