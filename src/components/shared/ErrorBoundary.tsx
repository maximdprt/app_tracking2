"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  /** Fallback custom. Par défaut : carte d'erreur générique. */
  fallback?: ReactNode;
  /** Label contextuel affiché dans le message d'erreur. */
  label?: string | undefined;
}

interface State {
  error: Error | null;
}

/**
 * ErrorBoundary React class component.
 * Utilise le pattern officiel — les hooks ne peuvent pas catcher les erreurs de rendu.
 *
 * Usage :
 * ```tsx
 * <ErrorBoundary label="Dashboard">
 *   <DashboardPage />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ""}]`, error, info);
  }

  reset() {
    this.setState({ error: null });
  }

  override render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-50 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
          <div className="rounded-full bg-danger/10 p-3">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <p className="font-semibold text-text">
              Une erreur s'est produite
              {this.props.label ? ` dans ${this.props.label}` : ""}
            </p>
            <p className="mt-1 text-sm text-text-soft">
              {this.state.error.message.length < 120
                ? this.state.error.message
                : "Recharge la page pour réessayer."}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.reset()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Version légère pour wrapper des sections individuelles.
 */
export function SectionBoundary({
  children,
  label,
}: {
  children: ReactNode;
  label?: string | undefined;
}) {
  return <ErrorBoundary label={label}>{children}</ErrorBoundary>;
}
