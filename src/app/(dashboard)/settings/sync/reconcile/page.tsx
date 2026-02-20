"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  HardDrive,
  Cloud,
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

interface PreviewData {
  localOnly: number;
  cloudOnly: number;
  shared: number;
  conflicts: number;
}

interface ReconcileResult {
  merged: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  durationMs: number;
}

type Step = "preview" | "confirm" | "executing" | "results";

export default function ReconcilePage() {
  const [step, setStep] = useState<Step>("preview");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handlePreview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/reconcile/preview`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to generate preview");
      const data = await res.json();
      setPreview(data);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setStep("executing");
    setError("");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const res = await fetch(`${API_BASE}/v1/cloud/reconcile/execute`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      clearInterval(interval);
      if (!res.ok) throw new Error("Reconciliation failed");
      const data = await res.json();
      setResult(data);
      setProgress(100);
      setStep("results");
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Reconciliation failed");
      setStep("confirm");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings/sync">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <RefreshCw className="h-7 w-7 text-primary" />
            Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sync and merge differences between local and cloud
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-sm">
        {(["preview", "confirm", "executing", "results"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <Badge
              variant={step === s ? "default" : "outline"}
              className={
                (["preview", "confirm", "executing", "results"] as Step[]).indexOf(step) > i
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : ""
              }
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </Badge>
          </div>
        ))}
      </div>

      {/* Step 1: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Step 1: Preview Differences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan and compare your local memories with the cloud to identify differences.
            </p>
            <Button onClick={handlePreview} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowLeftRight className="mr-2 h-4 w-4" />
              )}
              Generate Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Confirm */}
      {step === "confirm" && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Step 2: Review &amp; Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <HardDrive className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{preview.localOnly}</p>
                  <p className="text-xs text-muted-foreground">Local only</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Cloud className="h-8 w-8 text-purple-500 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{preview.cloudOnly}</p>
                  <p className="text-xs text-muted-foreground">Cloud only</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <ArrowLeftRight className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{preview.shared}</p>
                  <p className="text-xs text-muted-foreground">Shared</p>
                </div>
              </div>
            </div>

            {preview.conflicts > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-orange-500/10 p-3 text-sm text-orange-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {preview.conflicts} conflicts detected — most recent version will be kept
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleExecute}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Reconciliation
              </Button>
              <Button variant="outline" onClick={() => setStep("preview")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Executing */}
      {step === "executing" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Step 3: Reconciling...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm">Merging memories between local and cloud...</p>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-right">
              {progress.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === "results" && result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Reconciliation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold text-green-600">{result.created}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{result.updated}</p>
                <p className="text-xs text-muted-foreground">Updated</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold text-purple-600">{result.merged}</p>
                <p className="text-xs text-muted-foreground">Merged</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xl font-bold">{result.skipped}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>

            {result.errors > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {result.errors} errors during reconciliation
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Completed in {(result.durationMs / 1000).toFixed(1)}s
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/settings/sync">
                <Button>Back to Sync</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("preview");
                  setPreview(null);
                  setResult(null);
                }}
              >
                Run Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
