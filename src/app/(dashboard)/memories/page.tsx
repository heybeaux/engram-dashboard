"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataList,
  DataListItem,
  DataListRow,
  DataListHeader,
  DataListActions,
} from "@/components/ui/data-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { engram, Memory, MemoryWithScore, MemoryLayer } from "@/lib/engram-client";

const LAYER_OPTIONS: MemoryLayer[] = ["IDENTITY", "PROJECT", "SESSION", "TASK"];
const PAGE_SIZE = 25;

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

function formatDate(dateString: string): string {
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
  return date.toLocaleDateString();
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-3 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-2 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-16 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function MobileListSkeleton() {
  return (
    <DataList>
      {[...Array(5)].map((_, i) => (
        <DataListItem key={i}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </DataListItem>
      ))}
    </DataList>
  );
}

export default function MemoriesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(initialQuery);
  const [layerFilter, setLayerFilter] = useState<MemoryLayer | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [memories, setMemories] = useState<(Memory | MemoryWithScore)[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch users for the filter dropdown
  useEffect(() => {
    engram.getUsers().then(({ users }) => {
      setUsers(users.map((u) => u.id));
    }).catch(console.error);
  }, []);

  // Fetch memories
  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      if (search.trim()) {
        // Use semantic search when there's a search query
        setSearching(true);
        setIsSemanticSearch(true);
        const layers = layerFilter ? [layerFilter] : undefined;
        const result = await engram.searchMemories(
          search,
          { limit: PAGE_SIZE, layers },
          userFilter || undefined
        );
        setMemories(result.memories ?? []);
        setTotal(result.memories.length);
        setPage(0); // Reset to first page on new search
      } else {
        // Use regular listing when no search
        setIsSemanticSearch(false);
        const result = await engram.getMemories({
          layer: layerFilter || undefined,
          userId: userFilter || undefined,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        });
        setMemories(result.memories ?? []);
        setTotal(result.total ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [search, layerFilter, userFilter, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMemories();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchMemories, search]);

  // Handle delete
  const handleDelete = async () => {
    if (!memoryToDelete) return;
    setDeleting(true);
    try {
      await engram.deleteMemory(memoryToDelete);
      setMemories((prev) => prev.filter((m) => m.id !== memoryToDelete));
      setTotal((prev) => prev - 1);
      setDeleteDialogOpen(false);
      setMemoryToDelete(null);
    } catch (error) {
      console.error("Failed to delete memory:", error);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setMemoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const startIdx = page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, total);
  const hasNextPage = (page + 1) * PAGE_SIZE < total;
  const hasPrevPage = page > 0;

  // Render memory card for mobile
  const renderMemoryCard = (memory: Memory | MemoryWithScore) => {
    const score = "score" in memory ? memory.score : null;
    return (
      <DataListItem key={memory.id}>
        <DataListHeader>
          <p className="line-clamp-2 text-sm">{memory.raw}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
            {memory.id}
          </p>
        </DataListHeader>

        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className={layerColors[memory.layer]}>
            {memory.layer}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {memory.userId}
          </span>
        </div>

        <DataListRow label="Created">
          {formatDate(memory.createdAt)}
        </DataListRow>

        <DataListRow label={isSemanticSearch ? "Similarity" : "Importance"}>
          {isSemanticSearch && score !== null && score !== undefined ? (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              {(score * 100).toFixed(1)}%
            </span>
          ) : (
            <span>{(memory.importanceScore * 100).toFixed(0)}%</span>
          )}
        </DataListRow>

        <DataListRow label="Retrieved">
          {memory.retrievalCount} times
        </DataListRow>

        <DataListActions>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 h-11"
          >
            <Link href={`/memories/${memory.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-11 text-destructive hover:text-destructive"
            onClick={() => confirmDelete(memory.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DataListActions>
      </DataListItem>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Memories</h1>
        <Button
          className="h-11 w-full sm:w-auto"
          disabled={creating}
          onClick={async () => {
            setCreating(true);
            try {
              await engram.createMemory({
                  raw: "Test memory created from dashboard at " + new Date().toISOString(),
                  layer: "SESSION",
                });
              fetchMemories();
            } catch (err) {
              console.error("Failed to create test memory:", err);
            } finally {
              setCreating(false);
            }
          }}
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Memory
            </>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              {searching ? (
                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                placeholder="Search memories semantically..."
                className="pl-10 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 justify-between">
                    <span className="truncate">{userFilter || "All Users"}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setUserFilter(null)} className="py-3">
                    All Users
                  </DropdownMenuItem>
                  {users.map((userId) => (
                    <DropdownMenuItem
                      key={userId}
                      onClick={() => setUserFilter(userId)}
                      className="py-3"
                    >
                      {userId}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 justify-between">
                    <span className="truncate">{layerFilter || "All Layers"}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLayerFilter(null)} className="py-3">
                    All Layers
                  </DropdownMenuItem>
                  {LAYER_OPTIONS.map((layer) => (
                    <DropdownMenuItem
                      key={layer}
                      onClick={() => setLayerFilter(layer)}
                      className="py-3"
                    >
                      {layer.charAt(0) + layer.slice(1).toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {isSemanticSearch && !loading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Showing semantic search results ranked by similarity</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Memory</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>{isSemanticSearch ? "Similarity" : "Importance"}</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Retrieved</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : memories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? "No memories found matching your search" : "No memories yet"}
                  </TableCell>
                </TableRow>
              ) : (
                memories.map((memory) => {
                  const score = "score" in memory ? memory.score : null;
                  return (
                    <TableRow key={memory.id}>
                      <TableCell className="max-w-md">
                        <p className="truncate font-medium">{memory.raw}</p>
                        <p className="text-xs text-muted-foreground">{memory.id}</p>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{memory.userId}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={layerColors[memory.layer]}
                        >
                          {memory.layer}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSemanticSearch && score !== null && score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {(score * 100).toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${memory.importanceScore * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {memory.importanceScore.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(memory.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {memory.retrievalCount} times
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild className="h-11 w-11">
                            <Link href={`/memories/${memory.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => confirmDelete(memory.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="lg:hidden">
        {loading ? (
          <MobileListSkeleton />
        ) : memories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search ? "No memories found matching your search" : "No memories yet"}
            </CardContent>
          </Card>
        ) : (
          <DataList>
            {memories.map(renderMemoryCard)}
          </DataList>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          {total > 0 ? (
            <>Showing {startIdx}-{endIdx} of {total.toLocaleString()}</>
          ) : (
            "No memories"
          )}
        </p>
        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage || loading}
            onClick={() => setPage((p) => p - 1)}
            className="flex-1 sm:flex-none h-11"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage || loading}
            onClick={() => setPage((p) => p + 1)}
            className="flex-1 sm:flex-none h-11"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
