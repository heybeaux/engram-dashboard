"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Source {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  enabled: boolean;
}

const INITIAL_SOURCES: Source[] = [
  {
    id: "linear",
    name: "Linear",
    description: "Import issues, projects, and team activity from Linear.",
    icon: "🔷",
    connected: false,
    enabled: false,
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Sync repositories, pull requests, and commit activity from GitHub.",
    icon: "🐙",
    connected: false,
    enabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Capture conversations and threads from Slack channels.",
    icon: "💬",
    connected: false,
    enabled: false,
  },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [connectModal, setConnectModal] = useState<string | null>(null);

  const toggleEnabled = (id: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id && s.connected ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const selectedSource = sources.find((s) => s.id === connectModal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="text-muted-foreground">
          Connect external data sources to feed signals into the awareness
          module.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{source.icon}</span>
                <div>
                  <CardTitle className="text-base">{source.name}</CardTitle>
                  <Badge
                    variant={source.connected ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {source.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={source.enabled}
                onCheckedChange={() => toggleEnabled(source.id)}
                disabled={!source.connected}
                aria-label={`Toggle ${source.name}`}
              />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {source.description}
              </CardDescription>
              {!source.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConnectModal(source.id)}
                >
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!connectModal}
        onOpenChange={(open) => !open && setConnectModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {selectedSource?.name ?? "Source"}
            </DialogTitle>
            <DialogDescription>
              OAuth integration for {selectedSource?.name} is coming soon.
              Check back later!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setConnectModal(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
