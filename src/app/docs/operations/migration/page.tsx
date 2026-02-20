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
          <h1>Migration Guide: v1 → v2</h1>

          <p className="text-xl text-gray-300">
            Engram v2 introduces agent identity, delegation, trust, awareness, and cloud sync.
            This guide covers what&apos;s new, what breaks, and how to migrate.
          </p>

          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 my-8">
            <h3 className="text-red-400 mt-0">⚠️ Breaking Changes</h3>
            <p className="mb-0">
              v2 includes database schema changes that require migration. <strong>Back up
              your database before upgrading.</strong> The migration is forward-only —
              there is no automatic rollback to v1.
            </p>
          </div>

          <h2>What&apos;s New in v2</h2>

          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Description</th>
                <th>Docs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Agent Identity</strong></td>
                <td>Emergent identity from memories — capabilities, preferences, trust, work style</td>
                <td><Link href="/docs/concepts/identity" className="text-purple-400">Identity →</Link></td>
              </tr>
              <tr>
                <td><strong>Delegation</strong></td>
                <td>Contract-based task assignment between agents with lifecycle tracking</td>
                <td><Link href="/docs/concepts/delegation" className="text-purple-400">Delegation →</Link></td>
              </tr>
              <tr>
                <td><strong>Trust Model</strong></td>
                <td>Time-decayed, domain-specific trust scoring from delegation outcomes</td>
                <td><Link href="/docs/concepts/trust" className="text-purple-400">Trust →</Link></td>
              </tr>
              <tr>
                <td><strong>Awareness</strong></td>
                <td>Proactive intelligence — contradiction detection, pattern recognition, insights</td>
                <td><Link href="/docs/concepts/awareness" className="text-purple-400">Awareness →</Link></td>
              </tr>
              <tr>
                <td><strong>Cloud Sync</strong></td>
                <td>Bidirectional sync between self-hosted and cloud instances</td>
                <td><Link href="/docs/operations/sync" className="text-purple-400">Sync →</Link></td>
              </tr>
            </tbody>
          </table>

          <h2>Breaking Changes</h2>

          <h3>1. New Required Environment Variable</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# v2 requires JWT_SECRET for agent identity tokens
JWT_SECRET="your-secret-key-at-least-32-chars"

# Generate one:
openssl rand -base64 32`}
          </pre>

          <h3>2. Database Schema Changes</h3>
          <p>v2 adds several new tables and modifies existing ones:</p>
          <ul>
            <li><strong>New tables:</strong> <code>agent_identities</code>, <code>delegations</code>, <code>trust_signals</code>, <code>trust_scores</code>, <code>insights</code>, <code>sync_state</code>, <code>sync_identity_map</code>, <code>sync_conflicts</code></li>
            <li><strong>Modified:</strong> <code>agents</code> table gains identity-related columns</li>
            <li><strong>Modified:</strong> <code>memories</code> table gains <code>agentId</code> foreign key for agent-owned memories</li>
          </ul>

          <h3>3. API Changes</h3>

          <table>
            <thead>
              <tr>
                <th>Change</th>
                <th>v1</th>
                <th>v2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Agent creation response</td>
                <td>Returns <code>id</code> and <code>apiKey</code></td>
                <td>Returns <code>id</code>, <code>apiKey</code>, and <code>identityToken</code></td>
              </tr>
              <tr>
                <td>Memory creation</td>
                <td>Optional <code>agentId</code></td>
                <td><code>agentId</code> inferred from API key (still optional for user memories)</td>
              </tr>
              <tr>
                <td>Context loading</td>
                <td>Returns flat memory list</td>
                <td>Returns memories grouped by layer + agent identity context</td>
              </tr>
              <tr>
                <td>Health endpoint</td>
                <td><code>/v1/health</code></td>
                <td><code>/v1/health</code> now includes awareness and sync status</td>
              </tr>
            </tbody>
          </table>

          <h3>4. Removed/Deprecated</h3>
          <ul>
            <li><code>POST /v1/agents</code> now requires <code>JWT_SECRET</code> to be set</li>
            <li>The <code>flat</code> context format is deprecated — use <code>grouped</code> (now default)</li>
          </ul>

          <h2>Migration Steps</h2>

          <h3>Step 1: Back Up Everything</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Database backup
pg_dump -Fc engram > engram-v1-backup-$(date +%Y%m%d).dump

# Environment backup
cp .env .env.v1.bak`}
          </pre>

          <h3>Step 2: Update the Code</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`git fetch origin
git checkout main
git pull origin main

# Install new dependencies
pnpm install`}
          </pre>

          <h3>Step 3: Update Environment</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Add to .env:
JWT_SECRET="$(openssl rand -base64 32)"

# Optional — new v2 features (all disabled by default):
AWARENESS_ENABLED=false
SYNC_ENABLED=false`}
          </pre>

          <h3>Step 4: Run Database Migrations</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Apply new schema
pnpm prisma migrate deploy

# Regenerate client
pnpm prisma generate`}
          </pre>

          <h3>Step 5: Run the Identity Backfill</h3>
          <p>
            Existing agents need identity records generated from their memory history.
            The backfill script creates initial identity profiles.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Generate identity profiles for existing agents
pnpm ts-node scripts/backfill-identities.ts

# Output:
# Processing 3 agents...
# agent_abc123: Generated identity (47 memories, phase: ESTABLISHED)
# agent_def456: Generated identity (12 memories, phase: LEARNING)
# agent_ghi789: Generated identity (3 memories, phase: BOOTSTRAP)
# Done. 3 identities created.`}
          </pre>

          <h3>Step 6: Verify and Start</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Run tests
pnpm test

# Start the server
pnpm start:prod

# Verify health
curl http://localhost:3000/v1/health`}
          </pre>

          <h2>Gradual Feature Adoption</h2>

          <p>
            v2 features are opt-in. You don&apos;t have to use everything at once:
          </p>

          <ol>
            <li>
              <strong>Week 1:</strong> Migrate schema, add <code>JWT_SECRET</code>. Everything
              works as before with identity records being passively built.
            </li>
            <li>
              <strong>Week 2:</strong> Enable Awareness (<code>AWARENESS_ENABLED=true</code>).
              Review generated insights in the dashboard.
            </li>
            <li>
              <strong>Week 3:</strong> Start using delegation for inter-agent tasks. Trust
              scores will accumulate naturally.
            </li>
            <li>
              <strong>Week 4:</strong> Enable cloud sync if desired (<code>SYNC_ENABLED=true</code>).
              Start with push-only mode.
            </li>
          </ol>

          <h2>Rollback Plan</h2>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">If Something Goes Wrong</h3>
            <ol>
              <li>Stop the v2 server</li>
              <li>Restore your database: <code>pg_restore -d engram engram-v1-backup.dump</code></li>
              <li>Restore your environment: <code>cp .env.v1.bak .env</code></li>
              <li>Check out the v1 tag: <code>git checkout v1.x.x</code></li>
              <li>Restart: <code>pnpm start:prod</code></li>
            </ol>
            <p className="mb-0">
              The v1 backup contains everything you need. New v2 tables are ignored by v1 code,
              but the schema changes to existing tables require the full restore.
            </p>
          </div>

          <h2>Need Help?</h2>
          <ul>
            <li>
              <strong>GitHub Issues:</strong>{' '}
              <a href="https://github.com/heybeaux/engram/issues" className="text-purple-400 hover:text-purple-300">
                github.com/heybeaux/engram/issues
              </a>
            </li>
            <li>
              <strong>Discord:</strong> Join the Engram community for real-time help
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
