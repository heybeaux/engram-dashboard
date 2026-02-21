"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bot, Brain, Shield, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

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

interface Memory {
  id: string;
  content: string;
  type?: string;
  createdAt: string;
}

interface TrustProfile {
  overallScore?: number;
  domains?: Record<string, number>;
  lastUpdated?: string;
}

interface AgentContext {
  agentId?: string;
  name?: string;
  [key: string]: unknown;
}

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [memories, setMemories] = useState<Memory[]>([]);
  const [context, setContext] = useState<AgentContext | null>(null);
  const [trust, setTrust] = useState<TrustProfile | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [memRes, ctxRes, trustRes, profileRes] = await Promise.allSettled([
        fetch(`${API_BASE}/v1/agents/${id}/memories?limit=20`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/agents/${id}/context`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/identity/agents/${id}/trust-profile`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/identity/agents/${id}`, { headers: getAuthHeaders() }),
      ]);

      if (memRes.status === "fulfilled" && memRes.value.ok) {
        const d = await memRes.value.json();
        setMemories(Array.isArray(d) ? d : d.memories || []);
      }
      if (ctxRes.status === "fulfilled" && ctxRes.value.ok) {
        setContext(await ctxRes.value.json());
      }
      if (trustRes.status === "fulfilled" && trustRes.value.ok) {
        setTrust(await trustRes.value.json());
      }
      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        const profile = await profileRes.value.json();
        if (profile.name) setAgentName(profile.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            {agentName || context?.name || id}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{context?.agentId || id}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agents/${id}/trust`}>
            <Button variant="outline" size="sm"><Shield className="mr-1.5 h-3.5 w-3.5" />Trust Profile</Button>
          </Link>
          <Link href={`/agents/${id}/export`}>
            <Button variant="outline" size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" />Export</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Trust Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Trust Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trust ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <span className="text-2xl font-bold">{trust.overallScore ?? "N/A"}</span>
                </div>
                {trust.domains && Object.entries(trust.domains).map(([domain, score]) => (
                  <div key={domain} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{domain}</span>
                    <Badge variant="outline">{score}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No trust profile available.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Memories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" /> Recent Memories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No memories recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {memories.map((mem) => (
                  <div key={mem.id} className="border-b pb-2 last:border-0">
                    <p className="text-sm line-clamp-2">{mem.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {mem.type && <Badge variant="outline" className="text-xs">{mem.type}</Badge>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{timeAgo(mem.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
