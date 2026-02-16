"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Moon, RefreshCw, Clock, CheckCircle2, AlertCircle, Loader2, Brain, Trash2, BarChart3, Archive } from "lucide-react";

interface DreamCycleReport {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  dryRun: boolean;
  status: string;
  scoresRefreshed: number;
  duplicatesMerged: number;
  patternsCreated: number;
  memoriesArchived: number;
  totalActive: number;
  avgEffectiveScore: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stageDetails: Record<string, any>;
  errors: string[];
}

const API_URL = process.env.NEXT_PUBLIC_ENGRAM_API_URL || "https://api.openengram.ai";
const API_KEY = process.env.NEXT_PUBLIC_ENGRAM_API_KEY || "";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusConfig: Record<string, { icon: any; color: string; iconClass: string }> = {
  RUNNING: { icon: Loader2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", iconClass: "animate-spin" },
  COMPLETED: { icon: CheckCircle2, color: "bg-green-500/10 text-green-500 border-green-500/20", iconClass: "" },
  FAILED: { icon: AlertCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", iconClass: "" },
  DRY_RUN: { icon: CheckCircle2, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", iconClass: "" },
};

export default function ConsolidationPage() {
  const [reports, setReports] = useState<DreamCycleReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningCycle, setRunningCycle] = useState(false);
  const [cycleResult, setCycleResult] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (API_KEY) {
        headers["X-AM-API-Key"] = API_KEY;
        headers["Authorization"] = `Bearer ${API_KEY}`;
      }
      const res = await fetch(`${API_URL}/v1/consolidation/dream-cycle/reports`, {
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // API returns array directly, but handle wrapped format too
      setReports(Array.isArray(data) ? data : data.reports || []);
    } catch (err) {
      console.error("Failed to fetch dream cycle reports:", err);
      setError("Could not load consolidation reports. The consolidation service may not be running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Consolidation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dream cycle reports — memory consolidation and deduplication runs
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={async () => {
              setRunningCycle(true);
              setCycleResult(null);
              try {
                const dreamHeaders: Record<string, string> = {
                  "Content-Type": "application/json",
                };
                if (API_KEY) {
                  dreamHeaders["X-AM-API-Key"] = API_KEY;
                  dreamHeaders["Authorization"] = `Bearer ${API_KEY}`;
                }
                const res = await fetch(`${API_URL}/v1/consolidation/dream-cycle`, {
                  method: "POST",
                  headers: dreamHeaders,
                  body: JSON.stringify({ dryRun: false }),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setCycleResult("Dream cycle started successfully!");
                // Refresh reports after a delay to let it complete
                setTimeout(fetchReports, 3000);
              } catch (err) {
                setCycleResult(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
              } finally {
                setRunningCycle(false);
              }
            }}
            disabled={runningCycle}
            className="h-11 flex-1 sm:flex-none"
          >
            {runningCycle ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Run Consolidation
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={fetchReports}
            disabled={loading}
            className="h-11 flex-1 sm:flex-none"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Cycle Result */}
      {cycleResult && (
        <Card>
          <CardContent className="py-3 text-center text-sm">
            <p className={cycleResult.startsWith("Failed") ? "text-destructive" : "text-green-600"}>
              {cycleResult}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Moon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
              <h2 className="text-base md:text-lg font-semibold mb-2">No Reports Available</h2>
              <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Moon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
              <h2 className="text-base md:text-lg font-semibold mb-2">No Dream Cycles Yet</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Dream cycles run automatically to consolidate and deduplicate memories.
                Reports will appear here after the first cycle completes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      {!loading && !error && reports.map((report) => {
        const config = statusConfig[report.status] || { icon: AlertCircle, color: "bg-gray-500/10 text-gray-500 border-gray-500/20", iconClass: "" };
        const StatusIcon = config.icon;
        const stageDetails = report.stageDetails || {};

        return (
          <Card key={report.id}>
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(report.startedAt)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {report.dryRun && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      Dry Run
                    </Badge>
                  )}
                  <Badge variant="outline" className={config.color}>
                    <StatusIcon className={`mr-1 h-3 w-3 ${config.iconClass}`} />
                    {report.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Stats */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Duplicates Merged
                  </p>
                  <p className="text-lg font-semibold">{report.duplicatesMerged}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Archive className="h-3 w-3" /> Archived
                  </p>
                  <p className="text-lg font-semibold">{report.memoriesArchived}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Scores Refreshed
                  </p>
                  <p className="text-lg font-semibold">{report.scoresRefreshed}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Brain className="h-3 w-3" /> Patterns Created
                  </p>
                  <p className="text-lg font-semibold">{report.patternsCreated}</p>
                </div>
              </div>

              {/* Health & Duration Row */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Total Active</p>
                  <p className="font-medium">{report.totalActive || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="font-medium">
                    {report.avgEffectiveScore ? report.avgEffectiveScore.toFixed(3) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {report.durationMs ? formatDuration(report.durationMs) : "—"}
                  </p>
                </div>
              </div>

              {/* Stage Details (collapsible-style) */}
              {Object.keys(stageDetails).length > 0 && (
                <div className="border-t pt-3 mt-2">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Stage Details</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {stageDetails.dedup && (
                      <div className="text-xs bg-muted/50 rounded-md p-2">
                        <span className="font-medium">Stage 1 — Dedup:</span>{" "}
                        {stageDetails.dedup.scanned} scanned, {stageDetails.dedup.merged} merged, {stageDetails.dedup.flagged} flagged
                      </div>
                    )}
                    {stageDetails.staleness && (
                      <div className="text-xs bg-muted/50 rounded-md p-2">
                        <span className="font-medium">Stage 2 — Staleness:</span>{" "}
                        {stageDetails.staleness.scoresRefreshed} refreshed, {stageDetails.staleness.archived} archived, {stageDetails.staleness.candidates} candidates
                      </div>
                    )}
                    {stageDetails.patterns && (
                      <div className="text-xs bg-muted/50 rounded-md p-2">
                        <span className="font-medium">Stage 3 — Patterns:</span>{" "}
                        {stageDetails.patterns.clustersFound} clusters, {stageDetails.patterns.patternsCreated} created, {stageDetails.patterns.llmCalls} LLM calls
                      </div>
                    )}
                    {stageDetails.report && (
                      <div className="text-xs bg-muted/50 rounded-md p-2">
                        <span className="font-medium">Stage 4 — Report:</span>{" "}
                        {stageDetails.report.totalActive} active, avg score {stageDetails.report.avgEffectiveScore?.toFixed(3)}
                      </div>
                    )}
                    {stageDetails.generateContext && (
                      <div className="text-xs bg-muted/50 rounded-md p-2">
                        <span className="font-medium">Stage 5 — Context:</span>{" "}
                        {stageDetails.generateContext.memoriesIncluded} memories, {stageDetails.generateContext.tokenCount} tokens
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {report.errors && report.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {report.errors.map((err, i) => (
                    <div key={i} className="p-2 rounded-lg bg-red-500/10 text-red-500 text-xs">
                      {err}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
