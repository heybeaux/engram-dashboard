"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Link2, Unlink, Clock } from "lucide-react";
import type { EntityMemory } from "@/lib/api/entity-profiles";
import { attachMemory, detachMemory } from "@/lib/api/entity-profiles";

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function relevanceBadgeClass(score: number): string {
  if (score >= 0.8) return "bg-green-500/10 text-green-700 border-green-200";
  if (score >= 0.5) return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

function truncate(text: string, maxLen = 180): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

// ============================================================================
// ATTACH MEMORY MODAL
// ============================================================================

interface AttachModalProps {
  open: boolean;
  profileId: string;
  onClose: () => void;
  onAttached: (memoryId: string) => void;
}

function AttachMemoryModal({ open, profileId, onClose, onAttached }: AttachModalProps) {
  const [memoryId, setMemoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setMemoryId(""); setError(null);
  }

  async function handleAttach() {
    if (!memoryId.trim()) {
      setError("Please enter a memory ID.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await attachMemory(profileId, memoryId.trim());
      onAttached(memoryId.trim());
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to attach memory.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Attach Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            placeholder="Memory ID"
            value={memoryId}
            onChange={(e) => setMemoryId(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</Button>
          <Button onClick={handleAttach} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Attach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MEMORY TIMELINE
// ============================================================================

interface MemoryTimelineProps {
  profileId: string;
  memories: EntityMemory[];
  loading?: boolean;
  onChange: (updated: EntityMemory[]) => void;
}

export function MemoryTimeline({
  profileId,
  memories,
  loading,
  onChange,
}: MemoryTimelineProps) {
  const [showAttach, setShowAttach] = useState(false);
  const [detaching, setDetaching] = useState<string | null>(null);

  async function handleDetach(memId: string) {
    setDetaching(memId);
    try {
      await detachMemory(profileId, memId);
      onChange(memories.filter((m) => m.id !== memId));
    } catch {
      // silent
    } finally {
      setDetaching(null);
    }
  }

  function handleAttached(memoryId: string) {
    // Add a placeholder — ideally re-fetch, but this keeps it responsive
    const placeholder: EntityMemory = {
      id: memoryId,
      content: "Loading…",
      raw: "Loading…",
      relevanceScore: 0,
      createdAt: new Date().toISOString(),
    };
    onChange([placeholder, ...memories]);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {memories.length} memor{memories.length !== 1 ? "ies" : "y"} attached
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAttach(true)}
          className="gap-1.5"
        >
          <Link2 className="h-3.5 w-3.5" />
          Attach Memory
        </Button>
      </div>

      {memories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No memories attached yet.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => setShowAttach(true)}
          >
            Attach First Memory
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {[...memories]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .map((mem) => (
              <div
                key={mem.id}
                className="flex gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {truncate(mem.content || mem.raw || "")}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(mem.createdAt)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono opacity-60">
                      {mem.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${relevanceBadgeClass(mem.relevanceScore)}`}
                  >
                    {(mem.relevanceScore * 100).toFixed(0)}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    disabled={detaching === mem.id}
                    onClick={() => handleDetach(mem.id)}
                  >
                    {detaching === mem.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Unlink className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <AttachMemoryModal
        open={showAttach}
        profileId={profileId}
        onClose={() => setShowAttach(false)}
        onAttached={handleAttached}
      />
    </div>
  );
}
