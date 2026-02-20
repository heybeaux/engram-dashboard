import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number; // 0.0 - 1.0
  className?: string;
}

function getColor(score: number): string {
  if (score >= 0.8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 0.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

function getLabel(score: number): string {
  if (score >= 0.8) return "High";
  if (score >= 0.5) return "Medium";
  return "Low";
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const pct = Math.round(score * 100);
  return (
    <span
      role="status"
      aria-label={`Confidence: ${pct}% (${getLabel(score)})`}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        getColor(score),
        className,
      )}
    >
      {pct}%
    </span>
  );
}
