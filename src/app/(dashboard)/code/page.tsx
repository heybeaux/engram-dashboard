"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Server } from "lucide-react";
import { useInstance } from "@/context/instance-context";
import { CodeComingSoon } from "@/components/code/code-coming-soon";

export default function CodePage() {
  const { mode, isCloud, features, isLoading } = useInstance();
  const isCloudMode = isCloud || mode === "cloud";
  const codeSearchEnabled = !isCloudMode || features?.codeSearch === true;

  if (isLoading) {
    return null;
  }

  if (!codeSearchEnabled) {
    return <CodeComingSoon />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Search</h1>
        <p className="text-muted-foreground">
          Semantic search across your indexed codebases
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Code2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Code Search</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Semantic search across your indexed codebases using the{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">engram-code</code> service.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Server className="h-4 w-4" />
            <span>Available when running Engram locally or on your own infrastructure</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
