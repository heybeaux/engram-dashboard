"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MergeCard } from "@/components/merge-review/MergeCard";
import { BulkActions } from "@/components/merge-review/BulkActions";
import { engram } from "@/lib/engram-client";
import { MergeCandidate } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function MergeReviewPage() {
  const [candidates, setCandidates] = useState<MergeCandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "REVIEWED" | "ALL">("PENDING");
  const [minSimilarity, setMinSimilarity] = useState(0.5);

  const reviewedCount = candidates.filter(
    (c) => c.status === "REVIEWED"
  ).length;

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        status?: "PENDING" | "REVIEWED";
        minSimilarity?: number;
        limit?: number;
      } = { limit: 50 };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (minSimilarity > 0) {
        params.minSimilarity = minSimilarity;
      }

      const result = await engram.getMergeCandidates(params);
      setCandidates(result.candidates);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to fetch merge candidates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch merge candidates"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, minSimilarity]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleReview = async (
    id: string,
    action: "MERGE" | "KEEP" | "SKIP",
    winnerId?: string
  ) => {
    await engram.reviewMergeCandidate(id, { action, winnerId });
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "REVIEWED" as const, reviewAction: action } : c
      )
    );
  };

  const handleBulkMerge = async () => {
    setBulkLoading(true);
    try {
      const highSimilarity = candidates.filter(
        (c) => c.status === "PENDING" && c.similarity >= 0.95
      );
      for (const candidate of highSimilarity) {
        // Pick the memory with the higher effective score as winner
        const winnerId =
          candidate.memoryA.effectiveScore >= candidate.memoryB.effectiveScore
            ? candidate.memoryA.id
            : candidate.memoryB.id;
        await engram.reviewMergeCandidate(candidate.id, {
          action: "MERGE",
          winnerId,
        });
      }
      setCandidates((prev) =>
        prev.map((c) =>
          c.status === "PENDING" && c.similarity >= 0.95
            ? { ...c, status: "REVIEWED" as const, reviewAction: "MERGE" as const }
            : c
        )
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkKeep = async () => {
    setBulkLoading(true);
    try {
      const pending = candidates.filter((c) => c.status === "PENDING");
      for (const candidate of pending) {
        await engram.reviewMergeCandidate(candidate.id, { action: "KEEP" });
      }
      setCandidates((prev) =>
        prev.map((c) =>
          c.status === "PENDING"
            ? { ...c, status: "REVIEWED" as const, reviewAction: "KEEP" as const }
            : c
        )
      );
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Merge Review</h1>
        <p className="text-muted-foreground mt-1">
          Review and resolve duplicate memory candidates
        </p>
      </div>

      {/* Bulk Actions & Filters */}
      <BulkActions
        totalCandidates={total}
        reviewedCount={reviewedCount}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        minSimilarity={minSimilarity}
        onMinSimilarityChange={setMinSimilarity}
        onBulkMerge={handleBulkMerge}
        onBulkKeep={handleBulkKeep}
        bulkLoading={bulkLoading}
      />

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-6">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p>{error}</p>
            <button
              onClick={fetchCandidates}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && candidates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No merge candidates</p>
            <p className="mt-1 text-sm">
              {statusFilter === "PENDING"
                ? "All candidates have been reviewed!"
                : "No candidates match your filters."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Candidate Cards */}
      {!loading &&
        !error &&
        candidates.map((candidate) => (
          <MergeCard
            key={candidate.id}
            candidate={candidate}
            onReview={handleReview}
          />
        ))}

      {/* Bulk loading overlay */}
      {bulkLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg border">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing bulk action...</span>
          </div>
        </div>
      )}
    </div>
  );
}
