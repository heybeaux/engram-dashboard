"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useFogIndex } from "@/hooks/use-fog-index";

function getTierColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  if (score >= 20) return "text-red-400";
  return "text-red-600";
}

function getTierBg(score: number): string {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 75) return "bg-green-500/10 border-green-500/20";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  if (score >= 20) return "bg-red-500/10 border-red-500/20";
  return "bg-red-600/10 border-red-600/20";
}

function getTierBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 75) return "default";
  if (score >= 40) return "secondary";
  return "destructive";
}

function Sparkline({ data }: { data: Array<{ score: number }> }) {
  if (data.length < 2) return null;

  const width = 120;
  const height = 32;
  const padding = 2;

  const scores = data.map(d => d.score).reverse(); // oldest first
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - padding * 2);
    const y = height - padding - ((score - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const lastScore = scores[scores.length - 1];
  const color = lastScore >= 75 ? "#22c55e" : lastScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
      {/* Dot on latest value */}
      {scores.length > 0 && (
        <circle
          cx={padding + ((scores.length - 1) / (scores.length - 1)) * (width - padding * 2)}
          cy={height - padding - ((lastScore - min) / range) * (height - padding * 2)}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

function ComponentBar({ name, score, details }: {
  name: string;
  score: number;
  details: string;
}) {
  const barColor =
    score >= 75 ? "bg-green-500" :
    score >= 50 ? "bg-yellow-500" :
    score >= 25 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-medium tabular-nums">{score.toFixed(0)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/70">{details}</p>
    </div>
  );
}

export function FogIndexCard() {
  const { data, history, loading, error, refetch } = useFogIndex();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fog Index</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-24 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fog Index</CardTitle>
          <Button variant="ghost" size="sm" onClick={refetch} className="h-8 w-8 p-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "No data"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${getTierBg(data.score)}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Fog Index
        </CardTitle>
        <div className="flex items-center gap-2">
          {history.length >= 2 && <Sparkline data={history} />}
          <Button variant="ghost" size="sm" onClick={refetch} className="h-8 w-8 p-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score + Tier */}
        <div className="flex items-baseline gap-3">
          <span className={`text-4xl font-bold tabular-nums ${getTierColor(data.score)}`}>
            {data.score.toFixed(1)}
          </span>
          <Badge variant={getTierBadgeVariant(data.score)}>
            {data.tier}
          </Badge>
        </div>

        {/* Expand toggle */}
        {data.components.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 text-xs text-muted-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              <span>Component Breakdown</span>
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {expanded && (
              <div className="space-y-3 pt-1">
                {data.components
                  .sort((a, b) => b.weight - a.weight)
                  .map((c) => (
                    <ComponentBar
                      key={c.name}
                      name={c.name}
                      score={c.score}
                      details={c.details}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
