"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Dumbbell,
  Grid3x3,
  Home,
  Salad,
  Settings2,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

const links = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: Home },
  { href: ROUTES.nutrition, label: "Nutrition", icon: Salad },
  { href: ROUTES.training, label: "Entraînement", icon: Dumbbell },
  { href: ROUTES.stats, label: "Statistiques", icon: BarChart3 },
  { href: ROUTES.habits, label: "Habitudes", icon: Sparkles },
  { href: ROUTES.habitsMatrix, label: "Routine (matrice)", icon: Grid3x3 },
  { href: ROUTES.coach, label: "Coach IA", icon: Bot },
];

interface SidebarProps {
  email: string | undefined;
}

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-surface md-elevation-1 lg:sticky lg:top-0 lg:flex">
      <div className="flex h-18 items-center px-5">
        <Link
          href={ROUTES.dashboard}
          className="group flex items-center gap-3 rounded-full py-1 pr-3 transition-colors hover:bg-surface-2"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary md-elevation-1 md-title-medium">
            L
          </span>
          <span className="md-title-large text-text">Lift</span>
        </Link>
      </div>

      <p className="px-5 pb-2 pt-1 md-label-medium uppercase tracking-wider text-muted">
        Navigation
      </p>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-full px-4 py-2.5 md-body-large transition-colors",
                active
                  ? "bg-primary-container text-on-primary-container md-elevation-0"
                  : "text-text-soft hover:bg-surface-2 hover:text-text",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-primary/25"
                  transition={{ type: "spring", duration: 0.45, bounce: 0.12 }}
                />
              ) : null}
              <Icon
                className={cn(
                  "relative z-1 size-5.5 shrink-0",
                  active ? "text-on-primary-container" : "",
                )}
                aria-hidden
              />
              <span className="relative z-1 md-label-large">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border px-3 pb-4 pt-3">
        <Link
          href={ROUTES.profile}
          className={cn(
            "flex items-center gap-3 rounded-full px-4 py-2.5 md-body-large transition-colors",
            pathname === ROUTES.profile
              ? "bg-surface-2 text-text"
              : "text-text-soft hover:bg-surface-2 hover:text-text",
          )}
        >
          <Settings2 className="size-5.5 shrink-0" aria-hidden />
          <span className="md-label-large">Profil</span>
        </Link>
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
