"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Users, ArrowRight } from "lucide-react";
import { getAccount, type Account } from "@/lib/account-api";

const PLAN_LIMITS: Record<string, { memories: number; apiCalls: number; agents: number }> = {
  free: { memories: 1_000, apiCalls: 100, agents: 1 },
  starter: { memories: 10_000, apiCalls: 1_000, agents: 3 },
  pro: { memories: 100_000, apiCalls: 10_000, agents: 10 },
  team: { memories: Infinity, apiCalls: Infinity, agents: Infinity },
};

function MiniMeter({ used, limit }: { used: number; limit: number }) {
  const isUnlimited = !isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  return (
    <div className="h-1.5 rounded-full bg-muted w-full">
      <div
        className={`h-full rounded-full ${pct > 80 ? "bg-destructive" : "bg-primary"}`}
        style={{ width: isUnlimited ? "0%" : `${pct}%` }}
      />
    </div>
  );
}

export function AccountUsageCard() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    getAccount().then(setAccount).catch(() => {});
  }, []);

  if (!account) return null;

  const limits = PLAN_LIMITS[account.plan] ?? PLAN_LIMITS.free;
  const isFreeTier = account.plan === "free";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Account</CardTitle>
        <Badge variant="outline" className="text-xs">
          {account.plan}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Brain className="h-3 w-3" /> Memories
            </span>
            <span className="text-muted-foreground">
              {account.memoriesUsed.toLocaleString()} / {isFinite(limits.memories) ? limits.memories.toLocaleString() : "∞"}
            </span>
          </div>
          <MiniMeter used={account.memoriesUsed} limit={limits.memories} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> API Calls Today
            </span>
            <span className="text-muted-foreground">
              {account.apiCallsToday.toLocaleString()} / {isFinite(limits.apiCalls) ? limits.apiCalls.toLocaleString() : "∞"}
            </span>
          </div>
          <MiniMeter used={account.apiCallsToday} limit={limits.apiCalls} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Agents
          </span>
          <span className="text-muted-foreground">
            {account.agents?.length ?? 0} / {isFinite(limits.agents) ? limits.agents : "∞"}
          </span>
        </div>

        {isFreeTier && (
          <Link href="/billing">
            <Button size="sm" className="w-full mt-2 h-8 text-xs">
              Upgrade Plan
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
