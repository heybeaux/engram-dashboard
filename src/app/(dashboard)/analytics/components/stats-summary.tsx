"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CalendarDays, TrendingUp, Gauge } from "lucide-react";
import type { AnalyticsSummaryResponse } from "@/lib/types";

interface StatsSummaryProps {
  summary: AnalyticsSummaryResponse;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatsSummary({ summary }: StatsSummaryProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Memories"
        value={summary.totalMemories.toLocaleString()}
        description="All time"
        icon={<Brain className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Today"
        value={summary.memoriesToday.toLocaleString()}
        description="Memories created today"
        icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="This Week"
        value={summary.memoriesThisWeek.toLocaleString()}
        description="Memories this week"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Avg Importance"
        value={summary.avgImportance.toFixed(2)}
        description="Average importance score"
        icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
