"use client";

import { Bot, Trash2, X } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { useChatPanelStore } from "@/stores/useChatPanelStore";
import { useCoachChat } from "@/hooks/useCoachChat";
import { CoachChatThread } from "@/features/coach/CoachChatThread";

export function CoachChatPanel() {
  const isOpen = useChatPanelStore((s) => s.isOpen);
  const close = useChatPanelStore((s) => s.close);
  const { messages, clear } = useCoachChat();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      side="right"
      hideHeader
      className="w-full max-w-sm sm:max-w-none sm:w-104"
    >
      <div className="flex h-dvh max-h-dvh flex-col">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container md-elevation-0">
              <Bot className="h-5 w-5 text-on-primary-container" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="md-title-medium truncate text-text">Coach IA</p>
              <p className="md-label-medium truncate text-muted">Contexte 7 jours + aujourd’hui</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={() => clear()}
                title="Nouvelle conversation"
                className="rounded-full p-2.5 text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                aria-label="Effacer la conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-4">
          <CoachChatThread showKeyboardHint />
        </div>
      </div>
    </Sheet>
  );
}
