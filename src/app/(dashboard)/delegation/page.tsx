"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function DelegationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delegation</h1>
        <p className="text-muted-foreground">
          Track delegated tasks, outcomes, and trust evolution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" aria-hidden="true" />
            Task History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No delegated tasks recorded yet. Task completions are tracked
            automatically when agents report outcomes via the API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
