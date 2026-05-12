import { useEffect } from "react";

export function useKeyboardShortcut(key: string, handler: () => void, withMeta = true) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (e.key.toLowerCase() === key.toLowerCase() && (!withMeta || isMeta)) {
        e.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, handler, withMeta]);
}
