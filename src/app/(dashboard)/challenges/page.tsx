"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Swords, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

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

interface Challenge {
  id: string;
  title?: string;
  description?: string;
  agentId?: string;
  domain?: string;
  status: string;
  createdAt?: string;
  resolvedAt?: string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/challenges`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setChallenges(Array.isArray(d) ? d : d.challenges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await fetch(`${API_BASE}/v1/challenges/${id}/resolve`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, status: "resolved" } : c));
    } catch {
      setError("Failed to resolve challenge");
    } finally {
      setResolvingId(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600 border-yellow-600/30";
      case "active": return "text-blue-600 border-blue-600/30";
      case "resolved": return "text-green-600 border-green-600/30";
      case "failed": return "text-destructive border-destructive/30";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Swords className="h-7 w-7 text-primary" />
          Challenges
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Trust challenges and verification tasks for agent capabilities.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Swords className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No challenges issued yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Challenges are generated to verify and calibrate agent trust scores.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{c.title || c.id}</p>
                      <Badge variant="outline" className={`text-xs capitalize ${statusColor(c.status)}`}>{c.status}</Badge>
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {c.agentId && <Badge variant="outline" className="text-xs font-mono">{c.agentId}</Badge>}
                      {c.domain && <Badge variant="outline" className="text-xs">{c.domain}</Badge>}
                      {c.createdAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />{timeAgo(c.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {c.status !== "resolved" && c.status !== "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(c.id)}
                      disabled={resolvingId === c.id}
                    >
                      {resolvingId === c.id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
