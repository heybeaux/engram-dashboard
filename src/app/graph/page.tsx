'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { engram } from '@/lib/engram-client';
import { GraphData, GraphNode, GraphEntity } from '@/lib/types';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center">Loading graph...</div>
});

// Color mapping for entity types
const ENTITY_TYPE_COLORS: Record<string, string> = {
  person: '#3b82f6',      // blue
  organization: '#8b5cf6', // purple
  project: '#10b981',      // green
  product: '#f59e0b',      // amber
  location: '#ef4444',     // red
  other: '#6b7280',        // gray
};

// Color mapping for memory layers
const LAYER_COLORS: Record<string, string> = {
  IDENTITY: '#3b82f6',   // blue
  PROJECT: '#10b981',    // green
  SESSION: '#f59e0b',    // amber
  TASK: '#ef4444',       // red
};

// Force graph nodes/links are loosely typed - the library mutates them with position data

export default function GraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(500, window.innerHeight - 300) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch graph data
  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        const graphData = await engram.getGraphData({ limit: 500 });
        setData(graphData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, []);

  // Node click handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode);
    setSelectedEntity(null);
  }, []);

  // Node label
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNodeLabel = useCallback((node: any) => {
    const what = node.extraction?.what;
    if (what && what.length > 50) return what.substring(0, 50) + '...';
    return what || node.raw?.substring(0, 50) + '...';
  }, []);

  // Node color based on layer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNodeColor = useCallback((node: any) => {
    return LAYER_COLORS[node.layer] || '#6b7280';
  }, []);

  // Node size based on importance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNodeSize = useCallback((node: any) => {
    return 4 + ((node.importanceScore || 0.5) * 8);
  }, []);

  // Link color based on type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getLinkColor = useCallback((link: any) => {
    const colors: Record<string, string> = {
      LED_TO: '#6b7280',
      SUPPORTS: '#10b981',
      CONTRADICTS: '#ef4444',
      UPDATES: '#3b82f6',
      RELATED: '#8b5cf6',
    };
    return colors[link.linkType] || '#6b7280';
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory Graph</h2>
          <p className="text-muted-foreground">Loading visualization...</p>
        </div>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory Graph</h2>
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Transform data for force graph (edges need to be called 'links')
  const graphData = {
    nodes: data.nodes,
    links: data.edges.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory Graph</h2>
          <p className="text-muted-foreground">
            Visualize relationships between memories
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">{data.nodes.length} memories</Badge>
          <Badge variant="secondary">{data.edges.length} links</Badge>
          <Badge variant="secondary">{data.entities.length} entities</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Visualization */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0" ref={containerRef}>
            <ForceGraph2D
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel={getNodeLabel}
              nodeColor={getNodeColor}
              nodeVal={getNodeSize}
              linkColor={getLinkColor}
              linkWidth={1.5}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              nodeCanvasObjectMode={() => 'after'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                // Draw a small label for important nodes
                if ((node.importanceScore || 0) > 0.7 && globalScale > 1) {
                  const label = node.extraction?.what?.substring(0, 20) || '';
                  if (label && node.x !== undefined && node.y !== undefined) {
                    const fontSize = 10 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = '#666';
                    ctx.textAlign = 'center';
                    ctx.fillText(label, node.x, node.y + 8);
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Layers</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(LAYER_COLORS).map(([layer, color]) => (
                    <Badge 
                      key={layer} 
                      variant="outline" 
                      style={{ borderColor: color, color }}
                      className="text-xs"
                    >
                      {layer}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Link Types</p>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-gray-500" />
                    <span>LED_TO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500" />
                    <span>SUPPORTS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500" />
                    <span>CONTRADICTS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500" />
                    <span>UPDATES</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Entities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Entities</CardTitle>
              <CardDescription className="text-xs">
                Click to filter (coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.entities.slice(0, 10).map(entity => (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity)}
                    className="w-full text-left p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: ENTITY_TYPE_COLORS[entity.type] || '#6b7280' }}
                      />
                      <span className="text-sm truncate">{entity.name}</span>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {entity.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Memory Detail */}
          {selectedNode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Memory</CardTitle>
                <Badge variant="outline" style={{ borderColor: LAYER_COLORS[selectedNode.layer] }}>
                  {selectedNode.layer}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">What</p>
                  <p className="text-sm">{selectedNode.extraction?.what || selectedNode.raw}</p>
                </div>
                {selectedNode.extraction?.who && (
                  <div>
                    <p className="text-xs text-muted-foreground">Who</p>
                    <p className="text-sm">{selectedNode.extraction.who}</p>
                  </div>
                )}
                {selectedNode.extraction?.when && (
                  <div>
                    <p className="text-xs text-muted-foreground">When</p>
                    <p className="text-sm">{new Date(selectedNode.extraction.when).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Importance</p>
                  <p className="text-sm">{(selectedNode.importanceScore * 100).toFixed(0)}%</p>
                </div>
                {selectedNode.entities.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Entities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.entities.map(e => (
                        <Badge key={e.id} variant="secondary" className="text-xs">
                          {e.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNode.extraction?.topics && selectedNode.extraction.topics.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Topics</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.extraction.topics.map(t => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
