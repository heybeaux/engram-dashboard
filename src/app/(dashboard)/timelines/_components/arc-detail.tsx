"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CalendarDays, Layers } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { ArcSearchResult, Timeline, TimelineLod } from "@/lib/types";
import { DayTimelineCard } from "./day-timeline-card";
import { LodSwitch } from "./lod-switch";
import { formatSpan } from "./format";

export function ArcDetail({
  arc,
  onBack,
}: {
  arc: ArcSearchResult;
  onBack: () => void;
}) {
  const [lod, setLod] = useState<TimelineLod>("summary");
  const [days, setDays] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await engram.getArc(arc.arcId, lod);
      setDays(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load arc.");
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [arc.arcId, lod]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 h-9">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to results
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold md:text-2xl">{arc.title}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatSpan(arc.from, arc.to)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              {arc.dayCount} {arc.dayCount === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
        <LodSwitch value={lod} onChange={setLod} disabled={loading} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
          This arc has no day timelines.
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
