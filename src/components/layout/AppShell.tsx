import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ChatPanel } from "@/components/layout/ChatPanel";
import { ChatFAB } from "@/components/layout/ChatFAB";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

interface AppShellProps {
  email: string | undefined;
  children: React.ReactNode;
}

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-text lg:flex">
      <Sidebar email={email} />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col bg-background">
        <Topbar />
        <main className="relative flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-10 lg:pb-12 lg:pt-6">
          <div className="mx-auto w-full max-w-7xl">
            <ErrorBoundary label="page">{children}</ErrorBoundary>
          </div>
        </main>
      </div>
      <CommandPalette />
      <ChatPanel />
      <ChatFAB />
    </div>
  );
}
