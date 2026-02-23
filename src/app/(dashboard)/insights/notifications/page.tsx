"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellOff,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Globe,
  Key,
} from "lucide-react";
import {
  getNotificationConfig,
  saveNotificationConfig,
  type NotificationConfig,
  type NotificationEvent,
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

export default function NotificationSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig>({
    enabled: false,
    confidenceThreshold: 0.7,
    webhookUrl: "",
    hmacSecret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [history, setHistory] = useState<NotificationEvent[]>([]);
  const [webhookError, setWebhookError] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getNotificationConfig();
      setConfig(data.config || {
        enabled: data.enabled ?? false,
        confidenceThreshold: data.confidenceThreshold ?? 0.7,
        webhookUrl: data.webhookUrl ?? "",
        hmacSecret: data.hmacSecret ?? "",
      });
      if (data.history) setHistory(data.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const validateWebhook = (url: string): boolean => {
    if (!url) {
      setWebhookError("");
      return true;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        setWebhookError("URL must use HTTPS");
        return false;
      }
      setWebhookError("");
      return true;
    } catch {
      setWebhookError("Invalid URL format");
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateWebhook(config.webhookUrl)) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveNotificationConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!validateWebhook(config.webhookUrl)) return;
    setTesting(true);
    setTestResult(null);
    try {
      await saveNotificationConfig({ ...config, test: true });
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-9 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" />
            Notification Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how you receive insight notifications
          </p>
        </div>
        <Badge variant={config.enabled ? "default" : "secondary"} className="w-fit">
          {config.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Config */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">
                Send webhook notifications for new insights
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig((c) => ({ ...c, enabled }))}
            />
          </div>

          {/* Confidence threshold */}
          <div>
            <label className="text-sm font-medium">
              Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(0)}%
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Only send notifications for insights above this confidence level
            </p>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={config.confidenceThreshold}
              onChange={(e) =>
                setConfig((c) => ({ ...c, confidenceThreshold: parseFloat(e.target.value) }))
              }
              className="w-full max-w-md"
            />
            <div className="flex justify-between text-xs text-muted-foreground max-w-md">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Webhook URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/webhook"
              value={config.webhookUrl}
              onChange={(e) => {
                setConfig((c) => ({ ...c, webhookUrl: e.target.value }));
                validateWebhook(e.target.value);
              }}
              className="mt-1 max-w-full md:max-w-lg"
            />
            {webhookError && (
              <p className="text-xs text-destructive mt-1">{webhookError}</p>
            )}
          </div>

          {/* HMAC Secret */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5" />
              HMAC Secret
            </label>
            <div className="relative mt-1 max-w-full md:max-w-lg">
              <Input
                type={showSecret ? "text" : "password"}
                placeholder="Optional signing secret"
                value={config.hmacSecret}
                onChange={(e) => setConfig((c) => ({ ...c, hmacSecret: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Used to sign webhook payloads with HMAC-SHA256
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !!webhookError}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : null}
              {saved ? "Saved" : "Save Settings"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !config.webhookUrl || !!webhookError}
            >
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Test Notification
            </Button>
          </div>
          {testResult === "success" && (
            <p className="text-sm text-green-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Test notification sent successfully
            </p>
          )}
          {testResult === "error" && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Test notification failed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="py-6 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {event.status === "sent" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className="capitalize">{event.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(event.sentAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
