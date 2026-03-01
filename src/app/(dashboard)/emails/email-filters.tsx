"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Received", value: "received" },
  { label: "Processed", value: "processed" },
  { label: "Unrouted", value: "unrouted" },
  { label: "Failed", value: "failed" },
  { label: "Routed", value: "routed" },
];

interface EmailFiltersProps {
  loading?: boolean;
}

export function EmailFilters({ loading }: EmailFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // Reset to page 1 on filter change
      params.delete("page");
      router.push(`/emails?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/emails");
  }, [router]);

  const hasFilters = search || status || startDate || endDate;
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label ?? "All Statuses";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          placeholder="Search emails by subject or body..."
          className="pl-10 h-11"
          defaultValue={search}
          onChange={(e) => {
            // Debounce handled by the page component via URL updates
            const value = e.target.value;
            // Use a small debounce for typing
            const timer = setTimeout(() => updateParams({ search: value }), 300);
            return () => clearTimeout(timer);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-11 justify-between"
            >
              <span className="truncate">{statusLabel}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => updateParams({ status: opt.value })}
                className="py-3"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="date"
          className="flex-1 sm:flex-none sm:w-40 h-11"
          value={startDate}
          onChange={(e) => updateParams({ startDate: e.target.value })}
          placeholder="Start date"
        />
        <Input
          type="date"
          className="flex-1 sm:flex-none sm:w-40 h-11"
          value={endDate}
          onChange={(e) => updateParams({ endDate: e.target.value })}
          placeholder="End date"
        />

        {hasFilters && (
          <Button
            variant="ghost"
            className="h-11"
            onClick={clearFilters}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
