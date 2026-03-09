"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import type {
  EntityAttribute,
  AttributeSource,
  CreateAttributeRequest,
} from "@/lib/api/entity-profiles";
import {
  addAttribute,
  updateAttribute,
  deleteAttribute,
} from "@/lib/api/entity-profiles";

// ============================================================================
// HELPERS
// ============================================================================

const SOURCE_LABELS: Record<AttributeSource, string> = {
  USER: "👤",
  AGENT: "🤖",
  IMPORTED: "📥",
};

const SOURCE_TOOLTIPS: Record<AttributeSource, string> = {
  USER: "User-entered",
  AGENT: "Agent-extracted",
  IMPORTED: "Imported",
};

/** Group attributes by category */
function groupByCategory(attrs: EntityAttribute[]): Record<string, EntityAttribute[]> {
  return attrs.reduce<Record<string, EntityAttribute[]>>((acc, attr) => {
    const cat = attr.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(attr);
    return acc;
  }, {});
}

// ============================================================================
// ADD ATTRIBUTE MODAL
// ============================================================================

interface AddAttributeModalProps {
  open: boolean;
  profileId: string;
  onClose: () => void;
  onAdded: (attr: EntityAttribute) => void;
}

function AddAttributeModal({ open, profileId, onClose, onAdded }: AddAttributeModalProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [valueType, setValueType] = useState("string");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setKey(""); setValue(""); setValueType("string"); setCategory(""); setError(null);
  }

  async function handleSubmit() {
    if (!key.trim() || !value.trim()) {
      setError("Key and value are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const req: CreateAttributeRequest = {
        key: key.trim(),
        value: value.trim(),
        valueType,
        category: category.trim() || undefined,
        source: "USER",
      };
      const attr = await addAttribute(profileId, req);
      onAdded(attr);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add attribute.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Attribute</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Key (e.g. email)" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          <div className="flex gap-2">
            <Select value={valueType} onValueChange={setValueType}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="number">number</SelectItem>
                <SelectItem value="date">date</SelectItem>
                <SelectItem value="boolean">boolean</SelectItem>
                <SelectItem value="url">url</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="flex-1"
              placeholder="Category (optional)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// ATTRIBUTE TABLE
// ============================================================================

interface AttributeTableProps {
  profileId: string;
  attributes: EntityAttribute[];
  onChange: (updated: EntityAttribute[]) => void;
}

export function AttributeTable({ profileId, attributes, onChange }: AttributeTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const grouped = groupByCategory(attributes);

  function handleAdded(attr: EntityAttribute) {
    onChange([...attributes, attr]);
  }

  async function handleVerify(attr: EntityAttribute) {
    setVerifying(attr.id);
    try {
      const updated = await updateAttribute(profileId, attr.id, { verified: true });
      onChange(attributes.map((a) => (a.id === attr.id ? updated : a)));
    } catch {
      // silent — could toast here
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(attr: EntityAttribute) {
    setDeleting(attr.id);
    try {
      await deleteAttribute(profileId, attr.id);
      onChange(attributes.filter((a) => a.id !== attr.id));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {attributes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">No attributes yet.</p>
          <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add First Attribute
          </Button>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([category, attrs]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </p>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {attrs.map((attr, idx) => (
                      <tr
                        key={attr.id}
                        className={[
                          idx % 2 === 0 ? "bg-background" : "bg-muted/30",
                          !attr.verified ? "border-l-2 border-amber-400" : "",
                        ].join(" ")}
                      >
                        <td className="px-3 py-2 font-medium text-muted-foreground w-1/3 align-top">
                          <div className="flex items-center gap-1.5">
                            <span
                              title={SOURCE_TOOLTIPS[attr.source as AttributeSource]}
                              className="cursor-help"
                            >
                              {SOURCE_LABELS[attr.source as AttributeSource] ?? "?"}
                            </span>
                            {attr.key}
                          </div>
                        </td>
                        <td className="px-3 py-2 break-all">
                          <span>{attr.value}</span>
                          {!attr.verified && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px] text-amber-600 border-amber-300 bg-amber-50"
                            >
                              unverified
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {!attr.verified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-green-600 hover:text-green-700"
                                disabled={verifying === attr.id}
                                onClick={() => handleVerify(attr)}
                              >
                                {verifying === attr.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              disabled={deleting === attr.id}
                              onClick={() => handleDelete(attr)}
                            >
                              {deleting === attr.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Attribute
          </Button>
        </>
      )}

      <AddAttributeModal
        open={showAddModal}
        profileId={profileId}
        onClose={() => setShowAddModal(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
