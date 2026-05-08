"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Dumbbell, Home, Salad, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/layout/UserMenu";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/nutrition", label: "Nutrition", icon: Salad },
  { href: "/training", label: "Entrainement", icon: Dumbbell },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/habits", label: "Habitudes", icon: Target },
  { href: "/coach", label: "Coach IA", icon: Sparkles },
];

export function Sidebar({ email }: { email: string | undefined }) {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-surface hidden w-[260px] flex-col border-r p-4 lg:flex">
      <div className="mb-6 px-2">
        <p className="text-2xl font-semibold tracking-tight">Lift</p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-text-soft hover:border-border-strong hover:bg-surface-2 relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active && "bg-surface-2 text-text",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="active-sidebar"
                  className="bg-primary absolute top-2 bottom-2 left-0 w-0.5 rounded-full"
                />
              ) : null}
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link
          href="/profile"
          className="text-text-soft hover:bg-surface-2 block rounded-xl px-3 py-2 text-sm"
        >
          Profil
        </Link>
        <UserMenu email={email} />
      </div>
    </aside>
  );
}
