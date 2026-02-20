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

          <nav className="not-prose mb-12 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Table of Contents</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li><a href="#authentication" className="text-purple-400 hover:text-purple-300">Authentication</a></li>
              <li><a href="#memories" className="text-purple-400 hover:text-purple-300">Memories</a></li>
              <li><a href="#identity" className="text-purple-400 hover:text-purple-300">Identity</a></li>
              <li><a href="#cloud-sync" className="text-purple-400 hover:text-purple-300">Cloud Sync</a></li>
              <li><a href="#awareness" className="text-purple-400 hover:text-purple-300">Awareness</a></li>
              <li><a href="#context" className="text-purple-400 hover:text-purple-300">Context</a></li>
              <li><a href="#auto-observe" className="text-purple-400 hover:text-purple-300">Auto-Observe</a></li>
              <li><a href="#consolidation" className="text-purple-400 hover:text-purple-300">Consolidation</a></li>
              <li><a href="#agent-self-memory" className="text-purple-400 hover:text-purple-300">Agent Self-Memory</a></li>
              <li><a href="#dashboard" className="text-purple-400 hover:text-purple-300">Dashboard</a></li>
              <li><a href="#errors" className="text-purple-400 hover:text-purple-300">Errors</a></li>
            </ul>
          </nav>

          {/* ─── AUTHENTICATION ─── */}
          <h2 id="authentication">Authentication</h2>
          <p>
            Engram supports three authentication methods depending on the context.
            All requests (except <code>/v1/health</code> and auth endpoints) require
            authentication via one of these methods.
          </p>

          <h3>JWT Bearer Token</h3>
          <p>Used by the dashboard and interactive clients. Obtained via login or registration.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`}
          </pre>

          <h3>API Key</h3>
          <p>Used for server-to-server and SDK integrations. Passed via header.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx
X-AM-User-ID: alice`}
          </pre>
          <ul>
            <li><strong>X-AM-API-Key</strong>: Your agent&apos;s API key</li>
            <li><strong>X-AM-User-ID</strong>: External user identifier (you define this)</li>
          </ul>

          <h3>Sync Key</h3>
          <p>Used exclusively for cloud sync operations. Obtained when linking a device.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`X-Sync-Key: sync_xxxxxxxxxxxx`}
          </pre>

          <h3>POST /v1/auth/register</h3>
          <p>Create a new account.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/auth/register

{
  "email": "alice@example.com",
  "password": "securepassword",
  "name": "Alice"                        // Optional
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_abc123",
    "email": "alice@example.com",
    "name": "Alice"
  }
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","password":"securepassword","name":"Alice"}'`}
          </pre>

          <h3>POST /v1/auth/login</h3>
          <p>Authenticate and receive a JWT token.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/auth/login

{
  "email": "alice@example.com",
  "password": "securepassword"
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_abc123",
    "email": "alice@example.com",
    "name": "Alice"
  }
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","password":"securepassword"}'`}
          </pre>

          <h3>GET /v1/auth/me</h3>
          <p>Get the current authenticated user.</p>
          <p><strong>Auth:</strong> JWT Bearer</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/auth/me

Response: {
  "id": "user_abc123",
  "email": "alice@example.com",
  "name": "Alice",
  "agents": [
    { "id": "agent_xyz", "name": "MyAgent" }
  ]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/auth/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
          </pre>

          <h3>POST /v1/auth/api-keys</h3>
          <p>Create a new API key for an agent.</p>
          <p><strong>Auth:</strong> JWT Bearer</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/auth/api-keys

{
  "agentId": "agent_xyz",
  "name": "Production Key",              // Optional: label for the key
  "expiresIn": "90d"                     // Optional: expiration (e.g. "30d", "1y", null for no expiry)
}

Response: {
  "id": "key_abc123",
  "key": "eg_sk_live_xxxxxxxxxxxx",      // Only shown once
  "name": "Production Key",
  "agentId": "agent_xyz",
  "expiresAt": "2026-05-21T00:00:00Z",
  "createdAt": "2026-02-20T00:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/auth/api-keys \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"agentId":"agent_xyz","name":"Production Key"}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── MEMORIES ─── */}
          <h2 id="memories">Memories</h2>

          <h3>Create Memory</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories

{
  "raw": "Beaux prefers dark mode",      // Required
  "layer": "IDENTITY",                   // Optional: IDENTITY|PROJECT|SESSION|TASK
  "importanceHint": "high",              // Optional: low|medium|high|critical
  "projectId": "proj_123",               // Optional: associate with project
  "sessionId": "sess_456",               // Optional: associate with session
  "visibility": "private",               // Optional: "private"|"shared"|"public" (default: "private")
  "type": "OBSERVATION"                  // Optional: OBSERVATION|TASK_OUTCOME|SELF_ASSESSMENT
}

Response: Memory object with extraction`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"raw":"Beaux prefers dark mode","visibility":"shared","type":"OBSERVATION"}'`}
          </pre>
          <p>
            <strong>New memory types:</strong> In addition to the default <code>OBSERVATION</code> type,
            memories can now be typed as <code>TASK_OUTCOME</code> (records the result of a completed task)
            or <code>SELF_ASSESSMENT</code> (agent self-evaluation). These types are used by the
            identity and trust systems.
          </p>
          <p>
            <strong>Visibility:</strong> Controls who can see a memory. <code>private</code> (default)
            is visible only to the owning agent. <code>shared</code> is visible to all agents in the
            same account. <code>public</code> makes the memory accessible via cloud sync.
          </p>

          <h3>Create Batch</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories/batch \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"memories":[{"raw":"Memory 1"},{"raw":"Memory 2"}]}'`}
          </pre>

          <h3>Query Memories</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories/query \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"what does Beaux like?","limit":10}'`}
          </pre>

          <h3>Get Memory</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/memories/:id

Response: Memory with extraction`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/memories/mem_abc123 \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Update Memory</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X PATCH https://api.openengram.ai/v1/memories/mem_abc123 \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"userPinned":true}'`}
          </pre>

          <h3>Delete Memory</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DELETE /v1/memories/:id

Response: { deleted: true }`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X DELETE https://api.openengram.ai/v1/memories/mem_abc123 \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Mark as Used</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/:id/used

Response: { usedCount: number }`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories/mem_abc123/used \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Correct Memory</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/:id/correct

{
  "correctedContent": "The correct information",
  "reason": "Original had wrong date"    // Optional
}

Response: New Memory (old one marked superseded)`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories/mem_abc123/correct \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"correctedContent":"The correct information","reason":"Original had wrong date"}'`}
          </pre>

          <h3>Challenge Memory</h3>
          <p>
            Flag a memory as potentially incorrect. Challenged memories are marked for review
            and their effective score is reduced until resolved.
          </p>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/:id/challenge

{
  "reason": "This contradicts newer information",  // Required
  "suggestedCorrection": "The actual fact is..."   // Optional
}

Response: {
  "id": "mem_abc123",
  "challenged": true,
  "challengeReason": "This contradicts newer information",
  "challengedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/memories/mem_abc123/challenge \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"reason":"This contradicts newer information"}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── IDENTITY ─── */}
          <h2 id="identity">Identity</h2>
          <p>
            The Identity API provides access to an agent&apos;s computed identity, capabilities,
            trust narrative, and behavioral patterns. These endpoints power the agent self-model.
          </p>

          <h3>GET /v1/agents/:id/identity</h3>
          <p>
            Retrieve the full computed identity for an agent, including personality traits,
            values, communication style, and trust score.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:id/identity

Response: {
  "agentId": "agent_xyz",
  "name": "Rook",
  "traits": [
    { "name": "analytical", "confidence": 0.92 },
    { "name": "concise", "confidence": 0.87 }
  ],
  "values": ["accuracy", "transparency", "efficiency"],
  "communicationStyle": {
    "tone": "professional",
    "verbosity": "low",
    "formality": "moderate"
  },
  "trustScore": 0.85,
  "lastUpdated": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/identity \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>GET /v1/agents/:id/capabilities</h3>
          <p>
            List the agent&apos;s known capabilities and proficiency levels, derived from
            task outcomes and self-assessments.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:id/capabilities

Response: {
  "agentId": "agent_xyz",
  "capabilities": [
    {
      "name": "code_generation",
      "proficiency": 0.91,
      "taskCount": 47,
      "successRate": 0.89,
      "lastUsed": "2026-02-19T18:30:00Z"
    },
    {
      "name": "summarization",
      "proficiency": 0.95,
      "taskCount": 23,
      "successRate": 0.96,
      "lastUsed": "2026-02-20T10:15:00Z"
    }
  ]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/capabilities \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>GET /v1/agents/:id/export</h3>
          <p>
            Export all agent data (identity, memories, capabilities, trust data) as a portable JSON bundle.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:id/export

Response: {
  "version": "1.0",
  "exportedAt": "2026-02-20T12:00:00Z",
  "agent": {
    "id": "agent_xyz",
    "name": "Rook",
    "identity": { ... },
    "capabilities": [ ... ],
    "memories": [ ... ],
    "trustData": { ... }
  }
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/export \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>POST /v1/agents/:id/export</h3>
          <p>
            Export with options — filter by date range, include/exclude specific data categories.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:id/export

{
  "since": "2026-01-01T00:00:00Z",      // Optional: only data after this date
  "include": ["identity", "memories"],    // Optional: specific sections to include
  "format": "json"                        // Optional: "json" (default) or "jsonl"
}

Response: Same as GET but filtered`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/export \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"since":"2026-01-01T00:00:00Z","include":["identity","memories"]}'`}
          </pre>

          <h3>POST /v1/agents/:id/import</h3>
          <p>
            Import agent data from a previously exported bundle. Merges with existing data
            using conflict resolution.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:id/import

{
  "bundle": { ... },                     // Required: export bundle
  "strategy": "merge",                   // Optional: "merge" (default) | "replace" | "skip"
  "dryRun": false                        // Optional: preview without applying
}

Response: {
  "imported": {
    "memories": 142,
    "capabilities": 8,
    "identityFields": 5
  },
  "skipped": 3,
  "conflicts": [
    {
      "field": "identity.traits.analytical",
      "existing": 0.88,
      "incoming": 0.92,
      "resolution": "incoming"
    }
  ]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/import \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"bundle":{...},"strategy":"merge","dryRun":true}'`}
          </pre>

          <h3>POST /v1/agents/:agentId/task-outcomes</h3>
          <p>
            Record the outcome of a completed task. Used to build the agent&apos;s capability
            profile and compute trust scores.
          </p>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:agentId/task-outcomes

{
  "task": "Generate unit tests for auth module",
  "capability": "code_generation",        // Capability tag
  "outcome": "success",                   // "success" | "partial" | "failure"
  "confidence": 0.9,                      // Agent's self-rated confidence (0-1)
  "duration": 12500,                      // Task duration in ms
  "metadata": {                           // Optional: additional context
    "linesGenerated": 145,
    "testsCreated": 8
  }
}

Response: {
  "id": "to_abc123",
  "agentId": "agent_xyz",
  "task": "Generate unit tests for auth module",
  "capability": "code_generation",
  "outcome": "success",
  "confidence": 0.9,
  "createdAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/task-outcomes \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"task":"Generate unit tests","capability":"code_generation","outcome":"success","confidence":0.9}'`}
          </pre>

          <h3>GET /v1/agents/:agentId/task-outcomes</h3>
          <p>List task outcomes for an agent with optional filters.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/task-outcomes?capability=code_generation&limit=20&offset=0

Response: {
  "outcomes": [TaskOutcome],
  "total": 47,
  "limit": 20,
  "offset": 0
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl "https://api.openengram.ai/v1/agents/agent_xyz/task-outcomes?capability=code_generation&limit=20" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>POST /v1/agents/:agentId/self-assessments</h3>
          <p>
            Record an agent&apos;s self-assessment of its own performance and behavior patterns.
          </p>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:agentId/self-assessments

{
  "area": "code_generation",              // What area is being assessed
  "assessment": "I tend to over-engineer solutions for simple problems",
  "rating": 0.7,                          // Self-rated proficiency (0-1)
  "evidence": [                           // Optional: supporting memory IDs
    "mem_abc123",
    "mem_def456"
  ]
}

Response: {
  "id": "sa_abc123",
  "agentId": "agent_xyz",
  "area": "code_generation",
  "assessment": "I tend to over-engineer solutions for simple problems",
  "rating": 0.7,
  "createdAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/self-assessments \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"area":"code_generation","assessment":"I tend to over-engineer solutions","rating":0.7}'`}
          </pre>

          <h3>GET /v1/agents/:agentId/self-assessments</h3>
          <p>List self-assessments for an agent.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/self-assessments?area=code_generation&limit=20

Response: {
  "assessments": [SelfAssessment],
  "total": 12,
  "limit": 20,
  "offset": 0
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl "https://api.openengram.ai/v1/agents/agent_xyz/self-assessments?limit=20" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>POST /v1/agents/:agentId/trust/recompute</h3>
          <p>
            Trigger a recomputation of the agent&apos;s trust score based on task outcomes,
            self-assessments, and behavioral patterns.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/agents/:agentId/trust/recompute

Response: {
  "agentId": "agent_xyz",
  "previousScore": 0.82,
  "newScore": 0.85,
  "factors": {
    "taskSuccessRate": 0.89,
    "selfAssessmentAccuracy": 0.78,
    "consistencyScore": 0.91,
    "failureRecoveryRate": 0.85
  },
  "recomputedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/trust/recompute \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>GET /v1/agents/:agentId/trust/narrative</h3>
          <p>
            Get a human-readable narrative explaining the agent&apos;s trust score — why it is
            what it is, what contributed positively and negatively.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/trust/narrative

Response: {
  "agentId": "agent_xyz",
  "trustScore": 0.85,
  "narrative": "Rook has demonstrated strong reliability across 47 tasks with an 89% success rate. Code generation is a particular strength (91% proficiency). Areas for improvement include error handling in edge cases, where 3 recent failures were noted. Self-assessments closely align with observed outcomes (78% accuracy), suggesting good self-awareness.",
  "strengths": [
    "Consistent code generation quality",
    "Accurate self-assessment"
  ],
  "improvementAreas": [
    "Edge case handling",
    "Error recovery in complex tasks"
  ],
  "generatedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/trust/narrative \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>GET /v1/agents/:agentId/failure-patterns</h3>
          <p>
            Analyze the agent&apos;s failure patterns — recurring types of failures, common
            conditions, and suggested mitigations.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/failure-patterns

Response: {
  "agentId": "agent_xyz",
  "totalFailures": 8,
  "patterns": [
    {
      "pattern": "Timeout on large input processing",
      "occurrences": 3,
      "capability": "data_analysis",
      "lastSeen": "2026-02-18T09:00:00Z",
      "suggestedMitigation": "Implement chunked processing for inputs over 10k tokens"
    },
    {
      "pattern": "Missing edge case handling in generated tests",
      "occurrences": 2,
      "capability": "code_generation",
      "lastSeen": "2026-02-19T14:30:00Z",
      "suggestedMitigation": "Add explicit edge case enumeration step before test generation"
    }
  ],
  "analyzedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/failure-patterns \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── CLOUD SYNC ─── */}
          <h2 id="cloud-sync">Cloud Sync</h2>
          <p>
            Cloud sync enables multi-device synchronization of agent data. Link a device,
            push and pull changes, and resolve conflicts.
          </p>

          <h3>POST /v1/cloud/link</h3>
          <p>
            Link the current device/instance to the cloud sync service. Returns a sync key
            for subsequent sync operations.
          </p>
          <p><strong>Auth:</strong> JWT Bearer</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/cloud/link

{
  "deviceName": "MacBook Pro",           // Required: human-readable device name
  "deviceId": "device_abc123"            // Optional: stable device identifier (auto-generated if omitted)
}

Response: {
  "syncKey": "sync_xxxxxxxxxxxx",
  "deviceId": "device_abc123",
  "deviceName": "MacBook Pro",
  "linkedAt": "2026-02-20T12:00:00Z",
  "cloudEndpoint": "https://sync.openengram.ai"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/cloud/link \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"deviceName":"MacBook Pro"}'`}
          </pre>

          <h3>GET /v1/cloud/status</h3>
          <p>Get the current cloud sync status for this device.</p>
          <p><strong>Auth:</strong> Sync Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/cloud/status

Response: {
  "linked": true,
  "deviceId": "device_abc123",
  "deviceName": "MacBook Pro",
  "lastSyncAt": "2026-02-20T11:45:00Z",
  "pendingChanges": 3,
  "conflictCount": 0,
  "connectedDevices": [
    { "deviceId": "device_abc123", "name": "MacBook Pro", "lastSeen": "2026-02-20T12:00:00Z" },
    { "deviceId": "device_def456", "name": "iPhone", "lastSeen": "2026-02-20T11:30:00Z" }
  ]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/cloud/status \\
  -H "X-Sync-Key: sync_xxxxxxxxxxxx"`}
          </pre>

          <h3>POST /v1/cloud/sync</h3>
          <p>
            Push local changes to the cloud. Sends a delta of changes since the last sync point.
          </p>
          <p><strong>Auth:</strong> Sync Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/cloud/sync

{
  "changes": [                           // Required: array of change operations
    {
      "type": "upsert",
      "collection": "memories",
      "id": "mem_abc123",
      "data": { ... },
      "timestamp": "2026-02-20T12:00:00Z"
    },
    {
      "type": "delete",
      "collection": "memories",
      "id": "mem_old456",
      "timestamp": "2026-02-20T11:55:00Z"
    }
  ],
  "syncCursor": "cursor_abc123"          // Required: last known sync position
}

Response: {
  "accepted": 2,
  "rejected": 0,
  "conflicts": [],
  "newCursor": "cursor_def456"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/cloud/sync \\
  -H "X-Sync-Key: sync_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"changes":[{"type":"upsert","collection":"memories","id":"mem_abc123","data":{...}}],"syncCursor":"cursor_abc123"}'`}
          </pre>

          <h3>POST /v1/cloud/pull</h3>
          <p>
            Pull remote changes from the cloud since the last sync point.
          </p>
          <p><strong>Auth:</strong> Sync Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/cloud/pull

{
  "syncCursor": "cursor_abc123",         // Required: last known sync position
  "limit": 100                           // Optional: max changes to pull
}

Response: {
  "changes": [
    {
      "type": "upsert",
      "collection": "memories",
      "id": "mem_new789",
      "data": { ... },
      "timestamp": "2026-02-20T11:50:00Z",
      "sourceDevice": "device_def456"
    }
  ],
  "hasMore": false,
  "newCursor": "cursor_ghi789"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/cloud/pull \\
  -H "X-Sync-Key: sync_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"syncCursor":"cursor_abc123","limit":100}'`}
          </pre>

          <h3>POST /v1/cloud/reconcile/preview</h3>
          <p>
            Preview how conflicts would be resolved without applying changes.
          </p>
          <p><strong>Auth:</strong> Sync Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/cloud/reconcile/preview

Response: {
  "conflicts": [
    {
      "id": "mem_abc123",
      "collection": "memories",
      "local": { "raw": "Local version", "updatedAt": "2026-02-20T11:00:00Z" },
      "remote": { "raw": "Remote version", "updatedAt": "2026-02-20T11:30:00Z" },
      "suggestedResolution": "remote",   // "local" | "remote" | "merge"
      "reason": "Remote is newer"
    }
  ],
  "autoResolvable": 1,
  "needsManualReview": 0
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/cloud/reconcile/preview \\
  -H "X-Sync-Key: sync_xxxxxxxxxxxx"`}
          </pre>

          <h3>POST /v1/cloud/reconcile/execute</h3>
          <p>
            Execute conflict resolution. Pass explicit resolutions or let the system auto-resolve.
          </p>
          <p><strong>Auth:</strong> Sync Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/cloud/reconcile/execute

{
  "resolutions": [                       // Optional: manual overrides
    {
      "id": "mem_abc123",
      "resolution": "remote"             // "local" | "remote" | "merge"
    }
  ],
  "autoResolveRest": true                // Optional: auto-resolve remaining conflicts
}

Response: {
  "resolved": 1,
  "applied": [
    {
      "id": "mem_abc123",
      "resolution": "remote",
      "result": "applied"
    }
  ],
  "newCursor": "cursor_jkl012"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/cloud/reconcile/execute \\
  -H "X-Sync-Key: sync_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"resolutions":[{"id":"mem_abc123","resolution":"remote"}],"autoResolveRest":true}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── AWARENESS ─── */}
          <h2 id="awareness">Awareness</h2>
          <p>
            The Awareness system provides proactive insights by analyzing patterns across
            memories, tracking external sources, and generating notifications.
          </p>

          <h3>GET /v1/awareness/status</h3>
          <p>Get the current status of the awareness engine.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/awareness/status

Response: {
  "enabled": true,
  "lastCycleAt": "2026-02-20T11:00:00Z",
  "nextCycleAt": "2026-02-20T12:00:00Z",
  "cycleIntervalMs": 3600000,
  "pendingInsights": 3,
  "sourcesConfigured": 5,
  "sourcesHealthy": 4
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/awareness/status \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>POST /v1/awareness/cycle</h3>
          <p>
            Manually trigger an awareness cycle. The engine analyzes recent memories and
            sources to generate new insights.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/awareness/cycle

{
  "force": false                         // Optional: run even if recent cycle exists
}

Response: {
  "cycleId": "cycle_abc123",
  "insightsGenerated": 2,
  "insights": [
    {
      "id": "ins_abc123",
      "type": "pattern",
      "title": "Increasing task complexity trend",
      "summary": "Over the last 7 days, average task complexity has increased 40% while success rate remains stable.",
      "confidence": 0.82,
      "relatedMemories": ["mem_1", "mem_2"],
      "createdAt": "2026-02-20T12:00:00Z"
    }
  ],
  "sourcesChecked": 5,
  "durationMs": 3200
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/awareness/cycle \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"force":false}'`}
          </pre>

          <h3>PATCH /v1/insights/:id/feedback</h3>
          <p>
            Provide feedback on an insight — rate its usefulness, dismiss it, or flag it
            for follow-up.
          </p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PATCH /v1/insights/:id/feedback

{
  "rating": "helpful",                   // "helpful" | "not_helpful" | "incorrect"
  "dismissed": false,                    // Optional: hide from active insights
  "followUp": true,                      // Optional: flag for deeper analysis
  "comment": "Good catch, will adjust"   // Optional: free-text feedback
}

Response: {
  "id": "ins_abc123",
  "rating": "helpful",
  "dismissed": false,
  "followUp": true,
  "updatedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X PATCH https://api.openengram.ai/v1/insights/ins_abc123/feedback \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"rating":"helpful","followUp":true}'`}
          </pre>

          <h3>POST /v1/notifications/configure</h3>
          <p>Configure notification delivery preferences for awareness insights.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/notifications/configure

{
  "channels": [                          // Required: delivery channels
    {
      "type": "webhook",
      "url": "https://hooks.example.com/engram",
      "events": ["insight.new", "insight.critical"]
    },
    {
      "type": "email",
      "address": "alice@example.com",
      "events": ["insight.critical"]
    }
  ],
  "minConfidence": 0.7,                  // Optional: only notify above this threshold
  "quietHours": {                        // Optional: suppress notifications during these hours
    "start": "23:00",
    "end": "08:00",
    "timezone": "America/Vancouver"
  }
}

Response: {
  "configured": true,
  "channels": 2,
  "updatedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/notifications/configure \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"channels":[{"type":"webhook","url":"https://hooks.example.com/engram","events":["insight.new"]}]}'`}
          </pre>

          <h3>GET /v1/notifications/configure</h3>
          <p>Get the current notification configuration.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/notifications/configure

Response: {
  "channels": [
    {
      "type": "webhook",
      "url": "https://hooks.example.com/engram",
      "events": ["insight.new", "insight.critical"],
      "active": true
    }
  ],
  "minConfidence": 0.7,
  "quietHours": {
    "start": "23:00",
    "end": "08:00",
    "timezone": "America/Vancouver"
  }
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/notifications/configure \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>POST /v1/awareness/sources</h3>
          <p>Add a new external data source for the awareness engine to monitor.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/awareness/sources

{
  "name": "GitHub Notifications",        // Required: human-readable name
  "type": "webhook",                     // Required: "webhook" | "rss" | "api_poll"
  "config": {                            // Type-specific configuration
    "url": "https://api.github.com/notifications",
    "headers": { "Authorization": "Bearer ghp_..." },
    "pollIntervalMs": 300000
  },
  "filters": {                           // Optional: filter incoming data
    "include": ["pull_request", "issue"],
    "exclude": ["bot"]
  }
}

Response: {
  "id": "src_abc123",
  "name": "GitHub Notifications",
  "type": "webhook",
  "status": "active",
  "createdAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/awareness/sources \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"GitHub Notifications","type":"api_poll","config":{"url":"https://api.github.com/notifications","pollIntervalMs":300000}}'`}
          </pre>

          <h3>GET /v1/awareness/sources</h3>
          <p>List all configured awareness sources.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/awareness/sources

Response: {
  "sources": [
    {
      "id": "src_abc123",
      "name": "GitHub Notifications",
      "type": "api_poll",
      "status": "active",
      "lastCheckedAt": "2026-02-20T11:55:00Z",
      "createdAt": "2026-02-20T10:00:00Z"
    }
  ]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/awareness/sources \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>PATCH /v1/awareness/sources/:id</h3>
          <p>Update an existing awareness source.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PATCH /v1/awareness/sources/:id

{
  "name": "GitHub Alerts",               // Optional
  "config": {                            // Optional: partial update
    "pollIntervalMs": 600000
  },
  "status": "paused"                     // Optional: "active" | "paused"
}

Response: {
  "id": "src_abc123",
  "name": "GitHub Alerts",
  "type": "api_poll",
  "status": "paused",
  "updatedAt": "2026-02-20T12:00:00Z"
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X PATCH https://api.openengram.ai/v1/awareness/sources/src_abc123 \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"paused"}'`}
          </pre>

          <h3>DELETE /v1/awareness/sources/:id</h3>
          <p>Remove an awareness source.</p>
          <p><strong>Auth:</strong> API Key or JWT</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DELETE /v1/awareness/sources/:id

Response: { "deleted": true }`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X DELETE https://api.openengram.ai/v1/awareness/sources/src_abc123 \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── CONTEXT ─── */}
          <h2 id="context">Context</h2>

          <h3>Load Context</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/context \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"maxTokens":4000}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── AUTO-OBSERVE ─── */}
          <h2 id="auto-observe">Auto-Observe</h2>

          <h3>Observe Conversation</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/observe \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"turns":[{"role":"user","content":"I prefer dark mode"},{"role":"assistant","content":"Noted!"}]}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── CONSOLIDATION ─── */}
          <h2 id="consolidation">Consolidation</h2>

          <h3>Trigger Consolidation</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST "https://api.openengram.ai/v1/consolidate?dryRun=true" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Consolidation Stats</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/consolidate/stats \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── BACKFILL ─── */}
          <h2>Backfill</h2>

          <h3>Backfill Extractions</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories/backfill?dryRun=true&batchSize=50

Response: {
  processed: number,
  errors: number,
  details: [...]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST "https://api.openengram.ai/v1/memories/backfill?dryRun=true&batchSize=50" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Backfill User Identity</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/backfill/user-identity

{
  "actualName": "Beaux",
  "dryRun": true
}

Response: { updated: number, skipped: number }`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/backfill/user-identity \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"actualName":"Beaux","dryRun":true}'`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── AGENT SELF-MEMORY ─── */}
          <h2 id="agent-self-memory">Agent Self-Memory</h2>

          <h3>Agent Reflect</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl -X POST https://api.openengram.ai/v1/agents/agent_xyz/reflect \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -H "Content-Type: application/json" \\
  -d '{"recentTurns":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}'`}
          </pre>

          <h3>Get Agent Memories</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/memories

Response: Memory[]`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/memories \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Get Agent Context</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/agents/:agentId/context

Response: {
  context: string,
  memoriesIncluded: number
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/agents/agent_xyz/context \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── DASHBOARD ─── */}
          <h2 id="dashboard">Dashboard</h2>

          <h3>Health Check</h3>
          <p><strong>Auth:</strong> None required</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/health

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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/health`}
          </pre>

          <h3>Stats</h3>
          <p><strong>Auth:</strong> API Key</p>
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
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl https://api.openengram.ai/v1/stats \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>List Memories (Dashboard)</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/memories?page=1&limit=25&layer=IDENTITY

Response: {
  memories: Memory[],
  total: number,
  page: number,
  totalPages: number
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl "https://api.openengram.ai/v1/memories?page=1&limit=25&layer=IDENTITY" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <h3>Memory Graph</h3>
          <p><strong>Auth:</strong> API Key</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/graph/entities?userId=USER_ID&limit=100

Response: {
  nodes: [{ id, label, layer, type, score }],
  links: [{ source, target, type, strength }]
}`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-400">
{`curl "https://api.openengram.ai/v1/graph/entities?userId=alice&limit=100" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice"`}
          </pre>

          <hr className="border-gray-800" />

          {/* ─── ERRORS ─── */}
          <h2 id="errors">Error Responses</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// 401 Unauthorized
{
  "message": "Missing X-AM-API-Key header",
  "error": "Unauthorized",
  "statusCode": 401
}

// 403 Forbidden
{
  "message": "Insufficient permissions for this operation",
  "error": "Forbidden",
  "statusCode": 403
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
}

// 409 Conflict (Cloud Sync)
{
  "message": "Sync conflict detected",
  "conflicts": [...],
  "statusCode": 409
}`}
          </pre>
        </article>
      </div>
    </div>
  );
}
