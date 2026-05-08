export function KbdShortcut({ shortcut }: { shortcut: string }) {
  return (
    <kbd className="border-border bg-surface-2 text-text-soft rounded border px-2 py-1 text-xs">
      {shortcut}
    </kbd>
  );
}
