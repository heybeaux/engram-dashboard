"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Timeline } from "@/lib/types";
import { formatDay } from "./format";

export function DayTimelineCard({ day }: { day: Timeline }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{formatDay(day.agentLocalDate)}</p>
            {day.chapter && (
              <p className="truncate text-xs text-muted-foreground">{day.chapter}</p>
            )}
          </div>
          {day.mood && (
            <Badge variant="outline" className="shrink-0 capitalize">
              {day.mood}
            </Badge>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {day.text || "No entry for this day."}
        </p>
      </CardContent>
    </Card>
  );
}
