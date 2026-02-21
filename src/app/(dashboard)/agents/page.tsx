"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bot, Brain, Clock, AlertCircle } from "lucide-react";

const API_BASE = typeof window !== "undefined" ? "/api/engram" : "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return { "Content-Type": "application/json" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Agent {
  id: string;
  agentId: string;
  name: string;
  memoryCount?: number;
  lastActiveAt?: string;
  status?: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/agents`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : data.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          Agents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage agent identities, trust profiles, and capabilities.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      {agents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No agents registered yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Agents are created when they first connect via the API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/agents/${agent.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  {agent.name || agent.agentId}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="outline" className="text-xs font-mono">{agent.agentId}</Badge>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" /> Memories
                    </p>
                    <p className="font-medium">{(agent.memoryCount ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Active
                    </p>
                    <p className="font-medium">{agent.lastActiveAt ? timeAgo(agent.lastActiveAt) : "Never"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
