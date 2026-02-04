"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Trash2, Link as LinkIcon, Copy, Loader2, Check, AlertCircle } from "lucide-react";
import { engram, Memory } from "@/lib/engram-client";

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(dateString);
}

function MemoryDetailSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-11 w-24" />
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
          <Separator />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-2 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5W1H */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="h-11">
          <Link href="/memories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
            <h2 className="text-base md:text-lg font-semibold mb-2">Memory Not Found</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params.id as string;

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchMemory() {
      setLoading(true);
      setError(null);
      try {
        const data = await engram.getMemory(memoryId);
        if (!data) {
          setError("Memory not found");
          return;
        }
        setMemory(data);
      } catch (err) {
        console.error("Failed to fetch memory:", err);
        setError("Could not load this memory. It may have been deleted or the ID is invalid.");
      } finally {
        setLoading(false);
      }
    }
    fetchMemory();
  }, [memoryId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await engram.deleteMemory(memoryId);
      router.push("/memories");
    } catch (err) {
      console.error("Failed to delete memory:", err);
      setDeleting(false);
    }
  };

  const copyEmbeddingId = () => {
    if (memory?.embeddingId) {
      navigator.clipboard.writeText(memory.embeddingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <MemoryDetailSkeleton />;
  }

  if (error || !memory) {
    return <ErrorState message={error || "Memory not found"} />;
  }

  const extraction = memory.extraction;
  const extractionItems = [
    { label: "WHO", value: extraction?.who },
    { label: "WHAT", value: extraction?.what },
    { label: "WHEN", value: extraction?.when },
    { label: "WHERE", value: extraction?.whereCtx },
    { label: "WHY", value: extraction?.why },
    { label: "HOW", value: extraction?.how },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
          <Link href="/memories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Memories
          </Link>
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => setDeleteDialogOpen(true)}
          className="h-11 w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Memory Content */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <p className="text-lg md:text-2xl font-medium">&ldquo;{memory.raw}&rdquo;</p>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <code className="text-xs sm:text-sm break-all">{memory.id}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <code className="text-xs sm:text-sm break-all">{memory.userId}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Layer</p>
              <Badge variant="outline" className={layerColors[memory.layer]}>
                {memory.layer}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(memory.createdAt)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Importance</p>
              <div className="flex items-center gap-3">
                <div className="h-2 w-full max-w-[128px] rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${memory.importanceScore * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {memory.importanceScore.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Confidence</p>
              <div className="flex items-center gap-3">
                <div className="h-2 w-full max-w-[128px] rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${memory.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {memory.confidence.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Retrieved</p>
            <p className="text-sm">
              {memory.retrievalCount} times
              {memory.lastRetrievedAt && (
                <span className="text-muted-foreground">
                  {" "}(last: {formatRelativeTime(memory.lastRetrievedAt)})
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 5W1H Extraction */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">5W1H Extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {extractionItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm">{item.value || "—"}</p>
              </div>
            ))}
          </div>

          {extraction?.topics && extraction.topics.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Topics
                </p>
                <div className="flex flex-wrap gap-1">
                  {extraction.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Memory Chain */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Memory Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No linked memories</p>
          <Button variant="outline" size="sm" className="mt-4 h-11">
            <LinkIcon className="mr-2 h-4 w-4" />
            Link Memory
          </Button>
        </CardContent>
      </Card>

      {/* Embedding Info */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Embedding</CardTitle>
          {memory.embeddingId && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyEmbeddingId}
              className="h-11 w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied ID
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {memory.embeddingId ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Embedding ID</p>
                <code className="text-xs break-all">{memory.embeddingId}</code>
              </div>
              {memory.embeddingModel && (
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <code className="text-xs">{memory.embeddingModel}</code>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No embedding generated yet</p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Delete Memory</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this memory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="h-11 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="h-11 w-full sm:w-auto"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
