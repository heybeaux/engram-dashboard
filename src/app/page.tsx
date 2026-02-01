"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Activity, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - will be replaced with API calls
const stats = {
  totalMemories: 12847,
  memoryTrend: 1234,
  totalUsers: 342,
  userTrend: 28,
  healthScore: 98.2,
};

const apiRequestsData = [
  { day: "Mon", requests: 4200 },
  { day: "Tue", requests: 3800 },
  { day: "Wed", requests: 5100 },
  { day: "Thu", requests: 4600 },
  { day: "Fri", requests: 5800 },
  { day: "Sat", requests: 2400 },
  { day: "Sun", requests: 1900 },
];

const memoryByLayer = [
  { layer: "Identity", percentage: 18, color: "bg-blue-500" },
  { layer: "Project", percentage: 32, color: "bg-green-500" },
  { layer: "Session", percentage: 45, color: "bg-yellow-500" },
  { layer: "Task", percentage: 5, color: "bg-purple-500" },
];

const recentActivity = [
  { id: "1", action: "User created memory", time: "2 min ago" },
  { id: "2", action: 'Query: "preferences"', time: "5 min ago" },
  { id: "3", action: "Consolidation ran", time: "15 min ago" },
  { id: "4", action: "User deleted memory", time: "1 hour ago" },
  { id: "5", action: "API key created", time: "2 hours ago" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Overview</h1>
        <Badge variant="outline">Last 7 days</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <span className="text-green-500">+{stats.memoryTrend}</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{stats.userTrend}</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthScore}%</div>
            <p className="text-xs text-muted-foreground">
              Extraction success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            API Requests (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiRequestsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
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

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Memory by Layer */}
        <Card>
          <CardHeader>
            <CardTitle>Memory by Layer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memoryByLayer.map((layer) => (
              <div key={layer.layer} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{layer.layer}</span>
                  <span className="text-muted-foreground">{layer.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${layer.color}`}
                    style={{ width: `${layer.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{activity.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
