'use client';

import Link from 'next/link';

export default function APIReferencePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>API Reference</h1>
          
          <p className="text-xl text-gray-300">
            Complete REST API documentation for Engram.
          </p>

          <h2>Authentication</h2>
          <p>All requests (except <code>/v1/health</code>) require two headers:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx
X-AM-User-ID: alice`}
          </pre>
          <ul>
            <li><strong>X-AM-API-Key</strong>: Your agent&apos;s API key</li>
            <li><strong>X-AM-User-ID</strong>: External user identifier (you define this)</li>
          </ul>

          <hr className="border-gray-800" />

          <h2>Memories</h2>

          <h3>Create Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories

{
  "raw": "Beaux prefers dark mode",      // Required
  "layer": "IDENTITY",                   // Optional: IDENTITY|PROJECT|SESSION|TASK
  "importanceHint": "high",              // Optional: low|medium|high|critical
  "projectId": "proj_123",               // Optional: associate with project
  "sessionId": "sess_456"                // Optional: associate with session
}

Response: Memory object with extraction`}
          </pre>

          <h3>Create Batch</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/batch

{
  "memories": [
    { "raw": "Memory 1" },
    { "raw": "Memory 2" }
  ]
}

Response: { created: Memory[], failed: { raw, error }[] }`}
          </pre>

          <h3>Query Memories</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/query

{
  "query": "what does Beaux like?",      // Semantic search query
  "limit": 10,                           // Optional: max results
  "layers": ["IDENTITY", "SESSION"],     // Optional: filter by layer
  "includeChains": true                  // Optional: include related memories
}

Response: {
  memories: MemoryWithScore[],
  queryTokens: number,
  latencyMs: number
}`}
          </pre>

          <h3>Get Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/memories/:id

Response: Memory with extraction`}
          </pre>

          <h3>Update Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PATCH /v1/memories/:id

{
  "raw": "Updated content",              // Optional
  "layer": "IDENTITY",                   // Optional
  "userPinned": true,                    // Optional
  "userHidden": false                    // Optional
}

Response: Updated Memory`}
          </pre>

          <h3>Delete Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DELETE /v1/memories/:id

Response: { deleted: true }`}
          </pre>

          <h3>Mark as Used</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/:id/used

Response: { usedCount: number }`}
          </pre>

          <h3>Correct Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/:id/correct

{
  "correctedContent": "The correct information",
  "reason": "Original had wrong date"    // Optional
}

Response: New Memory (old one marked superseded)`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Context</h2>

          <h3>Load Context</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/context

{
  "maxTokens": 4000,                     // Optional: token budget
  "projectId": "proj_123",               // Optional: include project memories
  "agentId": "rook"                      // Optional: include agent self-memories
}

Response: {
  context: string,                       // Formatted for injection
  tokenCount: number,
  memoriesIncluded: number,
  layers: { identity, project, session, agent? }
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Auto-Observe</h2>

          <h3>Observe Conversation</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/observe

{
  "turns": [
    { "role": "user", "content": "I prefer dark mode" },
    { "role": "assistant", "content": "Noted!" }
  ],
  "projectId": "proj_123",               // Optional
  "sessionId": "sess_456",               // Optional
  "minImportance": 0.4                   // Optional: filter threshold
}

Response: {
  memoriesCreated: Memory[],
  factsExtracted: number
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Consolidation</h2>

          <h3>Trigger Consolidation</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/consolidate?dryRun=true

Response: {
  promoted: number,
  duplicatesRemoved: number,
  clustersFound: number,
  details: [{
    canonicalId: string,
    canonicalRaw: string,
    promotedToLayer: string,
    duplicateIds: string[]
  }]
}`}
          </pre>

          <h3>Consolidation Stats</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/consolidate/stats

Response: {
  totalMemories: number,
  sessionMemories: number,
  identityMemories: number,
  projectMemories: number,
  consolidatedCount: number,
  potentialClusters: number
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Backfill</h2>

          <h3>Backfill Extractions</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/backfill?dryRun=true&batchSize=50

Response: {
  processed: number,
  errors: number,
  details: [...]
}`}
          </pre>

          <h3>Backfill User Identity</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/backfill/user-identity

{
  "actualName": "Beaux",
  "dryRun": true
}

Response: { updated: number, skipped: number }`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Dashboard</h2>

          <h3>Health Check</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/health                          // No auth required

Response: {
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: string,
  metrics: {
    totalMemories: number,
    extractionRate: number,
    whoExtractionRate: number,
    entitiesPerMemory: number,
    linksPerMemory: number,
    memoriesLast24h: number,
    safetyCriticalCount: number,
    consolidatedCount: number
  },
  issues: string[]
}`}
          </pre>

          <h3>Stats</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/stats

Response: {
  totalMemories: number,
  totalUsers: number,
  healthScore: number,
  memoryByLayer: [...],
  recentActivity: [...]
}`}
          </pre>

          <h3>List Memories (Dashboard)</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/memories?page=1&limit=25&layer=IDENTITY

Response: {
  memories: Memory[],
  total: number,
  page: number,
  totalPages: number
}`}
          </pre>

          <h3>Memory Graph</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/graph/entities?userId=USER_ID&limit=100

Response: {
  nodes: [{ id, label, layer, type, score }],
  links: [{ source, target, type, strength }]
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Agent Self-Memory</h2>

          <h3>Agent Reflect</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:agentId/reflect

{
  "recentTurns": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response: Memory[]  // Agent self-memories created`}
          </pre>

          <h3>Get Agent Memories</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/memories

Response: Memory[]`}
          </pre>

          <h3>Get Agent Context</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/context

Response: {
  context: string,
  memoriesIncluded: number
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Error Responses</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// 401 Unauthorized
{
  "message": "Missing X-AM-API-Key header",
  "error": "Unauthorized",
  "statusCode": 401
}

// 404 Not Found
{
  "message": "Memory not found",
  "error": "Not Found", 
  "statusCode": 404
}

// 400 Bad Request
{
  "message": "Validation failed",
  "errors": [...],
  "statusCode": 400
}`}
          </pre>
        </article>
      </div>
    </div>
  );
}
