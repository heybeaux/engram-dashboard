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
} from "lucide-react";
import { useInstance } from "@/context/instance-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.openengram.ai";

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
}

interface SyncResult {
  syncedCount: number;
  errorCount: number;
  lastSyncedAt: string | null;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export default function CloudSettingsPage() {
  const { mode, features, refreshInstance } = useInstance();
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
      // Silent — sync status is supplementary
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status?.linked && features.cloudBackup) {
      fetchSyncStatus();
    }
  }, [status?.linked, features.cloudBackup, fetchSyncStatus]);

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

  if (mode !== "self-hosted") {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Cloud Link</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <Cloud className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              You&apos;re already running on OpenEngram Cloud. No linking needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        /* ── Linked State ───────────────────────────────────────────── */
        <>
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
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{status.email}</p>
                  </div>
                )}
                {status.plan && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm capitalize">{status.plan}</p>
                  </div>
                )}
                {status.lastVerified && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Verified</p>
                    <p className="text-sm">
                      {new Date(status.lastVerified).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
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
                      <Button
                        variant="outline"
                        onClick={() => setShowDisconnect(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                      >
                        {disconnecting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Disconnect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* ── Cloud Backup Sync ─────────────────────────────────── */}
          {features.cloudBackup && syncStatus && (
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Cloud Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sync progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {syncStatus.syncedCount} of {syncStatus.totalMemories} memories synced
                    </span>
                    {syncStatus.pendingCount > 0 && (
                      <span className="text-muted-foreground">
                        {syncStatus.pendingCount} pending
                      </span>
                    )}
                  </div>
                  <Progress
                    value={
                      syncStatus.totalMemories > 0
                        ? (syncStatus.syncedCount / syncStatus.totalMemories) * 100
                        : 0
                    }
                  />
                  {syncStatus.lastSyncedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(syncStatus.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Sync result */}
                {syncResult && (
                  <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>
                      Synced {syncResult.syncedCount} memories
                      {syncResult.errorCount > 0 && (
                        <span className="text-destructive">
                          {" "}({syncResult.errorCount} errors)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {/* Sync Now button */}
                  <Button
                    onClick={handleSync}
                    disabled={syncing || syncStatus.pendingCount === 0}
                  >
                    {syncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {syncing ? "Syncing..." : "Sync Now"}
                  </Button>

                  {/* Auto-sync toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={syncStatus.autoSync}
                      onCheckedChange={handleToggleAutoSync}
                      disabled={togglingAutoSync}
                    />
                    <span className="text-sm">Auto-sync new memories</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* ── Not Linked State ───────────────────────────────────────── */
        <>
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
        </>
      )}
    </div>
  );
}
