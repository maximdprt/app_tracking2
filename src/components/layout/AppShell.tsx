import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
export function AppShell({
  title,
  email,
  children,
}: {
  title: string;
  email: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-text min-h-screen lg:flex">
      <Sidebar email={email} />
      <div className="flex-1">
        <Topbar title={title} />
        <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
