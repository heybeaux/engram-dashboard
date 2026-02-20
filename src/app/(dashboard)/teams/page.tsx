"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Users, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { getTeams, getTeamDetail, addTeamMember, removeTeamMember } from "@/lib/delegation-client";
import type { Team, TeamDetail } from "@/lib/delegation-types";

// ============================================================================
// Helpers
// ============================================================================

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function trustColor(score: number): string {
  if (score >= 0.8) return "text-green-500";
  if (score >= 0.5) return "text-yellow-500";
  return "text-red-500";
}

// ============================================================================
// Team Cards (list view)
// ============================================================================

function TeamCards({ teams, onSelect }: { teams: Team[]; onSelect: (id: string) => void }) {
  if (teams.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No teams found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((t) => (
        <Card key={t.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => onSelect(t.id)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> {t.name}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm">
            <span>{t.memberCount} member{t.memberCount !== 1 ? "s" : ""}</span>
            <span className={trustColor(t.trustScore)}>Trust: {(t.trustScore * 100).toFixed(0)}%</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Team Detail View
// ============================================================================

function TeamDetailView({ teamId, onBack }: { teamId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAgentId, setNewAgentId] = useState("");
  const [adding, setAdding] = useState(false);

  const loadDetail = useCallback(() => {
    setLoading(true);
    getTeamDetail(teamId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [teamId]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  async function handleAddMember() {
    if (!newAgentId.trim()) return;
    setAdding(true);
    try {
      await addTeamMember(teamId, newAgentId.trim());
      setAddDialogOpen(false);
      setNewAgentId("");
      loadDetail();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    await removeTeamMember(teamId, memberId);
    loadDetail();
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  if (!detail) {
    return <p className="text-center text-muted-foreground py-8">Team not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <h2 className="text-xl font-bold">{detail.name}</h2>
        <Badge variant="outline" className={`${trustColor(detail.trustScore)} border-0`}>
          Trust: {(detail.trustScore * 100).toFixed(0)}%
        </Badge>
      </div>

      {detail.description && <p className="text-muted-foreground text-sm">{detail.description}</p>}

      {/* Members */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Members ({detail.members.length})</CardTitle>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {detail.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-medium text-sm">{m.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">{m.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${trustColor(m.trustScore)}`}>{(m.trustScore * 100).toFixed(0)}%</span>
                  <Button variant="ghost" size="sm" className="text-red-500 h-7 w-7 p-0" onClick={() => handleRemoveMember(m.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      {detail.capabilities.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Capabilities</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {detail.capabilities.map((cap) => (
                <Badge key={cap.name} variant="outline">{cap.name} (Lv {cap.level})</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {detail.timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Collaboration Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detail.timeline.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5">{formatDate(ev.timestamp)}</span>
                  <div>
                    <Badge variant="outline" className="text-xs mr-2">{ev.type}</Badge>
                    <span>{ev.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Enter the agent ID to add to this team.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Agent ID" value={newAgentId} onChange={(e) => setNewAgentId(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={adding || !newAgentId.trim()}>
              {adding && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTeams()
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" /> Teams
        </h1>
        <p className="text-muted-foreground">View and manage agent teams.</p>
      </div>

      {selectedTeamId ? (
        <TeamDetailView teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <TeamCards teams={teams} onSelect={setSelectedTeamId} />
      )}
    </div>
  );
}
