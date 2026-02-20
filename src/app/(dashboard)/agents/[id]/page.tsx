"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrustGauge } from "@/components/trust-gauge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { InsightTypeBadge } from "@/components/insight-type-badge";
import { ArrowLeft, Shield, Download, Clock } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { AgentIdentity } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AgentIdentityPage() {
  const params = useParams<{ id: string }>();
  const [identity, setIdentity] = useState<AgentIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await engram.getAgentIdentity(params.id);
        setIdentity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load identity");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <PageSkeleton />;
  if (error) return (
    <Card className="border-destructive">
      <CardContent className="pt-6 text-destructive">{error}</CardContent>
    </Card>
  );
  if (!identity) return null;

  const prefsByCategory = identity.preferences.reduce<Record<string, typeof identity.preferences>>(
    (acc, p) => { (acc[p.category] ??= []).push(p); return acc; }, {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/agents">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{identity.name}</h1>
          </div>
          {identity.description && (
            <p className="text-muted-foreground ml-10">{identity.description}</p>
          )}
          <p className="text-xs text-muted-foreground ml-10 mt-1">
            Created {formatDate(identity.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${params.id}/trust`}>
            <Button variant="outline" size="sm"><Shield className="h-4 w-4 mr-1" />Trust Profile</Button>
          </Link>
          <Link href={`/agents/${params.id}/export`}>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Trust Score */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Trust Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <TrustGauge score={identity.trustScore} label="Trust" />
            {identity.trustHistory.length > 0 && (
              <div className="w-full h-16 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={identity.trustHistory}>
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                    <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Capabilities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {identity.capabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No capabilities discovered yet</p>
            ) : identity.capabilities.map((cap) => (
              <div key={cap.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{cap.name}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(cap.score * 100)}%</span>
                </div>
                <Progress value={cap.score * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {Object.keys(prefsByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No preferences recorded yet</p>
            ) : Object.entries(prefsByCategory).map(([cat, prefs]) => (
              <div key={cat}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{cat}</p>
                {prefs.map((p) => (
                  <div key={p.key} className="flex items-center justify-between text-sm py-0.5">
                    <span>{p.key}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{p.value}</span>
                      <ConfidenceBadge score={p.confidence} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Behavioral Patterns */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Behavioral Patterns</CardTitle></CardHeader>
          <CardContent>
            {identity.behavioralPatterns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No patterns detected yet</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={identity.behavioralPatterns}>
                    <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {identity.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No recent activity</p>
            ) : identity.recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <InsightTypeBadge type={act.type} />
                    <span className="text-xs text-muted-foreground">{formatDate(act.timestamp)}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
