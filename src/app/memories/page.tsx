"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mock data
const mockMemories = [
  {
    id: "mem_abc123xyz",
    content: "Beaux prefers tabs over spaces",
    userId: "user_beaux",
    layer: "IDENTITY",
    importance: 0.82,
    createdAt: "2 hours ago",
    retrievalCount: 5,
  },
  {
    id: "mem_def456uvw",
    content: "Never deploy on Fridays - learned the hard way",
    userId: "user_beaux",
    layer: "IDENTITY",
    importance: 1.0,
    createdAt: "2 hours ago",
    retrievalCount: 3,
  },
  {
    id: "mem_ghi789rst",
    content: "Working on Engram memory infrastructure project",
    userId: "user_beaux",
    layer: "PROJECT",
    importance: 0.65,
    createdAt: "1 hour ago",
    retrievalCount: 0,
  },
  {
    id: "mem_jkl012mno",
    content: "Prefers dark mode in all applications",
    userId: "user_alex",
    layer: "IDENTITY",
    importance: 0.55,
    createdAt: "3 hours ago",
    retrievalCount: 2,
  },
  {
    id: "mem_pqr345stu",
    content: "Current sprint ends February 14th",
    userId: "user_beaux",
    layer: "PROJECT",
    importance: 0.78,
    createdAt: "Yesterday",
    retrievalCount: 8,
  },
];

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function MemoriesPage() {
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);

  const filteredMemories = mockMemories.filter((memory) => {
    if (layerFilter && memory.layer !== layerFilter) return false;
    if (userFilter && memory.userId !== userFilter) return false;
    if (search && !memory.content.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Memories</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Test Memory
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search memories semantically..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {userFilter || "All Users"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setUserFilter(null)}>
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserFilter("user_beaux")}>
                    user_beaux
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserFilter("user_alex")}>
                    user_alex
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {layerFilter || "All Layers"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLayerFilter(null)}>
                    All Layers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayerFilter("IDENTITY")}>
                    Identity
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayerFilter("PROJECT")}>
                    Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayerFilter("SESSION")}>
                    Session
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayerFilter("TASK")}>
                    Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Memory</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>Importance</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Retrieved</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMemories.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell className="max-w-md">
                    <p className="truncate font-medium">{memory.content}</p>
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${memory.importance * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {memory.importance.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {memory.createdAt}
                  </TableCell>
                  <TableCell className="text-sm">
                    {memory.retrievalCount} times
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/memories/${memory.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-{filteredMemories.length} of 12,847
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
