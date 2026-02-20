"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  HardDrive,
  Cloud,
  ArrowLeftRight,
  Loader2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api-config";

const API_BASE = getApiBaseUrl();

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

interface PreviewData {
  localOnly: number;
  cloudOnly: number;
  shared: number;
}

interface ReconcileResult {
  pushed: number;
  pulled: number;
  errors: number;
  durationMs: number;
}

const steps = ["Preview", "Options", "Execute", "Results"];

type Strategy = "push-all" | "pull-all" | "selective";

export default function ReconcilePage() {
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>("push-all");
  const [progress, setProgress] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState("");

  const fetchPreview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/cloud/reconcile/preview`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreview(data);
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch preview");
    } finally {
      setLoading(false);
    }
  };

  const executeReconcile = async () => {
    setExecuting(true);
    setProgress(0);
    setError("");
    setStep(2);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 500);

    try {
      const res = await fetch(`${API_BASE}/v1/cloud/reconcile`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ strategy }),
      });
      clearInterval(interval);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setProgress(100);
      setTimeout(() => setStep(3), 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Reconciliation failed");
    } finally {
      setExecuting(false);
    }
  };

  const reset = () => {
    setStep(0);
    setPreview(null);
    setStrategy("push-all");
    setProgress(0);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Reconciliation</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:inline",
                i <= step ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("h-px w-8 mx-1", i < step ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Step 0: Start / Preview */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview Differences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compare your local memories with the cloud to identify discrepancies.
            </p>
            <Button onClick={fetchPreview} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />}
              Analyze Differences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Preview Results + Options */}
      {step === 1 && preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Differences Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <HardDrive className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{preview.localOnly}</p>
                  <p className="text-xs text-muted-foreground">Local only</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Cloud className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{preview.cloudOnly}</p>
                  <p className="text-xs text-muted-foreground">Cloud only</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <ArrowLeftRight className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{preview.shared}</p>
                  <p className="text-xs text-muted-foreground">Shared</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Strategy</p>
              {(["push-all", "pull-all", "selective"] as const).map((s) => (
                <label
                  key={s}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    strategy === s ? "border-primary bg-primary/5" : "hover:bg-muted"
                  )}
                >
                  <input
                    type="radio"
                    name="strategy"
                    checked={strategy === s}
                    onChange={() => setStrategy(s)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium capitalize">{s.replace("-", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {s === "push-all" && "Push all local memories to cloud"}
                      {s === "pull-all" && "Pull all cloud memories to local"}
                      {s === "selective" && "Choose which memories to sync"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={executeReconcile}>
                Execute
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Executing */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reconciling...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              {executing ? "Processing memories..." : "Finishing up..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Reconciliation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.pushed}</p>
                <p className="text-xs text-muted-foreground">Pushed</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{result.pulled}</p>
                <p className="text-xs text-muted-foreground">Pulled</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className={cn("text-2xl font-bold", result.errors > 0 ? "text-red-600" : "text-muted-foreground")}>
                  {result.errors}
                </p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Completed in {(result.durationMs / 1000).toFixed(1)}s
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
