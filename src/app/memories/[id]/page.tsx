"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, Link as LinkIcon, Copy } from "lucide-react";

// Mock data for a single memory
const mockMemory = {
  id: "mem_abc123xyz",
  content: "Beaux prefers tabs over spaces",
  userId: "user_beaux",
  layer: "IDENTITY",
  importance: 0.82,
  confidence: 1.0,
  createdAt: "Feb 1, 2026 7:12 AM",
  retrievalCount: 5,
  lastRetrieved: "10 min ago",
  extraction: {
    who: "Beaux",
    what: "Prefers tabs over spaces",
    when: null,
    where: "Coding environment",
    why: "Personal preference",
    how: null,
    topics: ["coding", "preferences"],
    entities: ["Beaux"],
  },
  embedding: [0.023, -0.041, 0.087, -0.012, 0.056, -0.098, 0.034, 0.071],
};

export default function MemoryDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/memories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Memories
            </Link>
          </Button>
        </div>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Memory Content */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-2xl font-medium">&ldquo;{mockMemory.content}&rdquo;</p>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <code className="text-sm">{mockMemory.id}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <code className="text-sm">{mockMemory.userId}</code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Layer</p>
              <Badge variant="outline" className="mt-1">
                {mockMemory.layer}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{mockMemory.createdAt}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Importance</p>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${mockMemory.importance * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {mockMemory.importance.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Confidence</p>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${mockMemory.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {mockMemory.confidence.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Retrieved</p>
            <p className="text-sm">
              {mockMemory.retrievalCount} times (last: {mockMemory.lastRetrieved})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 5W1H Extraction */}
      <Card>
        <CardHeader>
          <CardTitle>5W1H Extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "WHO", value: mockMemory.extraction.who },
              { label: "WHAT", value: mockMemory.extraction.what },
              { label: "WHEN", value: mockMemory.extraction.when },
              { label: "WHERE", value: mockMemory.extraction.where },
              { label: "WHY", value: mockMemory.extraction.why },
              { label: "HOW", value: mockMemory.extraction.how },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm">{item.value || "—"}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Topics
              </p>
              <div className="flex flex-wrap gap-1">
                {mockMemory.extraction.topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Entities
              </p>
              <div className="flex flex-wrap gap-1">
                {mockMemory.extraction.entities.map((entity) => (
                  <Badge key={entity} variant="outline">
                    {entity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Chain */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No linked memories</p>
          <Button variant="outline" size="sm" className="mt-4">
            <LinkIcon className="mr-2 h-4 w-4" />
            Link Memory
          </Button>
        </CardContent>
      </Card>

      {/* Embedding Vector */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Embedding Vector (1536 dims)</CardTitle>
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </CardHeader>
        <CardContent>
          <code className="text-xs text-muted-foreground">
            [{mockMemory.embedding.join(", ")}, ...]
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
