/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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

// Dynamically import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

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

// ── Graph params state ──────────────────────────────────────────────────
interface GraphParams {
  limit: number;
  minConfidence: number;
  layers: Set<string>;
  searchQuery: string;
}

function defaultParams(): GraphParams {
  return {
    limit: 200,
    minConfidence: 0,
    layers: new Set(LAYERS),
    searchQuery: '',
  };
}

interface GraphNode {
  id: string;
  label: string;
  layer: string;
  importance: number;
  color: string;
  radius: number;
  isEntity: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  linkType: string;
  confidence: number;
}

// ── Transform API data → graph data ─────────────────────────────────
function buildGraphData(
  data: GraphData,
  params: GraphParams,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeMap = new Map<string, GraphNode>();

  for (const n of data.nodes) {
    if (!params.layers.has(n.layer)) continue;
    nodeMap.set(n.id, {
      id: n.id,
      label: n.extraction?.what || n.raw?.slice(0, 50) || n.id.slice(0, 8),
      layer: n.layer,
      importance: n.importanceScore ?? 0.5,
      color: LAYER_COLORS[n.layer] || DEFAULT_NODE_COLOR,
      radius: 3 + (n.importanceScore ?? 0.5) * 5,
      isEntity: false,
    });
  }

  for (const e of data.entities) {
    if (nodeMap.has(e.id)) continue;
    nodeMap.set(e.id, {
      id: e.id,
      label: e.name || e.id.slice(0, 8),
      layer: 'ENTITY',
      importance: 0.7,
      color: ENTITY_COLOR,
      radius: 5,
      isEntity: true,
    });
  }

  const links: GraphLink[] = data.edges
    .filter(
      (e) =>
        e.confidence >= params.minConfidence &&
        nodeMap.has(e.source) &&
        nodeMap.has(e.target),
    )
    .map((e) => ({
      source: e.source,
      target: e.target,
      linkType: e.linkType,
      confidence: e.confidence,
    }));

  return { nodes: Array.from(nodeMap.values()), links };
}

// ════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════

export default function GraphPage() {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rawData, setRawData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, entities: 0 });
  const [params, setParams] = useState<GraphParams>(defaultParams);
  const [showControls, setShowControls] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

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

  // ── Resize observer ─────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.max(500, window.innerHeight - 260),
          });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Build graph data when rawData or params change ──────────────────
  const graphData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] };
    return buildGraphData(rawData, params);
  }, [rawData, params]);

  // ── Configure forces and zoom to fit after data loads ─────────────
  useEffect(() => {
    if (graphData.nodes.length > 0 && graphRef.current) {
      // Configure force strengths
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.d3Force('charge')?.strength(-120);
          graphRef.current.d3Force('link')?.distance(60);
          graphRef.current.d3ReheatSimulation();
        }
      }, 100);
    }
  }, [graphData]);

  // ── Node canvas rendering ───────────────────────────────────────────
  const searchQuery = params.searchQuery.toLowerCase().trim();

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x: number; y: number };
      const highlighted =
        searchQuery.length > 0 &&
        n.label.toLowerCase().includes(searchQuery);
      const dimmed = searchQuery.length > 0 && !highlighted;

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = dimmed ? `${n.color}33` : n.color;
      ctx.fill();

      if (highlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Labels when zoomed in or highlighted
      if (globalScale > 2 || highlighted) {
        const fontSize = Math.max(10 / globalScale, 2);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = dimmed
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.85)';
        ctx.fillText(n.label.slice(0, 30), n.x, n.y + n.radius + 1);
      }
    },
    [searchQuery],
  );

  // ── Link rendering ──────────────────────────────────────────────────
  const linkColor = useCallback((link: any) => {
    const l = link as GraphLink;
    const isShared = l.linkType?.startsWith('shared:');
    return isShared
      ? `rgba(100, 116, 139, ${0.08 + l.confidence * 0.12})`
      : `rgba(236, 72, 153, ${0.15 + l.confidence * 0.25})`;
  }, []);

  const linkWidth = useCallback((link: any) => {
    const l = link as GraphLink;
    const isShared = l.linkType?.startsWith('shared:');
    return isShared ? 0.3 : 0.5 + l.confidence;
  }, []);

  // ── Zoom controls ───────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    const fg = graphRef.current;
    if (fg) {
      const currentZoom = fg.zoom();
      fg.zoom(currentZoom * 1.5, 300);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const fg = graphRef.current;
    if (fg) {
      const currentZoom = fg.zoom();
      fg.zoom(currentZoom / 1.5, 300);
    }
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
            {stats.nodes} memories · {stats.edges} links · {stats.entities}{' '}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-9 w-9 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-9 w-9 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadGraph()}
            className="h-9 w-9 p-0"
          >
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
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: ENTITY_COLOR }}
          />
          <span className="text-muted-foreground">entity</span>
        </div>
      </div>

      {/* Main layout: controls + graph */}
      <div className="flex gap-4">
        {/* Controls panel */}
        {showControls && (
          <Card className="w-[280px] shrink-0">
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Search entities</p>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={params.searchQuery}
                    onChange={(e) =>
                      setParams((p) => ({
                        ...p,
                        searchQuery: e.target.value,
                      }))
                    }
                    className="pl-8 h-9 text-sm"
                  />
                  {params.searchQuery && (
                    <button
                      className="absolute right-2 top-2.5"
                      onClick={() =>
                        setParams((p) => ({ ...p, searchQuery: '' }))
                      }
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
                  max={1000}
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
                    setParams((p) => ({
                      ...p,
                      minConfidence: parseFloat(e.target.value),
                    }))
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

              {/* Hovered node info */}
              {hoveredNode && (
                <div className="border-t pt-3 space-y-1">
                  <p className="text-xs font-medium truncate">
                    {hoveredNode.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hoveredNode.isEntity ? 'Entity' : hoveredNode.layer}
                    {!hoveredNode.isEntity &&
                      ` · importance ${hoveredNode.importance.toFixed(2)}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Graph */}
        <Card className="overflow-hidden flex-1">
          <CardContent className="p-0" ref={containerRef}>
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
                warmupTicks={100}
                cooldownTicks={200}
                nodeRelSize={6}
                onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
                onNodeHover={(node: any) => setHoveredNode(node as GraphNode | null)}
                onNodeDragEnd={(node: any) => {
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                onNodeClick={(node: any) => {
                  // Double-click to unpin
                  if (node.fx != null) {
                    node.fx = undefined;
                    node.fy = undefined;
                  }
                }}
                onBackgroundClick={() => setHoveredNode(null)}
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
