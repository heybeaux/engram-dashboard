"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "active" | "pending" | "expired" | "failed" | "completed" | "draft";

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/30",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  expired: "bg-muted text-muted-foreground border-muted",
  failed: "bg-red-500/10 text-red-600 border-red-500/30",
  draft: "bg-muted text-muted-foreground border-muted",
};

interface StatusBadgeProps {
  status: StatusVariant | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = variantStyles[status as StatusVariant] ?? variantStyles.draft;
  return (
    <Badge variant="outline" className={cn(style, "capitalize", className)}>
      {status}
    </Badge>
  );
}
