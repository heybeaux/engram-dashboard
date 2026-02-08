"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  FolderGit2,
  Search,
  FileCode,
  Database,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  engramCode,
  CodeProject,
  ProjectStats,
  SearchResult,
  ChunkType,
} from "@/lib/engram-code";
import { ChunkCard, ChunkCardSkeleton } from "@/components/code/chunk-card";
import { SearchFilters } from "@/components/code/search-filters";

interface ProjectWithStats extends CodeProject {
  stats?: ProjectStats;
}

const RESULTS_PER_PAGE = 10;

export default function CodePage() {
  // Project state
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const [totalFound, setTotalFound] = useState(0);

  // Filter state
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();
  const [selectedChunkType, setSelectedChunkType] = useState<ChunkType | undefined>();

  // Pagination state
  const [displayLimit, setDisplayLimit] = useState(RESULTS_PER_PAGE);

  // Derived state
  const totalFiles = projects.reduce((acc, p) => acc + (p.stats?.totalFiles ?? 0), 0);
  const totalChunks = projects.reduce((acc, p) => acc + (p.stats?.totalChunks ?? 0), 0);

  // Get available languages from projects
  const availableLanguages = Array.from(
    new Set(projects.flatMap((p) => p.languages))
  ).sort();

  // Fetch projects on mount
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError(null);
    try {
      const projectList = await engramCode.listProjects();

      // Fetch stats for each project
      const projectsWithStats = await Promise.all(
        projectList.map(async (project) => {
          try {
            const stats = await engramCode.getProjectStats(project.id);
            return { ...project, stats };
          } catch {
            return { ...project };
          }
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjectsError(
        "Failed to connect to engram-code service. Is it running on localhost:3003?"
      );
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setDisplayLimit(RESULTS_PER_PAGE);

    try {
      const response = await engramCode.search(searchQuery, {
        projectId: selectedProjectId,
        language: selectedLanguage,
        chunkType: selectedChunkType,
        limit: 50, // Fetch more, paginate client-side
      });

      setSearchResults(response.results);
      setSearchTimeMs(response.latencyMs);
      setTotalFound(response.totalFound);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, selectedProjectId, selectedLanguage, selectedChunkType]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedProjectId(undefined);
    setSelectedLanguage(undefined);
    setSelectedChunkType(undefined);
  };

  // Load more results
  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + RESULTS_PER_PAGE);
  };

  const displayedResults = searchResults.slice(0, displayLimit);
  const hasMoreResults = displayLimit < searchResults.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Code Search</h1>
          <p className="text-muted-foreground">
            Semantic search across your indexed codebases
          </p>
        </div>
        <Link href="/code/projects">
          <Button variant="outline">
            <FolderGit2 className="mr-2 h-4 w-4" />
            Manage Projects
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{projects.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Files Indexed</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Code Chunks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalChunks.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Error */}
      {projectsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{projectsError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <SearchFilters
                projects={projects}
                selectedProjectId={selectedProjectId}
                selectedLanguage={selectedLanguage}
                selectedChunkType={selectedChunkType}
                availableLanguages={availableLanguages}
                onProjectChange={setSelectedProjectId}
                onLanguageChange={setSelectedLanguage}
                onChunkTypeChange={setSelectedChunkType}
                onClearAll={handleClearFilters}
              />
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search code... e.g., 'where is authentication handled?'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={!searchQuery.trim() || searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searching ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <ChunkCardSkeleton key={i} />
              ))}
            </div>
          ) : searchError ? (
            <Card className="border-destructive">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-3 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p>{searchError}</p>
                  <Button variant="outline" onClick={handleSearch}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : hasSearched && searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your search query or filters.
                  </p>
                  {(selectedProjectId || selectedLanguage || selectedChunkType) && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : hasSearched ? (
            <div className="space-y-4">
              {/* Results header */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {displayedResults.length} of {totalFound} results
                </span>
                {searchTimeMs !== null && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {searchTimeMs}ms
                  </span>
                )}
              </div>

              {/* Results list */}
              {displayedResults.map((result) => (
                <ChunkCard
                  key={result.chunk.id}
                  chunk={result.chunk}
                  score={result.score}
                  highlights={result.highlights}
                  showPreview={true}
                  maxPreviewLines={6}
                />
              ))}

              {/* Load more button */}
              {hasMoreResults && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={handleLoadMore}>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More ({searchResults.length - displayLimit} remaining)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Initial state - no search yet */
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Search your codebase using natural language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Try searching for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>&quot;where is authentication handled?&quot;</li>
                    <li>&quot;database connection setup&quot;</li>
                    <li>&quot;error handling patterns&quot;</li>
                    <li>&quot;API endpoint definitions&quot;</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
