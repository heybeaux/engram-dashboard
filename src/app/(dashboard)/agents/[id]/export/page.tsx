"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload, CheckCircle, AlertCircle, FileJson, Loader2 } from "lucide-react";
import { engram } from "@/lib/engram-client";

export default function PortableIdentityPage() {
  const params = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await engram.exportAgentIdentity(params.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-${params.id}-identity.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setResult({ ok: false, message: "Export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setPreview(data);
      } catch {
        setResult({ ok: false, message: "Invalid JSON file" });
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await engram.importAgentIdentity(params.id, preview);
      setResult({ ok: res.success, message: res.message ?? "Identity imported successfully" });
      if (res.success) setPreview(null);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Import failed" });
    } finally {
      setImporting(false);
    }
  };

  const previewKeys = preview ? Object.keys(preview) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/agents/${params.id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Portable Identity</h1>
      </div>

      {result && (
        <Card className={result.ok ? "border-green-500/50" : "border-destructive"}>
          <CardContent className="flex items-center gap-2 pt-6">
            {result.ok
              ? <CheckCircle className="h-5 w-5 text-green-500" />
              : <AlertCircle className="h-5 w-5 text-destructive" />}
            <span className={result.ok ? "text-green-700 dark:text-green-400" : "text-destructive"}>
              {result.message}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Download this agent&apos;s complete identity as a portable JSON file.
              Includes capabilities, preferences, trust data, and behavioral patterns.
            </p>
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {exporting ? "Exporting..." : "Download JSON"}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload a previously exported identity JSON file to merge into this agent.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileRef.current?.click()}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Select JSON File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Import Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-muted p-4 text-sm space-y-1 max-h-64 overflow-y-auto">
              {previewKeys.map((key) => {
                const val = preview[key];
                const display = Array.isArray(val)
                  ? `${val.length} items`
                  : typeof val === "object" && val !== null
                  ? `${Object.keys(val).length} fields`
                  : String(val);
                return (
                  <div key={key} className="flex justify-between">
                    <span className="font-mono text-muted-foreground">{key}</span>
                    <span>{display}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importing} className="flex-1">
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {importing ? "Importing..." : "Import Identity"}
              </Button>
              <Button variant="outline" onClick={() => { setPreview(null); setResult(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
