"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  FolderGit2,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  FileCode,
  Database,
  AlertTriangle,
} from "lucide-react";
import { engramCode, CodeProject, ProjectStats, CreateProjectDto } from "@/lib/engram-code";

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatDate(dateString);
}

interface ProjectWithStats extends CodeProject {
  stats?: ProjectStats;
}

// ============================================================================
// Create Project Dialog
// ============================================================================

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [languages, setLanguages] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !rootPath.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const data: CreateProjectDto = {
        name: name.trim(),
        rootPath: rootPath.trim(),
        languages: languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      };

      await engramCode.createProject(data);
      setName("");
      setRootPath("");
      setLanguages("");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a codebase to index for semantic search.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              placeholder="e.g., my-app"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Root Path</label>
            <Input
              placeholder="e.g., /Users/you/projects/my-app"
              value={rootPath}
              onChange={(e) => setRootPath(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Absolute path to the project directory
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Languages (optional)</label>
            <Input
              placeholder="e.g., typescript, javascript, python"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of languages to index
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !rootPath.trim() || creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onDeleted,
}: {
  project: CodeProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      await engramCode.deleteProject(project.id);
      onOpenChange(false);
      onDeleted();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{project?.name}</span>? This will
            permanently remove all indexed code chunks. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function CodeProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<CodeProject | null>(null);
  const [ingestingProjectId, setIngestingProjectId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectList = await engramCode.listProjects();

      // Fetch stats for each project
      const projectsWithStats = await Promise.all(
        projectList.map(async (project) => {
          try {
            const stats = await engramCode.getProjectStats(project.id);
            return { ...project, stats };
          } catch {
            return { ...project };
          }
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to connect to engram-code service. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIngest = async (projectId: string) => {
    setIngestingProjectId(projectId);
    try {
      await engramCode.ingestProject(projectId);
      await fetchData();
    } catch (err) {
      console.error("Failed to trigger ingestion:", err);
    } finally {
      setIngestingProjectId(null);
    }
  };

  const handleDeleteClick = (project: CodeProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Code Projects</h1>
          <p className="text-muted-foreground">
            Manage your indexed codebases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            {projects.length} project{projects.length !== 1 ? "s" : ""} indexed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Create your first project to start indexing code for semantic search.
              </p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead className="text-right">
                    <FileCode className="inline h-4 w-4 mr-1" />
                    Files
                  </TableHead>
                  <TableHead className="text-right">
                    <Database className="inline h-4 w-4 mr-1" />
                    Chunks
                  </TableHead>
                  <TableHead>Last Ingested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground font-mono truncate max-w-xs">
                          {project.rootPath}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.languages.length > 0 ? (
                          project.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">Any</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {project.stats?.totalFiles?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {project.stats?.totalChunks?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(project.lastIngestedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIngest(project.id)}
                          disabled={ingestingProjectId === project.id}
                        >
                          {ingestingProjectId === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span className="sr-only">Re-ingest</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Chunk Type Distribution */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chunk Distribution</CardTitle>
            <CardDescription>
              Breakdown of indexed code by type across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(() => {
                const aggregated: Record<string, number> = {};
                projects.forEach((p) => {
                  if (p.stats?.chunksByType) {
                    Object.entries(p.stats.chunksByType).forEach(([type, count]) => {
                      aggregated[type] = (aggregated[type] ?? 0) + count;
                    });
                  }
                });

                const entries = Object.entries(aggregated).sort((a, b) => b[1] - a[1]);

                if (entries.length === 0) {
                  return (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No chunk data available. Run ingestion on your projects.
                    </div>
                  );
                }

                return entries.map(([type, count]) => (
                  <div key={type} className="p-4 rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground capitalize">{type}</div>
                    <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={fetchData}
      />

      <DeleteProjectDialog
        project={projectToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={fetchData}
      />
    </div>
  );
}
