"use client";

import { useState, useEffect, useCallback } from "react";
import { engram } from "@/lib/engram-client";
import type { HealthMetrics } from "@/lib/types";

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
      setData(result.metrics);
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
