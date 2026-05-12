"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
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
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            initial={{ x }}
            animate={{ x: 0 }}
            exit={{ x }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute top-0 h-full w-[280px] border-border bg-surface p-4 shadow-2xl",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className,
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              {title ? <p className="font-semibold">{title}</p> : <span />}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-text"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
