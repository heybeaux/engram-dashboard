"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimelineResponse } from "@/lib/types";

interface MemoryTimelineProps {
  data: TimelineResponse;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MemoryTimeline({ data }: MemoryTimelineProps) {
  const chartData = data.data.map((point) => ({
    ...point,
    date: formatDate(point.timestamp),
  }));

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg">Memory Timeline</CardTitle>
        <p className="text-xs text-muted-foreground">
          Memories over time ({data.granularity}ly view) · Total: {data.total.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="pl-2 pr-4 md:pl-4 md:pr-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 11 }}
                width={40}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
