import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface rounded-2xl border border-white/10 p-5", className)}
      {...props}
    />
  );
}
