"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Patterns and observations surfaced by the awareness system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            Awareness Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No insights surfaced yet. Insights are generated automatically as the
            awareness system observes patterns across your memories and agent
            activity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
