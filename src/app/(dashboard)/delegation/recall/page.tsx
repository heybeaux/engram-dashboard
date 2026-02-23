"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, AlertCircle, Undo2 } from "lucide-react";
import Link from "next/link";

const API_BASE = typeof window !== "undefined" ? "/api/engram" : "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return { "Content-Type": "application/json" };
}

interface RecallResult {
  id: string;
  contractId?: string;
  agentId?: string;
  action?: string;
  status?: string;
  details?: string;
  createdAt?: string;
}

export default function DelegationRecallPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecallResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`${API_BASE}/v1/identity/delegation-recall?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setResults(Array.isArray(d) ? d : d.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/delegation">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Undo2 className="h-7 w-7 text-primary" />
            Delegation Recall
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Search and recall delegation actions.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Search delegation actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-1.5 h-3.5 w-3.5" />Search
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!loading && searched && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No results found for &quot;{query}&quot;.</p>
            ) : (
              <div className="space-y-3">
                {results.map((r) => (
                  <div key={r.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.action || r.id}</p>
                      {r.status && <Badge variant="outline" className="text-xs capitalize">{r.status}</Badge>}
                    </div>
                    {r.details && <p className="text-xs text-muted-foreground mt-1">{r.details}</p>}
                    <div className="flex gap-2 mt-1">
                      {r.agentId && <Badge variant="outline" className="text-xs font-mono">{r.agentId}</Badge>}
                      {r.contractId && <Badge variant="outline" className="text-xs font-mono">{r.contractId}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
