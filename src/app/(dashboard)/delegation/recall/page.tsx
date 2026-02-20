"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, Brain, UserCheck } from "lucide-react";
import { delegationRecall } from "@/lib/delegation-client";
import type { DelegationRecallResponse } from "@/lib/delegation-types";

// ============================================================================
// Page
// ============================================================================

export default function DelegationRecallPage() {
  const [taskDescription, setTaskDescription] = useState("");
  const [delegatingAgent, setDelegatingAgent] = useState("");
  const [result, setResult] = useState<DelegationRecallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!taskDescription.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await delegationRecall(taskDescription, delegatingAgent || undefined);
      setResult(data);
    } catch {
      setResult({ memories: [], recommendedAgents: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" /> Delegation Recall
        </h1>
        <p className="text-muted-foreground">Search memories with delegation-aware context boosting.</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Task description — what needs to be done?"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Input
            placeholder="Delegating agent (optional)"
            value={delegatingAgent}
            onChange={(e) => setDelegatingAgent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !taskDescription.trim()}>
            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
            Search
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      )}

      {!loading && searched && result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recalled Memories */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold">Recalled Memories ({result.memories.length})</h2>
            {result.memories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No memories found for this query.</p>
            ) : (
              result.memories.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm whitespace-pre-wrap">{m.raw}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{m.layer}</Badge>
                      <span>Score: {m.score.toFixed(3)}</span>
                      {m.delegationBoost > 0 && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-0 text-xs">
                          +{m.delegationBoost.toFixed(3)} boost
                        </Badge>
                      )}
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Recommended Agents */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Recommended Agents
            </h2>
            {result.recommendedAgents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No agent recommendations.</p>
            ) : (
              result.recommendedAgents.map((a) => (
                <Card key={a.agentId}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm font-medium">{a.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Trust:</span>
                      <span className={a.trustScore >= 0.8 ? "text-green-500" : a.trustScore >= 0.5 ? "text-yellow-500" : "text-red-500"}>
                        {(a.trustScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div><span className="text-muted-foreground">Past tasks:</span> {a.pastTaskCount}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {a.relevantCapabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
