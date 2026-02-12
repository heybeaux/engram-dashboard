"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimilarityBar } from "./SimilarityBar";
import { MergeCandidate, MergeCandidateMemory } from "@/lib/types";
import {
  GitMerge,
  ShieldCheck,
  SkipForward,
  ChevronDown,
  Loader2,
  Check,
} from "lucide-react";

interface MergeCardProps {
  candidate: MergeCandidate;
  onReview: (
    id: string,
    action: "MERGE" | "KEEP" | "SKIP",
    winnerId?: string
  ) => Promise<void>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MemorySide({ memory, label }: { memory: MergeCandidateMemory; label: string }) {
  return (
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {label}
        </span>
        {memory.layer && (
          <Badge variant="outline" className="text-xs">
            {memory.layer}
          </Badge>
        )}
      </div>
      <p className="text-sm leading-relaxed">
        {memory.content || memory.raw || "—"}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Score: {memory.effectiveScore?.toFixed(2) ?? "—"}</span>
        <span>{formatDate(memory.createdAt)}</span>
        {memory.type && <span>Type: {memory.type}</span>}
        {memory.source && <span>Source: {memory.source}</span>}
      </div>
    </div>
  );
}

export function MergeCard({ candidate, onReview }: MergeCardProps) {
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState(candidate.status === "REVIEWED");

  const handleAction = async (
    action: "MERGE" | "KEEP" | "SKIP",
    winnerId?: string
  ) => {
    setLoading(true);
    try {
      await onReview(candidate.id, action, winnerId);
      setReviewed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={reviewed ? "opacity-60" : undefined}>
      <CardContent className="pt-4 md:pt-6 space-y-4">
        {/* Similarity bar */}
        <SimilarityBar similarity={candidate.similarity} />

        {/* Side-by-side memories */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <MemorySide memory={candidate.memoryA} label="Memory A" />
          <div className="hidden md:block w-px bg-border" />
          <div className="md:hidden h-px bg-border" />
          <MemorySide memory={candidate.memoryB} label="Memory B" />
        </div>

        {/* Actions */}
        {reviewed ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4" />
            <span>
              {candidate.reviewAction === "MERGE"
                ? "Merged"
                : candidate.reviewAction === "KEEP"
                ? "Kept Both"
                : "Skipped"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={loading}
                  className="h-9"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GitMerge className="mr-2 h-4 w-4" />
                  )}
                  Merge
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    handleAction("MERGE", candidate.memoryA.id)
                  }
                  className="py-3"
                >
                  Keep Memory A
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleAction("MERGE", candidate.memoryB.id)
                  }
                  className="py-3"
                >
                  Keep Memory B
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              className="h-9"
              onClick={() => handleAction("KEEP")}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Keep Both
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              className="h-9"
              onClick={() => handleAction("SKIP")}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
