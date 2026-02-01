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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave}>
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
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Agent Name</label>
            <Input
              placeholder="My AI Agent"
              defaultValue="My AI Agent"
              className="mt-1 max-w-md"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              A friendly name to identify your agent
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LLM Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Provider</label>
              <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Model</label>
              <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option>gpt-4o-mini</option>
                <option>gpt-4o</option>
                <option>gpt-4-turbo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Embedding Model</label>
            <select className="mt-1 w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm">
              <option>text-embedding-3-small</option>
              <option>text-embedding-3-large</option>
              <option>text-embedding-ada-002</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vector Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Vector Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="vector-provider"
                defaultChecked
                className="mt-1"
              />
              <div>
                <p className="font-medium">pgvector (Local)</p>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL extension for vector similarity search. Free and
                  self-hosted.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="vector-provider" className="mt-1" />
              <div>
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
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Endpoint URL</label>
            <Input
              placeholder="https://myapp.com/webhooks/engram"
              className="mt-1 max-w-lg"
            />
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium mb-3 block">Events</label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Proactive Surface</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Contradiction Detected</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-sm">Pattern Detected</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Consolidation Complete</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear All Memories</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all memories for all users. This cannot be
                undone.
              </p>
            </div>
            <Button variant="destructive">Clear All</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
