"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Brain, Eye, Hash, Tag } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { AgentSessionSummary, AgentSessionStatus } from "@/lib/types";

const statusColors: Record<AgentSessionStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  TERMINATED: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionKey = decodeURIComponent(params.key as string);
  const [summary, setSummary] = useState<AgentSessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await engram.getAgentSessionSummary(sessionKey);
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch session summary:", err);
        setError("Could not load session summary.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionKey]);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
          <Link href="/sessions"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        <Card><CardContent className="py-8 text-center text-muted-foreground">{error || "Session not found"}</CardContent></Card>
      </div>
    );
  }

  const stats = [
    { label: "Memories Created", value: summary.memoriesCreated, icon: Brain },
    { label: "Memories Accessed", value: summary.memoriesAccessed, icon: Eye },
    { label: "Unique Memories", value: summary.uniqueMemories, icon: Hash },
    { label: "Duration", value: formatDuration(summary.duration), icon: Clock },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
          <Link href="/sessions"><ArrowLeft className="mr-2 h-4 w-4" />Back to Sessions</Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold font-mono break-all">{sessionKey}</h1>
        <Badge variant="outline" className={statusColors[summary.status]}>
          {summary.status}
        </Badge>
      </div>
      {summary.label && <p className="text-muted-foreground">{summary.label}</p>}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {summary.topTopics.length > 0 && (
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Tag className="h-4 w-4" /> Top Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.topTopics.map((topic) => (
                <Badge key={topic} variant="secondary">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
