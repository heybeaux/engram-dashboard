'use client';

import Link from 'next/link';

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Quick Start</h1>
          
          <p className="text-xl text-gray-300">
            Get Engram running and store your first memory in 5 minutes.
          </p>

          <h2>Prerequisites</h2>
          <ul>
            <li>Node.js 18+</li>
            <li>PostgreSQL 14+ with pgvector extension</li>
            <li>OpenAI API key (or other supported LLM)</li>
          </ul>

          <h2>1. Clone and Install</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`git clone https://github.com/heybeaux/engram.git
cd engram
pnpm install`}
          </pre>

          <h2>2. Configure Environment</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`cp .env.example .env

# Edit .env with your settings:
DATABASE_URL="postgresql://user:pass@localhost:5432/engram"
OPENAI_API_KEY="sk-..."
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o-mini"
VECTOR_PROVIDER="pgvector"`}
          </pre>

          <h2>3. Setup Database</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Enable pgvector extension
psql -d engram -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate`}
          </pre>

          <h2>4. Create an Agent</h2>
          <p>Agents are API consumers. Create one to get your API key:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm ts-node scripts/create-agent.ts --name "MyAgent"

# Output:
# Agent created!
# ID: agent_abc123
# API Key: eg_sk_live_xxxxxxxxxxxx
# Save this key - it won't be shown again.`}
          </pre>

          <h2>5. Start the Server</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm start

# Server running on http://localhost:3001`}
          </pre>

          <h2>6. Store Your First Memory</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`curl -X POST http://localhost:3001/v1/memories \\
  -H "Content-Type: application/json" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -d '{
    "raw": "Alice prefers dark mode for all applications"
  }'

# Response:
{
  "id": "mem_abc123",
  "userId": "cuid...",
  "raw": "Alice prefers dark mode for all applications",
  "layer": "SESSION",
  "memoryType": "PREFERENCE",
  "importanceScore": 0.6,
  "extraction": {
    "who": "Alice",
    "what": "prefers dark mode for all applications",
    "topics": ["preferences", "dark mode", "applications"]
  }
}`}
          </pre>

          <h2>7. Query Memories</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`curl -X POST http://localhost:3001/v1/memories/query \\
  -H "Content-Type: application/json" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -d '{
    "query": "what does Alice like?"
  }'

# Response includes semantically similar memories`}
          </pre>

          <h2>8. Load Context for Agent</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`curl -X POST http://localhost:3001/v1/context \\
  -H "Content-Type: application/json" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -H "X-AM-User-ID: alice" \\
  -d '{
    "maxTokens": 2000
  }'

# Response:
{
  "context": "# Memory Context\\n\\n## User Identity\\n- Alice prefers dark mode...",
  "tokenCount": 150,
  "memoriesIncluded": 5,
  "layers": {
    "identity": 2,
    "project": 0,
    "session": 3
  }
}`}
          </pre>

          <h2>9. Check System Health</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`curl http://localhost:3001/v1/health

{
  "status": "healthy",
  "metrics": {
    "totalMemories": 1,
    "extractionRate": 100,
    "whoExtractionRate": 100
  },
  "issues": []
}`}
          </pre>

          <h2>Next Steps</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6 not-prose">
            <Link 
              href="/docs/integration/openclaw" 
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">OpenClaw Integration</h3>
              <p className="text-gray-400 text-sm">Auto-capture memories from conversations</p>
            </Link>
            <Link 
              href="/docs/api" 
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">API Reference</h3>
              <p className="text-gray-400 text-sm">Full endpoint documentation</p>
            </Link>
            <Link 
              href="/docs/intelligence/effective-score" 
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">Memory Intelligence</h3>
              <p className="text-gray-400 text-sm">Learn about scoring and safety</p>
            </Link>
            <Link 
              href="/docs/operations/self-hosting" 
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">Self Hosting</h3>
              <p className="text-gray-400 text-sm">Production deployment guide</p>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
