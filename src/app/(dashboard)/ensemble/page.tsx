"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  XCircle,
  Layers,
  BarChart3,
  RefreshCw,
  Play,
  Loader2,
  Activity,
  Zap,
  Database,
} from "lucide-react";
import {
  EnsembleStatusResponse,
  ModelRegistryEntry,
  EmbeddingCoverageResponse,
  ABTestResults,
  ReembedJob,
  MODEL_CONFIGS,
  ModelStatus,
} from "@/lib/ensemble-types";
import { ensembleApi } from "@/lib/ensemble-client";

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const statusColors: Record<ModelStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-500", label: "Active" },
  shadow: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Shadow" },
  deprecated: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Deprecated" },
  disabled: { bg: "bg-muted", text: "text-muted-foreground", label: "Disabled" },
};

const jobStatusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: "bg-green-500/10", text: "text-green-500" },
  running: { bg: "bg-blue-500/10", text: "text-blue-500" },
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  failed: { bg: "bg-red-500/10", text: "text-red-500" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground" },
};

// ============================================================================
// Model Registry Section
// ============================================================================

function ModelRegistrySection({
  models,
  ensembleConfig,
  loading,
}: {
  models: ModelRegistryEntry[];
  ensembleConfig: EnsembleStatusResponse | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Model Registry
        </CardTitle>
        <CardDescription>
          Configured embedding models and their RRF fusion weights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Quality Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => {
              const statusStyle = statusColors[model.status];
              const config = MODEL_CONFIGS[model.modelId];
              const qualityScore = model.qualityMetrics.correlationWithGoldStandard;
              
              return (
                <TableRow key={model.modelId}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{model.modelId}</span>
                      {config?.queryPrefix && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uses query prefix
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{config?.dimensions || "—"}</TableCell>
                  <TableCell>
                    <span className="font-mono">{model.weight.toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {qualityScore > 0 ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${qualityScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(qualityScore * 100).toFixed(0)}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {ensembleConfig && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Ensemble Configuration</h4>
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <span className="text-muted-foreground">RRF Constant (k):</span>
                <span className="ml-2 font-mono">{ensembleConfig.config.rrfK}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Consensus Boost:</span>
                <span className="ml-2">
                  {ensembleConfig.config.consensusBoostEnabled ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Enabled ({ensembleConfig.config.consensusBoostFactor}x)
                    </Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Active Models:</span>
                <span className="ml-2 font-mono">{ensembleConfig.models.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Coverage Stats Section
// ============================================================================

function CoverageStatsSection({
  coverage,
  loading,
}: {
  coverage: EmbeddingCoverageResponse | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coverage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Embedding Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coverage statistics not available. This endpoint may not be implemented yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Embedding Coverage
        </CardTitle>
        <CardDescription>
          Percentage of memories with embeddings from each model
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Memories</p>
            <p className="text-2xl font-bold">{coverage.totalMemories.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Models Configured</p>
            <p className="text-2xl font-bold">{coverage.modelsConfigured}</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Full Coverage</p>
            <p className="text-2xl font-bold text-green-500">
              {coverage.fullCoveragePercentage.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Memories with All Models</p>
            <p className="text-2xl font-bold">{coverage.fullCoverageCount.toLocaleString()}</p>
          </div>
        </div>

        {/* Per-Model Coverage */}
        <div className="space-y-3">
          {coverage.perModel.map((model) => (
            <div key={model.model} className="flex items-center gap-4">
              <div className="w-24">
                <span className="font-medium text-sm">{model.model}</span>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${model.coveragePercentage}%` }}
                  />
                </div>
              </div>
              <div className="w-32 text-right text-sm">
                <span className="font-mono">{model.coveragePercentage.toFixed(1)}%</span>
                <span className="text-muted-foreground ml-2">
                  ({model.embeddedCount.toLocaleString()})
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// A/B Test Results Section
// ============================================================================

function ABTestResultsSection({
  results,
  loading,
}: {
  results: ABTestResults | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            A/B Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A/B test results not available. Enable shadow mode testing to collect data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          A/B Test Results
        </CardTitle>
        <CardDescription>
          Model performance comparison from {formatDate(results.period.start)} to{" "}
          {formatDate(results.period.end)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid gap-4 mb-6 md:grid-cols-3">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Queries</p>
            <p className="text-2xl font-bold">{results.totalQueries.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Consensus Rate</p>
            <p className="text-2xl font-bold text-green-500">
              {(results.consensusRate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Fusion Improvement</p>
            <p className="text-2xl font-bold text-primary">
              +{(results.fusionImprovement * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Model Hit Rates */}
        <h4 className="font-medium mb-3">Model Hit Rates</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Hit Rate</TableHead>
              <TableHead>Unique Hits</TableHead>
              <TableHead>Avg Rank Contribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.modelHitRates.map((model) => (
              <TableRow key={model.model}>
                <TableCell className="font-medium">{model.model}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${model.hitRate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono">
                      {(model.hitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>{model.uniqueHits.toLocaleString()}</TableCell>
                <TableCell className="font-mono">
                  {model.avgRankContribution.toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Query Type Breakdown */}
        {results.queryTypeBreakdown.length > 0 && (
          <>
            <Separator className="my-6" />
            <h4 className="font-medium mb-3">Query Type Performance</h4>
            <div className="space-y-2">
              {results.queryTypeBreakdown.map((qt) => (
                <div
                  key={qt.queryType}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <span className="capitalize">{qt.queryType}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Best: {qt.topModel}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Re-embedding Status Section
// ============================================================================

function ReembeddingSection({
  jobs,
  loading,
  onTrigger,
}: {
  jobs: ReembedJob[];
  loading: boolean;
  onTrigger: () => void;
}) {
  const activeJob = jobs.find((j) => j.status === "running");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Re-embedding Status
          </CardTitle>
          <CardDescription>Batch re-embedding jobs and history</CardDescription>
        </div>
        <Button onClick={onTrigger} disabled={!!activeJob}>
          {activeJob ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Trigger Re-embed
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Active Job Progress */}
        {activeJob && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="font-medium">Job in Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">{activeJob.jobId}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>
                  {activeJob.processedMemories.toLocaleString()} /{" "}
                  {activeJob.totalMemories.toLocaleString()}
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${
                      activeJob.totalMemories > 0
                        ? (activeJob.processedMemories / activeJob.totalMemories) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Models: {activeJob.models.join(", ")}</span>
              <span>Mode: {activeJob.mode}</span>
            </div>
          </div>
        )}

        {/* Job History */}
        <h4 className="font-medium mb-3">Recent Jobs</h4>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No re-embedding jobs yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Drift</TableHead>
                <TableHead className="text-right">Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.slice(0, 10).map((job) => {
                const statusStyle = jobStatusColors[job.status] || jobStatusColors.pending;
                return (
                  <TableRow key={job.jobId}>
                    <TableCell className="font-mono text-xs">{job.jobId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{job.mode}</TableCell>
                    <TableCell>
                      {job.processedMemories.toLocaleString()}
                      {job.failedMemories > 0 && (
                        <span className="text-red-500 ml-1">
                          ({job.failedMemories} failed)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.avgDrift !== undefined ? (
                        <span className="font-mono">
                          {(job.avgDrift * 100).toFixed(1)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {job.completedAt ? formatDate(job.completedAt) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function EnsemblePage() {
  const [ensembleStatus, setEnsembleStatus] = useState<EnsembleStatusResponse | null>(null);
  const [models, setModels] = useState<ModelRegistryEntry[]>([]);
  const [coverage, setCoverage] = useState<EmbeddingCoverageResponse | null>(null);
  const [abResults, setAbResults] = useState<ABTestResults | null>(null);
  const [reembedJobs, setReembedJobs] = useState<ReembedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [status, modelsList, coverageData, abData, jobs] = await Promise.all([
        ensembleApi.getStatus().catch(() => null),
        ensembleApi.getModels().catch(() => []),
        ensembleApi.getCoverage().catch(() => null),
        ensembleApi.getABResults().catch(() => null),
        ensembleApi.reembedding.listJobs(20).catch(() => []),
      ]);

      setEnsembleStatus(status);
      setModels(modelsList);
      setCoverage(coverageData);
      setAbResults(abData);
      setReembedJobs(jobs);
    } catch (error) {
      console.error("Failed to fetch ensemble data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for updates every 30 seconds if a job is running
  useEffect(() => {
    const hasActiveJob = reembedJobs.some((j) => j.status === "running");
    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [reembedJobs]);

  const handleTriggerReembed = async () => {
    setTriggering(true);
    try {
      await ensembleApi.reembedding.trigger({
        mode: "incremental",
      });
      setTriggerDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to trigger re-embedding:", error);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ensemble Overview</h1>
          <p className="text-muted-foreground">
            Multi-model embeddings, coverage stats, and re-embedding management
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ensembleStatus?.enabled ? (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <Check className="mr-1 h-3 w-3" />
              Ensemble Enabled
            </Badge>
          ) : (
            <Badge variant="outline">
              <XCircle className="mr-1 h-3 w-3" />
              Ensemble Disabled
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ab-testing">
            <Zap className="mr-2 h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="reembedding">
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-embedding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ModelRegistrySection
            models={models}
            ensembleConfig={ensembleStatus}
            loading={loading}
          />
          <CoverageStatsSection coverage={coverage} loading={loading} />
        </TabsContent>

        <TabsContent value="ab-testing">
          <ABTestResultsSection results={abResults} loading={loading} />
        </TabsContent>

        <TabsContent value="reembedding">
          <ReembeddingSection
            jobs={reembedJobs}
            loading={loading}
            onTrigger={() => setTriggerDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Trigger Re-embed Dialog */}
      <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Re-embedding</DialogTitle>
            <DialogDescription>
              Start a batch re-embedding job. This will re-embed memories using all configured
              models. The process runs in the background.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p>
                <strong>Mode:</strong> Incremental (only changed memories)
              </p>
              <p>
                <strong>Models:</strong> {ensembleStatus?.models.join(", ") || "All active"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTriggerDialogOpen(false)}
              disabled={triggering}
            >
              Cancel
            </Button>
            <Button onClick={handleTriggerReembed} disabled={triggering}>
              {triggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Re-embedding
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
