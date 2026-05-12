import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";

interface AppShellProps {
  email: string | undefined;
  children: React.ReactNode;
}

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text lg:flex">
      <Sidebar email={email} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
