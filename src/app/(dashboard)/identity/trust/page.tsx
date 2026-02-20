"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle, TrendingUp, TrendingDown, Minus, Shield, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  identityApi,
  type Agent, type TrustProfile, type TrustDomain,
} from "@/lib/identity-api";

// ============================================================================
// Trend Icon
// ============================================================================

function TrendIcon({ trend }: { trend: TrustDomain["trend"] }) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

const DOMAIN_COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

// ============================================================================
// Main Page
// ============================================================================

export default function TrustProfilesPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    identityApi
      .listAgents()
      .then((a) => {
        setAgents(a);
        if (a.length > 0) setSelectedAgentId(a[0].id);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load agents")
      )
      .finally(() => setLoadingAgents(false));
  }, []);

  const loadProfile = useCallback(async (agentId: string) => {
    if (!agentId) return;
    setLoadingProfile(true);
    setError(null);
    try {
      const p = await identityApi.getTrustProfile(agentId);
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trust profile");
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAgentId) loadProfile(selectedAgentId);
  }, [selectedAgentId, loadProfile]);

  const radarData = profile?.domains.map((d) => ({
    domain: d.domain,
    score: d.score,
    fullMark: 100,
  })) ?? [];

  const historyData = profile?.history.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overall: h.overall,
    ...h.domains,
  })) ?? [];

  const domainKeys = profile
    ? Array.from(new Set(profile.history.flatMap((h) => Object.keys(h.domains))))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trust Profiles</h1>
        <p className="text-muted-foreground">
          View trust scores by domain and track trends over time
        </p>
      </div>

      {/* Agent Selector */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <label className="text-sm font-medium">Agent</label>
          {loadingAgents ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
          {loadingProfile && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 py-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => loadProfile(selectedAgentId)}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loadingProfile && !profile ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : !profile ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No trust data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Select an agent to view their trust profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score */}
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">
                  {profile.overallTrust.toFixed(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{profile.agentName}</p>
                <p className="text-sm text-muted-foreground">Overall Trust Score</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trust by Domain</CardTitle>
                <CardDescription>Competency across capability areas</CardDescription>
              </CardHeader>
              <CardContent>
                {radarData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No domain data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Trust"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Domain List with Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Domain Breakdown</CardTitle>
                <CardDescription>Scores and trend indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.domains.map((d) => (
                    <div
                      key={d.domain}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <TrendIcon trend={d.trend} />
                        <span className="text-sm font-medium capitalize">
                          {d.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            d.trend === "improving"
                              ? "default"
                              : d.trend === "declining"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {d.trend}
                        </Badge>
                        <span className="w-10 text-right font-mono text-sm font-bold">
                          {d.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trust History</CardTitle>
              <CardDescription>Score trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {historyData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Overall"
                    />
                    {domainKeys.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={DOMAIN_COLORS[i % DOMAIN_COLORS.length]}
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="4 2"
                        name={key}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
