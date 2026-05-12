"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  Dumbbell,
  Home,
  MessageCircle,
  Plus,
  Salad,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";
import { useChatPanelStore } from "@/stores/useChatPanelStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ROUTES } from "@/constants/routes";

export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const openChat = useChatPanelStore((s) => s.open);

  useKeyboardShortcut("k", () => setOpen(true));
  useKeyboardShortcut("j", () => openChat());

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(path: string) {
    setOpen(false);
    router.push(path);
  }

  function openChatPanel() {
    setOpen(false);
    openChat();
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-sm"
    >
      <Command className="w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-surface-2 shadow-2xl">
        <Command.Input
          placeholder="Rechercher une action..."
          className="h-12 w-full border-b border-border bg-transparent px-4 text-sm text-text outline-none placeholder:text-muted"
        />
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            Aucun résultat
          </Command.Empty>

          <Command.Group heading="Actions rapides" className="text-[11px] uppercase text-muted">
            <CommandItem onSelect={() => go(ROUTES.nutritionAdd)} icon={<Plus className="h-4 w-4" />}>
              Ajouter un repas
            </CommandItem>
            <CommandItem
              onSelect={() => go(ROUTES.trainingStart)}
              icon={<Zap className="h-4 w-4" />}
            >
              Démarrer une séance
            </CommandItem>
            <CommandItem
              onSelect={openChatPanel}
              icon={<MessageCircle className="h-4 w-4" />}
            >
              Ouvrir le coach IA
              <span className="ml-auto font-mono text-[10px] text-muted">⌘J</span>
            </CommandItem>
          </Command.Group>

          <Command.Group heading="Navigation" className="mt-2 text-[11px] uppercase text-muted">
            <CommandItem onSelect={() => go(ROUTES.dashboard)} icon={<Home className="h-4 w-4" />}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.nutrition)} icon={<Salad className="h-4 w-4" />}>
              Nutrition
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.training)} icon={<Dumbbell className="h-4 w-4" />}>
              Entraînement
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.stats)} icon={<BarChart3 className="h-4 w-4" />}>
              Statistiques
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.coach)} icon={<Bot className="h-4 w-4" />}>
              Coach IA
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.habits)} icon={<Sparkles className="h-4 w-4" />}>
              Habitudes
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.profile)} icon={<Settings2 className="h-4 w-4" />}>
              Profil
            </CommandItem>
          </Command.Group>
        </Command.List>
      </Command>
    </Command.Dialog>
  );
}

function CommandItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-soft transition-colors aria-selected:bg-surface aria-selected:text-text"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Command.Item>
  );
}
