"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Server } from "lucide-react";
import { useInstance } from "@/context/instance-context";

function CloudCodeMessage() {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Code2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Self-Hosted Only</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Code Search is available on self-hosted installations. It requires the{" "}
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
  );
}

function SelfHostedCodeUI() {
  return (
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
  );
}

export default function CodePage() {
  const { features } = useInstance();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Search</h1>
        <p className="text-muted-foreground">
          Semantic search across your indexed codebases
        </p>
      </div>

      {features.codeSearch ? <SelfHostedCodeUI /> : <CloudCodeMessage />}
    </div>
  );
}
