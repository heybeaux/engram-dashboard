'use client';

import Link from 'next/link';

export default function ConsolidationPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Sleep Consolidation</h1>
          
          <p className="text-xl text-gray-300">
            Like how human memory consolidates during sleep — compressing experiences into 
            essential knowledge — Engram can consolidate similar memories into distilled facts.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">🧠 Inspired by Neuroscience</h3>
            <p className="mb-0">
              During sleep, the brain replays memories and strengthens repeated patterns. 
              Details fade, but the gist remains. Engram mimics this process — finding 
              recurring patterns and promoting them to long-term storage.
            </p>
          </div>

          <h2>How It Works</h2>

          <h3>1. Clustering</h3>
          <p>
            The consolidation service finds all SESSION layer memories and clusters them 
            by semantic similarity using embeddings.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Similarity threshold: 0.85 (very similar)
Minimum cluster size: 3 memories`}
          </pre>

          <h3>2. Gist Extraction</h3>
          <p>
            For each cluster, an LLM extracts the <strong>essential fact</strong> that all 
            memories share. This is the &quot;gist&quot; — the compressed wisdom.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Input memories:
1. "I prefer dark mode"
2. "Dark mode is my preference"  
3. "I always use dark mode for everything"

Extracted gist:
"Beaux prefers dark mode"`}
          </pre>

          <h3>3. Promotion</h3>
          <p>
            The canonical memory is promoted to the IDENTITY layer with:
          </p>
          <ul>
            <li>Content replaced with the gist</li>
            <li>+0.2 importance boost</li>
            <li><code>consolidated: true</code> flag</li>
          </ul>

          <h3>4. Archival</h3>
          <p>
            Duplicate memories are soft-deleted with a <code>consolidatedInto</code> reference 
            pointing to the canonical memory. Original content is preserved in the extraction&apos;s 
            <code>rawJson</code> for audit purposes.
          </p>

          <h2>API Usage</h2>

          <h3>Trigger Consolidation</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/consolidate
X-AM-API-Key: your-key
X-AM-User-ID: beaux

Query params:
  dryRun=true    # Preview without making changes
  
Response:
{
  "promoted": 3,
  "duplicatesRemoved": 8,
  "clustersFound": 3,
  "details": [
    {
      "canonicalId": "mem_abc123",
      "canonicalRaw": "Beaux prefers dark mode",
      "promotedToLayer": "IDENTITY",
      "duplicateIds": ["mem_def456", "mem_ghi789"]
    }
  ]
}`}
          </pre>

          <h3>Get Consolidation Stats</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/consolidate/stats
X-AM-API-Key: your-key
X-AM-User-ID: beaux

Response:
{
  "totalMemories": 547,
  "sessionMemories": 461,
  "identityMemories": 52,
  "projectMemories": 34,
  "consolidatedCount": 12,
  "potentialClusters": 15
}`}
          </pre>

          <h2>Scheduling</h2>
          <p>
            Consolidation is computationally expensive (embedding generation + LLM calls). 
            Run it during off-hours, not on every request.
          </p>

          <h3>Recommended Schedule</h3>
          <ul>
            <li><strong>Nightly</strong>: Full consolidation pass</li>
            <li><strong>Weekly</strong>: Aggressive consolidation with lower threshold (0.80)</li>
          </ul>

          <h3>Cron Example</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Run consolidation every night at 3am
0 3 * * * curl -X POST https://api.openengram.ai/v1/consolidate \\
  -H "X-AM-API-Key: $API_KEY" \\
  -H "X-AM-User-ID: beaux"`}
          </pre>

          <h2>Configuration</h2>

          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>minOccurrences</code></td>
                <td>3</td>
                <td>Minimum memories in cluster to trigger promotion</td>
              </tr>
              <tr>
                <td><code>similarityThreshold</code></td>
                <td>0.85</td>
                <td>Cosine similarity threshold for clustering</td>
              </tr>
              <tr>
                <td><code>dryRun</code></td>
                <td>false</td>
                <td>Preview changes without applying</td>
              </tr>
            </tbody>
          </table>

          <h2>Audit Trail</h2>
          <p>
            Consolidation preserves the original memories for compliance and debugging:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Stored in MemoryExtraction.rawJson
{
  "consolidatedFrom": [
    { "id": "mem_def456", "raw": "I prefer dark mode", "createdAt": "..." },
    { "id": "mem_ghi789", "raw": "Dark mode is my preference", "createdAt": "..." }
  ],
  "gistConfidence": 0.92,
  "originalRaw": "I always use dark mode for everything"
}`}
          </pre>

          <h2>Monitoring</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/health

{
  "metrics": {
    "consolidatedCount": 12,  // Total consolidated memories
    // ...
  }
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Always dry-run first</strong> — Review what will be consolidated before committing
            </li>
            <li>
              <strong>Schedule during quiet hours</strong> — Consolidation can take minutes for large memory stores
            </li>
            <li>
              <strong>Monitor cluster quality</strong> — If gists seem off, adjust the similarity threshold
            </li>
            <li>
              <strong>Preserve audit trail</strong> — The rawJson field contains original content for compliance
            </li>
          </ul>

          <h2>Future: Hierarchical Compression</h2>
          <p>
            Sleep consolidation is the first step toward multi-resolution memory:
          </p>
          <ul>
            <li><strong>Gist layer</strong>: Fast retrieval of essential facts</li>
            <li><strong>Detail layer</strong>: Slower access to original content when needed</li>
            <li><strong>Automatic tiering</strong>: Old details → cold storage</li>
          </ul>
        </article>
      </div>
    </div>
  );
}
