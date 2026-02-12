"use client";

import { useState, useEffect, useCallback } from "react";
import { engram } from "@/lib/engram-client";
import type { FogIndexResult, FogIndexHistory } from "@/lib/types";

export function useFogIndex() {
  const [data, setData] = useState<FogIndexResult | null>(null);
  const [history, setHistory] = useState<FogIndexHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [current, hist] = await Promise.all([
        engram.getFogIndex(),
        engram.getFogIndexHistory(30),
      ]);
      setData(current);
      setHistory(hist);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch Fog Index";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, history, loading, error, refetch: fetch };
}
