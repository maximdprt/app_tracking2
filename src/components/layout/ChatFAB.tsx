"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    <motion.button
      type="button"
      onClick={toggle}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Ouvrir le coach IA"
    >
      <Bot className="h-6 w-6" />
    </motion.button>
  );
}
