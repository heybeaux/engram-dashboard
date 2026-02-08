"use client";

import Link from "next/link";
import { CodeChunk, ChunkType } from "@/types/code";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CodeViewer } from "./code-viewer";
import { FileCode, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChunkCardProps {
  chunk: CodeChunk;
  score?: number;
  highlights?: string[];
  onClick?: () => void;
  showPreview?: boolean;
  maxPreviewLines?: number;
  className?: string;
}

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

/**
 * Get score color based on similarity score
 */
function getScoreColor(score: number): string {
  if (score >= 0.9) return "text-green-500";
  if (score >= 0.7) return "text-yellow-500";
  if (score >= 0.5) return "text-orange-500";
  return "text-red-500";
}

/**
 * Format file path for display (truncate if too long)
 */
function formatFilePath(path: string, maxLength = 60): string {
  if (path.length <= maxLength) return path;
  const parts = path.split("/");
  if (parts.length <= 3) return path;
  return `.../${parts.slice(-3).join("/")}`;
}

export function ChunkCard({
  chunk,
  score,
  highlights,
  onClick,
  showPreview = true,
  maxPreviewLines = 8,
  className,
}: ChunkCardProps) {
  const { variant, label } = getChunkTypeBadge(chunk.chunkType);

  const content = (
    <Card
      className={cn(
        "hover:border-primary/50 transition-colors cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate" title={chunk.filePath}>
                  {formatFilePath(chunk.filePath)}
                </span>
                <span className="text-muted-foreground text-sm">
                  :{chunk.lineStart}
                  {chunk.lineEnd !== chunk.lineStart && `-${chunk.lineEnd}`}
                </span>
              </div>
              {chunk.name && (
                <div className="text-sm text-muted-foreground truncate">
                  {chunk.parentName && (
                    <span className="text-primary/70">{chunk.parentName}.</span>
                  )}
                  <span className="font-mono">{chunk.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {score !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  getScoreColor(score)
                )}
                title={`Similarity score: ${(score * 100).toFixed(1)}%`}
              >
                <Hash className="h-3 w-3" />
                {(score * 100).toFixed(0)}%
              </div>
            )}
            <Badge variant={variant} className="text-xs">
              {label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {chunk.language}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Code preview */}
        {showPreview && chunk.content && (
          <div className="mt-2">
            <CodeViewer
              content={chunk.content}
              language={chunk.language}
              lineStart={chunk.lineStart}
              maxLines={maxPreviewLines}
              showLineNumbers={true}
            />
          </div>
        )}

        {/* Highlights from search */}
        {highlights && highlights.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground mb-1">Matches:</div>
            <div className="flex flex-wrap gap-1">
              {highlights.slice(0, 5).map((h, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">
                  {h.length > 30 ? h.slice(0, 30) + "..." : h}
                </Badge>
              ))}
              {highlights.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{highlights.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If there's a click handler, wrap with a div, otherwise wrap with Link
  if (onClick) {
    return content;
  }

  return (
    <Link href={`/code/chunks/${chunk.id}`} className="block">
      {content}
    </Link>
  );
}

/**
 * Skeleton loading state for ChunkCard
 */
export function ChunkCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-muted rounded mb-1" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="h-32 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}
