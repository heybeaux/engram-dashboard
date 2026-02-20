"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Plus, ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import {
  identityApi,
  type Team, type Agent, type CollaborationPair,
} from "@/lib/identity-api";

// ============================================================================
// Collaboration Pair Visualization
// ============================================================================

function CollaborationGrid({ pairs }: { pairs: CollaborationPair[] }) {
  if (pairs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No collaboration data yet.</p>
    );
  }

  const maxScore = Math.max(...pairs.map((p) => p.score), 1);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => {
        const pct = Math.round((pair.score / maxScore) * 100);
        return (
          <div
            key={`${pair.agentA}-${pair.agentB}`}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {pair.agentA} &harr; {pair.agentB}
              </p>
              <p className="text-xs text-muted-foreground">
                {pair.taskCount} tasks
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold">{pair.score.toFixed(1)}</span>
              <div className="mt-1 h-1.5 w-16 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Create Team Modal
// ============================================================================

function CreateTeamDialog({
  open,
  onOpenChange,
  agents,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agents: Agent[];
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedIds.size === 0) return;
    setCreating(true);
    setError(null);
    try {
      await identityApi.createTeam({
        name: name.trim(),
        memberIds: Array.from(selectedIds),
      });
      setName("");
      setSelectedIds(new Set());
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Group agents together to track collaboration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
            {agents.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">No agents found</p>
            )}
            {agents.map((agent) => (
              <label
                key={agent.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(agent.id)}
                  onChange={() => toggle(agent.id)}
                  className="rounded"
                />
                <span className="text-sm">{agent.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {agent.type}
                </Badge>
              </label>
            ))}
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || selectedIds.size === 0 || creating}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Team Detail View
// ============================================================================

function TeamDetail({
  team,
  onBack,
}: {
  team: Team;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h2 className="text-2xl font-bold">{team.name}</h2>
        <Badge>{team.members.length} members</Badge>
      </div>

      {team.description && (
        <p className="text-muted-foreground">{team.description}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Trust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.trustScore != null ? m.trustScore.toFixed(1) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregated Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            {team.aggregatedCapabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">None detected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {team.aggregatedCapabilities.map((cap) => (
                  <Badge key={cap} variant="secondary">
                    {cap}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collaboration Scores</CardTitle>
          <CardDescription>
            Pairwise collaboration effectiveness between team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CollaborationGrid pairs={team.collaborationPairs} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, a] = await Promise.all([
        identityApi.listTeams(),
        identityApi.listAgents(),
      ]);
      setTeams(t);
      setAgents(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (selectedTeam) {
    return <TeamDetail team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage agent teams and track collaboration effectiveness
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 py-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={load}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a team to group agents and track their collaboration.
            </p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedTeam(team)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {team.name}
                </CardTitle>
                <CardDescription>
                  {team.members.length} member{team.members.length !== 1 && "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Collaboration Score
                  </span>
                  <span className="text-lg font-bold">
                    {team.collaborationScore.toFixed(1)}
                  </span>
                </div>
                {team.aggregatedCapabilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {team.aggregatedCapabilities.slice(0, 4).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {team.aggregatedCapabilities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{team.aggregatedCapabilities.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        agents={agents}
        onCreated={load}
      />
    </div>
  );
}
