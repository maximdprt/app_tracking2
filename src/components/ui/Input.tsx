import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "bg-surface text-text ring-primary/40 placeholder:text-muted h-11 w-full rounded-xl border border-white/10 px-3 text-sm outline-none focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
