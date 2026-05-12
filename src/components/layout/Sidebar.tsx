"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Dumbbell,
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
  { href: ROUTES.coach, label: "Coach IA", icon: Bot },
];

interface SidebarProps {
  email: string | undefined;
}

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-surface lg:sticky lg:top-0 lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-black">
            L
          </span>
          Lift
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 text-text"
                  : "text-text-soft hover:bg-surface-2 hover:text-text",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              ) : null}
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href={ROUTES.profile}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
            pathname === ROUTES.profile
              ? "bg-surface-2 text-text"
              : "text-text-soft hover:bg-surface-2 hover:text-text",
          )}
        >
          <Settings2 className="h-4 w-4" />
          Profil
        </Link>
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
