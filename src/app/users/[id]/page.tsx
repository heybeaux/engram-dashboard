"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, Trash2, Eye } from "lucide-react";

// Mock data
const mockUser = {
  id: "user_beaux",
  memoryCount: 847,
  lastActive: "2 min ago",
  createdAt: "Jan 15, 2026",
  memories: [
    {
      id: "mem_abc123xyz",
      content: "Beaux prefers tabs over spaces",
      layer: "IDENTITY",
      importance: 0.82,
      createdAt: "2 hours ago",
    },
    {
      id: "mem_def456uvw",
      content: "Never deploy on Fridays - learned the hard way",
      layer: "IDENTITY",
      importance: 1.0,
      createdAt: "2 hours ago",
    },
    {
      id: "mem_ghi789rst",
      content: "Working on Engram memory infrastructure project",
      layer: "PROJECT",
      importance: 0.65,
      createdAt: "1 hour ago",
    },
  ],
};

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function UserDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User Data
          </Button>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            <code className="text-2xl">{mockUser.id}</code>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Memories</p>
              <p className="text-2xl font-bold">
                {mockUser.memoryCount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Active</p>
              <p className="text-lg">{mockUser.lastActive}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg">{mockUser.createdAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Memories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Memories</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/memories?userId=${mockUser.id}`}>View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
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
              {mockUser.memories.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell className="max-w-md">
                    <p className="truncate">{memory.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={layerColors[memory.layer]}
                    >
                      {memory.layer}
                    </Badge>
                  </TableCell>
                  <TableCell>{memory.importance.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {memory.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/memories/${memory.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
