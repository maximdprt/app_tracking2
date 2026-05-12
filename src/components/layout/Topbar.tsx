"use client";

import { Search } from "lucide-react";
import { SidebarMobile } from "@/components/layout/SidebarMobile";
import { useUIStore } from "@/stores/useUIStore";
import { KbdShortcut } from "@/components/shared/KbdShortcut";

export function Topbar() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md lg:px-10">
      <SidebarMobile />
      <div className="ml-auto">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-soft transition-colors hover:border-border-strong hover:text-text"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Rechercher</span>
          <KbdShortcut keys={["⌘", "K"]} />
        </button>
      </div>
    </header>
  );
}
