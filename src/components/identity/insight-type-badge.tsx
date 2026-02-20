import { cn } from "@/lib/utils";

type InsightType = "pattern" | "anomaly" | "suggestion" | "warning";

interface InsightTypeBadgeProps {
  type: InsightType;
  className?: string;
}

const colorMap: Record<InsightType, string> = {
  pattern: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  anomaly: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  suggestion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const labelMap: Record<InsightType, string> = {
  pattern: "Pattern",
  anomaly: "Anomaly",
  suggestion: "Suggestion",
  warning: "Warning",
};

export function InsightTypeBadge({ type, className }: InsightTypeBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Insight type: ${labelMap[type]}`}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colorMap[type],
        className,
      )}
    >
      {labelMap[type]}
    </span>
  );
}
