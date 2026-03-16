import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/20",
        blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        pink: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
        orange: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
        gradient: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
