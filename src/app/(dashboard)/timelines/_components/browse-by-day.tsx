"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarRange } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { Timeline, TimelineLod } from "@/lib/types";
import { DayTimelineCard } from "./day-timeline-card";
import { LodSwitch } from "./lod-switch";

/**
 * Browse-by-day fallback shown when no arc search is active. Lists recent
 * daily timelines via GET /v1/timelines. When from/to are provided the list is
 * scoped to that window; otherwise the backend returns the full (recent) set.
 */
export function BrowseByDay({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const [lod, setLod] = useState<TimelineLod>("summary");
  const [days, setDays] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await engram.getTimelines({ from, to, lod });
      setDays(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timelines.");
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, lod]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarRange className="h-4 w-4" />
          Browsing daily timelines
        </div>
        <LodSwitch value={lod} onChange={setLod} disabled={loading} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={load} className="mt-3">
            Retry
          </Button>
        </div>
      ) : days.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          No daily timelines found{from || to ? " for this date range" : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <DayTimelineCard key={day.id ?? day.agentLocalDate} day={day} />
          ))}
        </div>
      )}
    </div>
  );
}
