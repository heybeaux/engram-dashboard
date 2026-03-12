"use client";

import { useState, useEffect, useCallback } from "react";
import { engram } from "@/lib/engram-client";
import type { HealthMetrics } from "@/lib/types";

// The API returns metrics as an array of { key, value, status, description }
// Transform into the flat HealthMetrics shape the dashboard expects.
function transformMetrics(raw: unknown): HealthMetrics {
  const arr = Array.isArray(raw) ? raw : [];
  const map = new Map<string, unknown>();
  for (const m of arr) {
    if (m && typeof m === "object" && "key" in m && "value" in m) {
      map.set(m.key as string, m.value);
    }
  }

  const layerDist = map.get("layer_distribution");
  const totalMemories =
    layerDist && typeof layerDist === "object"
      ? Object.values(layerDist as Record<string, number>).reduce((a, b) => a + b, 0)
      : 0;

  return {
    memoryCount: totalMemories,
    embeddingCoverage: (map.get("embedding_coverage_pct") as number) ?? 0,
    dedupPendingClusters: (map.get("dedup_pending_clusters") as number) ?? 0,
    avgRecallLatencyMs: (map.get("avg_recall_latency_ms") as number) ?? 0,
    dreamCycleStatus: (map.get("dream_cycle_status") as string) ?? "unknown",
    dreamCycleLastRun: (map.get("dream_cycle_last_run") as string) ?? "",
    decayPercentage: (map.get("stale_memories_pct") as number) ?? 0,
    freshnessPercentage: 100 - ((map.get("stale_memories_pct") as number) ?? 0),
  };
}

export function useHealthMetrics() {
  const [data, setData] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await engram.getHealthMetrics();
      // API returns { metrics: [...] } array — transform to flat object
      setData(transformMetrics(result.metrics));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch health metrics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await engram.refreshHealthMetrics();
      await fetchMetrics();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh health metrics";
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refreshing, refetch: fetchMetrics, refresh };
}
