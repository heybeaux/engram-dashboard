"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Loader2, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  getContracts,
  createContract,
  type DelegationContract,
  type ContractStatus,
  type CreateContractRequest,
} from "@/lib/identity-api";

const statusConfig: Record<ContractStatus, { icon: React.ReactNode; class: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  active: { icon: <Loader2 className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  completed: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500 border-green-500/20" },
  failed: { icon: <XCircle className="h-3 w-3" />, class: "bg-red-500/10 text-red-500 border-red-500/20" },
  timed_out: { icon: <AlertTriangle className="h-3 w-3" />, class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  expired: { icon: <Clock className="h-3 w-3" />, class: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  violated: { icon: <XCircle className="h-3 w-3" />, class: "bg-red-500/10 text-red-600 border-red-500/20" },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function ContractTableSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function StatusBadge({ status }: { status: ContractStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`gap-1 ${config.class}`}>
      {config.icon}
      <span className="capitalize">{status.replace("_", " ")}</span>
    </Badge>
  );
}

function ContractCard({ contract }: { contract: DelegationContract }) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm">{contract.title}</h3>
          <StatusBadge status={contract.status} />
        </div>
        {contract.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{contract.description}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Domain: <Badge variant="outline" className="text-xs ml-1">{contract.domain}</Badge></span>
          <span>From: {contract.delegatorName || contract.delegatorId.slice(0, 8)}</span>
          <span>To: {contract.delegateeName || contract.delegateeId.slice(0, 8)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(contract.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

function ContractTable({ contracts, loading }: { contracts: DelegationContract[]; loading: boolean }) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Delegatee</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody><ContractTableSkeleton /></TableBody>
      </Table>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No contracts found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Delegatee</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <span className="font-medium">{c.title}</span>
                  {c.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{c.description}</p>}
                </TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell><Badge variant="outline">{c.domain}</Badge></TableCell>
                <TableCell className="text-sm">{c.delegateeName || c.delegateeId.slice(0, 8)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {contracts.map((c) => (
          <ContractCard key={c.id} contract={c} />
        ))}
      </div>
    </>
  );
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<DelegationContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateContractRequest>({
    title: "",
    delegateeId: "",
    domain: "",
    description: "",
    timeoutMinutes: 60,
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { contracts } = await getContracts(
        tab === "templates" ? { isTemplate: true } : tab === "history" ? {} : { status: "active" as ContractStatus }
      );
      setContracts(contracts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const activeContracts = tab === "active"
    ? contracts.filter((c) => c.status === "active" || c.status === "pending")
    : tab === "templates"
    ? contracts
    : contracts;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.delegateeId.trim() || !(form.domain ?? "").trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createContract(form);
      setCreateOpen(false);
      setForm({ title: "", delegateeId: "", domain: "", description: "", timeoutMinutes: 60 });
      fetchContracts();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Delegation Contracts</h1>
        <Button className="h-11 w-full sm:w-auto" onClick={() => { setCreateError(null); setCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="py-4 text-center text-destructive">{error}</CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardContent className="p-0 md:p-0">
              <ContractTable contracts={activeContracts} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Contract Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Delegation Contract</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title <span className="text-destructive">*</span></label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Contract title" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What is this delegation for?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Delegatee ID <span className="text-destructive">*</span></label>
                <Input value={form.delegateeId} onChange={(e) => setForm((f) => ({ ...f, delegateeId: e.target.value }))} placeholder="Agent ID" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Domain <span className="text-destructive">*</span></label>
                <Input value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} placeholder="e.g. code-review" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Timeout (minutes)</label>
              <Input type="number" value={form.timeoutMinutes} onChange={(e) => setForm((f) => ({ ...f, timeoutMinutes: parseInt(e.target.value) || 60 }))} />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating} className="h-11 w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={creating} className="h-11 w-full sm:w-auto">
                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
