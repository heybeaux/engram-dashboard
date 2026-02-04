"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataList,
  DataListItem,
  DataListRow,
  DataListHeader,
  DataListActions,
} from "@/components/ui/data-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Copy, AlertTriangle, Check } from "lucide-react";

// Mock data
const mockApiKeys = [
  {
    id: "key_1",
    name: "Production",
    keyHint: "...a7f9",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "key_2",
    name: "Development",
    keyHint: "...2345",
    createdAt: "Feb 1, 2026",
  },
  {
    id: "key_3",
    name: "Testing",
    keyHint: "...x8k2",
    createdAt: "Feb 1, 2026",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(mockApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    // Simulate creating a new key
    const generatedKey = `engram_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setNewKey(generatedKey);

    // Add to list
    const newKeyObj = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyHint: `...${generatedKey.slice(-4)}`,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setKeys([...keys, newKeyObj]);
    setNewKeyName("");
  };

  const handleCopyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.filter((key) => key.id !== id));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewKey(null);
    setNewKeyName("");
    setCopied(false);
  };

  // Render key card for mobile
  const renderKeyCard = (key: typeof mockApiKeys[0]) => (
    <DataListItem key={key.id}>
      <DataListHeader>
        <span className="font-medium">{key.name}</span>
      </DataListHeader>

      <DataListRow label="Key">
        <code className="text-muted-foreground">{key.keyHint}</code>
      </DataListRow>

      <DataListRow label="Created">
        {key.createdAt}
      </DataListRow>

      <DataListActions>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-11 text-destructive hover:text-destructive"
          onClick={() => handleRevokeKey(key.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Revoke
        </Button>
      </DataListActions>
    </DataListItem>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">API Keys</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>
                {newKey ? "API Key Created" : "Create API Key"}
              </DialogTitle>
              <DialogDescription>
                {newKey
                  ? "Make sure to copy your API key now. You won't be able to see it again!"
                  : "Give your API key a name to help identify it later."}
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-3 text-sm break-all">
                    {newKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopyKey} className="h-11 w-11 shrink-0">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p>
                    Store this key securely. It will only be shown once and
                    cannot be recovered.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="e.g., Production, Development"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {newKey ? (
                <Button onClick={handleCloseDialog} className="h-11 w-full sm:w-auto">Done</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCloseDialog} className="h-11 w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={!newKeyName.trim()} className="h-11 w-full sm:w-auto">
                    Create Key
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-muted-foreground">{key.keyHint}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {key.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-11"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Card List */}
      <div className="md:hidden">
        {keys.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No API keys yet
            </CardContent>
          </Card>
        ) : (
          <DataList>
            {keys.map(renderKeyCard)}
          </DataList>
        )}
      </div>

      {/* Warning */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 pt-4 md:pt-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-600 dark:text-yellow-400">
              Keep your API keys secure
            </p>
            <p className="text-sm text-muted-foreground">
              API keys are shown only once when created. Store them securely and
              never commit them to version control.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
