"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap } from "lucide-react";
import { getAccount, type Account } from "@/lib/account-api";

function RadialGauge({ used, limit }: { used: number; limit: number }) {
  const isUnlimited = !isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const color =
    pct > 90 ? "text-destructive" : pct > 70 ? "text-yellow-500" : "text-primary";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/30"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isUnlimited ? circumference : strokeDashoffset}
            className={`transition-all duration-700 ease-out ${color}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{used.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">
            / {isUnlimited ? "∞" : limit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ApiRequestsCard() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    getAccount().then(setAccount).catch(() => {});
  }, []);

  if (!account) return null;

  const limit =
    account.limits.apiCallsPerDay === -1
      ? Infinity
      : account.limits.apiCallsPerDay;
  const used = account.apiCallsToday;
  const pct = isFinite(limit) ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
          API Requests Today
          {pct > 80 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {pct >= 100 ? "Limit Reached" : "High Usage"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <RadialGauge used={used} limit={limit} />
          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  Calls used
                </span>
                <span className="font-medium">{used.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily limit</span>
                <span className="font-medium">
                  {isFinite(limit) ? limit.toLocaleString() : "Unlimited"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">
                  {isFinite(limit)
                    ? Math.max(limit - used, 0).toLocaleString()
                    : "∞"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="outline" className="text-xs">
                  {account.plan}
                </Badge>
              </div>
            </div>
            {isFinite(limit) && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct > 90
                        ? "bg-destructive"
                        : pct > 70
                          ? "bg-yellow-500"
                          : "bg-primary"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {pct.toFixed(1)}% used
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
