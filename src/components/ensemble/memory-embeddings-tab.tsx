"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  Clock,
  XCircle,
  HelpCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  MemoryEmbeddingsResponse,
  MemoryEmbeddingInfo,
  MODEL_CONFIGS,
} from "@/lib/ensemble-types";
import { ensembleApi } from "@/lib/ensemble-client";

interface MemoryEmbeddingsTabProps {
  memoryId: string;
}

const statusConfig = {
  embedded: {
    icon: Check,
    label: "Embedded",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  missing: {
    icon: HelpCircle,
    label: "Missing",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
  },
};

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

function DriftIndicator({ driftScore }: { driftScore?: number }) {
  if (driftScore === undefined) return null;

  const isLow = driftScore < 0.05;
  const isMedium = driftScore >= 0.05 && driftScore < 0.15;
  const isHigh = driftScore >= 0.15;

  let Icon = Minus;
  let color = "text-muted-foreground";
  let label = "Stable";

  if (isHigh) {
    Icon = TrendingUp;
    color = "text-red-500";
    label = "High drift";
  } else if (isMedium) {
    Icon = TrendingUp;
    color = "text-yellow-500";
    label = "Moderate drift";
  } else if (isLow) {
    Icon = TrendingDown;
    color = "text-green-500";
    label = "Low drift";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${color}`}>
            <Icon className="h-3 w-3" />
            <span className="text-xs">{(driftScore * 100).toFixed(1)}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label} - Difference from previous embedding version</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EmbeddingCard({ embedding }: { embedding: MemoryEmbeddingInfo }) {
  const config = statusConfig[embedding.status];
  const StatusIcon = config.icon;
  const modelConfig = MODEL_CONFIGS[embedding.model];

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{embedding.model}</span>
              <Badge variant="outline" className={`${config.bgColor} ${config.color}`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {modelConfig?.dimensions || embedding.dimensions || "—"} dimensions
              {modelConfig?.maxTokens && ` • ${modelConfig.maxTokens} max tokens`}
            </p>
          </div>
          <DriftIndicator driftScore={embedding.driftScore} />
        </div>

        {embedding.status === "embedded" && embedding.embeddedAt && (
          <div className="mt-3 text-xs text-muted-foreground">
            <p>Embedded: {formatDate(embedding.embeddedAt)}</p>
            {embedding.vectorId && (
              <p className="mt-1 truncate">
                Vector ID: <code className="text-xs">{embedding.vectorId}</code>
              </p>
            )}
          </div>
        )}

        {embedding.status === "failed" && embedding.error && (
          <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-500">
            {embedding.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmbeddingsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MemoryEmbeddingsTab({ memoryId }: MemoryEmbeddingsTabProps) {
  const [data, setData] = useState<MemoryEmbeddingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reembedding, setReembedding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmbeddings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ensembleApi.getMemoryEmbeddings(memoryId);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch embeddings:", err);
      setError("Failed to load embedding status");
    } finally {
      setLoading(false);
    }
  }, [memoryId]);

  useEffect(() => {
    fetchEmbeddings();
  }, [fetchEmbeddings]);

  const handleReembed = async () => {
    setReembedding(true);
    try {
      await ensembleApi.reembedding.reembedMemory(memoryId);
      // Refresh the data after re-embedding
      await fetchEmbeddings();
    } catch (err) {
      console.error("Failed to re-embed memory:", err);
      setError("Failed to trigger re-embedding");
    } finally {
      setReembedding(false);
    }
  };

  if (loading) {
    return <EmbeddingsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <XCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Error Loading Embeddings</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchEmbeddings}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Embedding Data</h2>
        <p className="text-sm text-muted-foreground">
          Embedding information is not available for this memory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Coverage:</span>
            <Badge variant="outline">
              {data.embeddedCount}/{data.totalModels} models
            </Badge>
          </div>
          {data.pendingCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
              {data.pendingCount} pending
            </Badge>
          )}
          {data.failedCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {data.failedCount} failed
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReembed}
          disabled={reembedding}
          className="h-9"
        >
          {reembedding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-embedding...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-embed
            </>
          )}
        </Button>
      </div>

      {/* Embedding Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.embeddings.map((embedding) => (
          <EmbeddingCard key={embedding.model} embedding={embedding} />
        ))}
      </div>

      {/* Info Note */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Multi-Model Embeddings:</strong> This memory is embedded using multiple
            models for improved retrieval accuracy. Ensemble retrieval fuses results from
            all models using Reciprocal Rank Fusion (RRF).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MemoryEmbeddingsTab;
