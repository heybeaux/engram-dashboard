"use client";

import { useState } from "react";
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
import { Search, Eye, Download } from "lucide-react";

// Mock data
const mockUsers = [
  {
    id: "user_beaux",
    memoryCount: 847,
    lastActive: "2 min ago",
  },
  {
    id: "user_alex",
    memoryCount: 234,
    lastActive: "1 hour ago",
  },
  {
    id: "user_sam",
    memoryCount: 156,
    lastActive: "Yesterday",
  },
  {
    id: "user_jordan",
    memoryCount: 42,
    lastActive: "3 days ago",
  },
  {
    id: "user_taylor",
    memoryCount: 89,
    lastActive: "5 days ago",
  },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter((user) =>
    user.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <code className="text-sm font-medium">{user.id}</code>
                  </TableCell>
                  <TableCell>{user.memoryCount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastActive}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/users/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Total users: {mockUsers.length}</p>
        <p>
          Total memories:{" "}
          {mockUsers.reduce((acc, u) => acc + u.memoryCount, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
