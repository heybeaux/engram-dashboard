"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Download, Trash2, Eye, RefreshCw, Loader2 } from "lucide-react";
import { engram } from "@/lib/engram-client";

interface UserData {
  id: string;
  externalId: string;
  memoryCount: number;
  lastActive: string;
  createdAt: string;
}

interface Memory {
  id: string;
  raw: string;
  layer: string;
  importanceScore: number;
  createdAt: string;
}

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  INSIGHT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return time.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MobileListSkeleton() {
  return (
    <DataList>
      {[...Array(3)].map((_, i) => (
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

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user list and find our user
      const usersResponse = await engram.getUsers();
      const foundUser = usersResponse.users?.find(
        (u) => u.externalId === userId || u.id === userId
      );

      if (foundUser) {
        setUser({
          id: foundUser.id,
          externalId: foundUser.externalId || foundUser.id,
          memoryCount: foundUser.memoryCount || 0,
          lastActive: foundUser.lastActive || "",
          createdAt: foundUser.createdAt || "",
        });

        // Fetch memories using the internal user ID, not the route param
        const memoriesResponse = await engram.getMemories({ userId: foundUser.id, limit: 10 });
        setMemories(memoriesResponse.memories || []);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-9 w-32" />
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-36" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="p-4 md:p-0">
            <div className="hidden md:block">
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
            <div className="md:hidden">
              <MobileListSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="h-11">
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline" className="h-11">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render memory card for mobile
  const renderMemoryCard = (memory: Memory) => (
    <DataListItem key={memory.id}>
      <DataListHeader>
        <p className="line-clamp-2 text-sm">{memory.raw}</p>
      </DataListHeader>

      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="outline" className={layerColors[memory.layer] || ""}>
          {memory.layer}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {(memory.importanceScore || 0).toFixed(2)} importance
        </span>
      </div>

      <DataListRow label="Created">
        {memory.createdAt ? formatRelativeTime(memory.createdAt) : "Unknown"}
      </DataListRow>

      <DataListActions>
        <Button variant="outline" size="sm" asChild className="flex-1 h-11">
          <Link href={`/memories/${memory.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
      </DataListActions>
    </DataListItem>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="h-11">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="destructive" className="h-11">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User Data
          </Button>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle>
            <code className="text-lg md:text-2xl break-all">{user?.externalId || userId}</code>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Memories</p>
              <p className="text-xl md:text-2xl font-bold">
                {(user?.memoryCount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Active</p>
              <p className="text-base md:text-lg">
                {user?.lastActive ? formatRelativeTime(user.lastActive) : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-base md:text-lg">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Memories */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Recent Memories</CardTitle>
          <Button variant="outline" size="sm" asChild className="h-11 w-full sm:w-auto">
            <Link href={`/memories?userId=${userId}`}>View All</Link>
          </Button>
        </CardHeader>
        
        {/* Desktop Table */}
        <CardContent className="p-0 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Memory</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No memories found
                  </TableCell>
                </TableRow>
              ) : (
                memories.map((memory) => (
                  <TableRow key={memory.id}>
                    <TableCell className="max-w-md">
                      <p className="truncate">{memory.raw}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={layerColors[memory.layer] || ""}
                      >
                        {memory.layer}
                      </Badge>
                    </TableCell>
                    <TableCell>{(memory.importanceScore || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {memory.createdAt ? formatRelativeTime(memory.createdAt) : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="h-11 w-11">
                        <Link href={`/memories/${memory.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Mobile Card List */}
        <CardContent className="md:hidden pt-0">
          {memories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No memories found
            </div>
          ) : (
            <DataList>
              {memories.map(renderMemoryCard)}
            </DataList>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
