"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Search, Download, Bot, RefreshCw } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { AgentSummary } from "@/lib/types";

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return "Never";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function AgentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await engram.getAgents();
      setAgents(res.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleExport = async (agent: AgentSummary) => {
    try {
      const blob = await engram.exportAgentIdentity(agent.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${agent.name}-identity.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const filtered = agents.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage agent identities and memory profiles</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAgents} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-40" />
            <p className="font-medium">No agents found</p>
            <p className="text-sm">Agents will appear here once they start creating memories.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <Card key={agent.id} className="hover:border-primary/50 transition-colors group">
              <Link href={`/agents/${agent.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base truncate">{agent.name}</CardTitle>
                    <ConfidenceBadge score={agent.trustScore} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {agent.memoryCount} memories · Active {formatRelativeTime(agent.lastActive)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <div key={cap.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">{cap.name}</span>
                      <span className="text-xs font-medium ml-2">{Math.round(cap.score * 100)}%</span>
                    </div>
                  ))}
                  {agent.capabilities.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No capabilities yet</p>
                  )}
                </CardContent>
              </Link>
              <div className="px-6 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => { e.preventDefault(); handleExport(agent); }}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
