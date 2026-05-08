import Link from "next/link";
import { Home, Utensils, Dumbbell, ChartColumn, Bot, User } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/training", label: "Entrainement", icon: Dumbbell },
  { href: "/stats", label: "Statistiques", icon: ChartColumn },
  { href: "/coach", label: "Coach IA", icon: Bot },
  { href: "/profile", label: "Profil", icon: User },
];

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-60 flex-col border-r border-white/10 bg-black/30 p-4 lg:flex">
      <p className="mb-8 text-xl font-semibold">Lift</p>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-text flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-white/5"
          >
            <link.icon size={16} />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
