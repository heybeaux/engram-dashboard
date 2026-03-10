"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  Brain,
  HelpCircle,
} from "lucide-react";
import { ProfileFormModal } from "@/components/entity-profiles/profile-form-modal";
import { AttributeTable } from "@/components/entity-profiles/attribute-table";
import { MemoryTimeline } from "@/components/entity-profiles/memory-timeline";
import {
  getProfile,
  getProfileMemories,
  deleteProfile,
  type EntityProfile,
  type EntityMemory,
  type EntityType,
} from "@/lib/api/entity-profiles";
import {
  User,
  Building2,
  FolderKanban,
  Lightbulb,
  MapPin,
  CalendarDays,
} from "lucide-react";

// ============================================================================
// HELPERS
// ============================================================================

const TYPE_ICONS: Record<EntityType, React.ComponentType<{ className?: string }>> = {
  PERSON: User,
  ORGANIZATION: Building2,
  PROJECT: FolderKanban,
  CONCEPT: Lightbulb,
  LOCATION: MapPin,
  EVENT: CalendarDays,
  OTHER: HelpCircle,
};

const TYPE_COLORS: Record<EntityType, string> = {
  PERSON: "bg-blue-500/10 text-blue-600 border-blue-200",
  ORGANIZATION: "bg-purple-500/10 text-purple-600 border-purple-200",
  PROJECT: "bg-green-500/10 text-green-600 border-green-200",
  CONCEPT: "bg-amber-500/10 text-amber-600 border-amber-200",
  LOCATION: "bg-rose-500/10 text-rose-600 border-rose-200",
  EVENT: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  OTHER: "bg-gray-500/10 text-gray-600 border-gray-200",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// DELETE CONFIRMATION DIALOG
// ============================================================================

interface DeleteDialogProps {
  open: boolean;
  profileName: string;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

function DeleteDialog({ open, profileName, onClose, onConfirm, deleting }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Profile</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Are you sure you want to delete <strong>{profileName}</strong>? This action cannot be
          undone. All associated attributes will be removed.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-64" />
    </div>
  );
}

// ============================================================================
// DETAIL PAGE
// ============================================================================

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [memories, setMemories] = useState<EntityMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [memoriesLoading, setMemoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---- Fetch profile ----
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile(profileId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // ---- Fetch memories ----
  const fetchMemories = useCallback(async () => {
    setMemoriesLoading(true);
    try {
      const data = await getProfileMemories(profileId);
      setMemories(data);
    } catch {
      // Non-fatal — memories may not be available
      setMemories([]);
    } finally {
      setMemoriesLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
    fetchMemories();
  }, [fetchProfile, fetchMemories]);

  // ---- Delete ----
  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProfile(profileId);
      router.push("/identity/profiles");
    } catch (err) {
      // Show error inline; don't close dialog
      setDeleting(false);
      setShowDelete(false);
      setError(err instanceof Error ? err.message : "Failed to delete profile.");
    }
  }

  // ---- Profile updated via edit modal ----
  function handleSaved(updated: EntityProfile) {
    setProfile(updated);
  }

  // ---- Render guards ----
  if (loading) return <DetailSkeleton />;

  if (error && !profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/identity/profiles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profiles
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-destructive">{error}</p>
            <Button variant="link" onClick={fetchProfile} className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const Icon = TYPE_ICONS[profile.type] ?? HelpCircle;
  const colorClass = TYPE_COLORS[profile.type] ?? TYPE_COLORS.OTHER;

  // Most recent memory date
  const lastMentioned =
    memories.length > 0
      ? memories.reduce((latest, m) =>
          new Date(m.createdAt) > new Date(latest.createdAt) ? m : latest,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
        <Link href="/identity/profiles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profiles
        </Link>
      </Button>

      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon */}
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-7 w-7 text-primary" />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold truncate">{profile.name}</h1>
                <Badge variant="outline" className={`text-xs ${colorClass}`}>
                  {profile.type}
                </Badge>
              </div>

              {profile.aliases.length > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  Also known as:{" "}
                  <span className="font-medium">{profile.aliases.join(", ")}</span>
                </p>
              )}

              {profile.description ? (
                <p className="text-sm text-muted-foreground max-w-2xl">{profile.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEdit(true)}
                className="gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDelete(true)}
                className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* TWO-COLUMN LAYOUT: facts (left) + activity (right)                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verified Facts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verified Facts</CardTitle>
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
                <Brain className="h-4 w-4" />
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
        </div>

        {/* Right column — Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Brain className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Attached memories</p>
                  <p className="text-sm font-semibold">
                    {memoriesLoading ? "—" : memories.length}
                  </p>
                </div>
              </div>

              {lastMentioned && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last mentioned</p>
                    <p className="text-sm font-semibold">
                      {formatDate(lastMentioned.createdAt)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-semibold">{formatDateTime(profile.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last updated</p>
                  <p className="text-sm font-semibold">{formatDateTime(profile.updatedAt)}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">Normalized name</p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono break-all">
                  {profile.normalizedName}
                </code>
              </div>

              {profile.aliases.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Aliases</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.aliases.map((alias) => (
                      <Badge key={alias} variant="secondary" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODALS                                                              */}
      {/* ------------------------------------------------------------------ */}
      <ProfileFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={handleSaved}
        profile={profile}
      />

      <DeleteDialog
        open={showDelete}
        profileName={profile.name}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
