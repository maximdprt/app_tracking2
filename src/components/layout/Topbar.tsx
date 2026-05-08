import { DateNavigator } from "@/components/shared/DateNavigator";
import { SidebarMobile } from "@/components/layout/SidebarMobile";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="border-border flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <SidebarMobile />
        <p className="text-text-soft text-sm">{title}</p>
      </div>
      <DateNavigator />
    </header>
  );
}
