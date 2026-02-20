'use client';

import Link from 'next/link';

export default function CloudSyncConceptPage() {
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
            Cloud sync lets Engram instances share memories across environments — from local
            development to production, or between multiple deployment regions. Memories stay
            consistent without manual exports.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Sync is opt-in and conflict-aware.</strong> Nothing leaves your instance
              until you explicitly link it. When conflicts arise, Engram uses deterministic
              reconciliation rules — not silent overwrites.
            </p>
          </div>

          <h2>Cloud Linking</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Link to Engram Cloud
engram sync link --cloud-url https://api.openengram.ai --token <your-token>

# Link to a self-hosted hub
engram sync link --cloud-url https://engram.internal.company.com --token <token>

# Check link status
engram sync status

# Output:
{
  "linked": true,
  "cloudUrl": "https://api.openengram.ai",
  "lastSync": "2026-02-20T10:30:00Z",
  "pendingPush": 12,
  "pendingPull": 3,
  "syncMode": "bidirectional"
}`}
          </pre>

          <h3>Sync Modes</h3>
          <ul>
            <li><strong>Bidirectional</strong> (default) — Push local changes up, pull remote changes down</li>
            <li><strong>Push-only</strong> — Local changes go to cloud; remote changes are ignored</li>
            <li><strong>Pull-only</strong> — Cloud changes come down; local changes stay local</li>
          </ul>

          <h2>Push / Pull</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌───────────────┐                    ┌───────────────┐
│  Local Engram  │                    │  Cloud / Hub  │
│               │                    │               │
│  New memories  │───── PUSH ───────▶│  Receives &   │
│  Edits         │                    │  stores       │
│  Deletions     │                    │               │
│               │◀──── PULL ─────────│  New memories  │
│  Receives &   │                    │  from other    │
│  merges       │                    │  instances     │
└───────────────┘                    └───────────────┘

Sync is delta-based:
  • Only changed memories since last sync are transferred
  • Each memory has a version vector for conflict detection
  • Soft-deleted memories sync as tombstones`}
          </pre>

          <h3>Automatic Sync</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Environment variables
SYNC_ENABLED=true
SYNC_INTERVAL_MS=300000     # 5 minutes
SYNC_BATCH_SIZE=100         # Memories per sync batch
SYNC_CLOUD_URL=https://api.openengram.ai
SYNC_TOKEN=est_xxxxxxxxxxxx`}
          </pre>

          <h3>Manual Sync</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Push local changes
engram sync push

# Pull remote changes
engram sync pull

# Full bidirectional sync
engram sync now`}
          </pre>

          <h2>Reconciliation</h2>

          <p>
            When the same memory is modified on both sides between syncs, Engram must
            reconcile the conflict. The rules are deterministic and predictable:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Reconciliation Rules (in order):

1. SAFETY WINS
   If either version is safetyCritical, keep the safety-critical one.

2. PIN WINS
   If one version is userPinned, keep the pinned one.

3. NEWER WINS
   Compare updatedAt timestamps — most recent edit wins.

4. HIGHER SCORE WINS
   If timestamps are identical, keep the version with
   higher effectiveScore.

5. TIE-BREAK
   If all else is equal, the version from the cloud wins
   (convention: cloud is source of truth for ties).`}
          </pre>

          <h3>Conflict Log</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`{
  "conflictId": "conf_abc123",
  "memoryId": "mem_xyz789",
  "localVersion": { "updatedAt": "2026-02-20T10:00:00Z", "raw": "..." },
  "remoteVersion": { "updatedAt": "2026-02-20T10:05:00Z", "raw": "..." },
  "resolution": "REMOTE_WINS",
  "rule": "NEWER_WINS",
  "resolvedAt": "2026-02-20T10:30:00Z"
}`}
          </pre>

          <h2>Identity Mapping</h2>

          <p>
            When syncing between instances, user and agent IDs may differ. Engram uses
            <strong> identity mapping</strong> to link local entities to their cloud
            counterparts.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Identity mapping configuration
{
  "identityMappings": {
    "users": {
      "local_user_123": "cloud_user_abc",
      "local_user_456": "cloud_user_def"
    },
    "agents": {
      "local_agent_reviewer": "cloud_agent_reviewer_prod"
    }
  }
}

// Or use automatic mapping via email/external ID
{
  "identityMappingStrategy": "email",  // "email" | "externalId" | "manual"
  "autoCreateMappings": true
}`}
          </pre>

          <h2>Security</h2>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">🔒 Sync Security</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>All sync traffic is encrypted via TLS</li>
              <li>Sync tokens are scoped to specific instances</li>
              <li>Memory content is encrypted at rest on the cloud</li>
              <li>Sync logs are retained for 90 days for audit</li>
              <li>Sensitive memories can be excluded via <code className="text-purple-300">syncExcluded</code> flag</li>
            </ul>
          </div>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model SyncState {
  id              String   @id
  instanceId      String   @unique
  cloudUrl        String
  lastSyncAt      DateTime?
  lastPushAt      DateTime?
  lastPullAt      DateTime?
  syncMode        SyncMode @default(BIDIRECTIONAL)
  localCursor     String?
  remoteCursor    String?
}

model SyncConflict {
  id              String   @id
  memoryId        String
  localVersion    Json
  remoteVersion   Json
  resolution      ConflictResolution
  rule            String
  resolvedAt      DateTime @default(now())
}

model IdentityMapping {
  id              String   @id
  localId         String
  remoteId        String
  entityType      String   // "user" | "agent"
  
  @@unique([localId, entityType])
}

enum SyncMode {
  BIDIRECTIONAL
  PUSH_ONLY
  PULL_ONLY
}

enum ConflictResolution {
  LOCAL_WINS
  REMOTE_WINS
  MERGED
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Start with pull-only.</strong> When first linking, use pull-only mode
              to see what comes down before pushing your local data up.
            </li>
            <li>
              <strong>Set up identity mappings before syncing.</strong> Unmapped identities
              create orphaned memories that need manual cleanup.
            </li>
            <li>
              <strong>Monitor the conflict log.</strong> Frequent conflicts indicate that
              multiple instances are modifying the same memories.
            </li>
            <li>
              <strong>Exclude sensitive memories.</strong> Use the <code>syncExcluded</code>{' '}
              flag for memories that should never leave the local instance.
            </li>
            <li>
              <strong>Use webhooks for sync events.</strong> Configure webhook notifications
              for sync failures so you catch issues before data drifts.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
