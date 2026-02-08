"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Moon, RefreshCw, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DreamCycleReport {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "completed" | "failed";
  memoriesProcessed?: number;
  memoriesConsolidated?: number;
  memoriesDeduplicated?: number;
  durationMs?: number;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_ENGRAM_API_URL || "http://localhost:3001";
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

const statusConfig: Record<string, { icon: any; color: string; iconClass: string }> = {
  running: { icon: Loader2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", iconClass: "animate-spin" },
  RUNNING: { icon: Loader2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", iconClass: "animate-spin" },
  completed: { icon: CheckCircle2, color: "bg-green-500/10 text-green-500 border-green-500/20", iconClass: "" },
  COMPLETED: { icon: CheckCircle2, color: "bg-green-500/10 text-green-500 border-green-500/20", iconClass: "" },
  failed: { icon: AlertCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", iconClass: "" },
  FAILED: { icon: AlertCircle, color: "bg-red-500/10 text-red-500 border-red-500/20", iconClass: "" },
  DRY_RUN: { icon: CheckCircle2, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", iconClass: "" },
};

export default function ConsolidationPage() {
  const [reports, setReports] = useState<DreamCycleReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/consolidation/dream-cycle/reports`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReports(data.reports || data || []);
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
        <Button
          variant="outline"
          onClick={fetchReports}
          disabled={loading}
          className="h-11 w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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

      {/* Reports List */}
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

      {!loading && !error && reports.map((report) => {
        const config = statusConfig[report.status] || { icon: AlertCircle, color: "bg-gray-500/10 text-gray-500 border-gray-500/20", iconClass: "" };
        const StatusIcon = config.icon;
        return (
          <Card key={report.id}>
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(report.startedAt)}
                </CardTitle>
                <Badge variant="outline" className={config.color}>
                  <StatusIcon className={`mr-1 h-3 w-3 ${config.iconClass}`} />
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Processed</p>
                  <p className="text-lg font-semibold">{report.memoriesProcessed ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consolidated</p>
                  <p className="text-lg font-semibold">{report.memoriesConsolidated ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deduplicated</p>
                  <p className="text-lg font-semibold">{report.memoriesDeduplicated ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">
                    {report.durationMs ? formatDuration(report.durationMs) : "—"}
                  </p>
                </div>
              </div>
              {report.error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                  {report.error}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
