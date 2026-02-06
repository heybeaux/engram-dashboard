"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsHeaderProps {
  period: "7d" | "30d" | "90d";
  onPeriodChange: (period: "7d" | "30d" | "90d") => void;
  onRefresh: () => void;
  loading?: boolean;
}

const PERIODS = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
] as const;

export function AnalyticsHeader({
  period,
  onPeriodChange,
  onRefresh,
  loading,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Memory creation patterns and insights
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Period selector buttons */}
        <div className="flex rounded-md border border-input">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant="ghost"
              size="sm"
              onClick={() => onPeriodChange(p.value)}
              className={cn(
                "h-9 px-3 rounded-none first:rounded-l-md last:rounded-r-md",
                period === p.value && "bg-muted"
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 w-9"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
