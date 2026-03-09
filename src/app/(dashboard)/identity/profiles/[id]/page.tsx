"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Brain,
  Tag,
  Calendar,
  LayoutList,
} from "lucide-react";

import { ProfileFormModal } from "@/components/entity-profiles/profile-form-modal";
import { AttributeTable } from "@/components/entity-profiles/attribute-table";
import { MemoryTimeline } from "@/components/entity-profiles/memory-timeline";
import { TYPE_ICONS, TYPE_COLORS } from "@/components/entity-profiles/profile-card";

import {
  getProfile,
  deleteProfile,
  getProfileMemories,
  type EntityProfile,
  type EntityMemory,
} from "@/lib/api/entity-profiles";

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================================================
// SKELETON
// ============================================================================

function ProfileDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [memories, setMemories] = useState<EntityMemory[]>([]);
  const [memoriesLoading, setMemoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getProfile(id);
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMemories = useCallback(async () => {
    setMemoriesLoading(true);
    try {
      const mems = await getProfileMemories(id);
      setMemories(mems);
    } catch {
      // silent — memories are secondary
    } finally {
      setMemoriesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
    fetchMemories();
  }, [fetchProfile, fetchMemories]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProfile(id);
      router.push("/identity/profiles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete profile.");
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) return <ProfileDetailSkeleton />;

  if (error && !profile) {
    return (
      <div className="space-y-4">
        <Link href="/identity/profiles">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Profiles
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            {error}
            <div className="mt-3">
              <Button variant="outline" onClick={fetchProfile}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const Icon = TYPE_ICONS[profile.type] ?? TYPE_ICONS.OTHER;
  const colorClass = TYPE_COLORS[profile.type] ?? TYPE_COLORS.OTHER;
  const verifiedCount = profile.attributes.filter((a) => a.verified).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Back nav */}
      <Link href="/identity/profiles">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-1">
          <ArrowLeft className="h-4 w-4" />
          Profiles
        </Button>
      </Link>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{profile.name}</h1>
            <Badge variant="outline" className={`${colorClass} text-xs`}>
              {profile.type}
            </Badge>
          </div>
          {profile.description && (
            <p className="text-muted-foreground text-sm max-w-2xl">{profile.description}</p>
          )}
          {profile.aliases.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.aliases.map((alias) => (
                <Badge key={alias} variant="secondary" className="text-xs">
                  {alias}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Brain className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{memories.length}</p>
            <p className="text-xs text-muted-foreground">Memories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Tag className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{profile.attributes.length}</p>
            <p className="text-xs text-muted-foreground">Attributes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <LayoutList className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{verifiedCount}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-sm font-semibold">{formatDate(profile.updatedAt)}</p>
            <p className="text-xs text-muted-foreground">Last Updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Verified Facts / Attributes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Verified Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttributeTable
            profileId={profile.id}
            attributes={profile.attributes}
            onChange={(updated) =>
              setProfile((prev) => prev ? { ...prev, attributes: updated } : prev)
            }
          />
        </CardContent>
      </Card>

      {/* Memory Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Memory Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemoryTimeline
            profileId={profile.id}
            memories={memories}
            loading={memoriesLoading}
            onChange={setMemories}
          />
        </CardContent>
      </Card>

      {/* Meta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">Created</dt>
              <dd className="font-medium">{formatDate(profile.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">Last Updated</dt>
              <dd className="font-medium">{formatDate(profile.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">Normalized Name</dt>
              <dd className="font-mono text-xs">{profile.normalizedName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-0.5">ID</dt>
              <dd className="font-mono text-xs break-all">{profile.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ProfileFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        onSaved={(updated) => {
          setProfile(updated);
          setShowEdit(false);
        }}
      />

      {/* Delete Confirmation */}
      <Dialog open={showDelete} onOpenChange={(v) => !v && setShowDelete(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{profile.name}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
