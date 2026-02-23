"use client";

import { cn } from "@/lib/utils";

interface TrustGaugeProps {
  score: number; // 0-1
  size?: number;
  className?: string;
  label?: string;
}

export function TrustGauge({ score, size = 120, className, label = "Trust" }: TrustGaugeProps) {
  const clampedScore = Math.max(0, Math.min(1, score));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampedScore);

  const color =
    clampedScore >= 0.7 ? "text-green-500" : clampedScore >= 0.4 ? "text-yellow-500" : "text-red-500";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", color)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(clampedScore * 100)}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
