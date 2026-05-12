import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 font-semibold uppercase text-text-soft",
          SIZES[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt ?? "avatar"} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback.slice(0, 2)}</span>
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
