import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "border-border text-text-soft inline-flex rounded-full border px-2 py-1 text-xs",
        className,
      )}
      {...props}
    />
  );
}
