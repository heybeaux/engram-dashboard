"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ShieldAlert,
  Loader2,
  ChevronDown,
  AlertTriangle,
  HelpCircle,
  Zap,
  Server,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getChallenges,
  createChallenge,
  resolveChallenge,
  type Challenge,
  type ChallengeType,
  type ChallengeResolution,
  type CreateChallengeRequest,
} from "@/lib/identity-api";

const typeConfig: Record<ChallengeType, { icon: React.ReactNode; class: string; label: string }> = {
  unsafe: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Unsafe" },
  underspecified: { icon: <HelpCircle className="h-3 w-3" />, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Underspecified" },
  capability_mismatch: { icon: <Zap className="h-3 w-3" />, class: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Capability Mismatch" },
  resource_constraint: { icon: <Server className="h-3 w-3" />, class: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Resource Constraint" },
};

const CHALLENGE_TYPES: ChallengeType[] = ["unsafe", "underspecified", "capability_mismatch", "resource_constraint"];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function TypeBadge({ type }: { type: ChallengeType }) {
  const config = typeConfig[type];
  return (
    <Badge variant="outline" className={`gap-1 ${config.class}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function ChallengeSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ChallengeType | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateChallengeRequest>({
    type: "unsafe",
    title: "",
    description: "",
  });

  // Resolve dialog
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<Challenge | null>(null);
  const [resolution, setResolution] = useState<ChallengeResolution>("accept");
  const [resolveNote, setResolveNote] = useState("");

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { challenges } = await getChallenges({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setChallenges(challenges);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createChallenge(form);
      setCreateOpen(false);
      setForm({ type: "unsafe", title: "", description: "" });
      fetchChallenges();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to raise challenge");
    } finally {
      setCreating(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setResolving(true);
    try {
      await resolveChallenge(resolveTarget.id, { resolution, note: resolveNote || undefined });
      setResolveOpen(false);
      setResolveTarget(null);
      setResolveNote("");
      fetchChallenges();
    } catch (err) {
      console.error("Failed to resolve challenge:", err);
    } finally {
      setResolving(false);
    }
  };

  const openResolve = (challenge: Challenge) => {
    setResolveTarget(challenge);
    setResolution("accept");
    setResolveNote("");
    setResolveOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Challenge Protocol</h1>
        <Button className="h-11 w-full sm:w-auto" onClick={() => { setCreateError(null); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Raise Challenge
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11">
                  {statusFilter ? <span className="capitalize">{statusFilter}</span> : "All Statuses"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("open")}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("dismissed")}>Dismissed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11">
                  {typeFilter ? typeConfig[typeFilter].label : "All Types"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter(null)}>All Types</DropdownMenuItem>
                {CHALLENGE_TYPES.map((t) => (
                  <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>{typeConfig[t].label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card><CardContent className="py-4 text-center text-destructive">{error}</CardContent></Card>
      )}

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challenge</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <ChallengeSkeleton />
              ) : challenges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No challenges found</p>
                  </TableCell>
                </TableRow>
              ) : (
                challenges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-medium">{c.title}</span>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{c.description}</p>
                    </TableCell>
                    <TableCell><TypeBadge type={c.type} /></TableCell>
                    <TableCell>
                      <Badge variant={c.status === "open" ? "default" : "outline"}>
                        {c.status === "resolved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {c.status === "dismissed" && <XCircle className="h-3 w-3 mr-1" />}
                        <span className="capitalize">{c.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.raisedByName || c.raisedBy.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {c.status === "open" && (
                        <Button variant="outline" size="sm" className="h-9" onClick={() => openResolve(c)}>
                          Resolve
                        </Button>
                      )}
                      {c.resolution && (
                        <span className="text-xs text-muted-foreground capitalize">{c.resolution}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-20" /></CardContent></Card>
          ))
        ) : challenges.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No challenges found</p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm">{c.title}</h3>
                  <Badge variant={c.status === "open" ? "default" : "outline"} className="shrink-0 capitalize">{c.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-2">
                  <TypeBadge type={c.type} />
                  <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                </div>
                {c.status === "open" && (
                  <Button variant="outline" size="sm" className="w-full h-11 mt-2" onClick={() => openResolve(c)}>
                    Resolve
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Challenge Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Raise Challenge</DialogTitle>
            <DialogDescription>Flag an issue with a task delegation or agent capability.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ChallengeType }))}
              >
                {CHALLENGE_TYPES.map((t) => (
                  <option key={t} value={t}>{typeConfig[t].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title <span className="text-destructive">*</span></label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Brief summary" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description <span className="text-destructive">*</span></label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Contract ID (optional)</label>
              <Input value={form.contractId || ""} onChange={(e) => setForm((f) => ({ ...f, contractId: e.target.value || undefined }))} placeholder="Related contract ID" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating} className="h-11 w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={creating} className="h-11 w-full sm:w-auto">
                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Raising...</> : "Raise Challenge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve Challenge Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Challenge</DialogTitle>
            {resolveTarget && <DialogDescription>{resolveTarget.title}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Resolution</label>
              <div className="flex gap-2">
                {(["accept", "override", "modify"] as ChallengeResolution[]).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={resolution === r ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-11 capitalize"
                    onClick={() => setResolution(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Note (optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Explain the resolution"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={resolving} className="h-11 w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleResolve} disabled={resolving} className="h-11 w-full sm:w-auto">
                {resolving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resolving...</> : "Confirm Resolution"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
