"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">
          View team compositions, roles, and collaborative trust profiles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5" aria-hidden="true" />
            Team Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No teams configured yet. Teams form organically as agents collaborate
            on shared memory pools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
