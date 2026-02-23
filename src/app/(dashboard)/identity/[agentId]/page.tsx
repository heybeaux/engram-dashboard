"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Bot, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  getAgent,
  getAgentTrustProfile,
  type AgentProfile,
  type AgentTrustProfile,
} from "@/lib/identity-api";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardContent className="pt-6"><Skeleton className="h-48" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-48" /></CardContent></Card>
      </div>
    </div>
  );
}

const statusIcon = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  partial: <AlertCircle className="h-4 w-4 text-yellow-500" />,
};

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [trust, setTrust] = useState<AgentTrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;
    Promise.allSettled([getAgent(agentId), getAgentTrustProfile(agentId)])
      .then(([agentResult, trustResult]) => {
        if (agentResult.status === "fulfilled") {
          setAgent(agentResult.value);
        } else {
          setError(agentResult.reason instanceof Error ? agentResult.reason.message : "Failed to load agent");
        }
        if (trustResult.status === "fulfilled") {
          setTrust(trustResult.value);
        }
        // Trust failure is non-fatal — page still shows agent profile
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/identity"><ArrowLeft className="mr-2 h-4 w-4" />Back to Agents</Link>
        </Button>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/identity"><ArrowLeft className="mr-2 h-4 w-4" />Back to Agents</Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            {error || "Agent not found"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const radarData = trust?.domainScores.map((d) => ({
    domain: d.domain,
    confidence: Math.round(d.confidence * 100),
  })) ?? [];

  const barData = trust?.domainScores.map((d) => ({
    domain: d.domain,
    tasks: d.taskCount,
    confidence: Math.round(d.confidence * 100),
  })) ?? [];

  return (
    <div className="space-y-4 md:space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/identity"><ArrowLeft className="mr-2 h-4 w-4" />Back to Agents</Link>
      </Button>

      {/* Agent Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              {agent.description && (
                <p className="text-muted-foreground mt-1">{agent.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{agent.id}</code>
                <span>·</span>
                <span>Created {formatDate(agent.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {agent.capabilities.map((cap) => (
              <Badge key={cap} variant="outline">{cap}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Summary */}
      {trust && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Trust Summary</h2>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {Math.round(trust.overallTrust * 100)}%
              </div>
              <div className="flex-1">
                <Progress value={trust.overallTrust * 100} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {trust && radarData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Radar Chart */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Capability Radar</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Confidence"
                      dataKey="confidence"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Domain Performance</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="confidence" fill="hsl(var(--primary))" name="Confidence %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tasks" fill="hsl(var(--muted-foreground))" name="Tasks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Behavioral Patterns */}
      {trust && trust.behavioralPatterns.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Behavioral Patterns</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trust.behavioralPatterns.map((pattern) => (
                <div key={pattern.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{pattern.label}</span>
                    <span className="text-muted-foreground">{Math.round(pattern.value * 100)}%</span>
                  </div>
                  <Progress value={pattern.value * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Completions */}
      {trust && trust.recentCompletions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Task Completions</h2>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trust.recentCompletions.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.taskName}</TableCell>
                      <TableCell><Badge variant="outline">{task.domain}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {statusIcon[task.status]}
                          <span className="capitalize">{task.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.score !== undefined ? `${Math.round(task.score * 100)}%` : "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(task.completedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile list */}
            <div className="md:hidden space-y-3">
              {trust.recentCompletions.map((task) => (
                <div key={task.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{task.taskName}</span>
                    {statusIcon[task.status]}
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{task.domain}</Badge>
                    <span>{formatDate(task.completedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
