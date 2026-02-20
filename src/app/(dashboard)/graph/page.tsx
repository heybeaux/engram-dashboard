/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Network, ZoomIn, ZoomOut } from 'lucide-react';
import dynamic from 'next/dynamic';
import { engram as engramClient } from '@/lib/engram-client';
import type { GraphData } from '@/lib/types';

// Force graph must be loaded client-side only (uses canvas/window)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Loading graph renderer...
    </div>
  ),
});

// Color map for memory layers
const LAYER_COLORS: Record<string, string> = {
  CORE: '#ef4444',
  SEMANTIC: '#3b82f6',
  EPISODIC: '#22c55e',
  WORKING: '#f59e0b',
  PROCEDURAL: '#8b5cf6',
  INSIGHT: '#f59e0b',
};

const DEFAULT_NODE_COLOR = '#6b7280';

interface ForceGraphNode {
  id: string;
  name: string;
  layer: string;
  importance: number;
  color: string;
  val: number;
}

interface ForceGraphLink {
  source: string;
  target: string;
  linkType: string;
  confidence: number;
}

interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

function transformGraphData(data: GraphData): ForceGraphData {
  const nodeMap = new Set(data.nodes.map((n) => n.id));

  // Build entity nodes if we have entities but few memory nodes
  const entityNodes: ForceGraphNode[] = data.entities
    .filter((e) => !nodeMap.has(e.id))
    .map((e) => ({
      id: e.id,
      name: e.name || e.normalizedName,
      layer: 'ENTITY',
      importance: 0.5,
      color: '#ec4899',
      val: 4,
    }));

  const memoryNodes: ForceGraphNode[] = data.nodes.map((n) => ({
    id: n.id,
    name: n.extraction?.what || n.raw?.slice(0, 60) || n.id.slice(0, 8),
    layer: n.layer,
    importance: n.importanceScore,
    color: LAYER_COLORS[n.layer] || DEFAULT_NODE_COLOR,
    val: 2 + n.importanceScore * 6,
  }));

  const allNodeIds = new Set([...memoryNodes.map((n) => n.id), ...entityNodes.map((n) => n.id)]);

  // Only include edges where both endpoints exist
  const links: ForceGraphLink[] = data.edges
    .filter((e) => allNodeIds.has(e.source) && allNodeIds.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      linkType: e.linkType,
      confidence: e.confidence,
    }));

  return {
    nodes: [...memoryNodes, ...entityNodes],
    links,
  };
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<ForceGraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, entities: 0 });
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await engramClient.getGraphData({ limit: 200 });
      setStats({
        nodes: data.nodes.length,
        edges: data.edges.length,
        entities: data.entities.length,
      });

      if (data.nodes.length === 0 && data.entities.length === 0) {
        setGraphData({ nodes: [], links: [] });
      } else {
        setGraphData(transformGraphData(data));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Resize observer for responsive dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.max(500, window.innerHeight - 260) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 300);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.5, 300);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
          <Badge variant="outline">Loading...</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-muted animate-pulse" />
              <span className="w-16 h-3 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center" style={{ height: Math.max(500, 600) }}>
              <div className="relative w-64 h-64">
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const r = 80 + (i % 3) * 20;
                  return (
                    <span
                      key={i}
                      className="absolute w-4 h-4 rounded-full bg-muted animate-pulse"
                      style={{
                        left: `${128 + Math.cos(angle) * r - 8}px`,
                        top: `${128 + Math.sin(angle) * r - 8}px`,
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Network className="h-8 w-8 text-muted-foreground/30 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading graph data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
          <Badge variant="destructive">Error</Badge>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
            <Network className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Failed to Load Graph</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
            <Button onClick={loadGraph} variant="outline" size="sm" className="h-11">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = graphData && graphData.nodes.length === 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {stats.nodes} memories · {stats.edges} links · {stats.entities} entities
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-9 w-9 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-9 w-9 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={loadGraph} className="h-9 w-9 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Layer legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(LAYER_COLORS).map(([layer, color]) => (
          <div key={layer} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground capitalize">{layer.toLowerCase()}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#ec4899' }} />
          <span className="text-muted-foreground">entity</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0" ref={containerRef}>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Network className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Graph Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No memories or relationships found. Add some memories to see the graph visualization.
              </p>
            </div>
          ) : (
            graphData && (
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                nodeLabel={(node: any) => `${node.name}\n[${node.layer}]`}
                nodeColor={(node: any) => node.color}
                nodeRelSize={4}
                linkColor={() => 'rgba(100, 116, 139, 0.3)'}
                linkWidth={(link: any) => 0.5 + link.confidence * 2}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={2}
                backgroundColor="transparent"
                onNodeClick={(node: any) => {
                  // Center on clicked node
                  graphRef.current?.centerAt(node.x, node.y, 500);
                  graphRef.current?.zoom(3, 500);
                }}
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                  const label = node.name;
                  const fontSize = Math.max(10 / globalScale, 1.5);
                  const r = Math.sqrt(node.val) * 4;

                  // Draw node circle
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
                  ctx.fillStyle = node.color;
                  ctx.fill();
                  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                  ctx.lineWidth = 0.5;
                  ctx.stroke();

                  // Draw label if zoomed in enough
                  if (globalScale > 1.5) {
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.fillText(label.slice(0, 30), node.x, node.y + r + 1);
                  }
                }}
                cooldownTicks={100}
                warmupTicks={50}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
