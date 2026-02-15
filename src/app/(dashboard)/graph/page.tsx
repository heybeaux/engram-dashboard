'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Network, ExternalLink } from 'lucide-react';

/**
 * Memory Graph Page
 * 
 * Embeds the D3 memory graph visualization from the Engram API server.
 * The graph is served from /memory-graph.html on the Engram server.
 */
export default function GraphPage() {
  const [graphUrl, setGraphUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkGraph = () => {
    setLoading(true);
    setError(null);
    
    const apiUrl = process.env.NEXT_PUBLIC_ENGRAM_API_URL || 'https://api.openengram.ai';
    const apiKey = process.env.NEXT_PUBLIC_ENGRAM_API_KEY || '';
    const userId = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || 'Beaux';
    
    const params = new URLSearchParams();
    if (apiKey) params.set('apiKey', apiKey);
    if (userId) params.set('userId', userId);
    const graphPath = `${apiUrl}/memory-graph.html?${params.toString()}`;
    
    fetch(graphPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setGraphUrl(graphPath);
        } else {
          setError(`Graph visualization not available (HTTP ${res.status}). The Engram API may not be serving static files.`);
        }
      })
      .catch((err) => {
        setError(`Cannot connect to Engram API: ${err.message}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkGraph();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
          <Badge variant="outline">Loading...</Badge>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Connecting to graph visualization...</div>
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
          <Badge variant="destructive">Unavailable</Badge>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
            <Network className="h-10 w-10 md:h-12 md:w-12 text-destructive mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Graph Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Make sure the Engram API server is running and the memory-graph.html file is in its public directory.
            </p>
            <Button onClick={checkGraph} variant="outline" size="sm" className="h-11">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Memory Graph</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-11" asChild>
            <a href={graphUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Screen
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={checkGraph} className="h-11 w-11">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <iframe
            src={graphUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
            title="Memory Graph"
            allow="fullscreen"
          />
        </CardContent>
      </Card>
    </div>
  );
}
