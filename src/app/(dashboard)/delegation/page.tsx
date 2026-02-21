"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollText, FileStack, AlertCircle, Clock } from "lucide-react";
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

interface Contract {
  id: string;
  name?: string;
  agentId?: string;
  status: string;
  scope?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
}

export default function DelegationPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [cRes, tRes] = await Promise.allSettled([
        fetch(`${API_BASE}/v1/delegation-contracts`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/v1/identity/delegation-templates`, { headers: getAuthHeaders() }),
      ]);

      if (cRes.status === "fulfilled" && cRes.value.ok) {
        const d = await cRes.value.json();
        setContracts(Array.isArray(d) ? d : d.contracts || []);
      }
      if (tRes.status === "fulfilled" && tRes.value.ok) {
        const d = await tRes.value.json();
        setTemplates(Array.isArray(d) ? d : d.templates || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delegation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 border-green-600/30";
      case "expired": return "text-muted-foreground";
      case "revoked": return "text-destructive border-destructive/30";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ScrollText className="h-7 w-7 text-primary" />
            Delegation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage delegation contracts and templates.</p>
        </div>
        <Link href="/delegation/recall">
          <Button variant="outline" size="sm">Delegation Recall</Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      {/* Contracts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No delegation contracts yet.</p>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.name || c.id}</p>
                    {c.agentId && <p className="text-xs text-muted-foreground font-mono">{c.agentId}</p>}
                    {c.scope && <Badge variant="outline" className="text-xs mt-1">{c.scope}</Badge>}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`text-xs capitalize ${statusColor(c.status)}`}>{c.status}</Badge>
                    {c.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />{timeAgo(c.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileStack className="h-4 w-4" /> Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No delegation templates available.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="border-b pb-2 last:border-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
