import { cn } from "@/lib/utils";

interface KbdShortcutProps {
  keys: string[];
  className?: string;
}

export function KbdShortcut({ keys, className }: KbdShortcutProps) {
  return (
    <span className={cn("flex items-center gap-0.5", className)}>
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-surface-2 px-1 font-mono text-xs text-muted"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}
