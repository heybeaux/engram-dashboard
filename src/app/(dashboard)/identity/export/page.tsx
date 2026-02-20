"use client";

import { useState, useRef, useCallback } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Download, Upload, FileJson, CheckCircle2, XCircle,
  AlertCircle, Loader2, Shield, Package,
} from "lucide-react";
import {
  identityApi,
  type ImportPreview,
} from "@/lib/identity-api";

// ============================================================================
// Export Section
// ============================================================================

function ExportSection() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const data = await identityApi.exportIdentity();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `engram-identity-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Identity
        </CardTitle>
        <CardDescription>
          Download your complete identity data as a portable JSON file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Identity
        </Button>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Import Section
// ============================================================================

function ImportSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setPreview(null);
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const p = await identityApi.previewImport(f);
      setPreview(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview file");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleConfirm = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const res = await identityApi.confirmImport(file);
      setSuccess(`Successfully imported ${res.imported} items`);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Identity
        </CardTitle>
        <CardDescription>
          Upload a previously exported identity file to restore or merge data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <FileJson className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag &amp; drop a JSON file here, or
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fileRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{file.name}</span>
            <span className="text-muted-foreground">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={reset}>
              Clear
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing file…
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </p>
        )}

        {/* Preview */}
        {preview && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Import Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Schema Version</span>
                </div>
                <span className="font-mono">{preview.schemaVersion}</span>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Integrity</span>
                </div>
                <div className="flex items-center gap-1">
                  {preview.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono text-xs truncate max-w-[200px]">
                    {preview.integrityHash}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Agents: </span>
                  <span className="font-bold">{preview.agentCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Teams: </span>
                  <span className="font-bold">{preview.teamCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Memories: </span>
                  <span className="font-bold">{preview.memoryCount}</span>
                </div>
              </div>

              {preview.conflicts.length > 0 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {preview.conflicts.length} conflict{preview.conflicts.length !== 1 && "s"} detected
                  </p>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {preview.conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleConfirm} disabled={importing || !preview.valid}>
                  {importing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Confirm Import
                </Button>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function PortableIdentityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portable Identity</h1>
        <p className="text-muted-foreground">
          Export and import identity data for backup or migration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExportSection />
        <ImportSection />
      </div>
    </div>
  );
}
