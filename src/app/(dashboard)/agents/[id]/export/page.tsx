"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

const API_BASE = typeof window !== "undefined" ? "/api/engram" : "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("engram_token") : null;
  if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return { "Content-Type": "application/json" };
}

export default function AgentExportPage() {
  const params = useParams();
  const id = params.id as string;

  const [exportData, setExportData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExport = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/identity/agents/${id}/export`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExportData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load export data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchExport(); }, [fetchExport]);

  const handleDownload = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-${id}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/agents/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Agent Export
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Export data for agent {id}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Export Preview</CardTitle>
            <Button size="sm" onClick={handleDownload} disabled={!exportData}>
              <Download className="mr-1.5 h-3.5 w-3.5" />Download JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exportData ? (
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(exportData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No export data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
