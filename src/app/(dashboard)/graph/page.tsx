/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  Network,
  ZoomIn,
  ZoomOut,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { engram as engramClient } from '@/lib/engram-client';
import type { GraphData } from '@/lib/types';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

// ── Helpers ─────────────────────────────────────────────────────────────

/** Decode HTML entities like &#x27; &amp; &quot; etc. */
function decodeHtmlEntities(text: string): string {
  if (typeof document !== 'undefined') {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
  }
  // SSR fallback
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

// ── Color scheme ────────────────────────────────────────────────────────
const LAYER_COLORS: Record<string, string> = {
  IDENTITY: '#3B82F6',
  PROJECT: '#22C55E',
  SESSION: '#EAB308',
  TASK: '#8B5CF6',
  INSIGHT: '#F59E0B',
};
const ENTITY_COLOR = '#ec4899';
const DEFAULT_NODE_COLOR = '#6b7280';
const LAYERS = ['IDENTITY', 'PROJECT', 'SESSION', 'TASK', 'INSIGHT'] as const;

// ── Types ───────────────────────────────────────────────────────────────
interface GraphParams {
  limit: number;
  minConfidence: number;
  layers: Set<string>;
  searchQuery: string;
}

function defaultParams(): GraphParams {
  return {
    limit: 500,
    minConfidence: 0,
    layers: new Set(LAYERS),
    searchQuery: '',
  };
}

interface GraphNode {
  id: string;
  label: string;
  raw: string; // full memory text
  layer: string;
  importance: number;
  color: string;
  radius: number;
  isEntity: boolean;
  mentionCount?: number;
  source?: string;
  createdAt?: string;
}

interface GraphLink {
  source: string;
  target: string;
  linkType: string;
  confidence: number;
}

// ── Build graph ─────────────────────────────────────────────────────────
function buildGraphData(
  data: GraphData,
  params: GraphParams,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeMap = new Map<string, GraphNode>();

  for (const n of data.nodes) {
    if (!params.layers.has(n.layer)) continue;
    const rawText = decodeHtmlEntities(n.raw || '');
    nodeMap.set(n.id, {
      id: n.id,
      label: decodeHtmlEntities(n.extraction?.what || rawText.slice(0, 60) || n.id.slice(0, 8)),
      raw: rawText,
      layer: n.layer,
      importance: n.importanceScore ?? 0.5,
      color: LAYER_COLORS[n.layer] || DEFAULT_NODE_COLOR,
      radius: 3 + (n.importanceScore ?? 0.5) * 5,
      isEntity: false,
      source: n.source,
      createdAt: n.createdAt,
    });
  }

  // Build entity → memory mapping from shared edges
  const entityMemories = new Map<string, Set<string>>();
  const entityNodeLookup = new Map<string, any>();

  for (const e of data.entities) {
    entityNodeLookup.set(e.name, e);
  }

  for (const edge of data.edges) {
    if (!edge.linkType?.startsWith('shared:')) continue;
    const entityName = edge.linkType.slice(7);
    if (!entityMemories.has(entityName)) {
      entityMemories.set(entityName, new Set());
    }
    if (nodeMap.has(edge.source)) entityMemories.get(entityName)!.add(edge.source);
    if (nodeMap.has(edge.target)) entityMemories.get(entityName)!.add(edge.target);
  }

  // Entity hub nodes
  Array.from(entityMemories.entries()).forEach(([entityName, memoryIds]) => {
    if (memoryIds.size < 2) return;
    const entityData = entityNodeLookup.get(entityName);
    const entityId = entityData?.id || `entity:${entityName}`;
    if (nodeMap.has(entityId)) return;

    nodeMap.set(entityId, {
      id: entityId,
      label: entityName,
      raw: `Entity: ${entityName} (${memoryIds.size} connected memories)`,
      layer: 'ENTITY',
      importance: 0.7,
      color: ENTITY_COLOR,
      radius: Math.min(4 + Math.sqrt(memoryIds.size) * 2, 14),
      isEntity: true,
      mentionCount: memoryIds.size,
    });
  });

  const links: GraphLink[] = [];

  // Entity → memory hub edges
  Array.from(entityMemories.entries()).forEach(([entityName, memoryIds]) => {
    if (memoryIds.size < 2) return;
    const entityData = entityNodeLookup.get(entityName);
    const entityId = entityData?.id || `entity:${entityName}`;
    if (!nodeMap.has(entityId)) return;

    Array.from(memoryIds).forEach((memId) => {
      if (!nodeMap.has(memId)) return;
      links.push({
        source: entityId,
        target: memId,
        linkType: `entity:${entityName}`,
        confidence: 0.7,
      });
    });
  });

  // Non-shared edges
  for (const e of data.edges) {
    if (e.linkType?.startsWith('shared:')) continue;
    if (e.confidence < params.minConfidence) continue;
    if (!nodeMap.has(e.source) || !nodeMap.has(e.target)) continue;
    links.push({
      source: e.source,
      target: e.target,
      linkType: e.linkType,
      confidence: e.confidence,
    });
  }

  // Remove unconnected memory nodes (keep entities — they always have edges)
  const connectedIds = new Set<string>();
  for (const link of links) {
    const srcId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tgtId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    connectedIds.add(srcId);
    connectedIds.add(tgtId);
  }

  const filteredNodes = Array.from(nodeMap.values()).filter(
    (n) => n.isEntity || connectedIds.has(n.id),
  );

  return { nodes: filteredNodes, links };
}

// ════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════

export default function GraphPage() {
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rawData, setRawData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, entities: 0 });
  const [params, setParams] = useState<GraphParams>(defaultParams);
  const [showControls, setShowControls] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Track which node IDs are "active" (selected + its neighbors)
  const activeNodeIds = useMemo(() => {
    if (!selectedNode) return null; // null = show all
    const ids = new Set<string>([selectedNode.id]);
    // Find all neighbors via links
    for (const link of (graphRef.current?.graphData?.()?.links || [])) {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
      if (srcId === selectedNode.id) ids.add(tgtId);
      if (tgtId === selectedNode.id) ids.add(srcId);
    }
    return ids;
  }, [selectedNode]);

  // ── Fetch data ──────────────────────────────────────────────────────
  const loadGraph = useCallback(
    async (limit?: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await engramClient.getGraphData({
          limit: limit ?? params.limit,
        });
        setRawData(data);
        setStats({
          nodes: data.nodes.length,
          edges: data.edges.length,
          entities: data.entities.length,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load graph data');
      } finally {
        setLoading(false);
      }
    },
    [params.limit],
  );

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // ── Resize: fill viewport below the graph card ─────────────────────
  useEffect(() => {
    const graphCard = containerRef.current?.closest('.overflow-hidden');
    const updateSize = () => {
      // Use the graph Card's position to calculate available space
      const el = graphCard || containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 8;
      const availableWidth = rect.width > 0 ? Math.floor(rect.width) : 800;
      setDimensions({
        width: availableWidth,
        height: Math.max(400, Math.floor(availableHeight)),
      });
    };

    // Observe the flex container that holds both sidebar + graph
    const flexParent = containerRef.current?.closest('.flex.gap-4');
    const observer = new ResizeObserver(() => updateSize());
    if (flexParent) observer.observe(flexParent);
    window.addEventListener('resize', updateSize);
    // Recalc after layout settles
    setTimeout(updateSize, 50);
    setTimeout(updateSize, 300);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [showControls]);

  // ── Build graph data ────────────────────────────────────────────────
  const graphData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] };
    return buildGraphData(rawData, params);
  }, [rawData, params]);

  // ── Configure forces ────────────────────────────────────────────────
  useEffect(() => {
    if (graphData.nodes.length > 0 && graphRef.current) {
      setTimeout(() => {
        if (!graphRef.current) return;
        const fg = graphRef.current;
        const nodeCount = graphData.nodes.length;

        const charge = -200 - nodeCount * 0.5;
        fg.d3Force('charge')?.strength(charge).distanceMax(600);

        fg.d3Force('link')
          ?.distance((link: any) => {
            const isEntityHub = (typeof link.linkType === 'string')
              ? link.linkType.startsWith('entity:')
              : false;
            return isEntityHub ? 40 : 80;
          })
          .strength((link: any) => {
            const isEntityHub = (typeof link.linkType === 'string')
              ? link.linkType.startsWith('entity:')
              : false;
            return isEntityHub ? 0.3 : 0.15 + (link.confidence || 0) * 0.15;
          });

        fg.d3Force('center')?.strength(0.05);
        fg.d3ReheatSimulation();

        setTimeout(() => fg.zoomToFit(400, 60), 2000);
      }, 200);
    }
  }, [graphData]);

  // ── Node rendering ──────────────────────────────────────────────────
  const searchQuery = params.searchQuery.toLowerCase().trim();

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x: number; y: number };
      const searchMatch =
        searchQuery.length > 0 && n.label.toLowerCase().includes(searchQuery);
      const dimmedBySearch = searchQuery.length > 0 && !searchMatch;
      const dimmedBySelection = activeNodeIds !== null && !activeNodeIds.has(n.id);
      const dimmed = dimmedBySearch || dimmedBySelection;
      const isSelected = selectedNode?.id === n.id;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = dimmed ? `${n.color}22` : n.color;
      ctx.fill();

      // Selected node ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 / globalScale;
        ctx.stroke();
      }

      // Entity hub glow
      if (n.isEntity && !dimmed) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `${ENTITY_COLOR}66`;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      if (searchMatch && !isSelected) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Labels
      const showLabel = n.isEntity || globalScale > 2.5 || searchMatch || isSelected;
      if (showLabel && !dimmed) {
        const fontSize = n.isEntity
          ? Math.max(11 / globalScale, 3)
          : Math.max(10 / globalScale, 2);
        ctx.font = `${n.isEntity ? 'bold ' : ''}${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = n.isEntity
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(255,255,255,0.75)';
        ctx.fillText(n.label.slice(0, 30), n.x, n.y + n.radius + 2);
      }
    },
    [searchQuery, activeNodeIds, selectedNode],
  );

  // ── Link rendering ──────────────────────────────────────────────────
  const linkColor = useCallback(
    (link: any) => {
      const l = link as GraphLink;
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;

      // Dim links not connected to selected node
      if (activeNodeIds !== null) {
        if (!activeNodeIds.has(srcId) || !activeNodeIds.has(tgtId)) {
          return 'rgba(100, 116, 139, 0.03)';
        }
        // Highlighted link
        const isEntityHub = (typeof l.linkType === 'string') && l.linkType.startsWith('entity:');
        return isEntityHub
          ? 'rgba(236, 72, 153, 0.6)'
          : 'rgba(100, 200, 255, 0.7)';
      }

      const isEntityHub = (typeof l.linkType === 'string') && l.linkType.startsWith('entity:');
      if (isEntityHub) {
        return 'rgba(236, 72, 153, 0.25)';
      }
      return `rgba(100, 200, 255, ${0.3 + l.confidence * 0.4})`;
    },
    [activeNodeIds],
  );

  const linkWidth = useCallback(
    (link: any) => {
      const l = link as GraphLink;
      if (activeNodeIds !== null) {
        const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        if (!activeNodeIds.has(srcId) || !activeNodeIds.has(tgtId)) return 0.1;
        return 1.5;
      }
      const isEntityHub = (typeof l.linkType === 'string') && l.linkType.startsWith('entity:');
      return isEntityHub ? 0.5 : 1 + l.confidence;
    },
    [activeNodeIds],
  );

  // ── Zoom controls ───────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 300);
  }, []);

  const handleZoomToFit = useCallback(() => {
    graphRef.current?.zoomToFit(400, 60);
  }, []);

  // ── Debounced limit change ──────────────────────────────────────────
  const limitTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleLimitChange = useCallback(
    (val: number[]) => {
      setParams((p) => ({ ...p, limit: val[0] }));
      clearTimeout(limitTimerRef.current);
      limitTimerRef.current = setTimeout(() => loadGraph(val[0]), 500);
    },
    [loadGraph],
  );

  // ── Node click handler ──────────────────────────────────────────────
  const handleNodeClick = useCallback(
    (node: any) => {
      const n = node as GraphNode;
      if (selectedNode?.id === n.id) {
        // Second click → navigate to memory detail (or deselect for entities)
        if (!n.isEntity) {
          router.push(`/memories/${n.id}`);
        } else {
          setSelectedNode(null);
        }
      } else {
        // First click → select and highlight connections
        setSelectedNode(n);
      }
    },
    [selectedNode, router],
  );

  // ── Display node for sidebar ────────────────────────────────────────
  const displayNode = selectedNode || hoveredNode;

  // ════════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════════

  if (loading && !rawData) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
          <Badge variant="outline">Loading...</Badge>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: 600 }}
            >
              <Network className="h-12 w-12 text-muted-foreground/30 animate-pulse mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading graph data...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
          <Badge variant="destructive">Error</Badge>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Network className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Graph</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {error}
            </p>
            <Button onClick={() => loadGraph()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {graphData.nodes.length} nodes · {stats.edges} links · {stats.entities}{' '}
            entities
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowControls((v) => !v)}
            className="h-9 w-9 p-0"
            title="Toggle controls"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-9 w-9 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-9 w-9 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomToFit} className="h-9 w-9 p-0" title="Zoom to fit">
            <Network className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => loadGraph()} className="h-9 w-9 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {LAYERS.map((layer) => (
          <div key={layer} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: LAYER_COLORS[layer] }}
            />
            <span className="text-muted-foreground capitalize">
              {layer.toLowerCase()}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: ENTITY_COLOR }} />
          <span className="text-muted-foreground">entity</span>
        </div>
      </div>

      {/* Main layout: controls + graph — fill remaining viewport */}
      <div className="flex gap-4" style={{ height: `calc(100vh - 220px)` }}>
        {/* Controls panel */}
        {showControls && (
          <Card className="w-[320px] shrink-0 overflow-y-auto h-full">
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Search</p>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={params.searchQuery}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, searchQuery: e.target.value }))
                    }
                    className="pl-8 h-9 text-sm"
                  />
                  {params.searchQuery && (
                    <button
                      className="absolute right-2 top-2.5"
                      onClick={() => setParams((p) => ({ ...p, searchQuery: '' }))}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Node count */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Nodes: {params.limit}
                </p>
                <input
                  type="range"
                  value={params.limit}
                  onChange={(e) => handleLimitChange([parseInt(e.target.value)])}
                  min={50}
                  max={2000}
                  step={50}
                  className="w-full accent-primary"
                />
              </div>

              {/* Confidence threshold */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Min confidence: {params.minConfidence.toFixed(2)}
                </p>
                <input
                  type="range"
                  value={params.minConfidence}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, minConfidence: parseFloat(e.target.value) }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full accent-primary"
                />
              </div>

              {/* Layer filters */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Layers</p>
                {LAYERS.map((layer) => (
                  <div key={layer} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`layer-${layer}`}
                      checked={params.layers.has(layer)}
                      onChange={(e) => {
                        setParams((p) => {
                          const next = new Set(p.layers);
                          if (e.target.checked) next.add(layer);
                          else next.delete(layer);
                          return { ...p, layers: next };
                        });
                      }}
                      className="accent-primary"
                    />
                    <label
                      htmlFor={`layer-${layer}`}
                      className="text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: LAYER_COLORS[layer] }}
                      />
                      {layer.toLowerCase()}
                    </label>
                  </div>
                ))}
              </div>

              {/* Memory detail panel */}
              {displayNode && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{
                        borderColor: displayNode.isEntity
                          ? ENTITY_COLOR
                          : LAYER_COLORS[displayNode.layer] || DEFAULT_NODE_COLOR,
                        color: displayNode.isEntity
                          ? ENTITY_COLOR
                          : LAYER_COLORS[displayNode.layer] || DEFAULT_NODE_COLOR,
                      }}
                    >
                      {displayNode.isEntity ? 'Entity' : displayNode.layer}
                    </Badge>
                    {selectedNode && (
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedNode(null)}
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium leading-snug">
                    {displayNode.label}
                  </p>

                  {/* Full memory text */}
                  {!displayNode.isEntity && (
                    <div className="bg-muted/50 rounded-md p-2.5 max-h-[200px] overflow-y-auto">
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {displayNode.raw}
                      </p>
                    </div>
                  )}

                  {displayNode.isEntity && (
                    <p className="text-xs text-muted-foreground">
                      {displayNode.mentionCount ?? 0} connected memories
                    </p>
                  )}

                  {!displayNode.isEntity && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Importance: {displayNode.importance.toFixed(2)}</span>
                      {displayNode.source && <span>{displayNode.source}</span>}
                    </div>
                  )}

                  {!displayNode.isEntity && selectedNode?.id === displayNode.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => router.push(`/memories/${displayNode.id}`)}
                    >
                      View full memory →
                    </Button>
                  )}

                  {!selectedNode && !displayNode.isEntity && (
                    <p className="text-[10px] text-muted-foreground/60">
                      Click to highlight connections · Double-click to view
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Graph */}
        <Card className="overflow-hidden flex-1 h-full">
          <CardContent className="p-0 h-full" ref={containerRef}>
            {graphData.nodes.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                style={{ height: dimensions.height }}
              >
                <Network className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Graph Data</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No memories match the current filters. Try adjusting the layer
                  filters or increasing the node count.
                </p>
              </div>
            ) : (
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                nodeId="id"
                nodeCanvasObject={nodeCanvasObject}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                  const n = node as GraphNode & { x: number; y: number };
                  ctx.beginPath();
                  ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
                  ctx.fillStyle = color;
                  ctx.fill();
                }}
                linkColor={linkColor}
                linkWidth={linkWidth}
                linkDirectionalParticles={0}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                warmupTicks={150}
                cooldownTicks={300}
                nodeRelSize={6}
                onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
                onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
                onNodeDragEnd={(node: any) => {
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                onNodeClick={handleNodeClick}
                onBackgroundClick={() => {
                  setSelectedNode(null);
                  setHoveredNode(null);
                }}
                backgroundColor="transparent"
                enablePointerInteraction={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
