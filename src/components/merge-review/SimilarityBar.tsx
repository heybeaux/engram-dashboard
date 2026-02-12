"use client";

import { cn } from "@/lib/utils";

interface SimilarityBarProps {
  similarity: number; // 0-1
  className?: string;
}

export function SimilarityBar({ similarity, className }: SimilarityBarProps) {
  const percent = Math.round(similarity * 100);
  const color =
    percent >= 95
      ? "bg-red-500"
      : percent >= 85
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums w-12 text-right">
        {percent}%
      </span>
    </div>
  );
}
