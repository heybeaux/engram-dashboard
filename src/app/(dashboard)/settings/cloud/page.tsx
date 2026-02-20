"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Cloud,
  CloudOff,
  Loader2,
  RefreshCw,
  Unplug,
  Plug,
  AlertCircle,
  CheckCircle2,
  Layers,
  HardDrive,
  ArrowLeftRight,
  Upload,
  Clock,
  Monitor,
} from "lucide-react";
import { useInstance } from "@/context/instance-context";
import { getApiBaseUrl } from '@/lib/api-config';
import { useAuth } from '@/lib/auth-context';

const API_BASE = getApiBaseUrl();

interface CloudStatus {
  linked: boolean;
  plan?: string;
  email?: string;
  lastVerified?: string;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  totalMemories: number;
  syncedCount: number;
  pendingCount: number;
  autoSync: boolean;
  syncing: boolean;
  progress?: { synced: number; total: number };
}

interface SyncResult {
  syncedCount: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  lastSyncedAt: string | null;
  durationMs: number;
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

interface CloudInstance {
  id: string;
  instanceId: string;
  instanceName: string | null;
  lastSyncAt: string | null;
  memoryCount: number;
  lastPushCount: number;
  status: string;
  createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }
  const apiKey = process.env.NEXT_PUBLIC_ENGRAM_API_KEY || "";
  const { user } = useAuth();
  const userId = user?.id || "default";
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
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CloudSettingsPage() {
  return <CloudSettingsPageContent />;
}

function CloudSettingsPageContent() {
  const { mode, refreshInstance } = useInstance();
  const [status, setStatus] = useState<CloudStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Link form
  const [apiKey, setApiKey] = useState("");
  const [linking, setLinking] = useState(false);

  // Refresh
  const [refreshing, setRefreshing] = useState(false);

  // Disconnect
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Sync
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [togglingAutoSync, setTogglingAutoSync] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncEvent[]>([]);
  const [pulling, setPulling] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pullResult, setPullResult] = useState<{
    pulled?: number;
    message?: string;
    durationMs?: number;
    newCount?: number;
    updatedCount?: number;
    skippedCount?: number;
    deletedCount?: number;
  } | null>(null);

  // Cloud instances (for cloud edition)
  const [instances, setInstances] = useState<CloudInstance[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/v1/cloud/status`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cloud status");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync/status`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSyncStatus(data);
    } catch {
      // Silent
    }
  }, []);

  const fetchSyncHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync/history`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSyncHistory(data);
    } catch {
      // Silent
    }
  }, []);

  const fetchInstances = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/sync/instances`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setInstances(data);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status?.linked) {
      fetchSyncStatus();
      fetchSyncHistory();
    }
  }, [status?.linked, fetchSyncStatus, fetchSyncHistory]);

  // For cloud edition, fetch connected instances
  useEffect(() => {
    if (mode === "cloud") {
      fetchInstances();
    }
  }, [mode, fetchInstances]);

  // Poll sync status while syncing
  useEffect(() => {
    if (!syncing) return;
    const interval = setInterval(fetchSyncStatus, 2000);
    return () => clearInterval(interval);
  }, [syncing, fetchSyncStatus]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Sync failed");
        return;
      }
      setSyncResult(data);
      await fetchSyncStatus();
      await fetchSyncHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoSync = async (enabled: boolean) => {
    setTogglingAutoSync(true);
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync/auto-sync`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to toggle auto-sync");
        return;
      }
      setSyncStatus((prev) => prev ? { ...prev, autoSync: enabled } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle auto-sync");
    } finally {
      setTogglingAutoSync(false);
    }
  };

  const handlePull = async () => {
    setPulling(true);
    setPullResult(null);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/sync/pull`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Pull failed");
        return;
      }
      setPullResult(data);
      await fetchSyncStatus();
      await fetchSyncHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pull failed");
    } finally {
      setPulling(false);
    }
  };

  const handleLink = async () => {
    if (!apiKey.trim()) return;
    setLinking(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/link`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Failed to link — check your API key");
        return;
      }
      setApiKey("");
      await fetchStatus();
      await refreshInstance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLinking(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/refresh`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to refresh");
        return;
      }
      await fetchStatus();
      await refreshInstance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/link`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to disconnect");
        return;
      }
      setShowDisconnect(false);
      await fetchStatus();
      await refreshInstance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setDisconnecting(false);
    }
  };

  // ── Cloud Edition: Show connected instances ──
  if (mode === "cloud") {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Connected Instances</h1>

        {instances.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Monitor className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No local instances have synced to this cloud account yet.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Link a self-hosted Engram instance to see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {instances.map((inst) => {
              const isStale = inst.lastSyncAt && 
                Date.now() - new Date(inst.lastSyncAt).getTime() > 3 * 24 * 60 * 60 * 1000;
              return (
                <Card key={inst.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {inst.instanceName || "Unnamed Instance"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {inst.instanceId.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isStale ? "secondary" : "outline"} className={
                          isStale 
                            ? "text-yellow-600" 
                            : "text-green-600 border-green-600/30"
                        }>
                          {isStale ? "Stale" : "Active"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Memories</p>
                        <p className="font-medium">{inst.memoryCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Push</p>
                        <p className="font-medium">{inst.lastPushCount} new</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Sync</p>
                        <p className="font-medium">
                          {inst.lastSyncAt ? timeAgo(inst.lastSyncAt) : "Never"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Self-Hosted Edition ──
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Cloud Link</h1>
        {status?.linked && (
          <Badge variant="outline" className="w-fit gap-1.5 text-green-600 border-green-600/30">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      ) : status?.linked ? (
        <>
          {/* ── Connection Details ── */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                Connection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {status.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account</p>
                    <p className="text-sm">{status.email}</p>
                  </div>
                )}
                {status.plan && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <Badge variant="outline" className="capitalize">{status.plan}</Badge>
                  </div>
                )}
                {status.lastVerified && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Verified</p>
                    <p className="text-sm">{timeAgo(status.lastVerified)}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Status
                </Button>

                <Dialog open={showDisconnect} onOpenChange={setShowDisconnect}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Unplug className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Disconnect from Cloud?</DialogTitle>
                      <DialogDescription>
                        This will remove the cloud link. Cloud features like backup,
                        sync, and ensemble models will be disabled. Your local data
                        is not affected.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDisconnect(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
                        {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Disconnect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* ── Cloud Sync ── */}
          {syncStatus && (
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Cloud Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {syncing && syncStatus.progress 
                        ? `Syncing... ${syncStatus.progress.synced} of ${syncStatus.progress.total}`
                        : `${syncStatus.syncedCount.toLocaleString()} of ${syncStatus.totalMemories.toLocaleString()} memories synced`
                      }
                    </span>
                    {syncStatus.pendingCount > 0 && !syncing && (
                      <span className="text-muted-foreground text-xs">
                        {syncStatus.pendingCount.toLocaleString()} pending
                      </span>
                    )}
                  </div>
                  <Progress
                    value={
                      syncing && syncStatus.progress && syncStatus.progress.total > 0
                        ? (syncStatus.progress.synced / syncStatus.progress.total) * 100
                        : syncStatus.totalMemories > 0
                        ? (syncStatus.syncedCount / syncStatus.totalMemories) * 100
                        : 0
                    }
                  />
                  {syncStatus.lastSyncedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {timeAgo(syncStatus.lastSyncedAt)}
                    </p>
                  )}
                </div>

                {/* Sync result */}
                {syncResult && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium">
                        Synced {syncResult.syncedCount.toLocaleString()} memories
                        {syncResult.durationMs && (
                          <span className="text-muted-foreground font-normal">
                            {" "}in {(syncResult.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {syncResult.newCount} new, {syncResult.updatedCount} updated, {syncResult.skippedCount} unchanged
                      {syncResult.errorCount > 0 && (
                        <span className="text-destructive"> · {syncResult.errorCount} failed</span>
                      )}
                    </p>
                  </div>
                )}

                {pullResult && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-medium">
                        Pulled from cloud
                        {pullResult.durationMs && (
                          <span className="text-muted-foreground font-normal">
                            {" "}in {(pullResult.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {pullResult.newCount} new, {pullResult.updatedCount} updated, {pullResult.skippedCount} unchanged, {pullResult.deletedCount} deleted
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button onClick={handleSync} disabled={syncing || syncStatus.pendingCount === 0}>
                    {syncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {syncing ? "Syncing..." : "Push to Cloud"}
                  </Button>

                  <Button variant="outline" onClick={handlePull} disabled={pulling || syncing}>
                    {pulling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                    )}
                    {pulling ? "Pulling..." : "Pull from Cloud"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={syncStatus.autoSync}
                      onCheckedChange={handleToggleAutoSync}
                      disabled={togglingAutoSync}
                    />
                    <span className="text-sm">Auto-sync</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Sync History ── */}
          {syncHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Sync History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {syncHistory.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {event.status === "completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <span>
                          {event.status === "completed" 
                            ? `${event.totalCount} synced`
                            : "Failed"
                          }
                        </span>
                        {event.status === "completed" && (
                          <span className="text-xs text-muted-foreground">
                            ({event.newCount} new, {event.updatedCount} updated, {event.skippedCount} unchanged
                            {event.failedCount > 0 && `, ${event.failedCount} failed`})
                          </span>
                        )}
                        {event.error && (
                          <span className="text-xs text-destructive">{event.error}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {timeAgo(event.createdAt)}
                        {event.durationMs && ` · ${(event.durationMs / 1000).toFixed(1)}s`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* ── Not Linked State ── */
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-muted-foreground" />
              Connect to OpenEngram Cloud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Link your self-hosted instance to OpenEngram Cloud to unlock additional features.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Layers className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Ensemble Models</p>
                  <p className="text-xs text-muted-foreground">
                    Access cloud-hosted embedding &amp; ranking models
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <HardDrive className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Cloud Backup</p>
                  <p className="text-xs text-muted-foreground">
                    Automatic encrypted backups of your memory store
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <ArrowLeftRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Cross-Device Sync</p>
                  <p className="text-xs text-muted-foreground">
                    Sync memories across multiple Engram instances
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">OpenEngram Cloud API Key</label>
              <div className="flex gap-2 max-w-full md:max-w-lg">
                <Input
                  type="password"
                  placeholder="eng_cloud_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLink()}
                />
                <Button onClick={handleLink} disabled={linking || !apiKey.trim()}>
                  {linking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="mr-2 h-4 w-4" />
                  )}
                  Connect
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://app.openengram.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  app.openengram.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
