"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LAYER_COLORS, LAYER_LABELS } from "@/lib/analytics-colors";
import type { LayerDistributionResponse } from "@/lib/types";

interface LayerDistributionChartProps {
  data: LayerDistributionResponse;
}

export function LayerDistributionChart({ data }: LayerDistributionChartProps) {
  // Transform data for Recharts
  const chartData = data.current
    .filter((layer) => layer.count > 0)
    .map((layer) => ({
      name: LAYER_LABELS[layer.layer],
      value: layer.count,
      percentage: layer.percentage,
      layer: layer.layer,
    }));

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg">Layer Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">
          Total: {data.total.toLocaleString()} memories
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.layer}
                    fill={LAYER_COLORS[entry.layer]}
                  />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any, props: any) => [
                  `${Number(value).toLocaleString()} (${props?.payload?.percentage?.toFixed(1) ?? 0}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, entry: any) => (
                  <span className="text-foreground">
                    {value} ({entry?.payload?.percentage?.toFixed(1) ?? 0}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Layer breakdown list for mobile */}
        <div className="mt-4 space-y-2 lg:hidden">
          {data.current.map((layer) => (
            <div key={layer.layer} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: LAYER_COLORS[layer.layer] }}
                />
                <span>{LAYER_LABELS[layer.layer]}</span>
              </div>
              <span className="text-muted-foreground">
                {layer.count.toLocaleString()} ({layer.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
