"use client";

import { useEffect } from "react";
import { readAnalyticsConsentFlag } from "@/lib/consent/analytics-consent";

/**
 * Phase 10 — PostHog EU + Sentry (prod) — **uniquement** si consentement analytics + env vars.
 */
export function ObservabilityBootstrap(): null {
  useEffect(() => {
    void (async () => {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";
      if (!key || typeof window === "undefined") return;
      if (!readAnalyticsConsentFlag()) return;

      const { default: posthog } = await import("posthog-js");
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        persistence: "localStorage+cookie",
      });
      posthog.register({ lift_app_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev" });

      try {
        const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
        if (dsn && process.env.NODE_ENV === "production" && readAnalyticsConsentFlag()) {
          void import("@sentry/react").then((Sentry) => {
            const env = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production";
            Sentry.init({ dsn, environment: env, tracesSampleRate: 0.12 });
          });
        }
      } catch {
        /* Sentry optionnel — pas de blocage utilisateur */
      }
    })();
  }, []);

  return null;
}
