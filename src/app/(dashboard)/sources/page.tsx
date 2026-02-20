"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Settings2,
  Unplug,
  CheckCircle2,
  AlertCircle,
  Radio,
  Activity,
  Clock,
  Rss,
  XCircle,
} from "lucide-react";

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

interface Source {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: "connected" | "disconnected" | "error";
  signalCount: number;
  lastSyncAt: string | null;
  config?: Record<string, string>;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Configure modal
  const [configuring, setConfiguring] = useState<Source | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Disconnect dialog
  const [disconnecting, setDisconnecting] = useState<Source | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // Toggling
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/sources`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSources(Array.isArray(data) ? data : data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleToggle = async (source: Source, enabled: boolean) => {
    setTogglingId(source.id);
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/sources/${source.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, enabled } : s))
      );
    } catch {
      setError("Failed to toggle source");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!configuring) return;
    setSavingConfig(true);
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/sources/${configuring.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ config: configValues }),
      });
      if (!res.ok) throw new Error("Failed");
      setSources((prev) =>
        prev.map((s) =>
          s.id === configuring.id ? { ...s, config: configValues } : s
        )
      );
      setConfiguring(null);
    } catch {
      setError("Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnecting) return;
    setConfirmDisconnect(true);
    try {
      const res = await fetch(`${API_BASE}/v1/awareness/sources/${disconnecting.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      setSources((prev) => prev.filter((s) => s.id !== disconnecting.id));
      setDisconnecting(null);
    } catch {
      setError("Failed to disconnect source");
    } finally {
      setConfirmDisconnect(false);
    }
  };

  const statusIcon = (status: Source["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusColor = (status: Source["status"]) => {
    switch (status) {
      case "connected":
        return "text-green-600 border-green-600/30";
      case "error":
        return "text-destructive border-destructive/30";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Rss className="h-7 w-7 text-primary" />
            Signal Sources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage data sources feeding into awareness
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No signal sources configured</p>
            <p className="text-xs text-muted-foreground mt-1">
              Signal sources will appear here once configured in your Engram instance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {statusIcon(source.status)}
                    {source.name}
                  </CardTitle>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(enabled) => handleToggle(source, enabled)}
                    disabled={togglingId === source.id}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {source.type}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${statusColor(source.status)}`}>
                    {source.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Signals
                    </p>
                    <p className="font-medium">{source.signalCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Sync
                    </p>
                    <p className="font-medium">
                      {source.lastSyncAt ? timeAgo(source.lastSyncAt) : "Never"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setConfiguring(source);
                      setConfigValues(source.config || {});
                    }}
                  >
                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDisconnecting(source)}
                  >
                    <Unplug className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configure Modal */}
      <Dialog open={!!configuring} onOpenChange={(open) => !open && setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configuring?.name}</DialogTitle>
            <DialogDescription>
              Update the configuration for this signal source.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {configuring?.config &&
              Object.keys(configuring.config).map((key) => (
                <div key={key}>
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </label>
                  <Input
                    value={configValues[key] || ""}
                    onChange={(e) =>
                      setConfigValues((v) => ({ ...v, [key]: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              ))}
            {(!configuring?.config || Object.keys(configuring.config).length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No configurable options for this source.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguring(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={savingConfig}>
              {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation */}
      <Dialog open={!!disconnecting} onOpenChange={(open) => !open && setDisconnecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {disconnecting?.name}?</DialogTitle>
            <DialogDescription>
              This will remove the signal source and stop collecting data from it.
              Existing signals are not deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={confirmDisconnect}
            >
              {confirmDisconnect && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
