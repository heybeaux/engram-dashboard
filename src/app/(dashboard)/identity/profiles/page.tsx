"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, ChevronLeft, ChevronRight, UserCircle2 } from "lucide-react";
import { ProfileCard } from "@/components/entity-profiles/profile-card";
import { ProfileFormModal } from "@/components/entity-profiles/profile-form-modal";
import {
  listProfiles,
  type EntityProfile,
  type EntityType,
} from "@/lib/api/entity-profiles";

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE = 24;

const ENTITY_TYPES: { value: EntityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "PERSON", label: "Person" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "PROJECT", label: "Project" },
  { value: "CONCEPT", label: "Concept" },
  { value: "LOCATION", label: "Location" },
  { value: "EVENT", label: "Event" },
  { value: "OTHER", label: "Other" },
];

// ============================================================================
// SKELETONS
// ============================================================================

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <Skeleton className="h-10 w-10 rounded-lg mb-3" />
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-3 w-48 mb-3" />
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function EntityProfilesPage() {
  const [profiles, setProfiles] = useState<EntityProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProfiles({
        search: debouncedSearch || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        page,
        limit: PAGE_SIZE,
      });
      setProfiles(res.profiles);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleCreated(profile: EntityProfile) {
    // Prepend to list if on page 1 with no filters
    if (page === 1 && !debouncedSearch && typeFilter === "ALL") {
      setProfiles((prev) => [profile, ...prev].slice(0, PAGE_SIZE));
      setTotal((t) => t + 1);
    } else {
      fetchProfiles();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Entity Profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${total} profile${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Profile
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search profiles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as EntityType | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="py-6 text-center text-destructive text-sm">
            {error}
            <Button variant="link" className="ml-2" onClick={fetchProfiles}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ProfileSkeleton key={i} />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {debouncedSearch || typeFilter !== "ALL"
                ? "No profiles match your filters"
                : "No profiles yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              {debouncedSearch || typeFilter !== "ALL"
                ? "Try adjusting your search or filter."
                : "Create your first entity profile to start tracking people, organizations, projects and more."}
            </p>
            {!debouncedSearch && typeFilter === "ALL" && (
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Profile
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create modal */}
      <ProfileFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={handleCreated}
      />
    </div>
  );
}
