'use client';

import Link from 'next/link';

export default function TrustModelPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Trust Model</h1>

          <p className="text-xl text-gray-300">
            Trust in Engram is a living, time-decayed score that agents earn through demonstrated
            reliability. It&apos;s not a permission system — it&apos;s a memory of how well
            an agent has performed, and it fades without reinforcement.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Trust is earned, domain-specific, and perishable.</strong> An agent
              trusted for code review isn&apos;t automatically trusted for deployments. And
              trust earned six months ago counts for less than trust earned yesterday.
            </p>
          </div>

          <h2>Trust Signals</h2>

          <p>
            Trust scores are built from <strong>signals</strong> — discrete events that provide
            evidence about an agent&apos;s reliability in a specific domain.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface TrustSignal {
  agentId:    string;
  domain:     string;      // e.g. "coding", "devops", "research"
  type:       'positive' | 'negative' | 'neutral';
  weight:     number;      // 0.0–1.0 (task complexity)
  source:     'delegation' | 'challenge' | 'manual' | 'observation';
  evidence:   string;      // What happened
  timestamp:  Date;
}`}
          </pre>

          <h3>Signal Sources</h3>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 my-6">
            <h3 className="text-green-400 mt-0">Delegation Outcomes (Primary)</h3>
            <p>
              The most impactful trust signals come from{' '}
              <Link href="/docs/concepts/delegation" className="text-green-400 hover:text-green-300">
                delegation
              </Link>{' '}
              results. A completed task with all acceptance criteria met is a strong positive
              signal. A failed task is a negative one.
            </p>
            <ul>
              <li><strong>COMPLETED</strong> → positive signal, weight based on complexity</li>
              <li><strong>REJECTED</strong> → negative signal, weight × 1.5 (failed after attempting)</li>
              <li><strong>FAILED</strong> → negative signal, weight × 1.0</li>
              <li><strong>DECLINED</strong> → neutral (no impact — agent opted out honestly)</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">Challenge Protocol</h3>
            <p>
              Periodic spot-checks where an agent&apos;s work is independently verified. The
              system randomly selects completed tasks for re-evaluation, comparing the
              agent&apos;s output against an independent assessment.
            </p>
            <ul>
              <li><strong>Passed</strong> → positive signal, weight × 0.5 (lower than delegation)</li>
              <li><strong>Failed</strong> → negative signal, weight × 2.0 (inflated — caught a miss)</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 my-6">
            <h3 className="text-blue-400 mt-0">Observation</h3>
            <p>
              Passive signals from watching agent behavior over time. These are lower-weight
              but continuous — they accumulate to form a baseline impression.
            </p>
            <ul>
              <li>Response time consistency</li>
              <li>Self-correction behavior (catching own mistakes)</li>
              <li>Appropriate escalation (knowing when to ask for help)</li>
            </ul>
          </div>

          <h2>Time-Decayed Scoring</h2>

          <p>
            Trust scores use exponential decay — recent signals matter more than old ones.
            This mirrors how human trust works: a colleague who was great a year ago but
            hasn&apos;t delivered recently gets a &quot;what have you done lately?&quot; discount.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`function computeTrustScore(signals: TrustSignal[], domain: string): TrustScore {
  const HALF_LIFE_DAYS = 30;  // Signal influence halves every 30 days
  const now = Date.now();
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const signal of signals.filter(s => s.domain === domain)) {
    const ageDays = (now - signal.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    
    const value = signal.type === 'positive' ? 1.0
                : signal.type === 'negative' ? 0.0
                : 0.5;  // neutral
    
    const effectiveWeight = signal.weight * decay;
    weightedSum += value * effectiveWeight;
    totalWeight += effectiveWeight;
  }
  
  // Bayesian prior: assume 0.5 with weight of 2 "virtual" signals
  const PRIOR = 0.5;
  const PRIOR_WEIGHT = 2.0;
  
  const score = (weightedSum + PRIOR * PRIOR_WEIGHT) / (totalWeight + PRIOR_WEIGHT);
  
  return {
    domain,
    score: Math.round(score * 100) / 100,
    evidence: signals.length,
    trend: computeTrend(signals, domain),
  };
}`}
          </pre>

          <h3>Decay Visualization</h3>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Signal influence over time (half-life = 30 days):

Day   | Signal Weight
------+---------------
  0   | 1.000  ████████████████████
  7   | 0.851  █████████████████
 14   | 0.724  ██████████████
 30   | 0.500  ██████████
 60   | 0.250  █████
 90   | 0.125  ██
120   | 0.063  █

A signal from 90 days ago has 12.5% of its original influence.
After ~6 months, signals are effectively forgotten.`}
          </pre>

          <h2>Trust as Living Memory</h2>

          <p>
            Trust signals are stored as memories in Engram. This means trust is not an
            opaque number — it&apos;s a queryable history. You can ask &quot;why does this
            agent have low trust for deployments?&quot; and get specific memories as evidence.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Query the trust history for an agent
const trustMemories = await engram.recall({
  query: "deployment trust signals",
  agentId: "agent_abc123",
  layer: "PROJECT",
  filter: { topics: ["trust", "delegation-outcome"] },
});

// Returns memories like:
// "Delegation del_789: FAILED — deployment script missed env var (2 days ago)"
// "Delegation del_456: COMPLETED — clean staging deploy (15 days ago)"
// "Challenge ch_012: FAILED — deployment had undetected downtime (30 days ago)"`}
          </pre>

          <h2>Challenge Protocol</h2>

          <p>
            The challenge protocol is Engram&apos;s trust verification system. It prevents
            trust scores from becoming stale or inaccurate by periodically re-evaluating
            completed work.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                    CHALLENGE PROTOCOL                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SELECT — Pick a completed delegation at random           │
│     • Probability increases for high-trust agents            │
│     • Recent completions preferred                           │
│                                                              │
│  2. EVALUATE — Independent assessment of the output          │
│     • Different agent or LLM re-evaluates the work           │
│     • Compared against original acceptance criteria          │
│                                                              │
│  3. COMPARE — Check alignment                                │
│     • Did the original evaluation match the challenge?       │
│     • Score discrepancies flagged                            │
│                                                              │
│  4. RECORD — Store the result as a trust signal              │
│     • Passed: mild positive signal                           │
│     • Failed: strong negative signal (2× weight)            │
│     • Feeds back into trust score computation                │
│                                                              │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">🔍 Why challenge high-trust agents more?</p>
            <p>
              Counterintuitive but important: agents with high trust are challenged more
              frequently because they handle more critical tasks. A trust score of 0.95 that
              hasn&apos;t been challenged in months is less reliable than a 0.80 that was
              verified last week.
            </p>
          </div>

          <h2>Trust Thresholds</h2>

          <table>
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Level</th>
                <th>Typical Permissions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>0.0 – 0.3</code></td>
                <td>Untrusted</td>
                <td>Read-only tasks, no autonomous action</td>
              </tr>
              <tr>
                <td><code>0.3 – 0.5</code></td>
                <td>Provisional</td>
                <td>Simple tasks with mandatory review</td>
              </tr>
              <tr>
                <td><code>0.5 – 0.7</code></td>
                <td>Trusted</td>
                <td>Standard tasks, optional review</td>
              </tr>
              <tr>
                <td><code>0.7 – 0.9</code></td>
                <td>Highly Trusted</td>
                <td>Complex tasks, autonomous execution</td>
              </tr>
              <tr>
                <td><code>0.9 – 1.0</code></td>
                <td>Exemplary</td>
                <td>Critical tasks, can delegate to others</td>
              </tr>
            </tbody>
          </table>

          <h2>Schema</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model TrustSignal {
  id          String   @id @default(cuid())
  agentId     String
  domain      String
  type        String   // positive | negative | neutral
  weight      Float
  source      String   // delegation | challenge | manual | observation
  evidence    String
  delegationId String?
  
  createdAt   DateTime @default(now())
  
  agent       Agent    @relation(fields: [agentId], references: [id])
}

model TrustScore {
  id          String   @id @default(cuid())
  agentId     String
  domain      String
  score       Float    // 0.0–1.0
  evidence    Int      // Signal count
  trend       String   // rising | stable | declining
  
  computedAt  DateTime @default(now())
  
  agent       Agent    @relation(fields: [agentId], references: [id])
  
  @@unique([agentId, domain])
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Trust is domain-specific.</strong> Don&apos;t use a single trust score
              for everything. An agent that&apos;s great at writing might be terrible at math.
              Always scope trust to a domain.
            </li>
            <li>
              <strong>Start with baseline trust (0.5).</strong> New agents aren&apos;t untrusted —
              they&apos;re unknown. The Bayesian prior of 0.5 gives them a fair starting point
              that adjusts quickly with evidence.
            </li>
            <li>
              <strong>Don&apos;t manually inflate trust.</strong> It&apos;s tempting to set
              trust to 1.0 for a known-good agent. Don&apos;t. Let the system earn trust
              through real outcomes so the score remains meaningful.
            </li>
            <li>
              <strong>Monitor declining trends.</strong> A trust score trending downward means
              something changed. Investigate before it drops below your threshold.
            </li>
            <li>
              <strong>Use the challenge protocol.</strong> Enable periodic challenges for
              production agents. It&apos;s the difference between &quot;we think it works&quot;
              and &quot;we verified it works.&quot;
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
