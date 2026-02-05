"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} className="h-11 w-full sm:w-auto">
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Agent Name</label>
            <Input
              placeholder="My AI Agent"
              defaultValue="My AI Agent"
              className="mt-1 max-w-full md:max-w-md"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              A friendly name to identify your agent
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LLM Configuration */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">LLM Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Provider</label>
              <select className="mt-1 w-full h-11 rounded-md border bg-background px-3 py-2 text-sm">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <select className="mt-1 w-full h-11 rounded-md border bg-background px-3 py-2 text-sm">
                <option>gpt-4o-mini</option>
                <option>gpt-4o</option>
                <option>gpt-4-turbo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Embedding Model</label>
            <select className="mt-1 w-full h-11 max-w-full md:max-w-md rounded-md border bg-background px-3 py-2 text-sm">
              <option>text-embedding-3-small</option>
              <option>text-embedding-3-large</option>
              <option>text-embedding-ada-002</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vector Storage */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Vector Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors">
              <input
                type="radio"
                name="vector-provider"
                defaultChecked
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">pgvector (Local)</p>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL extension for vector similarity search. Free and
                  self-hosted.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 -m-3 rounded-lg hover:bg-muted/50 transition-colors">
              <input type="radio" name="vector-provider" className="mt-1 h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Pinecone (Cloud)</p>
                <p className="text-sm text-muted-foreground">
                  Managed vector database. Scales to billions of vectors.
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Endpoint URL</label>
            <Input
              placeholder="https://myapp.com/webhooks/engram"
              className="mt-1"
            />
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-3 block">Events</label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-muted/50 min-h-[44px]">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm">Proactive Surface</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-muted/50 min-h-[44px]">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm">Contradiction Detected</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-muted/50 min-h-[44px]">
                <input type="checkbox" className="h-4 w-4" />
                <span className="text-sm">Pattern Detected</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-lg hover:bg-muted/50 min-h-[44px]">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm">Consolidation Complete</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-destructive text-base md:text-lg">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Clear All Memories</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all memories for all users. This cannot be
                undone.
              </p>
            </div>
            <Button variant="destructive" className="h-11 w-full sm:w-auto shrink-0">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
