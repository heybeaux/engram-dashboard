'use client';

import Link from 'next/link';

export default function MigrationGuidePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Migration Guide — v1 to v2</h1>

          <p className="text-xl text-gray-300">
            Engram v2 introduces agent identity, delegation, trust, awareness, and cloud sync.
            This guide walks you through upgrading from v1 with minimal downtime.
          </p>

          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 my-8">
            <h3 className="text-red-400 mt-0">⚠️ Breaking Changes</h3>
            <p className="mb-0">
              v2 includes database schema changes and new required environment variables.
              <strong> Back up your database before migrating.</strong> The migration is
              forward-only — there is no automated rollback.
            </p>
          </div>

          <h2>What&apos;s New in v2</h2>

          <ul>
            <li>
              <strong>Agent Identity</strong> — Agents develop persistent identities with
              capabilities, preferences, trust relationships, and work styles. See{' '}
              <Link href="/docs/concepts/identity" className="text-purple-400 hover:text-purple-300">
                Identity Framework
              </Link>.
            </li>
            <li>
              <strong>Delegation System</strong> — Structured task assignment between agents
              with contracts, templates, and lifecycle tracking. See{' '}
              <Link href="/docs/concepts/delegation" className="text-purple-400 hover:text-purple-300">
                Delegation System
              </Link>.
            </li>
            <li>
              <strong>Trust Model</strong> — Time-decayed trust scoring based on delegation
              outcomes and interaction quality. See{' '}
              <Link href="/docs/concepts/trust" className="text-purple-400 hover:text-purple-300">
                Trust Model
              </Link>.
            </li>
            <li>
              <strong>Awareness</strong> — Background intelligence that detects patterns,
              contradictions, and generates insights. See{' '}
              <Link href="/docs/concepts/awareness" className="text-purple-400 hover:text-purple-300">
                Awareness
              </Link>.
            </li>
            <li>
              <strong>Cloud Sync</strong> — Sync memories between instances with conflict
              reconciliation. See{' '}
              <Link href="/docs/operations/sync" className="text-purple-400 hover:text-purple-300">
                Cloud Sync
              </Link>.
            </li>
          </ul>

          <h2>Breaking Changes</h2>

          <h3>Database Schema</h3>
          <ul>
            <li>New tables: <code>agent_identities</code>, <code>delegations</code>, <code>trust_scores</code>, <code>trust_signals</code>, <code>awareness_insights</code>, <code>sync_state</code>, <code>sync_conflicts</code>, <code>identity_mappings</code></li>
            <li>New columns on <code>memories</code>: <code>syncExcluded</code>, <code>versionVector</code></li>
            <li>New columns on <code>agents</code>: <code>identityId</code></li>
            <li>New enum values: <code>MemoryLayer.INSIGHT</code></li>
          </ul>

          <h3>Environment Variables</h3>
          <ul>
            <li><code>JWT_SECRET</code> — <strong>Required.</strong> Used for sync token signing and inter-agent auth. Must be at least 32 characters.</li>
            <li><code>AWARENESS_ENABLED</code> — Defaults to <code>false</code>. Set to <code>true</code> to enable the Awareness system.</li>
            <li><code>SYNC_ENABLED</code> — Defaults to <code>false</code>. Set to <code>true</code> to enable cloud sync.</li>
          </ul>

          <h3>API Changes</h3>
          <ul>
            <li><code>POST /v1/context</code> response now includes an <code>insights</code> array</li>
            <li><code>GET /v1/health</code> response includes new <code>awareness</code> and <code>sync</code> sections</li>
            <li>Agent creation (<code>POST /v1/agents</code>) now accepts optional <code>identity</code> seed object</li>
            <li>Memory responses include new fields: <code>syncExcluded</code>, <code>versionVector</code></li>
          </ul>

          <h3>Removed / Changed</h3>
          <ul>
            <li><code>GET /v1/agents/:id/stats</code> replaced by <code>GET /v1/agents/:id/identity</code></li>
            <li>The <code>agentMetadata</code> JSON field on agents is deprecated — use the structured <code>AgentIdentity</code> model instead</li>
          </ul>

          <h2>Migration Steps</h2>

          <h3>1. Back Up Everything</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Full database backup
pg_dump -Fc engram > engram-v1-backup-$(date +%Y%m%d).dump

# Verify the backup
pg_restore --list engram-v1-backup-*.dump | head -20`}
          </pre>

          <h3>2. Update the Code</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`cd engram
git fetch origin
git checkout v2.0.0   # or 'main' if tracking latest
pnpm install`}
          </pre>

          <h3>3. Add New Environment Variables</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Add to .env

# Required — generate a secure random string
JWT_SECRET="$(openssl rand -base64 48)"

# Optional — enable new features
AWARENESS_ENABLED=false          # Enable when ready
AWARENESS_INTERVAL_MS=900000
SYNC_ENABLED=false               # Enable when ready
SYNC_CLOUD_URL=https://api.openengram.ai`}
          </pre>

          <h3>4. Run Database Migrations</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Apply new migrations
pnpm prisma migrate deploy

# Regenerate Prisma client
pnpm prisma generate`}
          </pre>

          <h3>5. Run the Identity Backfill</h3>
          <p>
            v2 creates <code>AgentIdentity</code> records for each existing agent. The backfill
            script initializes them with baseline values:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm ts-node scripts/backfill-identity.ts

# Output:
# Processing 3 agents...
# ✓ agent_main — identity created (maturity: 0.0)
# ✓ agent_reviewer — identity created (maturity: 0.0)
# ✓ agent_deployer — identity created (maturity: 0.0)
# Backfill complete. Identities will mature through usage.`}
          </pre>

          <h3>6. Start the Server</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`pnpm build
pnpm start:prod`}
          </pre>

          <h3>7. Verify</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Check health
curl http://localhost:3000/v1/health

# Expected new sections in response:
{
  "status": "healthy",
  "awareness": {
    "enabled": false,
    "lastCycle": null
  },
  "sync": {
    "enabled": false,
    "linked": false
  }
}`}
          </pre>

          <h3>8. Enable New Features (When Ready)</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Enable Awareness
AWARENESS_ENABLED=true

# Enable Cloud Sync (after setting up identity mappings)
SYNC_ENABLED=true
SYNC_TOKEN=est_xxxxxxxxxxxx`}
          </pre>

          <h2>Rollback Plan</h2>

          <p>
            If something goes wrong, restore from your backup:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Stop the server
pm2 stop engram

# Restore database
pg_restore -c -d engram engram-v1-backup-*.dump

# Switch back to v1 code
git checkout v1.x.x
pnpm install
pnpm build
pm2 restart engram`}
          </pre>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">💡 Migration Tips</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Run migrations on a staging database first</li>
              <li>The backfill script is idempotent — safe to run multiple times</li>
              <li>New features (Awareness, Sync) default to disabled — no behavior change until you opt in</li>
              <li>Existing API endpoints are fully backward-compatible (new fields are additive)</li>
              <li>Allow 1–2 weeks for agent identities to mature through natural usage</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
