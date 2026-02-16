"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Server } from "lucide-react";
import { useInstance } from "@/context/instance-context";

export default function CodePage() {
  const { mode, isLoading } = useInstance();
  const router = useRouter();

  // Redirect to dashboard if on cloud mode (this page is self-hosted only)
  useEffect(() => {
    if (!isLoading && mode === "cloud") {
      router.replace("/dashboard");
    }
  }, [isLoading, mode, router]);

  if (isLoading || mode === "cloud") {
    return null;
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
