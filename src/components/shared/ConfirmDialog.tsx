"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  trigger,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  trigger: ReactNode;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="border-border bg-surface w-full max-w-md rounded-2xl border p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-text-soft mt-2 text-sm">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                loading={loading}
                onClick={async () => {
                  setLoading(true);
                  await onConfirm();
                  setLoading(false);
                  setOpen(false);
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
