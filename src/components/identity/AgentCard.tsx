"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrustGauge } from "./TrustGauge";
import { StatusBadge } from "./StatusBadge";
import { Bot } from "lucide-react";

interface AgentCardProps {
  name: string;
  fingerprint?: string;
  trustScore?: number;
  status?: string;
  domains?: string[];
  className?: string;
  onClick?: () => void;
}

export function AgentCard({
  name,
  fingerprint,
  trustScore,
  status,
  domains,
  className,
  onClick,
}: AgentCardProps) {
  return (
    <Card
      className={cn("cursor-pointer hover:border-primary/50 transition-colors", className)}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Bot className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{name}</span>
            {status && <StatusBadge status={status} />}
          </div>
          {fingerprint && (
            <p className="text-xs text-muted-foreground font-mono truncate">{fingerprint}</p>
          )}
          {domains && domains.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {domains.join(", ")}
            </p>
          )}
        </div>
        {trustScore != null && <TrustGauge score={trustScore} size={48} label="" />}
      </CardContent>
    </Card>
  );
}
