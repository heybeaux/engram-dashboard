"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { X, Plus, Loader2 } from "lucide-react";
import type {
  EntityProfile,
  EntityType,
  CreateProfileRequest,
} from "@/lib/api/entity-profiles";
import { createProfile, updateProfile } from "@/lib/api/entity-profiles";

// ============================================================================
// TYPES
// ============================================================================

const ENTITY_TYPES: EntityType[] = [
  "PERSON",
  "ORGANIZATION",
  "PROJECT",
  "CONCEPT",
  "LOCATION",
  "EVENT",
  "OTHER",
];

interface AttributeRow {
  key: string;
  value: string;
  valueType: string;
}

interface ProfileFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (profile: EntityProfile) => void;
  /** Provide to edit an existing profile */
  profile?: EntityProfile;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProfileFormModal({
  open,
  onClose,
  onSaved,
  profile,
}: ProfileFormModalProps) {
  const isEdit = !!profile;

  const [name, setName] = useState("");
  const [type, setType] = useState<EntityType>("PERSON");
  const [description, setDescription] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState("");
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate when editing
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setType(profile.type);
      setDescription(profile.description ?? "");
      setAliases(profile.aliases ?? []);
      setAttributes(
        profile.attributes.map((a) => ({
          key: a.key,
          value: a.value,
          valueType: a.valueType ?? "string",
        })),
      );
    } else {
      setName("");
      setType("PERSON");
      setDescription("");
      setAliases([]);
      setAttributes([]);
    }
    setAliasInput("");
    setError(null);
  }, [profile, open]);

  // ---- alias tag input ----
  function handleAliasKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = aliasInput.trim();
      if (v && !aliases.includes(v)) {
        setAliases((prev) => [...prev, v]);
      }
      setAliasInput("");
    }
    if (e.key === "Backspace" && aliasInput === "" && aliases.length > 0) {
      setAliases((prev) => prev.slice(0, -1));
    }
  }

  function removeAlias(a: string) {
    setAliases((prev) => prev.filter((x) => x !== a));
  }

  // ---- attribute rows ----
  function addAttributeRow() {
    setAttributes((prev) => [...prev, { key: "", value: "", valueType: "string" }]);
  }

  function updateAttributeRow(idx: number, field: keyof AttributeRow, value: string) {
    setAttributes((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function removeAttributeRow(idx: number) {
    setAttributes((prev) => prev.filter((_, i) => i !== idx));
  }

  // ---- submit ----
  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: CreateProfileRequest = {
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        aliases: aliases.length ? aliases : undefined,
        attributes: attributes
          .filter((a) => a.key.trim() && a.value.trim())
          .map((a) => ({
            key: a.key.trim(),
            value: a.value.trim(),
            valueType: a.valueType || "string",
          })),
      };

      let saved: EntityProfile;
      if (isEdit && profile) {
        saved = await updateProfile(profile.id, payload);
      } else {
        saved = await createProfile(payload);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Profile" : "Create Profile"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <Select value={type} onValueChange={(v) => setType(v as EntityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Aliases */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Aliases{" "}
              <span className="text-muted-foreground font-normal">(press Enter to add)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input min-h-[40px]">
              {aliases.map((a) => (
                <Badge key={a} variant="secondary" className="gap-1 text-xs">
                  {a}
                  <button onClick={() => removeAlias(a)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={aliases.length === 0 ? "Type alias, press Enter…" : ""}
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAliasKeyDown}
              />
            </div>
          </div>

          {/* Attributes */}
          {!isEdit && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Initial Attributes</label>
                <Button variant="ghost" size="sm" onClick={addAttributeRow} className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              {attributes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No attributes yet.</p>
              ) : (
                <div className="space-y-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        className="flex-1 h-8 text-xs"
                        placeholder="Key"
                        value={attr.key}
                        onChange={(e) => updateAttributeRow(idx, "key", e.target.value)}
                      />
                      <Input
                        className="flex-1 h-8 text-xs"
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => updateAttributeRow(idx, "value", e.target.value)}
                      />
                      <Select
                        value={attr.valueType}
                        onValueChange={(v) => updateAttributeRow(idx, "valueType", v)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAttributeRow(idx)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
