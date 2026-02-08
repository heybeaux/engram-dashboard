"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FileCode,
  GitBranch,
  Clock,
  Hash,
  Link as LinkIcon,
  Copy,
  Check,
  AlertCircle,
  FolderGit2,
  ChevronRight,
} from "lucide-react";
import { engramCode, CodeChunk, ChunkType } from "@/lib/engram-code";
import { CodeViewer } from "@/components/code/code-viewer";

/**
 * Get badge variant based on chunk type
 */
function getChunkTypeBadge(type: ChunkType): {
  variant: "default" | "secondary" | "outline" | "destructive";
  label: string;
} {
  const typeMap: Record<
    ChunkType,
    { variant: "default" | "secondary" | "outline" | "destructive"; label: string }
  > = {
    file: { variant: "outline", label: "File" },
    class: { variant: "default", label: "Class" },
    method: { variant: "secondary", label: "Method" },
    function: { variant: "secondary", label: "Function" },
    interface: { variant: "default", label: "Interface" },
    type: { variant: "outline", label: "Type" },
    enum: { variant: "outline", label: "Enum" },
    constant: { variant: "outline", label: "Constant" },
    import: { variant: "outline", label: "Import" },
    export: { variant: "outline", label: "Export" },
    unknown: { variant: "outline", label: "Unknown" },
  };
  return typeMap[type] || { variant: "outline", label: type };
}

export default function ChunkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chunkId = params.id as string;

  const [chunk, setChunk] = useState<CodeChunk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchChunk = useCallback(async () => {
    if (!chunkId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await engramCode.getChunk(chunkId);
      setChunk(data);
    } catch (err) {
      console.error("Failed to fetch chunk:", err);
      setError("Failed to load chunk. It may not exist or the service is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [chunkId]);

  useEffect(() => {
    fetchChunk();
  }, [fetchChunk]);

  const handleCopyCode = async () => {
    if (!chunk) return;
    await navigator.clipboard.writeText(chunk.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPath = async () => {
    if (!chunk) return;
    await navigator.clipboard.writeText(chunk.filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !chunk) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-lg font-semibold">Chunk Not Found</h2>
              <p className="text-muted-foreground text-center max-w-md">
                {error || "The requested code chunk could not be found."}
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Link href="/code">
                  <Button>Search Code</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { variant, label } = getChunkTypeBadge(chunk.chunkType);
  const lineCount = chunk.lineEnd - chunk.lineStart + 1;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/code" className="hover:text-foreground transition-colors">
            Code
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate max-w-[300px]" title={chunk.filePath}>
            {chunk.filePath.split("/").pop()}
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{chunk.name || "Chunk"}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {chunk.name || "Unnamed Chunk"}
                <Badge variant={variant}>{label}</Badge>
                <Badge variant="outline">{chunk.language}</Badge>
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">
                {chunk.filePath}:{chunk.lineStart}-{chunk.lineEnd}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Code viewer */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Code</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CodeViewer
                content={chunk.content}
                language={chunk.language}
                lineStart={chunk.lineStart}
                showLineNumbers={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Metadata panel */}
        <div className="space-y-6">
          {/* File info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FileCode className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">File Path</div>
                  <div
                    className="font-mono text-sm truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={handleCopyPath}
                    title="Click to copy"
                  >
                    {chunk.filePath}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Lines</div>
                  <div className="text-sm">
                    {chunk.lineStart} - {chunk.lineEnd} ({lineCount} lines)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FolderGit2 className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Project ID</div>
                  <div className="font-mono text-sm">{chunk.projectId}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Indexed</div>
                  <div className="text-sm">
                    {new Date(chunk.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chunk metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chunk Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <GitBranch className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <Badge variant={variant} className="mt-1">
                    {label}
                  </Badge>
                </div>
              </div>

              {chunk.parentName && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-xs text-muted-foreground">Parent</div>
                    <div className="font-mono text-sm">{chunk.parentName}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-xs text-muted-foreground">Checksum</div>
                  <div className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {chunk.checksum}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dependencies */}
          {chunk.dependencies && chunk.dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dependencies</CardTitle>
                <CardDescription>
                  Imports and references in this chunk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {chunk.dependencies.map((dep, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
