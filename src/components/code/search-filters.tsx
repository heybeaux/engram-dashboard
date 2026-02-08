"use client";

import { ChunkType, CodeProject } from "@/types/code";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  projects: CodeProject[];
  selectedProjectId?: string;
  selectedLanguage?: string;
  selectedChunkType?: ChunkType;
  availableLanguages?: string[];
  onProjectChange: (projectId?: string) => void;
  onLanguageChange: (language?: string) => void;
  onChunkTypeChange: (chunkType?: ChunkType) => void;
  onClearAll: () => void;
  className?: string;
}

const CHUNK_TYPES: ChunkType[] = [
  "class",
  "method",
  "function",
  "interface",
  "type",
  "enum",
  "constant",
  "file",
];

const COMMON_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "java",
  "apex",
  "lwc",
  "html",
  "css",
  "json",
  "sql",
];

export function SearchFilters({
  projects,
  selectedProjectId,
  selectedLanguage,
  selectedChunkType,
  availableLanguages,
  onProjectChange,
  onLanguageChange,
  onChunkTypeChange,
  onClearAll,
  className,
}: SearchFiltersProps) {
  const hasFilters =
    selectedProjectId || selectedLanguage || selectedChunkType;

  const languages = availableLanguages ?? COMMON_LANGUAGES;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs"
          >
            Clear all
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Project filter */}
      {projects.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Project
          </label>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={!selectedProjectId ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/80"
              onClick={() => onProjectChange(undefined)}
            >
              All
            </Badge>
            {projects.map((project) => (
              <Badge
                key={project.id}
                variant={selectedProjectId === project.id ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary/80"
                onClick={() => onProjectChange(project.id)}
              >
                {project.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Language filter */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Language
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={!selectedLanguage ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-primary/80"
            onClick={() => onLanguageChange(undefined)}
          >
            All
          </Badge>
          {languages.map((lang) => (
            <Badge
              key={lang}
              variant={selectedLanguage === lang ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/80"
              onClick={() => onLanguageChange(lang)}
            >
              {lang}
            </Badge>
          ))}
        </div>
      </div>

      {/* Chunk type filter */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Chunk Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={!selectedChunkType ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-primary/80"
            onClick={() => onChunkTypeChange(undefined)}
          >
            All
          </Badge>
          {CHUNK_TYPES.map((type) => (
            <Badge
              key={type}
              variant={selectedChunkType === type ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/80 capitalize"
              onClick={() => onChunkTypeChange(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
