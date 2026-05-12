"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "lift-theme";

export function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    setMode(t === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={toggle}>
      {mode === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
      {mode === "dark" ? "Mode clair" : "Mode sombre"}
    </Button>
  );
}
