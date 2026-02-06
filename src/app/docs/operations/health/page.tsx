'use client';

import Link from 'next/link';

export default function HealthMonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Health Monitoring</h1>

          <p className="text-xl text-gray-300">
            Keep Engram running reliably by monitoring its health endpoint, tracking key
            metrics, and detecting early signs of memory quality degradation.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">🩺 Why Monitor?</h3>
            <p className="mb-0">
              Memory systems fail silently. A broken embedding pipeline doesn&apos;t throw errors
              your users see — it just makes your agent forget. Proactive monitoring catches
              issues before they degrade the experience.
            </p>
          </div>

          <h2>Health Check Endpoint</h2>

          <p>
            Engram exposes a <code>GET /health</code> endpoint that verifies connectivity
            to all critical subsystems.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86412,
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 2
    },
    "vectorStore": {
      "status": "healthy",
      "provider": "pgvector",
      "latencyMs": 5
    },
    "llm": {
      "status": "healthy",
      "provider": "openai",
      "model": "gpt-4o-mini"
    }
  },
  "metrics": {
    "totalMemories": 1247,
    "consolidatedCount": 42,
    "activeUsers": 3,
    "activeAgents": 2
  }
}`}
          </pre>

          <h3>Status Values</h3>

          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>healthy</code></td>
                <td>All subsystems operational</td>
                <td>None</td>
              </tr>
              <tr>
                <td><code>degraded</code></td>
                <td>Some subsystems impaired</td>
                <td>Investigate failing checks</td>
              </tr>
              <tr>
                <td><code>unhealthy</code></td>
                <td>Critical subsystem failure</td>
                <td>Immediate intervention required</td>
              </tr>
            </tbody>
          </table>

          <h2>Key Metrics to Monitor</h2>

          <h3>Memory Pipeline</h3>

          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>What It Tells You</th>
                <th>Warning Threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Memory count</strong></td>
                <td>Total memories stored (per user / global)</td>
                <td>Sudden drop or plateau</td>
              </tr>
              <tr>
                <td><strong>Extraction rate</strong></td>
                <td>Memories with successful 5W1H extraction</td>
                <td>&lt; 90% extraction success</td>
              </tr>
              <tr>
                <td><strong>Retrieval latency</strong></td>
                <td>Time for <code>POST /v1/memories/query</code></td>
                <td>&gt; 500ms p95</td>
              </tr>
              <tr>
                <td><strong>Vector store health</strong></td>
                <td>Embedding generation and search latency</td>
                <td>&gt; 200ms for vector search</td>
              </tr>
              <tr>
                <td><strong>Consolidation status</strong></td>
                <td>Last successful consolidation run</td>
                <td>No run in &gt; 48 hours</td>
              </tr>
            </tbody>
          </table>

          <h3>Scoring Pipeline</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Check effectiveScore distribution
SELECT
  CASE
    WHEN effective_score >= 0.8 THEN 'high (≥0.8)'
    WHEN effective_score >= 0.5 THEN 'medium (0.5-0.8)'
    WHEN effective_score >= 0.2 THEN 'low (0.2-0.5)'
    ELSE 'very low (<0.2)'
  END AS score_band,
  COUNT(*) as count
FROM memories
WHERE deleted_at IS NULL
GROUP BY score_band
ORDER BY score_band;`}
          </pre>

          <h2>Database Health</h2>

          <h3>Connection Pool</h3>
          <p>
            Engram uses Prisma with PostgreSQL. Monitor connection pool saturation — when
            the pool is exhausted, new queries queue and latency spikes.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Active connections (PostgreSQL)
SELECT count(*) FROM pg_stat_activity
WHERE datname = 'engram' AND state = 'active';

-- Connection pool config (via DATABASE_URL)
# For production, use PgBouncer:
DATABASE_URL="postgresql://user:pass@localhost:6543/engram?pgbouncer=true"`}
          </pre>

          <h3>Query Performance</h3>
          <p>
            The most performance-sensitive queries are memory retrieval (vector similarity search)
            and context loading (multi-layer aggregation). Monitor these key indexes:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Key indexes used by Engram
memories(user_id, layer)                          -- Layer filtering
memories(user_id, created_at)                     -- Temporal queries
memories(user_id, effective_score DESC)            -- Score-based retrieval
memories(user_id, layer, priority, created_at DESC) -- Priority retrieval
memories(embedding)                                -- Vector similarity (pgvector)

-- Check index usage
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;`}
          </pre>

          <h3>Storage Growth</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Table sizes
SELECT
  relname AS table,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Largest tables will be:
-- 1. memories       (raw text + embeddings)
-- 2. memory_extractions (5W1H + rawJson)
-- 3. audit_logs     (grows continuously)`}
          </pre>

          <h2>Alerting Recommendations</h2>

          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 my-8">
            <h3 className="text-red-400 mt-0">🚨 Critical Alerts</h3>
            <ul className="mb-0">
              <li><strong>Health endpoint returns <code>unhealthy</code></strong> — Database or vector store is down</li>
              <li><strong>Extraction failure rate &gt; 20%</strong> — LLM provider may be down or rate-limited</li>
              <li><strong>Zero memories created in 24h</strong> — Pipeline is broken</li>
              <li><strong>Disk usage &gt; 85%</strong> — Database storage running out</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 my-8">
            <h3 className="text-yellow-400 mt-0">⚠️ Warning Alerts</h3>
            <ul className="mb-0">
              <li><strong>Query latency p95 &gt; 500ms</strong> — Performance degradation</li>
              <li><strong>Consolidation job FAILED</strong> — Check <code>consolidation_jobs</code> table for errors</li>
              <li><strong>Webhook failure count &gt; 10</strong> — Downstream consumers not receiving events</li>
              <li><strong>Rate limit 429 responses increasing</strong> — Agents hitting limits</li>
            </ul>
          </div>

          <h2>Logging Configuration</h2>

          <p>
            Engram&apos;s logging behavior is controlled by <code>NODE_ENV</code>:
          </p>

          <table>
            <thead>
              <tr>
                <th>Environment</th>
                <th>Format</th>
                <th>Detail Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>development</code></td>
                <td>Pretty-printed, colorized</td>
                <td>Verbose — includes query details, extraction output</td>
              </tr>
              <tr>
                <td><code>production</code></td>
                <td>Structured JSON</td>
                <td>Compact — no stack traces in responses, structured for log aggregators</td>
              </tr>
              <tr>
                <td><code>test</code></td>
                <td>Minimal</td>
                <td>Errors only</td>
              </tr>
            </tbody>
          </table>

          <h3>Log Levels</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Set via LOG_LEVEL env var (default: "info")
LOG_LEVEL="debug"    # Everything — extraction prompts, vector search results
LOG_LEVEL="info"     # Normal operation — requests, memory creation, consolidation
LOG_LEVEL="warn"     # Degraded conditions — slow queries, rate limits
LOG_LEVEL="error"    # Failures — DB errors, LLM failures, unhandled exceptions`}
          </pre>

          <h3>Key Log Events to Watch</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Healthy operation
INFO  memory.created       { userId, memoryId, layer, source }
INFO  memory.queried       { userId, query, results, latencyMs }
INFO  consolidation.complete { promoted, duplicatesRemoved, duration }

# Warning signs
WARN  extraction.slow      { memoryId, durationMs }  // > 5s extraction
WARN  vector.search.slow   { query, durationMs }     // > 200ms search
WARN  rateLimit.hit        { agentId, endpoint }

# Errors
ERROR extraction.failed    { memoryId, error }
ERROR vector.upsert.failed { memoryId, error }
ERROR consolidation.failed { jobId, error }`}
          </pre>

          <h2>Example Monitoring Setup</h2>

          <p>
            A simple health check script you can run via cron or any monitoring tool:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`#!/bin/bash
# engram-health-check.sh
# Run every 5 minutes via cron:
# */5 * * * * /opt/scripts/engram-health-check.sh

ENGRAM_URL="\${ENGRAM_URL:-http://localhost:3000}"
ALERT_WEBHOOK="\${ALERT_WEBHOOK:-}"  # Slack/Discord webhook URL

# 1. Check health endpoint
HEALTH=$(curl -sf --max-time 10 "\${ENGRAM_URL}/health" 2>/dev/null)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  MSG="🔴 Engram health check FAILED (unreachable)"
  echo "$MSG"
  [ -n "$ALERT_WEBHOOK" ] && curl -sf -X POST "$ALERT_WEBHOOK" \\
    -H "Content-Type: application/json" \\
    -d "{\\"text\\":\\"$MSG\\"}"
  exit 1
fi

# 2. Parse status
STATUS=$(echo "$HEALTH" | jq -r '.status')
DB_STATUS=$(echo "$HEALTH" | jq -r '.checks.database.status')
VECTOR_STATUS=$(echo "$HEALTH" | jq -r '.checks.vectorStore.status')
LLM_STATUS=$(echo "$HEALTH" | jq -r '.checks.llm.status')
DB_LATENCY=$(echo "$HEALTH" | jq -r '.checks.database.latencyMs')

# 3. Alert on degraded/unhealthy
if [ "$STATUS" != "healthy" ]; then
  MSG="⚠️ Engram status: $STATUS"
  MSG+="\n  DB: $DB_STATUS (\${DB_LATENCY}ms)"
  MSG+="\n  Vector: $VECTOR_STATUS"
  MSG+="\n  LLM: $LLM_STATUS"
  echo -e "$MSG"
  [ -n "$ALERT_WEBHOOK" ] && curl -sf -X POST "$ALERT_WEBHOOK" \\
    -H "Content-Type: application/json" \\
    -d "{\\"text\\":\\"$MSG\\"}"
  exit 1
fi

# 4. Warn on high DB latency
if [ "$DB_LATENCY" -gt 100 ]; then
  MSG="🟡 Engram DB latency high: \${DB_LATENCY}ms"
  echo "$MSG"
  [ -n "$ALERT_WEBHOOK" ] && curl -sf -X POST "$ALERT_WEBHOOK" \\
    -H "Content-Type: application/json" \\
    -d "{\\"text\\":\\"$MSG\\"}"
fi

echo "✅ Engram healthy (DB: \${DB_LATENCY}ms)"
exit 0`}
          </pre>

          <h3>Cron Setup</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Health check every 5 minutes
*/5 * * * * /opt/scripts/engram-health-check.sh >> /var/log/engram-health.log 2>&1

# Memory count trend (daily)
0 6 * * * curl -sf http://localhost:3000/health | jq '.metrics' >> /var/log/engram-metrics.log`}
          </pre>

          <h2>Brain Fog Detection</h2>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">🧠 What Is Brain Fog?</h3>
            <p className="mb-0">
              When memory quality silently degrades — duplicates pile up, scores cluster
              at the bottom, and retrieval starts returning irrelevant results. The system
              is &quot;remembering&quot; but not <em>learning</em>. Catching this early prevents
              your agent from becoming forgetful.
            </p>
          </div>

          <h3>Signs of Degradation</h3>

          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Detection Query</th>
                <th>Healthy Range</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>High duplicate rate</strong></td>
                <td>Memories with cosine similarity &gt; 0.95</td>
                <td>&lt; 5% duplicates</td>
              </tr>
              <tr>
                <td><strong>Score collapse</strong></td>
                <td>Mean <code>effectiveScore</code> across all memories</td>
                <td>Mean &gt; 0.4</td>
              </tr>
              <tr>
                <td><strong>Extraction hollowing</strong></td>
                <td>Extractions with all NULL fields</td>
                <td>&lt; 2% empty extractions</td>
              </tr>
              <tr>
                <td><strong>Stale consolidation</strong></td>
                <td>Last successful consolidation job</td>
                <td>Within 48 hours</td>
              </tr>
              <tr>
                <td><strong>Low usage signal</strong></td>
                <td>Memories with <code>usedCount = 0</code></td>
                <td>&lt; 70% unused</td>
              </tr>
            </tbody>
          </table>

          <h3>Diagnostic Queries</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Duplicate rate: memories that are near-identical
-- (Run via consolidation stats endpoint)
GET /v1/consolidate/stats
--> check "potentialClusters" — high count means duplicates piling up

-- Score distribution (are scores healthy?)
SELECT
  COUNT(*) FILTER (WHERE effective_score < 0.2) AS very_low,
  COUNT(*) FILTER (WHERE effective_score BETWEEN 0.2 AND 0.5) AS low,
  COUNT(*) FILTER (WHERE effective_score BETWEEN 0.5 AND 0.8) AS medium,
  COUNT(*) FILTER (WHERE effective_score >= 0.8) AS high,
  ROUND(AVG(effective_score)::numeric, 3) AS mean_score
FROM memories
WHERE deleted_at IS NULL;

-- Empty extractions (LLM failing to parse?)
SELECT COUNT(*) AS empty_extractions
FROM memory_extractions
WHERE who IS NULL AND what IS NULL
  AND why IS NULL AND how IS NULL;

-- Unused memories (never retrieved or used)
SELECT
  COUNT(*) FILTER (WHERE used_count = 0 AND retrieval_count = 0) AS never_touched,
  COUNT(*) AS total,
  ROUND(
    COUNT(*) FILTER (WHERE used_count = 0 AND retrieval_count = 0)::numeric
    / GREATEST(COUNT(*), 1) * 100, 1
  ) AS pct_unused
FROM memories
WHERE deleted_at IS NULL;

-- Last successful consolidation
SELECT type, status, completed_at, memories_processed, patterns_detected
FROM consolidation_jobs
WHERE status = 'COMPLETED'
ORDER BY completed_at DESC
LIMIT 5;`}
          </pre>

          <h3>Remediation</h3>
          <ul>
            <li>
              <strong>High duplicates</strong> — Run consolidation: <code>POST /v1/consolidate</code> (dry-run first)
            </li>
            <li>
              <strong>Score collapse</strong> — Check that feedback signals (<code>/used</code>, <code>/helpful</code>) are being sent by your agent
            </li>
            <li>
              <strong>Empty extractions</strong> — Verify LLM provider is responsive; check <code>LOG_LEVEL=debug</code> for extraction prompt/response
            </li>
            <li>
              <strong>Stale consolidation</strong> — Check cron jobs; review <code>consolidation_jobs</code> for FAILED status and error messages
            </li>
          </ul>

          <h2>Production Checklist</h2>

          <ul>
            <li>
              <strong>Health endpoint accessible</strong> — <code>GET /health</code> returns 200 from your monitoring system
            </li>
            <li>
              <strong>Alerting configured</strong> — Unhealthy status triggers on-call notification
            </li>
            <li>
              <strong>Log aggregation</strong> — Structured JSON logs flowing to your log platform
            </li>
            <li>
              <strong>Database backups</strong> — Regular pg_dump or cloud-managed backups
            </li>
            <li>
              <strong>Connection pooling</strong> — PgBouncer or equivalent in front of PostgreSQL
            </li>
            <li>
              <strong>Consolidation scheduled</strong> — Nightly cron for sleep consolidation
            </li>
            <li>
              <strong>Disk monitoring</strong> — Alert at 80% capacity on database volume
            </li>
            <li>
              <strong>Brain fog checks</strong> — Weekly review of score distribution and duplicate rate
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
