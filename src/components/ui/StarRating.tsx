import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "default" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  showValue?: boolean;
}

const sizes = {
  sm: "w-3 h-3",
  default: "w-4 h-4",
  lg: "w-5 h-5",
};

export function StarRating({
  value,
  max = 5,
  size = "default",
  interactive,
  onChange,
  className,
  showValue,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            "transition-all duration-100",
            i < display ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            interactive && "cursor-pointer hover:scale-110"
          )}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
