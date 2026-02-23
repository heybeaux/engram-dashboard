"use client";

import { cn } from "@/lib/utils";

interface Capability {
  domain: string;
  score: number; // 0-1
}

interface CapabilityChartProps {
  capabilities: Capability[];
  className?: string;
}

export function CapabilityChart({ capabilities, className }: CapabilityChartProps) {
  const max = Math.max(...capabilities.map((c) => c.score), 0.01);

  return (
    <div className={cn("space-y-2", className)}>
      {capabilities.map((cap) => (
        <div key={cap.domain} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate">{cap.domain}</span>
            <span className="font-medium tabular-nums">{Math.round(cap.score * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(cap.score / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
