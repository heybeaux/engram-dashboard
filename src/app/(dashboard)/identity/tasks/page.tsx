"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListTodo, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

const API_BASE = typeof window !== "undefined" ? "/api/engram" : "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return { "Content-Type": "application/json" };
}

interface DelegationTask {
  id: string;
  sessionKey: string;
  parentSessionKey?: string;
  agentId?: string;
  task: string;
  status: "success" | "failure" | "timeout";
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; class: string }> = {
  success: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500 border-green-500/20" },
  failure: { icon: <XCircle className="h-3 w-3" />, class: "bg-red-500/10 text-red-500 border-red-500/20" },
  timeout: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { icon: <Clock className="h-3 w-3" />, class: "" };
  return (
    <Badge variant="outline" className={`gap-1 ${config.class}`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function TaskCard({ task }: { task: DelegationTask }) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm font-mono">{task.task}</h3>
          <StatusBadge status={task.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {task.agentId && <span>Agent: <Badge variant="outline" className="text-xs ml-1">{task.agentId}</Badge></span>}
          <span>Duration: {formatDuration(task.durationMs)}</span>
          <span>{formatDate(task.createdAt)}</span>
        </div>
        {task.error && <p className="text-xs text-destructive">{task.error}</p>}
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<DelegationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/identity/delegation/tasks?limit=100`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <ListTodo className="h-7 w-7 text-primary" />
          Delegation Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Task completions logged by delegated agents.</p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4 text-center text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No delegation tasks found</p>
          <p className="text-xs mt-1">Tasks appear here when agents log completions via the delegation API.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <span className="font-medium font-mono text-sm">{t.task}</span>
                          {t.error && <p className="text-xs text-destructive truncate max-w-xs">{t.error}</p>}
                        </TableCell>
                        <TableCell>
                          {t.agentId ? <Badge variant="outline">{t.agentId}</Badge> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDuration(t.durationMs)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(t.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
