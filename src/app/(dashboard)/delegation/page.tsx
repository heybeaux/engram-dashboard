"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardList, FileText, LayoutTemplate, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import {
  getTasks, getContracts, getTemplates, createTemplate, updateTemplate, deleteTemplate,
} from "@/lib/delegation-client";
import type {
  DelegationTask, TaskStatus, DelegationContract, ContractState, DelegationTemplate,
} from "@/lib/delegation-types";

// ============================================================================
// Helpers
// ============================================================================

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const taskStatusColor: Record<TaskStatus, { bg: string; text: string }> = {
  PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-500" },
  COMPLETED: { bg: "bg-green-500/10", text: "text-green-500" },
  FAILED: { bg: "bg-red-500/10", text: "text-red-500" },
};

const contractStateColor: Record<ContractState, { bg: string; text: string }> = {
  PROPOSED: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  ACCEPTED: { bg: "bg-blue-500/10", text: "text-blue-500" },
  COMPLETED: { bg: "bg-green-500/10", text: "text-green-500" },
  VERIFIED: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

// ============================================================================
// Active Tasks Tab
// ============================================================================

function ActiveTasksTab() {
  const [tasks, setTasks] = useState<DelegationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

  useEffect(() => {
    setLoading(true);
    getTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === "ALL" ? tasks : tasks.filter((t) => t.status === statusFilter);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No tasks found</TableCell></TableRow>
          ) : (
            filtered.map((task) => {
              const sc = taskStatusColor[task.status];
              return (
                <TableRow key={task.id}>
                  <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                  <TableCell>{task.assignedTo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${sc.bg} ${sc.text} border-0`}>{task.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.deadline)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
// Contracts Tab
// ============================================================================

function ContractsTab() {
  const [contracts, setContracts] = useState<DelegationContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getContracts()
      .then(setContracts)
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div className="space-y-3">
      {contracts.length === 0 && <p className="text-center text-muted-foreground py-8">No contracts found</p>}
      {contracts.map((c) => {
        const sc = contractStateColor[c.state];
        const isExpanded = expandedId === c.id;
        return (
          <Card
            key={c.id}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => setExpandedId(isExpanded ? null : c.id)}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${sc.bg} ${sc.text} border-0`}>{c.state}</Badge>
                  <span className="text-sm font-medium">{c.delegatorId} → {c.delegateeId}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span>{formatDate(c.createdAt)}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0 px-4 pb-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Terms:</span> {c.terms}</p>
                <p><span className="text-muted-foreground">Capabilities:</span> {c.capabilities.join(", ") || "—"}</p>
                <p><span className="text-muted-foreground">Task ID:</span> {c.taskId}</p>
                {c.completedAt && <p><span className="text-muted-foreground">Completed:</span> {formatDate(c.completedAt)}</p>}
                {c.verifiedAt && <p><span className="text-muted-foreground">Verified:</span> {formatDate(c.verifiedAt)}</p>}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// Templates Tab
// ============================================================================

function TemplatesTab() {
  const [templates, setTemplatesList] = useState<DelegationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DelegationTemplate | null>(null);
  const [form, setForm] = useState({ name: "", taskType: "", capabilities: "", estimatedDuration: "", description: "" });
  const [saving, setSaving] = useState(false);

  const loadTemplates = useCallback(() => {
    setLoading(true);
    getTemplates()
      .then(setTemplatesList)
      .catch(() => setTemplatesList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", taskType: "", capabilities: "", estimatedDuration: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(t: DelegationTemplate) {
    setEditing(t);
    setForm({ name: t.name, taskType: t.taskType, capabilities: t.capabilities.join(", "), estimatedDuration: t.estimatedDuration, description: t.description });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const caps = form.capabilities.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      if (editing) {
        await updateTemplate(editing.id, { ...form, capabilities: caps });
      } else {
        await createTemplate({ name: form.name, taskType: form.taskType, capabilities: caps, estimatedDuration: form.estimatedDuration, description: form.description });
      }
      setDialogOpen(false);
      loadTemplates();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteTemplate(id);
    loadTemplates();
  }

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No templates yet</p>}
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t.name}</CardTitle>
              <CardDescription>{t.taskType}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Capabilities:</span> {t.capabilities.join(", ") || "—"}</p>
              <p><span className="text-muted-foreground">Duration:</span> {t.estimatedDuration}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>Configure a delegation task template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Task Type" value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} />
            <Input placeholder="Capabilities (comma-separated)" value={form.capabilities} onChange={(e) => setForm({ ...form, capabilities: e.target.value })} />
            <Input placeholder="Estimated Duration" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function DelegationPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delegation</h1>
        <p className="text-muted-foreground">Manage delegated tasks, contracts, and templates.</p>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5"><ClipboardList className="h-4 w-4" /> Active Tasks</TabsTrigger>
          <TabsTrigger value="contracts" className="gap-1.5"><FileText className="h-4 w-4" /> Contracts</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><LayoutTemplate className="h-4 w-4" /> Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-4"><ActiveTasksTab /></TabsContent>
        <TabsContent value="contracts" className="mt-4"><ContractsTab /></TabsContent>
        <TabsContent value="templates" className="mt-4"><TemplatesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
