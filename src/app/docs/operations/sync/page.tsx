'use client';

import Link from 'next/link';

export default function CloudSyncPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Cloud Sync</h1>

          <p className="text-xl text-gray-300">
            Cloud sync lets you link a self-hosted Engram instance to the cloud service,
            keeping memories synchronized across environments. Your local instance stays
            authoritative — the cloud is a mirror and collaboration layer.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Local-first, cloud-enhanced.</strong> Your self-hosted instance is the
              source of truth. Cloud sync adds backup, cross-device access, and multi-agent
              collaboration — but you can always operate fully offline.
            </p>
          </div>

          <h2>Cloud Linking</h2>

          <p>
            Linking connects your local Engram instance to your cloud account. Once linked,
            memories flow bidirectionally based on your sync configuration.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Link your instance to the cloud
curl -X POST http://localhost:3000/v1/sync/link \\
  -H "Content-Type: application/json" \\
  -H "X-AM-API-Key: eg_sk_live_xxxxxxxxxxxx" \\
  -d '{
    "cloudToken": "oc_cloud_xxxxxxxxxxxx",
    "syncMode": "bidirectional",
    "conflictResolution": "local-wins"
  }'

# Response:
{
  "linked": true,
  "instanceId": "inst_abc123",
  "cloudEndpoint": "https://api.openengram.ai",
  "lastSync": null,
  "status": "ready"
}`}
          </pre>

          <h3>Sync Modes</h3>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Direction</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>push-only</code></td>
                <td>Local → Cloud</td>
                <td>Backup only — cloud is a read-only mirror</td>
              </tr>
              <tr>
                <td><code>pull-only</code></td>
                <td>Cloud → Local</td>
                <td>Restore or seed a new instance from cloud</td>
              </tr>
              <tr>
                <td><code>bidirectional</code></td>
                <td>Both</td>
                <td>Full sync — memories flow both ways</td>
              </tr>
            </tbody>
          </table>

          <h2>Push and Pull</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌──────────────┐                          ┌──────────────┐
│  LOCAL       │                          │  CLOUD       │
│  INSTANCE    │                          │  SERVICE     │
│              │                          │              │
│  Memories ───┼── PUSH (new/updated) ──→ ┼── Memories   │
│              │                          │              │
│  Memories ←──┼── PULL (new/updated) ──← ┼── Memories   │
│              │                          │              │
│  Sync Log ───┼── Cursor tracking ─────→ ┼── Sync Log   │
└──────────────┘                          └──────────────┘

Sync uses cursor-based pagination:
  • Each side tracks a "lastSyncCursor" (timestamp + ID)
  • Push: send all local changes since last push cursor
  • Pull: fetch all cloud changes since last pull cursor
  • Cursors advance on successful sync`}
          </pre>

          <h3>What Syncs</h3>
          <ul>
            <li><strong>Memories</strong> — raw content, extractions, scores, metadata</li>
            <li><strong>Entities</strong> — people, places, projects referenced in memories</li>
            <li><strong>Agent identities</strong> — capability profiles, trust scores</li>
            <li><strong>Trust signals</strong> — delegation outcomes and challenge results</li>
            <li><strong>Insights</strong> — Awareness-generated observations</li>
          </ul>

          <h3>What Doesn&apos;t Sync</h3>
          <ul>
            <li><strong>API keys</strong> — never leave the instance</li>
            <li><strong>Embeddings</strong> — regenerated locally (model-dependent)</li>
            <li><strong>Logs</strong> — instance-specific operational data</li>
          </ul>

          <h2>Reconciliation</h2>

          <p>
            When the same memory is modified on both sides between syncs, a conflict occurs.
            Engram uses a configurable reconciliation strategy to resolve conflicts.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface ConflictResolution {
  strategy:   'local-wins' | 'cloud-wins' | 'newest-wins' | 'manual';
  
  // For 'manual' strategy:
  onConflict: (local: Memory, cloud: Memory) => Promise<Memory>;
}

// Default: local-wins
// Your self-hosted instance is authoritative.
// Cloud changes are accepted only if the local version hasn't changed.

// Conflict detection uses version vectors:
interface SyncMetadata {
  memoryId:       string;
  localVersion:   number;    // Increments on local change
  cloudVersion:   number;    // Increments on cloud change
  lastSyncedAt:   DateTime;
  conflictStatus: 'none' | 'detected' | 'resolved';
}`}
          </pre>

          <h3>Conflict Resolution Strategies</h3>

          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Behavior</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>local-wins</code></td>
                <td>Local version always takes priority</td>
                <td>Single-user, self-hosted primary</td>
              </tr>
              <tr>
                <td><code>cloud-wins</code></td>
                <td>Cloud version always takes priority</td>
                <td>Cloud-primary deployments</td>
              </tr>
              <tr>
                <td><code>newest-wins</code></td>
                <td>Most recently updated version wins</td>
                <td>Multi-device with one active user</td>
              </tr>
              <tr>
                <td><code>manual</code></td>
                <td>Conflicts queued for human resolution</td>
                <td>Multi-agent environments</td>
              </tr>
            </tbody>
          </table>

          <h2>Identity Mapping</h2>

          <p>
            When syncing between instances, user and agent IDs may differ. Identity mapping
            ensures memories are attributed to the correct entities across environments.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Identity mapping configuration
{
  "userMappings": [
    { "localId": "user_abc", "cloudId": "cloud_user_xyz" },
    { "localId": "user_def", "cloudId": "cloud_user_uvw" }
  ],
  "agentMappings": [
    { "localId": "agent_local1", "cloudId": "cloud_agent_1" }
  ],
  "autoMap": true  // Auto-create mappings for new entities
}

// With autoMap enabled:
//   1. New local user pushes to cloud → cloud ID auto-generated
//   2. New cloud user pulls to local → local ID auto-generated
//   3. Mapping stored in sync_identity_map table
//   4. Subsequent syncs use the established mapping`}
          </pre>

          <h2>Configuration</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# .env — Cloud sync settings
SYNC_ENABLED=true
SYNC_CLOUD_ENDPOINT=https://api.openengram.ai
SYNC_CLOUD_TOKEN=oc_cloud_xxxxxxxxxxxx
SYNC_MODE=bidirectional              # push-only | pull-only | bidirectional
SYNC_CONFLICT_RESOLUTION=local-wins  # local-wins | cloud-wins | newest-wins | manual
SYNC_INTERVAL_MS=300000              # 5 minutes
SYNC_BATCH_SIZE=100                  # Memories per sync batch
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY_MS=5000`}
          </pre>

          <h2>Schema</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model SyncState {
  id              String   @id @default(cuid())
  instanceId      String   @unique
  cloudEndpoint   String
  syncMode        String
  
  lastPushCursor  String?
  lastPullCursor  String?
  lastSyncAt      DateTime?
  
  status          String   @default("ready")  // ready | syncing | error
  errorMessage    String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model SyncIdentityMap {
  id          String   @id @default(cuid())
  entityType  String   // user | agent
  localId     String
  cloudId     String
  
  createdAt   DateTime @default(now())
  
  @@unique([entityType, localId])
  @@unique([entityType, cloudId])
}

model SyncConflict {
  id          String   @id @default(cuid())
  memoryId    String
  localData   Json
  cloudData   Json
  strategy    String
  resolution  String?  // local | cloud | merged
  resolvedAt  DateTime?
  
  createdAt   DateTime @default(now())
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Start with push-only.</strong> Until you&apos;re confident in your
              sync setup, push-only gives you cloud backup without risk of cloud data
              overwriting local changes.
            </li>
            <li>
              <strong>Use local-wins for single-user setups.</strong> If you&apos;re the only
              one using the instance, local-wins is the safest conflict strategy.
            </li>
            <li>
              <strong>Monitor sync status.</strong> Check <code>/v1/sync/status</code>
              periodically. Failed syncs can silently accumulate if not monitored.
            </li>
            <li>
              <strong>Set up identity mappings early.</strong> Before your first bidirectional
              sync, configure user and agent mappings to prevent duplicate entities.
            </li>
            <li>
              <strong>Keep sync intervals reasonable.</strong> 5 minutes is a good default.
              Shorter intervals increase API costs without meaningful benefit for most
              use cases.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
