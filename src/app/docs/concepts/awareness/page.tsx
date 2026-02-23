'use client';

import Link from 'next/link';

export default function AwarenessConceptPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Awareness</h1>

          <p className="text-xl text-gray-300">
            The Awareness system is Engram&apos;s background intelligence — a periodic process
            that scans memories, detects patterns, generates insights, and surfaces
            notifications. It&apos;s how Engram thinks when nobody&apos;s asking it questions.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Awareness is proactive memory intelligence.</strong> Rather than only
              responding to queries, Engram continuously processes its memories to surface
              insights, detect contradictions, and identify patterns that no one asked about.
            </p>
          </div>

          <h2>The Waking Cycle</h2>

          <p>
            Awareness runs on a periodic <strong>Waking Cycle</strong> — a scheduled process
            that activates, processes signals, generates insights, and returns to sleep.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                      WAKING CYCLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SLEEP ──▶ WAKE ──▶ SCAN ──▶ PROCESS ──▶ NOTIFY ──▶ SLEEP  │
│            │         │         │           │                 │
│            │         │         │           └─ Push insights  │
│            │         │         │              to subscribers │
│            │         │         │                             │
│            │         │         └─ Generate insights from     │
│            │         │            detected patterns          │
│            │         │                                       │
│            │         └─ Collect signals from memory changes, │
│            │            delegation outcomes, trust shifts    │
│            │                                                 │
│            └─ Triggered by timer or event threshold          │
│                                                              │
│  Default interval: 15 minutes                               │
│  Event threshold: 10 new memories since last wake           │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <h3>Wake Triggers</h3>
          <ul>
            <li><strong>Timer</strong> — Every 15 minutes (configurable via <code>AWARENESS_INTERVAL_MS</code>)</li>
            <li><strong>Event threshold</strong> — When 10+ new memories accumulate since last cycle</li>
            <li><strong>Manual</strong> — Triggered via API (<code>POST /v1/awareness/wake</code>)</li>
            <li><strong>Priority signal</strong> — Immediately wakes for safety-critical memory changes</li>
          </ul>

          <h2>Signal Sources</h2>

          <p>
            During the scan phase, Awareness collects signals from multiple sources:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Signal Sources:

MEMORY_CREATED      — New memory added to the system
MEMORY_REINFORCED   — Existing memory retrieved and used
MEMORY_DECAYED      — Memory fell below relevance threshold
MEMORY_CONFLICT     — Two memories contradict each other
DELEGATION_COMPLETE — A delegated task finished
TRUST_SHIFT         — Agent trust score changed significantly
PATTERN_DETECTED    — Recurring theme across recent memories
IDENTITY_CHANGE     — Agent identity layer updated
CONTEXT_OVERFLOW    — Layer exceeded token budget during assembly`}
          </pre>

          <h2>Insight Types</h2>

          <p>
            Awareness generates <strong>insights</strong> — new memories in the INSIGHT layer
            that capture patterns, contradictions, and recommendations.
          </p>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 my-6">
            <h3 className="text-blue-400 mt-0">PATTERN — Recurring Themes</h3>
            <p>
              Detected when similar memories accumulate around a topic or behavior.
            </p>
            <p><strong>Example:</strong></p>
            <pre className="bg-gray-900 p-3 rounded-lg text-sm">
{`"User has mentioned 'deployment anxiety' in 4 of the last 7 sessions.
Consider proactively offering deployment checklists or dry-run options."`}
            </pre>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">CONTRADICTION — Conflicting Information</h3>
            <p>
              Detected when two memories in the same layer make incompatible claims.
            </p>
            <p><strong>Example:</strong></p>
            <pre className="bg-gray-900 p-3 rounded-lg text-sm">
{`"Memory mem_abc says 'User prefers TypeScript' but mem_xyz says
'User wants to switch everything to Rust'. These may conflict —
flagging for clarification."`}
            </pre>
          </div>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 my-6">
            <h3 className="text-green-400 mt-0">RECOMMENDATION — Suggested Actions</h3>
            <p>
              Generated when patterns suggest an actionable improvement.
            </p>
            <p><strong>Example:</strong></p>
            <pre className="bg-gray-900 p-3 rounded-lg text-sm">
{`"Agent code_reviewer has completed 15 code reviews with 0.94 average
quality. Consider promoting to 'Highly Trusted' for critical reviews."`}
            </pre>
          </div>

          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 my-6">
            <h3 className="text-red-400 mt-0">ALERT — Urgent Attention Needed</h3>
            <p>
              Generated for safety-critical detections or significant trust erosion.
            </p>
            <p><strong>Example:</strong></p>
            <pre className="bg-gray-900 p-3 rounded-lg text-sm">
{`"Agent deploy_bot trust score dropped from 0.78 to 0.52 in the
last 48 hours (3 failed deployments). Recommend suspending critical
task delegation until investigated."`}
            </pre>
          </div>

          <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-6 my-6">
            <h3 className="text-purple-400 mt-0">SUMMARY — Periodic Digests</h3>
            <p>
              Generated on a configurable schedule to summarize memory system health.
            </p>
            <p><strong>Example:</strong></p>
            <pre className="bg-gray-900 p-3 rounded-lg text-sm">
{`"Weekly summary: 47 new memories, 12 consolidated, 3 contradictions
resolved. Identity layer at 72% capacity. Top topic: 'engram v2
migration'. Trust network stable — all agents above 0.6."`}
            </pre>
          </div>

          <h2>Feedback Loop</h2>

          <p>
            Insights aren&apos;t just stored — they feed back into the system to improve
            future behavior.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Memories   │────▶│  Awareness   │────▶│   Insights   │
│  (raw data)  │     │  (analysis)  │     │ (new memory) │
└──────────────┘     └──────────────┘     └──────┬───────┘
       ▲                                         │
       │                                         │
       └─────────────────────────────────────────┘
              Insights become memories that
              inform future context assembly

Feedback effects:
  • PATTERN insights boost related memory scores
  • CONTRADICTION insights trigger memory review
  • RECOMMENDATION insights inform delegation routing
  • ALERT insights can pause delegation to affected agents`}
          </pre>

          <h2>Notifications</h2>

          <p>
            When Awareness generates insights, it can notify relevant parties through
            configurable channels:
          </p>

          <ul>
            <li>
              <strong>Dashboard.</strong> All insights appear in the Engram dashboard with
              severity indicators and action buttons.
            </li>
            <li>
              <strong>Webhooks.</strong> Push notifications to external systems (Slack, Discord,
              PagerDuty) for ALERT-level insights.
            </li>
            <li>
              <strong>Agent context.</strong> High-priority insights are injected into agent
              context during the next interaction, ensuring the agent is aware of recent
              discoveries.
            </li>
            <li>
              <strong>API polling.</strong> Clients can poll <code>GET /v1/awareness/insights</code>{' '}
              for recent insights filtered by type and severity.
            </li>
          </ul>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Notification configuration
{
  "awareness": {
    "notifications": {
      "alert": ["dashboard", "webhook", "agent_context"],
      "recommendation": ["dashboard", "agent_context"],
      "contradiction": ["dashboard"],
      "pattern": ["dashboard"],
      "summary": ["dashboard", "webhook"]
    },
    "webhookUrl": "https://hooks.slack.com/...",
    "webhookEvents": ["alert", "summary"]
  }
}`}
          </pre>

          <h2>Configuration</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Awareness environment variables
AWARENESS_ENABLED=true
AWARENESS_INTERVAL_MS=900000        # 15 minutes
AWARENESS_EVENT_THRESHOLD=10        # Wake after N new memories
AWARENESS_INSIGHT_MODEL=gpt-4o-mini # Model for insight generation
AWARENESS_MAX_SIGNALS_PER_CYCLE=50  # Limit signals processed per wake
AWARENESS_SUMMARY_CRON="0 9 * * 1" # Weekly summary on Mondays at 9am`}
          </pre>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model AwarenessInsight {
  id            String        @id
  agentId       String
  
  type          InsightType   // PATTERN, CONTRADICTION, RECOMMENDATION, ALERT, SUMMARY
  severity      InsightSeverity // LOW, MEDIUM, HIGH, CRITICAL
  title         String
  description   String
  
  // Source tracking
  sourceSignals Json          // Signal IDs that triggered this insight
  sourceMemories String[]     // Memory IDs referenced
  
  // Action
  actionTaken   Boolean       @default(false)
  actionNote    String?
  
  // Lifecycle
  createdAt     DateTime      @default(now())
  acknowledgedAt DateTime?
  resolvedAt    DateTime?
  
  // Stored as a memory too
  memoryId      String?       @unique
}

enum InsightType {
  PATTERN
  CONTRADICTION
  RECOMMENDATION
  ALERT
  SUMMARY
}

enum InsightSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Start with a longer interval.</strong> Begin with 30-minute cycles and
              decrease as your memory volume grows. Frequent waking with few memories wastes
              LLM calls.
            </li>
            <li>
              <strong>Act on contradictions.</strong> CONTRADICTION insights are the most
              actionable — they indicate stale or incorrect data. Resolve them promptly to keep
              the memory system accurate.
            </li>
            <li>
              <strong>Use summaries for monitoring.</strong> Weekly summaries are an excellent
              way to track memory system health without checking the dashboard daily.
            </li>
            <li>
              <strong>Configure webhooks for alerts.</strong> Don&apos;t rely on dashboard
              checks for ALERT-level insights. Push them to your team&apos;s communication
              channel.
            </li>
            <li>
              <strong>Review pattern insights periodically.</strong> Patterns that Awareness
              detects often reveal user needs or system behaviors that aren&apos;t obvious
              from individual interactions.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
