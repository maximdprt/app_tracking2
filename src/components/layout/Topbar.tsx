"use client";

import { Search } from "lucide-react";
import { SidebarMobile } from "@/components/layout/SidebarMobile";
import { useUIStore } from "@/stores/useUIStore";
import { KbdShortcut } from "@/components/shared/KbdShortcut";

export function Topbar() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md md-elevation-2 sm:h-16 sm:px-6 lg:px-10">
      <SidebarMobile />
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-2 px-4 py-2 text-muted transition-colors hover:border-outline hover:bg-surface-bright hover:text-text-soft md-label-medium"
        >
          <Search className="h-4 w-4 shrink-0 stroke-[1.5] opacity-80" aria-hidden />
          <span className="hidden sm:inline">Rechercher</span>
          <KbdShortcut keys={["⌘", "K"]} />
        </button>
      </div>
    </header>
  );
}
