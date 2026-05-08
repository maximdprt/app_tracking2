import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-text flex min-h-screen">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl p-6">{children}</main>
    </div>
  );
}
