"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, AlertCircle, Star, AlertTriangle, Clock, Loader2, History,
} from "lucide-react";
import {
  identityApi,
  type DelegationRecallResponse, type DelegationResult,
} from "@/lib/identity-api";

// ============================================================================
// Outcome Badge
// ============================================================================

function OutcomeBadge({ outcome }: { outcome: DelegationResult["outcome"] }) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    success: "default",
    partial: "secondary",
    failure: "destructive",
  };
  return <Badge variant={variants[outcome] ?? "secondary"}>{outcome}</Badge>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

// ============================================================================
// Main Page
// ============================================================================

export default function DelegationRecallPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DelegationRecallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await identityApi.recallDelegation(query.trim());
      setResults(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delegation Recall</h1>
        <p className="text-muted-foreground">
          Search past delegations to find the best agent for a task
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Describe the task (e.g. 'refactor authentication module')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 py-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {loading && !results && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Search past delegations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe a task to find similar past delegations and get agent recommendations.
            </p>
          </CardContent>
        </Card>
      )}

      {results && (
        <>
          {/* Recommended Agent */}
          {results.recommendedAgentId && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="flex items-center gap-3 py-4">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    Recommended: {results.recommendedAgentName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Best match based on past performance with similar tasks
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Similar Past Tasks</CardTitle>
              <CardDescription>
                {results.results.length} result{results.results.length !== 1 && "s"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.results.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No similar past tasks found. This may be a novel delegation.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Similarity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.results.map((r) => (
                        <TableRow
                          key={r.id}
                          className={
                            r.agentId === results.recommendedAgentId
                              ? "bg-primary/5"
                              : undefined
                          }
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{r.taskDescription}</p>
                              {r.notes && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {r.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {r.agentId === results.recommendedAgentId && (
                                <Star className="h-3 w-3 text-primary" />
                              )}
                              <span className="text-sm">{r.agentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <OutcomeBadge outcome={r.outcome} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{formatDuration(r.duration)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {(r.similarity * 100).toFixed(0)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Failure Patterns */}
          {results.failurePatterns.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Known Pitfalls
                </CardTitle>
                <CardDescription>
                  Failure patterns detected in similar past tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.failurePatterns.map((fp, i) => (
                    <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-sm font-medium">{fp.pattern}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Occurred {fp.frequency}×</span>
                        <span>·</span>
                        <span>
                          Last: {new Date(fp.lastSeen).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>
                          Agents: {fp.affectedAgents.join(", ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
