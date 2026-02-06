"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TYPE_COLORS, TYPE_LABELS } from "@/lib/analytics-colors";
import type { TypeBreakdownResponse, MemoryType } from "@/lib/types";

interface TypeBreakdownChartProps {
  data: TypeBreakdownResponse;
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const MEMORY_TYPES: MemoryType[] = [
  "CONSTRAINT",
  "PREFERENCE",
  "FACT",
  "TASK",
  "EVENT",
  "LESSON",
];

export function TypeBreakdownChart({ data }: TypeBreakdownChartProps) {
  // Transform data for Recharts
  const chartData = data.data.map((point) => ({
    date: formatDate(point.timestamp),
    ...point.types,
  }));

  // Filter to only types with data
  const activeTypes = MEMORY_TYPES.filter((type) =>
    data.data.some((point) => point.types[type] > 0)
  );

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg">Type Breakdown</CardTitle>
        <p className="text-xs text-muted-foreground">
          Memory types over time ({data.granularity}ly)
          {data.summary.dominant && ` · Dominant: ${TYPE_LABELS[data.summary.dominant]}`}
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
              <Legend 
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => TYPE_LABELS[value as string] || value}
              />
              {activeTypes.map((type) => (
                <Area
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stackId="1"
                  fill={TYPE_COLORS[type]}
                  stroke={TYPE_COLORS[type]}
                  fillOpacity={0.6}
                  name={type}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
