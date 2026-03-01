"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

const statusColors: Record<string, string> = {
  processed: "bg-green-500/10 text-green-500 border-green-500/20",
  routed: "bg-green-500/10 text-green-500 border-green-500/20",
  unrouted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  received: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function formatTimestamp(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString();
}

export function EmailDetail({ email }: { email: Email }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-4 bg-muted/30 border-t">
      {/* Header info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">From:</span>{" "}
          <span className="font-medium">{email.from}</span>
        </div>
        <div>
          <span className="text-muted-foreground">To:</span>{" "}
          <span className="font-medium">{email.to}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Subject:</span>{" "}
          <span className="font-medium">{email.subject}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <Badge
            variant="outline"
            className={statusColors[email.status] ?? statusColors.received}
          >
            {email.status}
          </Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Received:</span>{" "}
          <span>{formatTimestamp(email.createdAt)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Processed:</span>{" "}
          <span>{formatTimestamp(email.processedAt)}</span>
        </div>
      </div>

      {/* Text body */}
      {email.textBody && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
            Body
          </h4>
          <pre className="text-sm whitespace-pre-wrap bg-background rounded-md border p-3 max-h-64 overflow-y-auto font-mono">
            {email.textBody}
          </pre>
        </div>
      )}

      {/* Raw data toggle */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => setShowRaw(!showRaw)}
        >
          {showRaw ? (
            <ChevronDown className="mr-1 h-3 w-3" />
          ) : (
            <ChevronRight className="mr-1 h-3 w-3" />
          )}
          Raw Data
        </Button>
        {showRaw && (
          <pre className="text-xs whitespace-pre-wrap bg-background rounded-md border p-3 mt-2 max-h-48 overflow-y-auto font-mono">
            {JSON.stringify(email, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
