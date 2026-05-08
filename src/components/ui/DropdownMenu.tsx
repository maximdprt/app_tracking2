"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({
  trigger,
  items,
}: {
  trigger: ReactNode;
  items: { label: string; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button className="w-full" type="button" onClick={() => setOpen((v) => !v)}>
        {trigger}
      </button>
      {open ? (
        <div className="border-border bg-surface-2 absolute right-0 z-50 mt-2 min-w-40 rounded-xl border p-1">
          {items.map((item) => (
            <button
              key={item.label}
              className={cn(
                "text-text-soft hover:bg-surface block w-full rounded-lg px-3 py-2 text-left text-sm",
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
