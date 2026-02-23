"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Lightbulb, Activity, AlertCircle, Clock } from "lucide-react";
import {
  getInsights,
  getCycleStatus,
  type Insight,
  type CycleStatus,
} from "@/lib/identity-api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cycle, setCycle] = useState<CycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [insightsResult, cycleResult] = await Promise.allSettled([
        getInsights(),
        getCycleStatus(),
      ]);

      if (insightsResult.status === "fulfilled") {
        setInsights(insightsResult.value);
      }
      if (cycleResult.status === "fulfilled") {
        setCycle(cycleResult.value);
      }
      if (insightsResult.status === "rejected" && cycleResult.status === "rejected") {
        throw insightsResult.reason;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-24" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-7 w-7 text-primary" />
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Patterns and observations surfaced by the awareness system.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      {/* Cycle Status */}
      {(cycle || insights.length > 0) && (() => {
        // Derive accurate stats from actual insights when cycle status is stale
        const latestInsight = insights.length > 0
          ? insights.reduce((a, b) =>
              (a.createdAt && b.createdAt && new Date(b.createdAt) > new Date(a.createdAt)) ? b : a
            )
          : null;
        const effectiveInsightCount = (cycle?.insightsGenerated && cycle.insightsGenerated > 0)
          ? cycle.insightsGenerated
          : insights.length;
        const effectiveLastRun = cycle?.lastRun || latestInsight?.createdAt || null;
        const effectivePhase = cycle?.phase || (insights.length > 0 ? "completed" : "idle");

        // Group insights by category for summary
        const categoryCount = insights.reduce((acc, i) => {
          const cat = i.category || "uncategorized";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topCategories = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" /> Awareness Cycle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phase</p>
                  <p className="font-medium capitalize">{effectivePhase}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Insight</p>
                  <p className="font-medium">{effectiveLastRun ? timeAgo(effectiveLastRun) : "Never"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Next Run</p>
                  <p className="font-medium">{cycle?.nextRun ? timeAgo(cycle.nextRun) : "Scheduled"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Insights</p>
                  <p className="font-medium">{effectiveInsightCount}</p>
                </div>
              </div>
              {topCategories.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Top Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topCategories.map(([cat, count]) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Insights List */}
      {insights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No insights surfaced yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Insights are generated automatically as the awareness system observes patterns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {insight.title && <p className="text-sm font-medium mb-1">{insight.title}</p>}
                    <p className="text-sm text-muted-foreground">{insight.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {insight.category && <Badge variant="outline" className="text-xs">{insight.category}</Badge>}
                      {insight.confidence != null && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      )}
                      {insight.createdAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{timeAgo(insight.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
