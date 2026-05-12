"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Dumbbell,
  Home,
  Menu,
  Salad,
  Settings2,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/useUIStore";
import { Sheet } from "@/components/ui/Sheet";

const links = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: Home },
  { href: ROUTES.nutrition, label: "Nutrition", icon: Salad },
  { href: ROUTES.training, label: "Entraînement", icon: Dumbbell },
  { href: ROUTES.stats, label: "Statistiques", icon: BarChart3 },
  { href: ROUTES.habits, label: "Habitudes", icon: Sparkles },
  { href: ROUTES.coach, label: "Coach IA", icon: Bot },
  { href: ROUTES.profile, label: "Profil", icon: Settings2 },
];

export function SidebarMobile() {
  const pathname = usePathname();
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-1 rounded-full p-2.5 text-text-soft transition-colors hover:bg-surface-2 hover:text-text lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} side="left" title="Lift">
        <p className="mb-3 md-label-medium uppercase tracking-wider text-muted">Navigation</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-full px-4 py-2.5 md-label-large transition-colors",
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-text-soft hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon className="size-5.5 shrink-0" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Sheet>
    </>
  );
}
