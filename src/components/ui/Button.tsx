"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background lift-body-sm whitespace-nowrap [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary shadow-(--shadow-inner-primary) hover:bg-primary-hover md-elevation-1 hover:md-elevation-2",
        secondary:
          "border border-outline-variant bg-surface-2 text-text hover:border-outline hover:bg-surface-bright md-elevation-0",
        ghost: "text-text-soft hover:bg-surface-2 hover:text-text",
        danger:
          "border border-danger/35 bg-danger/12 text-danger hover:bg-danger/20 md-elevation-0",
        outline:
          "border border-outline bg-transparent text-text hover:bg-surface-2 md-elevation-0",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6",
        icon: "h-11 w-11 shrink-0 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
