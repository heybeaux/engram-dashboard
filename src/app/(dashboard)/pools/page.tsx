"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Database } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { MemoryPool, PoolVisibility } from "@/lib/types";

const PAGE_SIZE = 25;

const visibilityColors: Record<PoolVisibility, string> = {
  GLOBAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SHARED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PRIVATE: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default function PoolsPage() {
  const [pools, setPools] = useState<MemoryPool[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [visFilter, setVisFilter] = useState<PoolVisibility | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    try {
      const result = await engram.getPools({
        visibility: visFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setPools(result.pools ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      console.error("Failed to fetch pools:", error);
    } finally {
      setLoading(false);
    }
  }, [visFilter, page]);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  const startIdx = page * PAGE_SIZE + 1;
  const endIdx = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Memory Pools</h1>
      </div>

      <Card>
        <CardContent className="pt-4 md:pt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 justify-between">
                <span>{visFilter || "All Visibility"}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setVisFilter(null); setPage(0); }} className="py-3">All Visibility</DropdownMenuItem>
              {(["GLOBAL", "SHARED", "PRIVATE"] as PoolVisibility[]).map((v) => (
                <DropdownMenuItem key={v} onClick={() => { setVisFilter(v); setPage(0); }} className="py-3">{v}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No memory pools found
                  </TableCell>
                </TableRow>
              ) : (
                pools.map((pool) => (
                  <TableRow key={pool.id}>
                    <TableCell className="font-medium">{pool.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={visibilityColors[pool.visibility]}>
                        {pool.visibility}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{pool.memberCount ?? "—"}</TableCell>
                    <TableCell>
                      {pool.createdBySession ? (
                        <code className="text-xs">{pool.createdBySession}</code>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(pool.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="h-11 w-11">
                        <Link href={`/pools/${pool.id}`}>
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
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `Showing ${startIdx}-${endIdx} of ${total}` : "No pools"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="h-11">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= total || loading} onClick={() => setPage(p => p + 1)} className="h-11">
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
