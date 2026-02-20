"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Lightbulb,
  ThumbsUp,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Play,
  Filter,
  Clock,
  AlertCircle,
  Zap,
  TrendingUp,
  Link2,
  Brain,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_BASE =
  typeof window !== "undefined" ? "/api/engram" : "";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }
  return { "Content-Type": "application/json" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Insight {
  id: string;
  type: string;
  summary: string;
  confidence: number;
  status: string;
  createdAt: string;
  feedback?: string;
}

interface AwarenessStatus {
  lastRunAt: string | null;
  nextScheduledAt: string | null;
  running: boolean;
  insightCount: number;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pattern: <TrendingUp className="h-3.5 w-3.5" />,
  connection: <Link2 className="h-3.5 w-3.5" />,
  anomaly: <Zap className="h-3.5 w-3.5" />,
  suggestion: <Lightbulb className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  pattern: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  connection: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  anomaly: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  suggestion: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<AwarenessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runningCycle, setRunningCycle] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/status`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      if (data.insights) setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFeedback = async (id: string, feedback: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/insights/${id}/feedback`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error("Failed");
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, feedback, status: feedback === "dismiss" ? "dismissed" : "reviewed" } : i))
      );
    } catch {
      // Silent
    }
  };

  const handleRunCycle = async () => {
    setRunningCycle(true);
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/cycle`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to run cycle");
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run cycle");
    } finally {
      setRunningCycle(false);
    }
  };

  const filtered = insights.filter((i) => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterType !== "all" && i.type !== filterType) return false;
    if (i.confidence < minConfidence) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Insights &amp; Awareness
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated insights from your memory patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button onClick={handleRunCycle} disabled={runningCycle || status?.running}>
            {runningCycle || status?.running ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Cycle
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Cycle Status Bar */}
      {status && (
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last run:</span>
                <span className="font-medium">
                  {status.lastRunAt ? timeAgo(status.lastRunAt) : "Never"}
                </span>
              </div>
              {status.nextScheduledAt && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next:</span>
                  <span className="font-medium">{timeAgo(status.nextScheduledAt)}</span>
                </div>
              )}
              <Badge variant="outline" className="ml-auto">
                {status.insightCount} insights
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">All</option>
                  <option value="pattern">Pattern</option>
                  <option value="connection">Connection</option>
                  <option value="anomaly">Anomaly</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Min Confidence: {(minConfidence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="mt-1 block w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insight Feed */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run an awareness cycle to generate insights from your memories.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${TYPE_COLORS[insight.type] || ""}`}
                      >
                        {TYPE_ICONS[insight.type] || <Lightbulb className="h-3.5 w-3.5" />}
                        {insight.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {(insight.confidence * 100).toFixed(0)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(insight.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{insight.summary}</p>
                  </div>
                  {!insight.feedback && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        onClick={() => handleFeedback(insight.id, "helpful")}
                        title="Helpful"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => handleFeedback(insight.id, "acted_on")}
                        title="Acted on"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleFeedback(insight.id, "dismiss")}
                        title="Dismiss"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {insight.feedback && (
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {insight.feedback === "helpful" && "👍 Helpful"}
                      {insight.feedback === "acted_on" && "✅ Acted on"}
                      {insight.feedback === "dismiss" && "Dismissed"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
