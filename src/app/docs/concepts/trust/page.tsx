'use client';

import Link from 'next/link';

export default function TrustModelConceptPage() {
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
            Trust in Engram is a living memory — not a static permission level. It&apos;s
            earned through successful interactions, decays without reinforcement, and can
            be challenged when confidence drops below thresholds.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Trust is earned, not granted.</strong> Every agent starts at a baseline.
              Successful delegation outcomes increase trust. Failures decrease it. Time erodes
              it. This mirrors how human trust actually works.
            </p>
          </div>

          <h2>Trust Signals</h2>

          <p>
            Trust scores are built from discrete <strong>signals</strong> — observable events
            that indicate reliability, competence, or risk.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Signal Types:

DELEGATION_COMPLETE   — Task finished successfully         (+0.05 to +0.15)
DELEGATION_EXCEEDED   — Results exceeded expectations      (+0.10 bonus)
DELEGATION_ON_TIME    — Delivered before deadline           (+0.03 bonus)
DELEGATION_FAILED     — Task could not be completed        (-0.10 to -0.20)
DELEGATION_MISSED     — Deadline passed with no response   (-0.15)
QUALITY_HIGH          — Output quality rated excellent     (+0.05)
QUALITY_LOW           — Output quality rated poor          (-0.08)
CHALLENGE_PASSED      — Agent passed a trust challenge     (+0.10)
CHALLENGE_FAILED      — Agent failed a trust challenge     (-0.20)
INTERACTION_POSITIVE  — General positive interaction       (+0.02)
INTERACTION_NEGATIVE  — General negative interaction       (-0.05)`}
          </pre>

          <p>
            Signals are <strong>asymmetric by design</strong> — negative events have a larger
            impact than positive ones. This reflects the reality that trust is hard to build
            and easy to break.
          </p>

          <h2>Time-Decayed Scoring</h2>

          <p>
            Trust scores decay over time using the same half-life mechanism as memory layers.
            An agent that was trustworthy six months ago but hasn&apos;t been heard from since
            shouldn&apos;t retain full trust.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Trust Score Computation:

  effectiveTrust = baseline + Σ(signal.delta × decayFactor(signal.age))

  Where:
    baseline = 0.5 (neutral starting point)
    decayFactor = 0.5^(age_days / halfLife)
    halfLife = 90 days (trust decays slower than session memories)

  Bounds: [0.0, 1.0]

Example:
  Agent completed 5 tasks successfully over 3 months:
  
  Signal 1 (90 days ago): +0.10 × 0.50 = +0.050
  Signal 2 (60 days ago): +0.08 × 0.63 = +0.050
  Signal 3 (30 days ago): +0.12 × 0.79 = +0.095
  Signal 4 (14 days ago): +0.10 × 0.90 = +0.090
  Signal 5 (2 days ago):  +0.15 × 0.98 = +0.147
  
  effectiveTrust = 0.5 + 0.432 = 0.932`}
          </pre>

          <h3>Why Time Decay?</h3>
          <p>
            Without decay, a previously excellent agent could coast on past performance
            indefinitely. Time decay ensures trust reflects <em>current</em> reliability:
          </p>
          <ul>
            <li>Recent successes matter more than old ones</li>
            <li>Inactive agents gradually return to baseline</li>
            <li>A single catastrophic failure doesn&apos;t permanently blacklist an agent</li>
            <li>Recovery is always possible through consistent good performance</li>
          </ul>

          <h2>Trust as Living Memory</h2>

          <p>
            Trust scores are stored as memories in the IDENTITY layer, not in a separate
            permission database. This means trust participates in the same retrieval, decay,
            and reinforcement systems as any other memory.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Trust is a memory, stored in the identity layer
{
  "raw": "agent_code_reviewer has trust score 0.87 based on 12 delegations",
  "layer": "IDENTITY",
  "memoryType": "FACT",
  "metadata": {
    "trustType": "delegation",
    "targetAgentId": "agent_code_reviewer",
    "score": 0.87,
    "signalCount": 12,
    "lastSignal": "2026-02-18T14:30:00Z"
  }
}`}
          </pre>

          <p>Benefits of trust-as-memory:</p>
          <ul>
            <li>
              <strong>Portable.</strong> Trust travels with the agent via cloud sync. An agent
              that moves between environments retains its trust relationships.
            </li>
            <li>
              <strong>Queryable.</strong> &quot;Who do I trust most for code reviews?&quot;
              is a semantic search, not a database join.
            </li>
            <li>
              <strong>Evolvable.</strong> Trust memories participate in consolidation — the
              system can merge redundant trust signals into summary memories.
            </li>
          </ul>

          <h2>Trust Levels</h2>

          <table>
            <thead>
              <tr>
                <th>Range</th>
                <th>Level</th>
                <th>Permissions</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>0.0 – 0.2</code></td>
                <td><strong>Untrusted</strong></td>
                <td>No delegation</td>
                <td>Agent has failed too many tasks or is unknown</td>
              </tr>
              <tr>
                <td><code>0.2 – 0.4</code></td>
                <td><strong>Probation</strong></td>
                <td>Low-priority only</td>
                <td>New agent or recovering from failures</td>
              </tr>
              <tr>
                <td><code>0.4 – 0.6</code></td>
                <td><strong>Baseline</strong></td>
                <td>Medium-priority</td>
                <td>Default starting point, limited track record</td>
              </tr>
              <tr>
                <td><code>0.6 – 0.8</code></td>
                <td><strong>Trusted</strong></td>
                <td>High-priority</td>
                <td>Proven track record of reliable work</td>
              </tr>
              <tr>
                <td><code>0.8 – 1.0</code></td>
                <td><strong>Highly Trusted</strong></td>
                <td>Critical tasks</td>
                <td>Extensive history of excellent performance</td>
              </tr>
            </tbody>
          </table>

          <h2>Challenge Protocol</h2>

          <p>
            When an agent&apos;s trust score drops near a threshold boundary, or when a
            high-stakes task requires extra confidence, the system can issue a{' '}
            <strong>trust challenge</strong>.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Challenge Protocol Flow:

1. TRIGGER
   ├─ Trust score near boundary (e.g., 0.58 → approaching "Trusted")
   ├─ High-priority task with marginal trust
   └─ Periodic audit (configurable interval)

2. CHALLENGE ISSUED
   ├─ System selects a verifiable task
   ├─ Task has known-correct answer or measurable outcome
   └─ Agent is notified of the challenge

3. EXECUTION
   ├─ Agent performs the task normally
   ├─ No special treatment — it shouldn't know it's a test
   └─ Results are compared against ground truth

4. EVALUATION
   ├─ PASSED: Trust score boosted (+0.10)
   ├─ FAILED: Trust score penalized (-0.20)
   └─ Result stored as a trust signal memory

5. OUTCOME
   ├─ Agent promoted to higher trust level (if passed + above threshold)
   └─ Agent demoted or flagged for review (if failed)`}
          </pre>

          <p>
            Challenges serve two purposes: they verify that high-trust agents are still
            performing well, and they give lower-trust agents an opportunity to prove themselves
            on verifiable tasks.
          </p>

          <h2>Trust Visualization</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Trust score over time for an agent:

1.0 ┤
    │                                    ╭───── consistent delivery
0.8 ┤                              ╭────╯
    │                        ╭────╯
0.6 ┤──────────────────╭────╯
    │   baseline       │
0.4 ┤                  │ ← failed task, trust dip
    │            ╭────╯
0.2 ┤      ╭────╯
    │╭────╯ growing trust
0.0 ┤
    └────┬────┬────┬────┬────┬────┬────┬────
    Day  0   15   30   45   60   75   90  105`}
          </pre>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model TrustScore {
  id            String   @id
  agentId       String               // The agent whose trust is tracked
  targetAgentId String               // The agent being trusted
  
  score         Float    @default(0.5)
  signalCount   Int      @default(0)
  lastSignalAt  DateTime?
  
  // Relationship
  agent         AgentIdentity @relation(fields: [agentId], references: [id])
}

model TrustSignal {
  id            String   @id
  trustScoreId  String
  
  type          TrustSignalType
  delta         Float               // Score change
  reason        String?             // Human-readable explanation
  delegationId  String?             // If from a delegation
  
  createdAt     DateTime @default(now())
}

enum TrustSignalType {
  DELEGATION_COMPLETE
  DELEGATION_EXCEEDED
  DELEGATION_ON_TIME
  DELEGATION_FAILED
  DELEGATION_MISSED
  QUALITY_HIGH
  QUALITY_LOW
  CHALLENGE_PASSED
  CHALLENGE_FAILED
  INTERACTION_POSITIVE
  INTERACTION_NEGATIVE
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Start agents at baseline (0.5).</strong> Don&apos;t pre-trust agents.
              Let them earn it through successful work.
            </li>
            <li>
              <strong>Use challenges sparingly.</strong> Challenges are useful for boundary
              cases and audits, not for every interaction. Over-challenging wastes resources.
            </li>
            <li>
              <strong>Monitor trust trends, not snapshots.</strong> A trust score of 0.65 means
              different things depending on whether it&apos;s rising or falling. The dashboard
              shows trust trajectories.
            </li>
            <li>
              <strong>Don&apos;t manually inflate trust.</strong> If an agent consistently fails
              tasks, the correct response is to improve the agent — not to override its trust
              score.
            </li>
            <li>
              <strong>Review the asymmetry.</strong> Negative signals are intentionally stronger
              than positive ones. One major failure should outweigh several routine successes.
              If this feels wrong for your use case, adjust the signal weights.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
