'use client';

import { useEffect, useState } from 'react';

/**
 * Memory Graph Page
 * 
 * Embeds the D3 memory graph visualization from the Engram API server.
 * The graph is served from /memory-graph.html on the Engram server.
 */
export default function GraphPage() {
  const [graphUrl, setGraphUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the Engram API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_ENGRAM_API_URL || 'http://localhost:3001';
    
    // The graph HTML is served from the public directory of Engram
    // Accessible at /memory-graph.html
    const graphPath = `${apiUrl}/memory-graph.html`;
    
    // Verify the graph is accessible
    fetch(graphPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setGraphUrl(graphPath);
        } else {
          setError(`Graph not available at ${graphPath} (status ${res.status})`);
        }
      })
      .catch((err) => {
        setError(`Failed to connect to Engram: ${err.message}`);
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">Graph Unavailable</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Make sure the Engram API server is running and accessible.
          </p>
        </div>
      </div>
    );
  }

  if (!graphUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Full-screen iframe for the D3 graph */}
      <iframe
        src={graphUrl}
        className="w-full h-full border-0"
        title="Memory Graph"
        allow="fullscreen"
      />
    </div>
  );
}
