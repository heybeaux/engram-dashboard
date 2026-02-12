"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Loader2, Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ensembleApi,
  DriftLatestResponse,
  DriftHistoryResponse,
  // DriftSnapshotResponse,
} from "@/lib/ensemble-client";

// ============================================================================
// Constants
// ============================================================================

const ALERT_COLORS: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  normal: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle2 },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: AlertTriangle },
  critical: { bg: "bg-red-500/10", text: "text-red-500", icon: XCircle },
};

const MODEL_COLORS: Record<string, string> = {
  "bge-base": "#3b82f6",
  nomic: "#10b981",
  minilm: "#f59e0b",
  "gte-base": "#8b5cf6",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ============================================================================
// Page Component
// ============================================================================

export default function DriftPage() {
  const [latest, setLatest] = useState<DriftLatestResponse | null>(null);
  const [history, setHistory] = useState<DriftHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [latestData, historyData] = await Promise.all([
        ensembleApi.drift.getLatest(),
        ensembleApi.drift.getHistory({
          modelId: selectedModel === "all" ? undefined : selectedModel,
          limit: 200,
        }),
      ]);
      setLatest(latestData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch drift data");
    } finally {
      setLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await ensembleApi.drift.analyze();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // Transform history data for recharts
  const chartData = history?.snapshots
    ? [...history.snapshots]
        .reverse()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((acc: any[], snap) => {
          const timeKey = formatDate(snap.createdAt);
          let existing = acc.find((d) => d.time === timeKey);
          if (!existing) {
            existing = { time: timeKey };
            acc.push(existing);
          }
          existing[`${snap.modelId}_avg`] = snap.avgDrift;
          existing[`${snap.modelId}_max`] = snap.maxDrift;
          return acc;
        }, [])
    : [];

  const models = latest?.perModel?.map((m) => m.modelId) ?? [];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Embedding Drift</h1>
          <p className="text-muted-foreground">
            Track embedding quality over time and surface drift alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Analyze Now
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {latest?.perModel && latest.perModel.length > 0 ? (
          latest.perModel.map((model) => {
            const alertConfig = ALERT_COLORS[model.alertLevel] ?? ALERT_COLORS.normal;
            const AlertIcon = alertConfig.icon;
            return (
              <Card key={model.modelId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {model.modelId}
                    </CardTitle>
                    <Badge className={`${alertConfig.bg} ${alertConfig.text} border-0`}>
                      <AlertIcon className="mr-1 h-3 w-3" />
                      {model.alertLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Drift</span>
                      <span className="font-mono font-medium">
                        {model.avgDrift.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max Drift</span>
                      <span className="font-mono font-medium">
                        {model.maxDrift.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Samples</span>
                      <span className="font-mono">{model.sampleCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p>No drift data yet. Run an analysis to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drift Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drift Over Time</CardTitle>
            <CardDescription>
              Average cosine drift per model
              {latest?.thresholds && (
                <span className="ml-2 text-xs">
                  (warning: {latest.thresholds.drift}, critical: {latest.thresholds.alert})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {/* Threshold lines */}
                {latest?.thresholds && (
                  <>
                    <Line
                      type="monotone"
                      dataKey={() => latest.thresholds.drift}
                      stroke="#eab308"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name="Warning"
                      legendType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey={() => latest.thresholds.alert}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name="Critical"
                      legendType="none"
                    />
                  </>
                )}
                {models.map((model) => (
                  <Line
                    key={model}
                    type="monotone"
                    dataKey={`${model}_avg`}
                    stroke={MODEL_COLORS[model] ?? "#888"}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={`${model} (avg)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Snapshots Table */}
      {history && history.snapshots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Snapshots</CardTitle>
            <CardDescription>
              {history.count} drift snapshots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Avg Drift</TableHead>
                  <TableHead>Max Drift</TableHead>
                  <TableHead>Samples</TableHead>
                  <TableHead>Alert Level</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.snapshots.slice(0, 50).map((snap) => {
                  const alertConfig =
                    ALERT_COLORS[snap.alertLevel] ?? ALERT_COLORS.normal;
                  return (
                    <TableRow key={snap.id}>
                      <TableCell className="font-medium">
                        {snap.modelId}
                      </TableCell>
                      <TableCell className="font-mono">
                        {snap.avgDrift.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {snap.maxDrift.toFixed(4)}
                      </TableCell>
                      <TableCell>{snap.sampleCount}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${alertConfig.bg} ${alertConfig.text} border-0`}
                        >
                          {snap.alertLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(snap.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
