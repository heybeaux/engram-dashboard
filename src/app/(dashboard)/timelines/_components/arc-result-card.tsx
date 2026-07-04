"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Layers } from "lucide-react";
import type { ArcSearchResult } from "@/lib/types";
import { formatDay, formatSpan } from "./format";

export function ArcResultCard({
  arc,
  onOpen,
}: {
  arc: ArcSearchResult;
  onOpen: (arc: ArcSearchResult) => void;
}) {
  const scorePct = Math.round((arc.score ?? 0) * 100);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(arc)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(arc);
        }
      }}
      className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight">{arc.title}</h3>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {scorePct}%
          </Badge>
        </div>

        <p className="line-clamp-3 text-sm text-muted-foreground">
          {arc.summary || "No summary available."}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatSpan(arc.from, arc.to)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {arc.dayCount} {arc.dayCount === 1 ? "day" : "days"}
          </span>
          {arc.topDays && arc.topDays.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              Peak {formatDay(arc.topDays[0].date)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
