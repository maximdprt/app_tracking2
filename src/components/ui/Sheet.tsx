"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  title?: string;
  /** Pas de ligne titre + fermeture : le contenu gère toute la chrome (ex. chat plein écran). */
  hideHeader?: boolean;
  children: ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  hideHeader = false,
  children,
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const x = side === "left" ? -320 : 320;

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs"
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            initial={{ x }}
            animate={{ x: 0 }}
            exit={{ x }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              "absolute top-0 h-full w-full max-w-80 border-outline-variant bg-surface md-elevation-3",
              hideHeader ? "flex flex-col overflow-hidden p-0" : "overflow-y-auto p-5",
              side === "left" ? "left-0 rounded-r-3xl border-r" : "right-0 rounded-l-3xl border-l",
              className,
            )}
          >
            {!hideHeader ? (
              <div className="mb-5 flex items-center justify-between gap-3">
                {title ? <p className="md-title-medium text-text">{title}</p> : <span />}
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}
            {children}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
