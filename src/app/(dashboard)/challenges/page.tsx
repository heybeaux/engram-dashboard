"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert, Loader2 } from "lucide-react";
import { getChallenges, resolveChallenge } from "@/lib/delegation-client";
import type { Challenge, ChallengeStatus, ResolutionMethod } from "@/lib/delegation-types";

// ============================================================================
// Helpers
// ============================================================================

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusColor: Record<ChallengeStatus, { bg: string; text: string }> = {
  OPEN: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  UPHELD: { bg: "bg-red-500/10", text: "text-red-500" },
  DISMISSED: { bg: "bg-muted", text: "text-muted-foreground" },
  RESOLVED: { bg: "bg-green-500/10", text: "text-green-500" },
};

// ============================================================================
// Page
// ============================================================================

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getChallenges()
      .then(setChallenges)
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === "ALL" ? challenges : challenges.filter((c) => c.status === statusFilter);

  async function handleResolve(method: ResolutionMethod) {
    if (!selected) return;
    setResolving(true);
    try {
      await resolveChallenge(selected.id, method);
      const newStatus: ChallengeStatus = method === "uphold" ? "UPHELD" : method === "dismiss" ? "DISMISSED" : "RESOLVED";
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, status: newStatus, resolutionMethod: method, resolvedAt: new Date().toISOString() }
            : c
        )
      );
      setSelected(null);
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" /> Challenge Protocol
        </h1>
        <p className="text-muted-foreground">Review and resolve memory challenges.</p>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ChallengeStatus | "ALL")}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="UPHELD">Upheld</option>
          <option value="DISMISSED">Dismissed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Memory</TableHead>
              <TableHead>Challenger</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No challenges found</TableCell></TableRow>
            ) : (
              filtered.map((c) => {
                const sc = statusColor[c.status];
                return (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(c)}>
                    <TableCell className="max-w-xs truncate">{c.memoryPreview}</TableCell>
                    <TableCell>{c.challengerName}</TableCell>
                    <TableCell className="max-w-xs truncate">{c.reason}</TableCell>
                    <TableCell><Badge variant="outline" className={`${sc.bg} ${sc.text} border-0`}>{c.status}</Badge></TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Challenge Detail</DialogTitle>
            <DialogDescription>Review the challenge and choose a resolution.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Full Memory</p>
                <Card><CardContent className="p-3 text-sm whitespace-pre-wrap">{selected.memoryFull}</CardContent></Card>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Challenge Evidence</p>
                <Card><CardContent className="p-3 text-sm whitespace-pre-wrap">{selected.evidence}</CardContent></Card>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className={`${statusColor[selected.status].bg} ${statusColor[selected.status].text} border-0`}>{selected.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Challenger:</span> {selected.challengerName}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Reason:</span> {selected.reason}
              </div>
            </div>
          )}
          {selected?.status === "OPEN" && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleResolve("dismiss")} disabled={resolving}>Dismiss</Button>
              <Button variant="destructive" onClick={() => handleResolve("uphold")} disabled={resolving}>Uphold</Button>
              <Button onClick={() => handleResolve("resolve")} disabled={resolving}>
                {resolving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Resolve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
