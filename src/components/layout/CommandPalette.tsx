"use client";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/useUIStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  useKeyboardShortcut("k", () => setOpen(true));
  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-50 bg-black/70 p-4"
    >
      <Command className="border-border bg-surface mx-auto mt-20 w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl">
        <Command.Input
          className="border-border h-12 w-full border-b bg-transparent px-4 outline-none"
          placeholder="Rechercher une action..."
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Item
            className="hover:bg-surface-2 cursor-pointer rounded-lg px-3 py-2"
            onSelect={() => {
              setOpen(false);
              router.push("/nutrition/add");
            }}
          >
            Ajouter un repas
          </Command.Item>
          <Command.Item
            className="hover:bg-surface-2 cursor-pointer rounded-lg px-3 py-2"
            onSelect={() => {
              setOpen(false);
              router.push("/training/start");
            }}
          >
            Demarrer une seance
          </Command.Item>
          <Command.Item
            className="hover:bg-surface-2 cursor-pointer rounded-lg px-3 py-2"
            onSelect={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
          >
            Aller au dashboard
          </Command.Item>
        </Command.List>
      </Command>
    </Command.Dialog>
  );
}
