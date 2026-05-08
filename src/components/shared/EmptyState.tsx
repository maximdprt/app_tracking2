import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-8 text-center">
      <div className="border-border bg-surface-2 mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border">
        <Icon className="text-text-soft h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-text-soft mt-2 text-sm">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
