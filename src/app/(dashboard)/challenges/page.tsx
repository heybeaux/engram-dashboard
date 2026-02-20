"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground">
          Trust challenges and verification tasks for agent capabilities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" aria-hidden="true" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No challenges issued yet. Challenges are generated to verify and
            calibrate agent trust scores in specific domains.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
