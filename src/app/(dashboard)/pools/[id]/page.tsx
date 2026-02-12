"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Database, Shield, Brain } from "lucide-react";
import { engram } from "@/lib/engram-client";
import type { MemoryPool, PoolGrant, PoolMember, PoolVisibility } from "@/lib/types";

const visibilityColors: Record<PoolVisibility, string> = {
  GLOBAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SHARED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PRIVATE: "bg-red-500/10 text-red-500 border-red-500/20",
};

const layerColors: Record<string, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PROJECT: "bg-green-500/10 text-green-500 border-green-500/20",
  SESSION: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  TASK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.id as string;
  const [pool, setPool] = useState<MemoryPool | null>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [grants, setGrants] = useState<PoolGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [poolData, membersData, grantsData] = await Promise.all([
          engram.getPool(poolId),
          engram.getPoolMembers(poolId, { limit: 50 }),
          engram.getPoolGrants(poolId),
        ]);
        setPool(poolData);
        setMembers(membersData.members);
        setGrants(grantsData.grants);
      } catch (err) {
        console.error("Failed to fetch pool:", err);
        setError("Could not load pool details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [poolId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
          <Link href="/pools"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>
        <Card><CardContent className="py-8 text-center text-muted-foreground">{error || "Pool not found"}</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Button variant="ghost" size="sm" asChild className="h-11 w-fit">
        <Link href="/pools"><ArrowLeft className="mr-2 h-4 w-4" />Back to Pools</Link>
      </Button>

      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold">{pool.name}</h1>
        <Badge variant="outline" className={visibilityColors[pool.visibility]}>
          {pool.visibility}
        </Badge>
      </div>
      {pool.description && <p className="text-muted-foreground">{pool.description}</p>}

      {/* Grants */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" /> Access Grants ({grants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grants</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Granted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell><code className="text-xs">{grant.sessionKey}</code></TableCell>
                    <TableCell><Badge variant="secondary">{grant.permissions}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(grant.grantedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Brain className="h-4 w-4" /> Pool Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No memories in this pool</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Memory</TableHead>
                  <TableHead>Layer</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.memoryId}>
                    <TableCell className="max-w-md">
                      <Link href={`/memories/${member.memoryId}`} className="hover:underline">
                        <p className="truncate text-sm">{member.raw}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={layerColors[member.layer]}>
                        {member.layer}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(member.importanceScore * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
