"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, UtensilsCrossed, Grid3X3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const TABS = [
  { href: ROUTES.dashboard, label: "Accueil", Icon: LayoutDashboard },
  { href: ROUTES.training, label: "Sport", Icon: Dumbbell },
  { href: ROUTES.nutrition, label: "Food", Icon: UtensilsCrossed },
  { href: ROUTES.habitsMatrix, label: "Habitudes", Icon: Grid3X3 },
  { href: ROUTES.profile, label: "Profil", Icon: User },
] as const;

function tabActive(pathname: string | null, href: string): boolean {
  const p = pathname ?? "";
  if (href === ROUTES.dashboard) return p === ROUTES.dashboard;
  if (href === ROUTES.training) return p.startsWith("/training");
  if (href === ROUTES.nutrition) return p.startsWith("/nutrition");
  if (href === ROUTES.habitsMatrix) return p.startsWith("/habits/matrix");
  if (href === ROUTES.profile) return p.startsWith("/profile");
  return p === href;
}

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--lift-border-subtle)] bg-[var(--lift-bg-card)] md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {TABS.map(({ href, label, Icon }) => {
          const active = tabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors",
                active
                  ? "text-[var(--lift-text-primary)]"
                  : "text-[var(--lift-text-muted)]",
              )}
            >
              <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden />
              <span className="lift-body-sm max-w-full truncate font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
