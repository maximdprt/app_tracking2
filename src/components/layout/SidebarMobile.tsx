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
        className="rounded-lg p-2 text-text-soft hover:bg-surface-2 hover:text-text lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} side="left" title="Lift">
        <nav className="space-y-0.5">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  active
                    ? "bg-surface-2 text-text"
                    : "text-text-soft hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Sheet>
    </>
  );
}
