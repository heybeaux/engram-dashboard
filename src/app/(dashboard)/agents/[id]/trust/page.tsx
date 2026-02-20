"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrustGauge } from "@/components/trust-gauge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { StatusDot } from "@/components/status-dot";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { AgentTrustNarrative } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const signalIcons = {
  SUCCESS: <CheckCircle className="h-4 w-4 text-green-500" />,
  FAILURE: <XCircle className="h-4 w-4 text-red-500" />,
  CORRECTION: <AlertTriangle className="h-4 w-4 text-amber-500" />,
};

const signalColors = {
  SUCCESS: "bg-green-500/15 text-green-700 border-green-500/25",
  FAILURE: "bg-red-500/15 text-red-700 border-red-500/25",
  CORRECTION: "bg-amber-500/15 text-amber-700 border-amber-500/25",
};

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-48" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export default function TrustProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AgentTrustNarrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await engram.getAgentTrustNarrative(params.id);
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trust data");
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
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/agents/${params.id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Trust Profile</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Trust Score + History Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trust Score History (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <TrustGauge score={data.trustScore} size={100} label="Current" />
            </div>
            {data.trustHistory.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trustHistory}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                    <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No history data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Domain Breakdown */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Domain Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.domains.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No domain data yet</p>
            ) : data.domains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusDot color={d.score >= 0.8 ? "green" : d.score >= 0.6 ? "amber" : "red"} />
                  <span>{d.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{d.signalCount} signals</span>
                  <ConfidenceBadge score={d.score} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trust Signal Feed */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Trust Signals</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-72 overflow-y-auto">
            {data.signals.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No signals recorded yet</p>
            ) : data.signals.map((sig) => (
              <div key={sig.id} className="flex items-start gap-2 text-sm">
                {signalIcons[sig.type]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge className={signalColors[sig.type]}>{sig.type}</Badge>
                    {sig.domain && <span className="text-xs text-muted-foreground">{sig.domain}</span>}
                  </div>
                  <p className="text-muted-foreground mt-0.5 truncate">{sig.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(sig.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Narrative Trust Memories */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Narrative Trust Memories</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.narrativeMemories.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No narrative memories yet</p>
            ) : data.narrativeMemories.map((mem) => (
              <div key={mem.id} className="border rounded-lg p-3">
                <p className="text-sm">{mem.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <ConfidenceBadge score={mem.confidence} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(mem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
