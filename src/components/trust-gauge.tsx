"use client";

import { cn } from "@/lib/utils";

interface TrustGaugeProps {
  score: number; // 0-1
  size?: number;
  className?: string;
  label?: string;
}

function getColor(score: number) {
  if (score >= 0.8) return "#22c55e";
  if (score >= 0.6) return "#f59e0b";
  return "#ef4444";
}

export function TrustGauge({ score, size = 120, className, label }: TrustGaugeProps) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 270 degrees (3/4 of circle)
  const arcLength = circumference * 0.75;
  const filledLength = arcLength * Math.min(Math.max(score, 0), 1);
  const gapLength = circumference - arcLength;
  const color = getColor(score);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[225deg]"
      >
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
          className="text-muted/30"
        />
        {/* Filled arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filledLength} ${circumference - filledLength}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="flex flex-col items-center -mt-[40%]">
        <span className="text-2xl font-bold" style={{ color }}>
          {Math.round(score * 100)}
        </span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
