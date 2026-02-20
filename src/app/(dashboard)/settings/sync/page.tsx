"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import { EmptyState } from "@/components/identity";
import { getApiBaseUrl } from "@/lib/api-config";

const API_BASE = getApiBaseUrl();

interface SyncDashboard {
  pendingCount: number;
  lastPushAt: string | null;
  lastPullAt: string | null;
  autoSync: boolean;
  syncing: boolean;
}

interface SyncError {
  id: string;
  direction: string;
  error: string;
  createdAt: string;
}

interface SyncEvent {
  id: string;
  direction: string;
  status: string;
  totalCount: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  error: string | null;
  durationMs: number | null;
  createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const apiKey = process.env.NEXT_PUBLIC_ENGRAM_API_KEY || "";
  const userId = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || "Beaux";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["X-AM-API-Key"] = apiKey;
  headers["X-AM-User-ID"] = userId;
  return headers;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SyncStatusPage() {
  const [dashboard, setDashboard] = useState<SyncDashboard | null>(null);
  const [errors, setErrors] = useState<SyncError[]>([]);
  const [history, setHistory] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/v1/cloud/sync/status`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/cloud/sync/history`, { headers: getAuthHeaders() }),
      ]);
      if (statusRes.ok) {
        const data = await statusRes.json();
        setDashboard({
          pendingCount: data.pendingCount ?? 0,
          lastPushAt: data.lastSyncedAt ?? null,
          lastPullAt: data.lastPullAt ?? null,
          autoSync: data.autoSync ?? false,
          syncing: data.syncing ?? false,
        });
      }
      if (historyRes.ok) {
        const events: SyncEvent[] = await historyRes.json();
        setHistory(events);
        setErrors(
          events
            .filter((e) => e.status === "failed" && e.error)
            .slice(0, 10)
            .map((e) => ({ id: e.id, direction: e.direction, error: e.error!, createdAt: e.createdAt }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handlePush = async () => {
    setPushing(true);
    try {
      await fetch(`${API_BASE}/v1/cloud/sync`, { method: "POST", headers: getAuthHeaders() });
      await fetchAll();
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async () => {
    setPulling(true);
    try {
      await fetch(`${API_BASE}/v1/cloud/sync/pull`, { method: "POST", headers: getAuthHeaders() });
      await fetchAll();
    } finally {
      setPulling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Sync Status</h1>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{dashboard?.pendingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Pending changes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">
                  {dashboard?.lastPushAt ? timeAgo(dashboard.lastPushAt) : "Never"}
                </p>
                <p className="text-xs text-muted-foreground">Last push</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">
                  {dashboard?.lastPullAt ? timeAgo(dashboard.lastPullAt) : "Never"}
                </p>
                <p className="text-xs text-muted-foreground">Last pull</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handlePush} disabled={pushing || pulling}>
          {pushing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Push to Cloud
        </Button>
        <Button variant="outline" onClick={handlePull} disabled={pushing || pulling}>
          {pulling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Pull from Cloud
        </Button>
      </div>

      {/* Error Log */}
      {errors.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Recent Sync Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((err) => (
                <div key={err.id} className="flex items-start gap-2 rounded-md border border-destructive/20 p-2 text-sm">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-destructive truncate">{err.error}</p>
                    <p className="text-xs text-muted-foreground">
                      {err.direction} · {timeAgo(err.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Sync History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState title="No sync history" description="Push or pull to start syncing." />
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {event.status === "completed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.direction}
                    </Badge>
                    <span>
                      {event.status === "completed"
                        ? `${event.totalCount} synced (${event.newCount} new, ${event.updatedCount} updated)`
                        : event.error ?? "Failed"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {timeAgo(event.createdAt)}
                    {event.durationMs != null && ` · ${(event.durationMs / 1000).toFixed(1)}s`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
