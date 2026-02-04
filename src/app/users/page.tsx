"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Download, RefreshCw, Loader2 } from "lucide-react";
import { engram } from "@/lib/engram-client";

interface User {
  id: string;
  externalId: string;
  memoryCount: number;
  lastActive: string | null;
  createdAt: string;
}

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
  return time.toLocaleDateString();
}

function MobileListSkeleton() {
  return (
    <DataList>
      {[...Array(5)].map((_, i) => (
        <DataListItem key={i}>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </DataListItem>
      ))}
    </DataList>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await engram.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    (user.externalId || user.id).toLowerCase().includes(search.toLowerCase())
  );

  const totalMemories = users.reduce((acc, u) => acc + (u.memoryCount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
          <Skeleton className="h-11 w-24" />
        </div>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <Skeleton className="h-11 max-w-sm" />
          </CardContent>
        </Card>
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-0">
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:hidden">
          <MobileListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchUsers} variant="outline" className="h-11">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render user card for mobile
  const renderUserCard = (user: User) => (
    <DataListItem key={user.id}>
      <DataListHeader>
        <code className="text-sm font-medium break-all">
          {user.externalId || user.id}
        </code>
      </DataListHeader>

      <DataListRow label="Memories">
        {(user.memoryCount || 0).toLocaleString()}
      </DataListRow>

      <DataListRow label="Last Active">
        {user.lastActive ? formatRelativeTime(user.lastActive) : "Never"}
      </DataListRow>

      <DataListActions>
        <Button variant="outline" size="sm" asChild className="flex-1 h-11">
          <Link href={`/users/${user.externalId || user.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-11">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DataListActions>
    </DataListItem>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <Button onClick={fetchUsers} variant="outline" size="sm" className="h-11 w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-11 max-w-full sm:max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Memories</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {search ? "No users match your search" : "No users found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <code className="text-sm font-medium">{user.externalId || user.id}</code>
                    </TableCell>
                    <TableCell>{(user.memoryCount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.lastActive ? formatRelativeTime(user.lastActive) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild className="h-11">
                          <Link href={`/users/${user.externalId || user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-11">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="md:hidden">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {search ? "No users match your search" : "No users found"}
            </CardContent>
          </Card>
        ) : (
          <DataList>
            {filteredUsers.map(renderUserCard)}
          </DataList>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Total users: {users.length}</p>
        <p>Total memories: {totalMemories.toLocaleString()}</p>
      </div>
    </div>
  );
}
