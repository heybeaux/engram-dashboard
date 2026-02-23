"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ConfidenceBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 0.8) return "bg-green-500/15 text-green-700 border-green-500/25 dark:text-green-400";
  if (score >= 0.6) return "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-400";
  return "bg-red-500/15 text-red-700 border-red-500/25 dark:text-red-400";
}

export function ConfidenceBadge({ score, className, showLabel = false }: ConfidenceBadgeProps) {
  const pct = Math.round(score * 100);
  return (
    <Badge className={cn(getScoreColor(score), className)}>
      {showLabel && "Confidence: "}{pct}%
    </Badge>
  );
}
