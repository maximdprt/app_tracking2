import { format } from "date-fns";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted font-mono text-sm">{format(new Date(), "dd/MM/yyyy")}</p>
    </header>
  );
}
