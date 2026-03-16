import React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  color?: "default" | "success" | "warning" | "danger";
}

const sizeStyles = {
  sm: "h-1",
  default: "h-2",
  lg: "h-3",
};

const colorStyles = {
  default: "from-violet-600 to-indigo-500",
  success: "from-emerald-500 to-teal-400",
  warning: "from-amber-500 to-orange-400",
  danger: "from-red-500 to-rose-400",
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel,
  size = "default",
  color = "default",
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-secondary overflow-hidden", sizeStyles[size])}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
            colorStyles[color],
            barClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-muted-foreground text-right">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
