"use client";

import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { useChatPanelStore } from "@/stores/useChatPanelStore";

const HIDDEN_ROUTES = ["/onboarding", "/login", "/signup", "/reset-password", "/confirm"];

export function ChatFAB() {
  const pathname = usePathname();
  const isOpen = useChatPanelStore((s) => s.isOpen);
  const toggle = useChatPanelStore((s) => s.toggle);

  const isHidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r)) || isOpen;

  if (isHidden) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-40 flex h-14 min-h-14 w-14 min-w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-(--shadow-md-fab) transition-[transform,filter] hover:scale-105 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label="Ouvrir le coach IA"
    >
      <Bot className="h-7 w-7" aria-hidden />
    </button>
  );
}
