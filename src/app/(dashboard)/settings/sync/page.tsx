"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cloud,
  CloudOff,

  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeftRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

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
  return `${Math.floor(hours / 24)}d ago`;
}

interface CloudStatus {
  linked: boolean;
  email?: string;
  plan?: string;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  totalMemories: number;
  syncedCount: number;
  pendingCount: number;
  autoSync: boolean;
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

export default function SyncStatusPage() {
  const [cloudStatus, setCloudStatus] = useState<CloudStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [history, setHistory] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingAutoSync, setTogglingAutoSync] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cloudRes, syncRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/v1/cloud/status`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/cloud/sync/status`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/cloud/sync/history`, { headers: getAuthHeaders() }),
      ]);

      if (cloudRes.ok) setCloudStatus(await cloudRes.json());
      if (syncRes.ok) setSyncStatus(await syncRes.json());
      if (historyRes.ok) setHistory(await historyRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleAutoSync = async (enabled: boolean) => {
    setTogglingAutoSync(true);
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync/auto-sync`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      setSyncStatus((prev) => (prev ? { ...prev, autoSync: enabled } : prev));
    } catch {
      setError("Failed to toggle auto-sync");
    } finally {
      setTogglingAutoSync(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const syncPercent =
    syncStatus && syncStatus.totalMemories > 0
      ? (syncStatus.syncedCount / syncStatus.totalMemories) * 100
      : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-7 w-7 text-primary" />
            Sync Status
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor cloud synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings/sync/reconcile">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconcile
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            {cloudStatus?.linked ? (
              <Cloud className="h-4 w-4 text-primary" />
            ) : (
              <CloudOff className="h-4 w-4 text-muted-foreground" />
            )}
            Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge
              variant={cloudStatus?.linked ? "default" : "secondary"}
              className={
                cloudStatus?.linked
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : ""
              }
            >
              {cloudStatus?.linked ? "Connected" : "Disconnected"}
            </Badge>
            {cloudStatus?.email && (
              <span className="text-sm text-muted-foreground">{cloudStatus.email}</span>
            )}
            {!cloudStatus?.linked && (
              <Link href="/settings/cloud">
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {syncStatus && (
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">Sync Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{syncStatus.totalMemories.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {syncStatus.syncedCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Synced</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {syncStatus.pendingCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={syncPercent} />
              <p className="text-xs text-muted-foreground text-right">
                {syncPercent.toFixed(1)}% synced
              </p>
            </div>

            {syncStatus.lastSyncedAt && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last synced: {timeAgo(syncStatus.lastSyncedAt)}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm font-medium">Auto-sync</p>
                <p className="text-xs text-muted-foreground">
                  Automatically sync new memories to cloud
                </p>
              </div>
              <Switch
                checked={syncStatus.autoSync}
                onCheckedChange={handleToggleAutoSync}
                disabled={togglingAutoSync}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Sync History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No sync events yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice(0, 20).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {event.status === "completed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span className="text-xs capitalize">{event.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{event.totalCount}</TableCell>
                      <TableCell className="text-right">{event.newCount}</TableCell>
                      <TableCell className="text-right">{event.updatedCount}</TableCell>
                      <TableCell className="text-right">
                        {event.failedCount > 0 ? (
                          <span className="text-destructive">{event.failedCount}</span>
                        ) : (
                          0
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {event.durationMs ? `${(event.durationMs / 1000).toFixed(1)}s` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(event.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
