'use client';

import Link from 'next/link';

export default function AwarenessPage() {
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
            Awareness is Engram&apos;s proactive intelligence layer. Instead of waiting for
            queries, the Awareness system continuously monitors memory patterns, detects
            insights, and surfaces information before it&apos;s asked for.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Memory should think, not just remember.</strong> Awareness transforms
              Engram from a passive store into an active participant — detecting contradictions,
              spotting patterns, and generating insights that would otherwise go unnoticed.
            </p>
          </div>

          <h2>The Waking Cycle</h2>

          <p>
            Awareness operates on a periodic <strong>waking cycle</strong> — a scheduled
            process that wakes up, scans for signals, generates insights, and goes back
            to sleep. This mirrors how human cognition processes information during downtime.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                      WAKING CYCLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SLEEP ──→ WAKE ──→ SCAN ──→ ANALYZE ──→ ACT ──→ SLEEP     │
│                       │          │          │                │
│                       │          │          └─ Notify        │
│                       │          │          └─ Store insight │
│                       │          │          └─ Update scores │
│                       │          │                           │
│                       │          └─ Pattern detection        │
│                       │          └─ Contradiction check      │
│                       │          └─ Consolidation candidates │
│                       │                                      │
│                       └─ Gather new signals                  │
│                       └─ Check thresholds                    │
│                       └─ Evaluate pending insights            │
│                                                              │
│  Default interval: 15 minutes                                │
│  Configurable per deployment                                 │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>Signal Sources</h2>

          <p>
            The Awareness system monitors multiple signal sources to detect when something
            interesting or important has happened.
          </p>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 my-6">
            <h3 className="text-blue-400 mt-0">Memory Signals</h3>
            <ul>
              <li><strong>New memories</strong> — recently created memories that may trigger patterns</li>
              <li><strong>Score changes</strong> — significant shifts in effective scores</li>
              <li><strong>Decay thresholds</strong> — important memories approaching eviction</li>
              <li><strong>Cluster growth</strong> — topics accumulating enough memories to form insights</li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 my-6">
            <h3 className="text-green-400 mt-0">Trust Signals</h3>
            <ul>
              <li><strong>Trust changes</strong> — agent trust scores crossing thresholds</li>
              <li><strong>Delegation patterns</strong> — unusual failure rates or success streaks</li>
              <li><strong>Challenge results</strong> — challenge protocol outcomes</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">System Signals</h3>
            <ul>
              <li><strong>Health metrics</strong> — extraction rates, embedding quality</li>
              <li><strong>Usage patterns</strong> — changes in how the system is being used</li>
              <li><strong>Sync status</strong> — cloud sync conflicts or failures</li>
            </ul>
          </div>

          <h2>Insight Types</h2>

          <p>
            When the Awareness system detects something noteworthy, it generates an
            <strong> insight</strong> — a structured observation stored in the INSIGHT memory
            layer.
          </p>

          <table>
            <thead>
              <tr>
                <th>Insight Type</th>
                <th>Trigger</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>CONTRADICTION</code></td>
                <td>Two memories conflict</td>
                <td>&quot;Memory A says user prefers dark mode, Memory B says user switched to light mode&quot;</td>
              </tr>
              <tr>
                <td><code>PATTERN</code></td>
                <td>Recurring theme detected</td>
                <td>&quot;User has mentioned burnout 4 times in 2 weeks&quot;</td>
              </tr>
              <tr>
                <td><code>DECAY_WARNING</code></td>
                <td>Important memory fading</td>
                <td>&quot;High-priority project memory approaching eviction threshold&quot;</td>
              </tr>
              <tr>
                <td><code>CONSOLIDATION</code></td>
                <td>Memories can be merged</td>
                <td>&quot;5 memories about coffee preferences can be consolidated into 1&quot;</td>
              </tr>
              <tr>
                <td><code>TRUST_SHIFT</code></td>
                <td>Significant trust change</td>
                <td>&quot;Agent X trust for deployments dropped from 0.8 to 0.5 in 7 days&quot;</td>
              </tr>
              <tr>
                <td><code>ANOMALY</code></td>
                <td>Unusual behavior</td>
                <td>&quot;Memory creation rate 3× normal for this time period&quot;</td>
              </tr>
            </tbody>
          </table>

          <h2>The Feedback Loop</h2>

          <p>
            Insights don&apos;t just sit there — they feed back into the system. This creates
            a virtuous cycle where Awareness improves the quality of memory over time.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Memories ──→ Awareness ──→ Insights ──→ Actions ──→ Better Memories
    ↑                                       │
    └───────────────────────────────────────┘

Actions include:
  • Auto-consolidate redundant memories (reduce clutter)
  • Flag contradictions for resolution (improve accuracy)
  • Boost decaying memories that are still relevant (preserve knowledge)
  • Adjust trust scores based on observed patterns (refine delegation)
  • Notify users/agents of important changes (keep humans in the loop)`}
          </pre>

          <h3>Feedback Actions</h3>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface AwarenessAction {
  insightId:  string;
  type:       'consolidate' | 'flag' | 'boost' | 'notify' | 'adjust-trust';
  target:     string;      // Memory ID, agent ID, or user ID
  payload:    Json;        // Action-specific data
  auto:       boolean;     // Can execute without human approval
  priority:   'low' | 'medium' | 'high' | 'urgent';
}

// Auto-approved actions (safe to execute without human review):
//   - consolidate: merge near-duplicate memories
//   - boost: refresh decay on actively-retrieved memories
//
// Requires approval:
//   - flag: mark contradictions (human decides resolution)
//   - adjust-trust: significant trust score changes
//   - notify: alert user of important insights`}
          </pre>

          <h2>Notifications</h2>

          <p>
            When Awareness generates a high-priority insight, it can send notifications
            through configured channels. Notifications respect quiet hours and urgency levels.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface AwarenessNotification {
  userId:     string;
  insightId:  string;
  channel:    'dashboard' | 'webhook' | 'email';
  priority:   'low' | 'medium' | 'high' | 'urgent';
  title:      string;
  body:       string;
  actionUrl:  string?;     // Link to resolve in dashboard
}

// Notification rules:
//   urgent:  Always deliver immediately
//   high:    Deliver during waking hours
//   medium:  Batch into daily digest
//   low:     Show in dashboard only`}
          </pre>

          <h2>Configuration</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# .env — Awareness settings
AWARENESS_ENABLED=true
AWARENESS_INTERVAL_MS=900000       # 15 minutes
AWARENESS_CONTRADICTION_THRESHOLD=0.85  # Similarity threshold for contradiction detection
AWARENESS_CONSOLIDATION_THRESHOLD=0.90  # Similarity threshold for merge candidates
AWARENESS_DECAY_WARNING_THRESHOLD=0.3   # Score below which to warn about important memories
AWARENESS_NOTIFICATION_CHANNEL=dashboard  # dashboard | webhook | email
AWARENESS_QUIET_START=23            # Don't notify after 11 PM
AWARENESS_QUIET_END=8               # Don't notify before 8 AM`}
          </pre>

          <h2>Schema</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Insight {
  id          String   @id @default(cuid())
  userId      String
  type        String   // CONTRADICTION | PATTERN | DECAY_WARNING | etc.
  title       String
  body        String
  priority    String   // low | medium | high | urgent
  
  // References
  memoryIds   String[] // Memories that triggered this insight
  agentId     String?  // Relevant agent (for trust insights)
  
  // Lifecycle
  status      String   @default("pending")  // pending | acknowledged | resolved | dismissed
  actionTaken String?  // What was done about it
  
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  
  user        User     @relation(fields: [userId], references: [id])
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Start with a longer interval.</strong> 15 minutes is the default, but
              for small deployments with low memory volume, 30–60 minutes reduces
              unnecessary processing.
            </li>
            <li>
              <strong>Review contradictions promptly.</strong> Contradictions indicate that
              the agent has conflicting information. Resolving them quickly improves context
              quality for everyone.
            </li>
            <li>
              <strong>Trust auto-consolidation.</strong> The system only merges memories above
              a 0.90 similarity threshold. This is conservative by design — false merges are
              rare.
            </li>
            <li>
              <strong>Use the dashboard.</strong> Insights are most useful when someone looks
              at them. The Engram dashboard surfaces pending insights prominently — check it
              periodically.
            </li>
            <li>
              <strong>Set quiet hours.</strong> Nobody wants a &quot;5 memories can be
              consolidated&quot; notification at 3 AM. Configure quiet hours for your timezone.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
