import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const typeColors: Record<string, string> = {
  preference: "bg-blue-500/15 text-blue-700 border-blue-500/25 dark:text-blue-400",
  behavior: "bg-purple-500/15 text-purple-700 border-purple-500/25 dark:text-purple-400",
  skill: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-400",
  fact: "bg-cyan-500/15 text-cyan-700 border-cyan-500/25 dark:text-cyan-400",
  goal: "bg-orange-500/15 text-orange-700 border-orange-500/25 dark:text-orange-400",
  correction: "bg-red-500/15 text-red-700 border-red-500/25 dark:text-red-400",
};

const defaultColor = "bg-secondary text-secondary-foreground border-transparent";

interface InsightTypeBadgeProps {
  type: string;
  className?: string;
}

export function InsightTypeBadge({ type, className }: InsightTypeBadgeProps) {
  return (
    <Badge className={cn(typeColors[type] ?? defaultColor, className)}>
      {type}
    </Badge>
  );
}
