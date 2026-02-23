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
import * as d3 from 'd3';
import { engram as engramClient } from '@/lib/engram-client';
import type { GraphData } from '@/lib/types';

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

// ── D3 node/link types ──────────────────────────────────────────────────
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  layer: string;
  importance: number;
  color: string;
  radius: number;
  isEntity: boolean;
  highlighted: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  linkType: string;
  confidence: number;
}

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

// ── Transform API data → d3 simulation data ─────────────────────────────
function buildSimData(
  data: GraphData,
  params: GraphParams,
  oldNodes: Map<string, { x: number; y: number }>,
): { nodes: SimNode[]; links: SimLink[] } {
  const nodeMap = new Map<string, SimNode>();

  // Memory nodes
  for (const n of data.nodes) {
    if (!params.layers.has(n.layer)) continue;
    const old = oldNodes.get(n.id);
    nodeMap.set(n.id, {
      id: n.id,
      label: n.extraction?.what || n.raw?.slice(0, 50) || n.id.slice(0, 8),
      layer: n.layer,
      importance: n.importanceScore ?? 0.5,
      color: LAYER_COLORS[n.layer] || DEFAULT_NODE_COLOR,
      radius: 3 + (n.importanceScore ?? 0.5) * 5,
      isEntity: false,
      highlighted: false,
      ...(old ? { x: old.x, y: old.y } : {}),
    });
  }

  // Entity nodes
  for (const e of data.entities) {
    if (nodeMap.has(e.id)) continue;
    const old = oldNodes.get(e.id);
    nodeMap.set(e.id, {
      id: e.id,
      label: e.name || e.id.slice(0, 8),
      layer: 'ENTITY',
      importance: 0.7,
      color: ENTITY_COLOR,
      radius: 5,
      isEntity: true,
      highlighted: false,
      ...(old ? { x: old.x, y: old.y } : {}),
    });
  }

  // Links — filter by confidence and ensure both endpoints exist
  const links: SimLink[] = data.edges
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const transformRef = useRef(d3.zoomIdentity);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const oldPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const [rawData, setRawData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, entities: 0 });
  const [params, setParams] = useState<GraphParams>(defaultParams);
  const [showControls, setShowControls] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
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
        setDimensions({
          width,
          height: Math.max(500, window.innerHeight - 260),
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Build simulation data when rawData or params change ─────────────
  const simData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] };
    return buildSimData(rawData, params, oldPositionsRef.current);
  }, [rawData, params]);

  // ── Search highlighting ─────────────────────────────────────────────
  useEffect(() => {
    const q = params.searchQuery.toLowerCase().trim();
    for (const node of nodesRef.current) {
      node.highlighted = q.length > 0 && node.label.toLowerCase().includes(q);
    }
    renderCanvas();
  }, [params.searchQuery]);

  // ── D3 simulation + Canvas rendering ────────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    ctx.translate(
      transformRef.current.x * dpr,
      transformRef.current.y * dpr,
    );
    ctx.scale(
      transformRef.current.k * dpr,
      transformRef.current.k * dpr,
    );

    const nodes = nodesRef.current;
    const links = linksRef.current;
    const hasSearch = params.searchQuery.trim().length > 0;

    // Draw links
    for (const link of links) {
      const source = link.source as SimNode;
      const target = link.target as SimNode;
      if (source.x == null || target.x == null) continue;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y!);
      ctx.lineTo(target.x, target.y!);
      const isShared = link.linkType?.startsWith('shared:');
      ctx.strokeStyle = isShared
        ? `rgba(100, 116, 139, ${0.08 + link.confidence * 0.12})`
        : `rgba(236, 72, 153, ${0.15 + link.confidence * 0.25})`;
      ctx.lineWidth = isShared ? 0.3 : 0.5 + link.confidence;
      ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
      if (node.x == null) continue;

      const dimmed = hasSearch && !node.highlighted;
      const bright = hasSearch && node.highlighted;

      ctx.beginPath();
      ctx.arc(node.x, node.y!, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = dimmed
        ? `${node.color}33`
        : node.color;
      ctx.fill();

      if (bright) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Labels: show when zoomed in or highlighted
      if (transformRef.current.k > 2 || bright) {
        const fontSize = Math.max(10 / transformRef.current.k, 2);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = dimmed
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(255,255,255,0.85)';
        ctx.fillText(
          node.label.slice(0, 30),
          node.x,
          node.y! + node.radius + 1,
        );
      }
    }

    ctx.restore();
  }, [dimensions, params.searchQuery]);

  // ── Initialize / update simulation ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || simData.nodes.length === 0) return;

    // Save old positions for warm-start
    for (const node of nodesRef.current) {
      if (node.x != null && node.y != null) {
        oldPositionsRef.current.set(node.id, { x: node.x, y: node.y });
      }
    }

    nodesRef.current = simData.nodes;
    linksRef.current = simData.links;

    // Kill old simulation
    simRef.current?.stop();

    const { width, height } = dimensions;
    // Scale forces based on graph density
    const nodeCount = simData.nodes.length;
    const linkCount = simData.links.length;
    const density = nodeCount > 0 ? linkCount / nodeCount : 0;
    // Higher density → more repulsion to spread out clusters
    const chargeStrength = Math.max(-120, -30 - density * 10);
    const linkDistance = Math.max(30, 60 - density * 2);

    const sim = d3
      .forceSimulation<SimNode>(simData.nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simData.links)
          .id((d) => d.id)
          .distance(linkDistance)
          .strength((l) => {
            const link = l as SimLink;
            // Shared-entity links are weaker (don't pull memories together so tightly)
            const isShared = link.linkType?.startsWith('shared:');
            return isShared ? 0.02 + link.confidence * 0.03 : 0.1 + link.confidence * 0.15;
          }),
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength).distanceMax(300))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.03))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => d.radius + 2))
      .force('x', d3.forceX(width / 2).strength(0.01))
      .force('y', d3.forceY(height / 2).strength(0.01))
      .alphaDecay(0.015)
      .velocityDecay(0.3)
      .on('tick', renderCanvas);

    // Warm-start: if nodes already have positions, reduce alpha
    const hasPositions = simData.nodes.some((n) => n.x != null && n.y != null);
    if (hasPositions) {
      sim.alpha(0.3).restart();
    }

    simRef.current = sim;

    // ── Zoom ────────────────────────────────────────────────────────
    const d3Canvas = d3.select(canvas);
    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        renderCanvas();
      });
    d3Canvas.call(zoom);

    // ── Drag ────────────────────────────────────────────────────────
    const findNode = (x: number, y: number): SimNode | null => {
      const t = transformRef.current;
      const sx = (x - t.x) / t.k;
      const sy = (y - t.y) / t.k;
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i];
        if (n.x == null) continue;
        const dx = sx - n.x;
        const dy = sy - n.y!;
        if (dx * dx + dy * dy < (n.radius + 3) * (n.radius + 3)) return n;
      }
      return null;
    };

    let dragNode: SimNode | null = null;

    d3Canvas.on('mousedown', (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const node = findNode(event.clientX - rect.left, event.clientY - rect.top);
      if (node) {
        dragNode = node;
        node.fx = node.x;
        node.fy = node.y;
        simRef.current?.alphaTarget(0.3).restart();
      }
    });

    d3Canvas.on('mousemove', (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = transformRef.current;

      if (dragNode) {
        dragNode.fx = (event.clientX - rect.left - t.x) / t.k;
        dragNode.fy = (event.clientY - rect.top - t.y) / t.k;
      }

      // Hover detection
      const node = findNode(event.clientX - rect.left, event.clientY - rect.top);
      setHoveredNode(node);
      canvas.style.cursor = node ? 'pointer' : 'default';
    });

    d3Canvas.on('mouseup', () => {
      if (dragNode) {
        dragNode.fx = null;
        dragNode.fy = null;
        dragNode = null;
        simRef.current?.alphaTarget(0);
      }
    });

    // ── Click to center ─────────────────────────────────────────────
    d3Canvas.on('dblclick', (event: MouseEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const node = findNode(event.clientX - rect.left, event.clientY - rect.top);
      if (node && node.x != null) {
        const t = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(3)
          .translate(-node.x, -node.y!);
        d3Canvas.transition().duration(500).call(zoom.transform, t);
      }
    });

    return () => {
      sim.stop();
      d3Canvas.on('.zoom', null);
      d3Canvas.on('mousedown', null);
      d3Canvas.on('mousemove', null);
      d3Canvas.on('mouseup', null);
      d3Canvas.on('dblclick', null);
    };
  }, [simData, dimensions, renderCanvas]);

  // ── Canvas DPR sizing ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    renderCanvas();
  }, [dimensions, renderCanvas]);

  // ── Zoom controls ───────────────────────────────────────────────────
  const handleZoom = useCallback(
    (factor: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const d3Canvas = d3.select(canvas);
      const zoom = d3.zoom<HTMLCanvasElement, unknown>().scaleExtent([0.1, 10]);
      d3Canvas
        .transition()
        .duration(300)
        .call(
          zoom.scaleBy,
          factor,
        );
    },
    [],
  );

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
            onClick={() => handleZoom(1.5)}
            className="h-9 w-9 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(1 / 1.5)}
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

        {/* Canvas */}
        <Card className="overflow-hidden flex-1">
          <CardContent className="p-0" ref={containerRef}>
            {simData.nodes.length === 0 ? (
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
              <canvas
                ref={canvasRef}
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  display: 'block',
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
