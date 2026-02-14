"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Check,
  Copy,
  Plus,
  Trash2,
  Key,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getAccount,
  updateAccount,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  changePassword,
  type Account,
  type ApiKeyInfo,
} from "@/lib/account-api";

export default function SettingsPage() {
  // ── Profile state ──────────────────────────────────────────────────────
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState("");

  // ── Password state ─────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── API Keys state ─────────────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);

  // ── Delete account state ───────────────────────────────────────────────
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────
  const loadAccount = useCallback(async () => {
    try {
      const data = await getAccount();
      setAccount(data);
      setName(data.name);
      setLoadError("");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load account");
    }
  }, []);

  const loadKeys = useCallback(async () => {
    try {
      setKeysLoading(true);
      const data = await getApiKeys();
      setApiKeys(data.keys ?? []);
    } catch {
      // keys may not be available yet
    } finally {
      setKeysLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
    loadKeys();
  }, [loadAccount, loadKeys]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateAccount({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // TODO: show error toast
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      // TODO: POST /v1/account/password endpoint may not exist yet
      await changePassword({ currentPassword, newPassword });
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const result = await createApiKey(newKeyName.trim());
      setNewKeyValue(result.key);
      loadKeys();
    } catch {
      // TODO: show error
    } finally {
      setCreatingKey(false);
    }
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(newKeyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteKey = async (id: string) => {
    setDeletingKeyId(id);
    try {
      // TODO: DELETE /v1/account/api-keys/:id may not exist yet
      await deleteApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      // TODO: show error
    } finally {
      setDeletingKeyId(null);
    }
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setNewKeyName("");
    setNewKeyValue("");
    setCopied(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" className="mt-4" onClick={loadAccount}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        {account && (
          <Badge variant="outline" className="w-fit">
            {account.plan} plan
          </Badge>
        )}
      </div>

      {/* ── Profile ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={account?.email ?? ""}
              disabled
              className="mt-1 max-w-full md:max-w-md bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 max-w-full md:max-w-md"
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saving || name === account?.name}
            className="h-11"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? "Saved" : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Change Password ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative mt-1 max-w-full md:max-w-md">
              <Input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <div className="relative mt-1 max-w-full md:max-w-md">
              <Input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPw(!showNewPw)}
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 max-w-full md:max-w-md"
            />
          </div>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-500">Password changed successfully</p>}
          <Button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className="h-11"
          >
            {pwSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* ── API Keys ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 md:pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            if (!open) handleCloseCreateDialog();
            else setShowCreateDialog(true);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {newKeyValue ? "API Key Created" : "Create API Key"}
                </DialogTitle>
                <DialogDescription>
                  {newKeyValue
                    ? "Copy this key now. You won't be able to see it again."
                    : "Give your API key a name to identify it later."}
                </DialogDescription>
              </DialogHeader>
              {newKeyValue ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                      {newKeyValue}
                    </code>
                    <Button size="sm" variant="outline" onClick={handleCopyKey}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseCreateDialog}>Done</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production, Development"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                  />
                  <DialogFooter>
                    <Button
                      onClick={handleCreateKey}
                      disabled={creatingKey || !newKeyName.trim()}
                    >
                      {creatingKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No API keys yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{key.name}</span>
                      <code className="text-xs text-muted-foreground">
                        ····{key.lastFour}
                      </code>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>
                        Created{" "}
                        {new Date(key.createdAt).toLocaleDateString()}
                      </span>
                      {key.lastUsedAt && (
                        <span>
                          Last used{" "}
                          {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-9 w-9 p-0"
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={deletingKeyId === key.id}
                  >
                    {deletingKeyId === key.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-destructive text-base md:text-lg">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="h-11 w-full sm:w-auto shrink-0"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account, all memories, API keys, and billing data.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <label className="text-sm font-medium">
                    Type <strong>delete my account</strong> to confirm
                  </label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="delete my account"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== "delete my account"}
                    onClick={() => {
                      // TODO: Call deleteAccount() when endpoint exists
                      // deleteAccount().then(() => router.push('/'));
                      alert("Account deletion not yet implemented");
                    }}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
