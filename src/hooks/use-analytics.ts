"use client";

import { useState, useEffect, useCallback } from "react";
import { engram } from "@/lib/engram-client";
import type {
  AnalyticsSummaryResponse,
  TimelineResponse,
  TypeBreakdownResponse,
  LayerDistributionResponse,
} from "@/lib/types";

export interface UseAnalyticsOptions {
  granularity?: "hour" | "day" | "week";
  period?: "7d" | "30d" | "90d";
  realtime?: boolean;
}

export interface UseAnalyticsResult {
  summary: AnalyticsSummaryResponse | null;
  timeline: TimelineResponse | null;
  typeBreakdown: TypeBreakdownResponse | null;
  layerBreakdown: LayerDistributionResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getPeriodDates(period: "7d" | "30d" | "90d"): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
  }
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsResult {
  const { granularity = "day", period = "30d", realtime = false } = options;

  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdownResponse | null>(null);
  const [layerBreakdown, setLayerBreakdown] = useState<LayerDistributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dates = getPeriodDates(period);
      const timelineGranularity = granularity === "hour" ? "hour" : granularity === "week" ? "week" : "day";
      const typeGranularity = period === "7d" ? "day" : period === "30d" ? "week" : "month";

      // Fetch all analytics data in parallel
      const [summaryData, timelineData, typeData, layerData] = await Promise.all([
        engram.getAnalyticsSummary(),
        engram.getAnalyticsTimeline({
          granularity: timelineGranularity,
          start: dates.start,
          end: dates.end,
        }),
        engram.getAnalyticsTypeBreakdown({
          granularity: typeGranularity as "day" | "week" | "month",
          start: dates.start,
          end: dates.end,
        }),
        engram.getAnalyticsLayerBreakdown({
          includeTrend: true,
          granularity: period === "7d" ? "day" : "week",
        }),
      ]);

      setSummary(summaryData);
      setTimeline(timelineData);
      setTypeBreakdown(typeData);
      setLayerBreakdown(layerData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [granularity, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Polling for realtime updates
  useEffect(() => {
    if (!realtime) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [realtime, fetchAnalytics]);

  return {
    summary,
    timeline,
    typeBreakdown,
    layerBreakdown,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
