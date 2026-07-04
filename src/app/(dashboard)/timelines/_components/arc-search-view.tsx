"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SearchX, X } from "lucide-react";
import { engram, EngramApiError } from "@/lib/engram-client";
import type { ArcSearchRequest, ArcSearchResult } from "@/lib/types";
import { ArcResultCard } from "./arc-result-card";
import { ArcDetail } from "./arc-detail";
import { BrowseByDay } from "./browse-by-day";

type SearchState = "idle" | "loading" | "loaded" | "error";

export function ArcSearchView() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [state, setState] = useState<SearchState>("idle");
  const [arcs, setArcs] = useState<ArcSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ArcSearchResult | null>(null);

  const hasCriteria = Boolean(query.trim() || from || to);

  const runSearch = async () => {
    if (!hasCriteria) {
      setError("Enter a search query or pick a date range.");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);
    setSelected(null);

    const body: ArcSearchRequest = { lod: "summary" };
    if (query.trim()) body.query = query.trim();
    if (from) body.from = from;
    if (to) body.to = to;

    try {
      const result = await engram.searchArcs(body);
      setArcs(result.arcs);
      setState("loaded");
    } catch (err) {
      const message =
        err instanceof EngramApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Arc search failed.";
      setError(message);
      setArcs([]);
      setState("error");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setFrom("");
    setTo("");
    setArcs([]);
    setError(null);
    setSelected(null);
    setState("idle");
  };

  if (selected) {
    return <ArcDetail arc={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search arcs, e.g. “WhaleHawk launch work”"
                className="pl-9"
                aria-label="Arc search query"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label htmlFor="arc-from" className="text-xs font-medium text-muted-foreground">
                  From
                </label>
                <Input
                  id="arc-from"
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="arc-to" className="text-xs font-medium text-muted-foreground">
                  To
                </label>
                <Input
                  id="arc-to"
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={state === "loading"} className="h-11">
                  <Search className="mr-1.5 h-4 w-4" />
                  Search
                </Button>
                {(hasCriteria || state !== "idle") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSearch}
                    className="h-11"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results / states */}
      {state === "loading" && (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          {hasCriteria && (
            <Button variant="outline" size="sm" onClick={runSearch} className="mt-3">
              Retry
            </Button>
          )}
        </div>
      )}

      {state === "loaded" && arcs.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border p-10 text-center">
          <SearchX className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No arcs matched your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a broader query or a wider date range.
          </p>
        </div>
      )}

      {state === "loaded" && arcs.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {arcs.length} {arcs.length === 1 ? "arc" : "arcs"} found
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {arcs.map((arc) => (
              <ArcResultCard key={arc.arcId} arc={arc} onOpen={setSelected} />
            ))}
          </div>
        </div>
      )}

      {/* Browse-by-day fallback when no search is active */}
      {state === "idle" && <BrowseByDay />}
    </div>
  );
}
