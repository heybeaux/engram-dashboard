"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Users, Activity, TrendingUp, RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { FogIndexCard } from "@/components/fog-index-card";
import { AccountUsageCard } from "@/components/account-usage-card";

// Layer colors for visualization
const LAYER_COLORS: Record<string, string> = {
  IDENTITY: "bg-blue-500",
  PROJECT: "bg-green-500",
  SESSION: "bg-yellow-500",
  TASK: "bg-purple-500",
};

// Format relative time from ISO timestamp
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Loading skeleton for stats cards
function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

// Loading skeleton for chart
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] md:h-[300px] bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

// Error state component
function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void;
}) {
  const isConnectionError = error.includes("fetch") || error.includes("network") || error.includes("ECONNREFUSED");
  
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
        {isConnectionError ? (
          <WifiOff className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
        ) : (
          <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
        )}
        <h3 className="text-base md:text-lg font-semibold mb-2">
          {isConnectionError ? "API Not Connected" : "Failed to Load Data"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {isConnectionError 
            ? "Unable to connect to the Engram API. Make sure the server is running at the configured URL."
            : error}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm" className="h-11">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { stats, loading, error, refetch } = useDashboardStats();

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
          <Badge variant="outline">Loading...</Badge>
        </div>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        
        <ChartSkeleton />
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
          <Badge variant="destructive">Error</Badge>
        </div>
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
            <Brain className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground">
              Start storing memories to see your dashboard statistics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format layer data for display
  const memoryByLayer = (stats.memoryByLayer ?? []).map((layer) => ({
    layer: layer.layer.charAt(0) + layer.layer.slice(1).toLowerCase(),
    percentage: layer.percentage,
    count: layer.count,
    color: LAYER_COLORS[layer.layer] || "bg-gray-500",
  }));

  // Format API requests data for chart
  const apiRequestsData = (stats.apiRequests ?? []).map((item) => ({
    // API returns 'day' field with date string like "2026-01-27"
    day: new Date(item.day).toLocaleDateString("en-US", { weekday: "short" }),
    requests: item.requests,
  }));

  // Format recent activity - API returns 'time' field, not 'timestamp'
  const recentActivity = (stats.recentActivity ?? []).map((activity) => ({
    id: activity.id,
    action: activity.action,
    time: formatRelativeTime(activity.time),
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Overview</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refetch}
            className="h-11 w-11"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Badge variant="outline">Last 7 days</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalMemories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.memoryTrend >= 0 ? (
                <span className="text-green-500">+{stats.memoryTrend.toLocaleString()}</span>
              ) : (
                <span className="text-red-500">{stats.memoryTrend.toLocaleString()}</span>
              )}{" "}
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.userTrend >= 0 ? (
                <span className="text-green-500">+{stats.userTrend}</span>
              ) : (
                <span className="text-red-500">{stats.userTrend}</span>
              )}{" "}
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Extraction success rate
            </p>
          </CardContent>
        </Card>

        <FogIndexCard />

        <AccountUsageCard />
      </div>

      {/* API Requests Chart */}
      {apiRequestsData.length > 0 && (
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              API Requests (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 pr-4 md:pl-4 md:pr-6">
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiRequestsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-xs" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fontSize: 11 }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="requests"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Memory by Layer */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">Memory by Layer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memoryByLayer.length > 0 ? (
              memoryByLayer.map((layer) => (
                <div key={layer.layer} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{layer.layer}</span>
                    <span className="text-muted-foreground">
                      {layer.percentage.toFixed(1)}% ({layer.count.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${layer.color}`}
                      style={{ width: `${layer.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No memories stored yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <span className="text-sm line-clamp-2 flex-1">{activity.action}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
