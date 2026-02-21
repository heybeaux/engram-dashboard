"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Shield, Clock, AlertCircle, ArrowLeft } from "lucide-react";
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

interface TrustProfile {
  overallScore?: number;
  domains?: Record<string, number>;
  lastUpdated?: string;
}

interface TrustEvent {
  id: string;
  domain?: string;
  action: string;
  scoreDelta?: number;
  createdAt: string;
  reason?: string;
}

export default function AgentTrustPage() {
  const params = useParams();
  const id = params.id as string;

  const [trust, setTrust] = useState<TrustProfile | null>(null);
  const [history, setHistory] = useState<TrustEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [trustRes, histRes] = await Promise.allSettled([
        fetch(`${API_BASE}/v1/identity/agents/${id}/trust-profile`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/agents/${id}/trust/history`, { headers: getAuthHeaders() }),
      ]);

      if (trustRes.status === "fulfilled" && trustRes.value.ok) {
        setTrust(await trustRes.value.json());
      }
      if (histRes.status === "fulfilled" && histRes.value.ok) {
        const d = await histRes.value.json();
        setHistory(Array.isArray(d) ? d : d.history || d.events || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trust data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/agents/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Trust Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed trust breakdown for agent {id}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      {/* Trust Domains */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trust by Domain</CardTitle>
        </CardHeader>
        <CardContent>
          {trust ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-medium">Overall Score</span>
                <span className="text-3xl font-bold">{trust.overallScore ?? "N/A"}</span>
              </div>
              {trust.domains && Object.entries(trust.domains).length > 0 ? (
                Object.entries(trust.domains).map(([domain, score]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{domain}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, Number(score)))}%` }}
                        />
                      </div>
                      <Badge variant="outline" className="min-w-[3rem] justify-center">{score}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No domain scores available.</p>
              )}
              {trust.lastUpdated && (
                <p className="text-xs text-muted-foreground pt-2">Last updated: {timeAgo(trust.lastUpdated)}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No trust profile available.</p>
          )}
        </CardContent>
      </Card>

      {/* Trust History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Trust History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trust history recorded.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((event) => (
                <div key={event.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{event.action}</p>
                    {event.reason && <p className="text-xs text-muted-foreground">{event.reason}</p>}
                    {event.domain && <Badge variant="outline" className="text-xs mt-1">{event.domain}</Badge>}
                  </div>
                  <div className="text-right">
                    {event.scoreDelta != null && (
                      <span className={`text-sm font-medium ${event.scoreDelta >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {event.scoreDelta >= 0 ? "+" : ""}{event.scoreDelta}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground">{timeAgo(event.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
