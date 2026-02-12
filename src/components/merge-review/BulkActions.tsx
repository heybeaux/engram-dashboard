"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GitMerge, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";

interface BulkActionsProps {
  totalCandidates: number;
  reviewedCount: number;
  statusFilter: "PENDING" | "REVIEWED" | "ALL";
  onStatusFilterChange: (status: "PENDING" | "REVIEWED" | "ALL") => void;
  minSimilarity: number;
  onMinSimilarityChange: (value: number) => void;
  onBulkMerge: () => void;
  onBulkKeep: () => void;
  bulkLoading: boolean;
}

export function BulkActions({
  totalCandidates,
  reviewedCount,
  statusFilter,
  onStatusFilterChange,
  minSimilarity,
  onMinSimilarityChange,
  onBulkMerge,
  onBulkKeep,
  bulkLoading,
}: BulkActionsProps) {
  const statusLabel =
    statusFilter === "ALL"
      ? "All Status"
      : statusFilter === "PENDING"
      ? "Pending"
      : "Reviewed";

  return (
    <Card>
      <CardContent className="pt-4 md:pt-6">
        <div className="flex flex-col gap-3">
          {/* Counter */}
          <div className="text-sm text-muted-foreground">
            {reviewedCount} of {totalCandidates} candidates reviewed
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none h-11 justify-between"
                >
                  <span>{statusLabel}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onStatusFilterChange("ALL")}
                  className="py-3"
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusFilterChange("PENDING")}
                  className="py-3"
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusFilterChange("REVIEWED")}
                  className="py-3"
                >
                  Reviewed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Min similarity:
              </span>
              <Input
                type="number"
                min={0}
                max={100}
                step={5}
                value={Math.round(minSimilarity * 100)}
                onChange={(e) =>
                  onMinSimilarityChange(Number(e.target.value) / 100)
                }
                className="h-11 w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="h-9"
              disabled={bulkLoading}
              onClick={onBulkMerge}
            >
              {bulkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitMerge className="mr-2 h-4 w-4" />
              )}
              Merge All &gt; 95%
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              disabled={bulkLoading}
              onClick={onBulkKeep}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Keep All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
