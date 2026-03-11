"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  GitMerge,
  Zap,
  Moon,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useHealthMetrics } from "@/hooks/use-health-metrics";
import type { HealthMetrics } from "@/lib/types";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ============================================================================
// HELPERS
// ============================================================================

function statusDot(color: "green" | "yellow" | "red") {
  const classes = {
    green: "bg-emerald-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full shrink-0 ${classes[color]}`}
      aria-hidden="true"
    />
  );
}

function cardBorder(color: "green" | "yellow" | "red") {
  const classes = {
    green: "border-emerald-500/20",
    yellow: "border-yellow-500/20",
    red: "border-red-500/20",
  };
  return classes[color];
}

function valueColor(color: "green" | "yellow" | "red") {
  const classes = {
    green: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };
  return classes[color];
}

// ============================================================================
// INDIVIDUAL METRIC CARDS
// ============================================================================

function MemoryHealthCard({ m }: { m: HealthMetrics }) {
  const pct = m.embeddingCoverage * 100;
  const color: "green" | "yellow" | "red" =
    pct > 80 ? "green" : pct > 50 ? "yellow" : "red";

  return (
    <Card className={`border ${cardBorder(color)}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          Memory Health
        </CardTitle>
        {statusDot(color)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor(color)}`}>
          {m.memoryCount.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {pct.toFixed(1)}% embedded
        </p>
      </CardContent>
    </Card>
  );
}

function DedupStatusCard({ m }: { m: HealthMetrics }) {
  const clusters = m.dedupPendingClusters;
  const color: "green" | "yellow" | "red" =
    clusters < 100 ? "green" : clusters < 1000 ? "yellow" : "red";

  return (
    <Card className={`border ${cardBorder(color)}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-muted-foreground" />
          Dedup Status
        </CardTitle>
        {statusDot(color)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor(color)}`}>
          {clusters.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">pending clusters</p>
      </CardContent>
    </Card>
  );
}

function RecallPerformanceCard({ m }: { m: HealthMetrics }) {
  const ms = m.avgRecallLatencyMs;
  const color: "green" | "yellow" | "red" =
    ms < 200 ? "green" : ms < 500 ? "yellow" : "red";

  return (
    <Card className={`border ${cardBorder(color)}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          Recall Performance
        </CardTitle>
        {statusDot(color)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor(color)}`}>
          {ms}ms
        </div>
        <p className="text-xs text-muted-foreground mt-1">avg recall latency</p>
      </CardContent>
    </Card>
  );
}

function DreamCycleCard({ m }: { m: HealthMetrics }) {
  const status = m.dreamCycleStatus?.toUpperCase();
  const lastRun = m.dreamCycleLastRun ? new Date(m.dreamCycleLastRun) : null;
  const hoursAgo = lastRun
    ? (Date.now() - lastRun.getTime()) / 3600000
    : Infinity;

  const failed = status === "FAILED" || status === "ERROR";
  const color: "green" | "yellow" | "red" = failed
    ? "red"
    : hoursAgo < 36
    ? "green"
    : "yellow";

  const relativeTime = lastRun ? formatRelativeTime(lastRun) : "unknown";

  const displayStatus =
    status === "COMPLETED"
      ? "Completed"
      : status === "RUNNING"
      ? "Running"
      : status === "PENDING"
      ? "Pending"
      : status ?? "Unknown";

  return (
    <Card className={`border ${cardBorder(color)}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground" />
          Dream Cycle
        </CardTitle>
        {statusDot(color)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor(color)}`}>
          {displayStatus}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{relativeTime}</p>
      </CardContent>
    </Card>
  );
}

function MemoryFreshnessCard({ m }: { m: HealthMetrics }) {
  const freshPct = m.freshnessPercentage * 100;
  const decayPct = m.decayPercentage * 100;
  const color: "green" | "yellow" | "red" =
    freshPct > 30 ? "green" : freshPct > 15 ? "yellow" : "red";

  return (
    <Card className={`border ${cardBorder(color)}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Memory Freshness
        </CardTitle>
        {statusDot(color)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor(color)}`}>
          {freshPct.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          fresh · {decayPct.toFixed(1)}% archived
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HealthMetricsCards() {
  const { data, loading, error, refreshing, refresh } = useHealthMetrics();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">System Health</h3>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-7"
          onClick={refresh}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading || !data ? (
          <>
            {[...Array(5)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <MemoryHealthCard m={data} />
            <DedupStatusCard m={data} />
            <RecallPerformanceCard m={data} />
            <DreamCycleCard m={data} />
            <MemoryFreshnessCard m={data} />
          </>
        )}
      </div>
    </div>
  );
}
