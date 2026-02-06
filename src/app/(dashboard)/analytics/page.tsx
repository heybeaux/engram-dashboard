"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  StatsSummary,
  MemoryTimeline,
  TypeBreakdownChart,
  LayerDistributionChart,
  AnalyticsHeader,
} from "./components";

// Loading skeleton for stat cards
function StatsCardSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </div>
    </Card>
  );
}

// Loading skeleton for chart
function ChartSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="h-[250px] md:h-[300px] bg-muted animate-pulse rounded" />
      </div>
    </Card>
  );
}

// Error state component
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const isConnectionError =
    error.includes("fetch") ||
    error.includes("network") ||
    error.includes("ECONNREFUSED");

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
        {isConnectionError ? (
          <WifiOff className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
        ) : (
          <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
        )}
        <h3 className="text-base md:text-lg font-semibold mb-2">
          {isConnectionError ? "API Not Connected" : "Failed to Load Analytics"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {isConnectionError
            ? "Unable to connect to the Engram API. Make sure the server is running."
            : error}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm" className="h-11">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
        <Brain className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-sm text-muted-foreground">
          Start creating memories to see analytics data here.
        </p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { summary, timeline, typeBreakdown, layerBreakdown, loading, error, refetch } =
    useAnalytics({ period });

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <AnalyticsHeader
          period={period}
          onPeriodChange={setPeriod}
          onRefresh={refetch}
          loading={true}
        />

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        <ChartSkeleton />

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <Badge variant="destructive">Error</Badge>
        </div>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  // Empty state
  if (!summary || summary.totalMemories === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <AnalyticsHeader
          period={period}
          onPeriodChange={setPeriod}
          onRefresh={refetch}
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with controls */}
      <AnalyticsHeader
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={refetch}
      />

      {/* Stats summary cards */}
      <StatsSummary summary={summary} />

      {/* Timeline chart (full width) */}
      {timeline && timeline.data.length > 0 && (
        <MemoryTimeline data={timeline} />
      )}

      {/* Two-column row: Type breakdown and Layer distribution */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {typeBreakdown && typeBreakdown.data.length > 0 && (
          <TypeBreakdownChart data={typeBreakdown} />
        )}
        {layerBreakdown && (
          <LayerDistributionChart data={layerBreakdown} />
        )}
      </div>
    </div>
  );
}
