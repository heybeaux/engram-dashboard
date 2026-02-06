'use client';

import Link from 'next/link';

export default function SelfHostingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Self-Hosting</h1>

          <p className="text-xl text-gray-300">
            Run Engram on your own infrastructure for full control over your data and privacy.
          </p>

          <h2>Requirements</h2>
          <ul>
            <li><strong>Node.js</strong> 18+ (20+ recommended)</li>
            <li><strong>PostgreSQL</strong> 14+ with pgvector extension</li>
            <li><strong>pnpm</strong> (or npm/yarn)</li>
            <li>An LLM provider — OpenAI, Anthropic, or local via Ollama</li>
          </ul>

          {/* ───── Step-by-step setup ───── */}

          <h2>Step-by-Step Setup</h2>

          <h3>1. Clone and Install</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`git clone https://github.com/heybeaux/engram.git
cd engram
pnpm install`}
          </pre>

          <h3>2. Set Up the Database</h3>

          <p><strong>Option A — Docker (easiest)</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`docker run -d \\
  --name engram-db \\
  -e POSTGRES_USER=engram \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=engram \\
  -p 5432:5432 \\
  -v pgdata:/var/lib/postgresql/data \\
  ankane/pgvector`}
          </pre>

          <p><strong>Option B — Existing PostgreSQL</strong></p>
          <p>Enable the pgvector extension on your database:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`CREATE EXTENSION IF NOT EXISTS vector;`}
          </pre>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">💡 Managed Postgres</p>
            <p>
              Most managed services already support pgvector:{' '}
              <strong>Supabase</strong> and <strong>Neon</strong> have it built-in.{' '}
              <strong>AWS RDS</strong> and <strong>Google Cloud SQL</strong> let you enable it as an extension.
            </p>
          </div>

          <h3>3. Configure Environment</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`cp .env.example .env`}
          </pre>
          <p>Edit <code>.env</code> with your settings:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Required
DATABASE_URL="postgresql://engram:secret@localhost:5432/engram"

# LLM provider (openai | anthropic | ollama | lmstudio)
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o-mini"
OPENAI_API_KEY="sk-..."

# Embeddings (defaults to same as LLM_PROVIDER)
EMBEDDING_PROVIDER="openai"

# Vector store (pgvector | pinecone)
VECTOR_PROVIDER="pgvector"

# Server
PORT=3000
NODE_ENV=production`}
          </pre>

          <h3>4. Run Migrations</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm prisma migrate deploy
pnpm prisma generate`}
          </pre>

          <h3>5. Create an Agent</h3>
          <p>Agents are API consumers. Create one to get an API key:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm ts-node scripts/create-agent.ts --name "MyAgent"

# Output:
# Agent created!
# ID: agent_abc123
# API Key: eg_sk_live_xxxxxxxxxxxx
# Save this key — it won't be shown again.`}
          </pre>

          <h3>6. Start the Server</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod

# Server runs at http://localhost:3000`}
          </pre>

          {/* ───── Docker Compose ───── */}

          <h2>Docker Compose</h2>
          <p>
            The fastest way to get a complete production stack running. This spins up both Engram and
            PostgreSQL with pgvector in a single command.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# docker-compose.yml
version: '3.8'
services:
  engram:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://engram:secret@db:5432/engram
      - LLM_PROVIDER=openai
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: ankane/pgvector
    environment:
      - POSTGRES_USER=engram
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=engram
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Start everything
docker-compose up -d

# View logs
docker-compose logs -f engram`}
          </pre>

          {/* ───── Production Considerations ───── */}

          <h2>Production Considerations</h2>

          <h3>Reverse Proxy (nginx)</h3>
          <p>Put Engram behind nginx to handle TLS, rate limiting, and static assets.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`server {
    listen 443 ssl http2;
    server_name engram.example.com;

    ssl_certificate     /etc/letsencrypt/live/engram.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/engram.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
          </pre>

          <h3>Process Manager (PM2)</h3>
          <p>Use PM2 to keep Engram alive, manage restarts, and handle log rotation.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Install PM2
npm install -g pm2

# Start Engram
pm2 start pnpm --name engram -- start:prod

# Enable startup on reboot
pm2 startup
pm2 save

# Useful commands
pm2 logs engram
pm2 restart engram
pm2 monit`}
          </pre>

          <h3>SSL / TLS</h3>
          <p>
            Always use HTTPS in production. The easiest approach is{' '}
            <a href="https://certbot.eff.org/" className="text-purple-400 hover:text-purple-300">Certbot</a>{' '}
            with Let&apos;s Encrypt:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`sudo certbot --nginx -d engram.example.com`}
          </pre>

          <h3>Backups</h3>
          <p>Schedule regular PostgreSQL backups. Memory data is irreplaceable.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Manual backup
pg_dump -Fc engram > engram-backup-$(date +%Y%m%d).dump

# Restore
pg_restore -d engram engram-backup-20260205.dump

# Docker backup
docker exec engram-db pg_dump -U engram engram > backup.sql`}
          </pre>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">🔒 Security Checklist</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Use HTTPS everywhere</li>
              <li>Put the server behind a reverse proxy</li>
              <li>Restrict database access with firewall rules</li>
              <li>API keys are hashed (SHA-256) before storage — never log full keys</li>
              <li>Rotate API keys periodically</li>
              <li>Set <code className="text-purple-300">NODE_ENV=production</code> to hide stack traces</li>
            </ul>
          </div>

          {/* ───── Pinecone ───── */}

          <h2>Pinecone as Alternative Vector Store</h2>
          <p>
            For large-scale deployments with millions of memories, switch from pgvector to Pinecone.
            pgvector works great up to ~1M vectors; beyond that Pinecone offers better performance.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# .env
VECTOR_PROVIDER="pinecone"
PINECONE_API_KEY="pcsk_..."
PINECONE_INDEX="engram-prod"`}
          </pre>
          <p>Create an index in the Pinecone console with:</p>
          <ul>
            <li><strong>Dimensions:</strong> 1536 (for OpenAI <code>text-embedding-3-small</code>)</li>
            <li><strong>Metric:</strong> Cosine</li>
          </ul>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">📐 Embedding Dimensions</p>
            <p>Match your Pinecone index dimensions to the embedding model:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>OpenAI <code className="text-purple-300">text-embedding-3-small</code> → 1536</li>
              <li>OpenAI <code className="text-purple-300">text-embedding-3-large</code> → 3072</li>
              <li>Ollama <code className="text-purple-300">nomic-embed-text</code> → 768</li>
            </ul>
          </div>

          {/* ───── Monitoring ───── */}

          <h2>Monitoring &amp; Health Checks</h2>
          <p>Engram exposes a health endpoint you can wire into your uptime monitor or load balancer.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`curl http://localhost:3000/v1/health

{
  "status": "healthy",
  "metrics": {
    "totalMemories": 42,
    "extractionRate": 98,
    "whoExtractionRate": 95
  },
  "issues": []
}`}
          </pre>

          <h3>Logging</h3>
          <p>
            In production (<code>NODE_ENV=production</code>), Engram outputs structured JSON logs
            suitable for log aggregation tools like Datadog, Loki, or CloudWatch.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# View live logs
docker-compose logs -f engram

# Or with PM2
pm2 logs engram --lines 100`}
          </pre>

          <h3>Database Performance</h3>
          <p>If vector search becomes slow, add an HNSW index:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`CREATE INDEX ON memories
USING hnsw (embedding vector_cosine_ops);`}
          </pre>

          {/* ───── Fully Local ───── */}

          <h2>Running Fully Local (Ollama)</h2>
          <p>
            For complete privacy with zero cloud dependencies, use Ollama for both extraction and embeddings.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Install Ollama
brew install ollama        # macOS
# curl -fsSL https://ollama.com/install.sh | sh  # Linux

# Pull models
ollama pull llama3.2
ollama pull nomic-embed-text`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# .env for fully local
DATABASE_URL="postgresql://engram:secret@localhost:5432/engram"
LLM_PROVIDER="ollama"
LLM_MODEL="llama3.2"
EMBEDDING_PROVIDER="ollama"
OLLAMA_URL="http://localhost:11434"
VECTOR_PROVIDER="pgvector"`}
          </pre>

          {/* ───── Environment Reference ───── */}

          <h2>Environment Variable Reference</h2>

          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-2 pr-4">Variable</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">DATABASE_URL</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">PostgreSQL connection string</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">LLM_PROVIDER</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">openai | anthropic | ollama | lmstudio</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">LLM_MODEL</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Model name (e.g. gpt-4o-mini, llama3.2)</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">OPENAI_API_KEY</td>
                  <td className="py-2 pr-4">If OpenAI</td>
                  <td className="py-2">OpenAI API key</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">ANTHROPIC_API_KEY</td>
                  <td className="py-2 pr-4">If Anthropic</td>
                  <td className="py-2">Anthropic API key</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">EMBEDDING_PROVIDER</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">openai | ollama (Anthropic has no embeddings)</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">VECTOR_PROVIDER</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">pgvector (default) | pinecone</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">PINECONE_API_KEY</td>
                  <td className="py-2 pr-4">If Pinecone</td>
                  <td className="py-2">Pinecone API key</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">PINECONE_INDEX</td>
                  <td className="py-2 pr-4">If Pinecone</td>
                  <td className="py-2">Pinecone index name (default: engram)</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">OLLAMA_URL</td>
                  <td className="py-2 pr-4">If Ollama</td>
                  <td className="py-2">Ollama server URL (default: http://localhost:11434)</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-purple-300">PORT</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">Server port (default: 3000)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-purple-300">NODE_ENV</td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">development | production | test</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ───── Troubleshooting ───── */}

          <h2>Troubleshooting</h2>

          <h3>&ldquo;relation does not exist&rdquo;</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm prisma migrate deploy`}
          </pre>

          <h3>&ldquo;pgvector extension not found&rdquo;</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`CREATE EXTENSION IF NOT EXISTS vector;`}
          </pre>

          <h3>&ldquo;Provider does not support embeddings&rdquo;</h3>
          <p>
            Anthropic doesn&apos;t provide embeddings. Set{' '}
            <code>EMBEDDING_PROVIDER</code> to <code>openai</code> or <code>ollama</code>.
          </p>

          <h3>Slow vector search</h3>
          <p>Add an HNSW index (see Monitoring section above) and consider switching to Pinecone for large datasets.</p>

          {/* ───── Next Steps ───── */}

          <h2>Next Steps</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6 not-prose">
            <Link
              href="/docs/quickstart"
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">Quick Start</h3>
              <p className="text-gray-400 text-sm">Store your first memory in 5 minutes</p>
            </Link>
            <Link
              href="/docs/api"
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">API Reference</h3>
              <p className="text-gray-400 text-sm">Full endpoint documentation</p>
            </Link>
            <Link
              href="/docs/integration/openclaw"
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">OpenClaw Integration</h3>
              <p className="text-gray-400 text-sm">Auto-capture memories from conversations</p>
            </Link>
            <Link
              href="/docs/intelligence/effective-score"
              className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">Memory Intelligence</h3>
              <p className="text-gray-400 text-sm">Learn about scoring and safety layers</p>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
