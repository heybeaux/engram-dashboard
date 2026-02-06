'use client';

import Link from 'next/link';

export default function MemoryLayersPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Memory Layers</h1>

          <p className="text-xl text-gray-300">
            Engram organizes memories into four distinct layers that mirror how human cognition
            works — from permanent identity to fleeting tasks. Each layer has its own persistence
            behavior, token budget, and role in context assembly.
          </p>

          <h2>Core Principle</h2>

          <p>
            <strong>Layer determines WHERE a memory lives and HOW LONG it persists.</strong>{' '}
            Within each layer, memory types determine priority for eviction. This two-axis
            system ensures that critical information is never forgotten while ephemeral context
            naturally fades.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                    CONTEXT ASSEMBLY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  IDENTITY LAYER (800 tokens)                                │
│  ├─ CONSTRAINT (priority 1) — NEVER evicted by lower        │
│  ├─ PREFERENCE (priority 2) — evicted only by CONSTRAINT    │
│  └─ FACT (priority 3) — evicted by higher priority types    │
│                                                              │
│  PROJECT LAYER (600 tokens)                                 │
│  ├─ TASK (priority 2) — active tasks for current project    │
│  └─ FACT (priority 3) — project-specific knowledge          │
│                                                              │
│  SESSION LAYER (400 tokens)                                 │
│  └─ EVENT (priority 4) — last 7–14 days, pure recency       │
│                                                              │
│  TASK LAYER (no dedicated budget)                           │
│  └─ Ephemeral items — loaded on-demand, decay fastest       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
Total Context Budget: 1,800 tokens`}
          </pre>

          <h2>The Four Layers</h2>

          <h3>IDENTITY — Who the user is</h3>
          <p>
            The identity layer stores long-term, stable information about the user. These are
            facts, preferences, and constraints that define who someone is and how they want to
            be treated. Identity memories <strong>never decay</strong> — just like how you never
            forget your own name.
          </p>
          <ul>
            <li><strong>Token budget</strong>: 800 tokens</li>
            <li><strong>Half-life</strong>: ∞ (no decay)</li>
            <li><strong>Decay factor</strong>: Always 1.0</li>
            <li><strong>Types allowed</strong>: CONSTRAINT, PREFERENCE, FACT</li>
          </ul>
          <p><strong>Example memories:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`"Beaux is deathly allergic to shellfish"        → CONSTRAINT (priority 1)
"Beaux prefers dark mode for all applications"   → PREFERENCE (priority 2)
"Beaux lives in Powell River, BC"                → FACT (priority 3)
"Beaux drinks a large latte with dairy milk"     → PREFERENCE (priority 2)
"Once a mechanic, always a mechanic"             → FACT (priority 3)`}
          </pre>
          <p>
            The IDENTITY layer reserves <strong>200 tokens</strong> exclusively for CONSTRAINT
            memories (safety-critical items like allergies and medications). This guarantee means
            a flood of preferences can never push out a peanut allergy.
          </p>

          <h3>PROJECT — Current work context</h3>
          <p>
            The project layer holds knowledge about the user&apos;s active workstreams. These
            memories are relevant for weeks to months but eventually fade as projects complete
            or shift focus. Think of it as your working memory for &quot;what am I building
            right now?&quot;
          </p>
          <ul>
            <li><strong>Token budget</strong>: 600 tokens</li>
            <li><strong>Half-life</strong>: 60 days</li>
            <li><strong>Decay factor</strong>: <code>0.5^(age_days / 60)</code></li>
            <li><strong>Types allowed</strong>: TASK, FACT</li>
          </ul>
          <p><strong>Example memories:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`"Building the Engram auto-capture system"        → TASK (priority 2)
"Using Prisma with PostgreSQL for the schema"    → FACT (priority 3)
"PR #6384 adds message hooks to OpenClaw"        → FACT (priority 3)
"Need to write a backfill script for types"      → TASK (priority 2)
"Dashboard uses Next.js with dark theme"         → FACT (priority 3)`}
          </pre>
          <p>
            After 60 days without reinforcement, a project memory retains 50% of its original
            score. After 120 days, 25%. Memories that keep getting retrieved are boosted via
            the usage signal, counteracting decay.
          </p>

          <h3>SESSION — Recent conversations</h3>
          <p>
            The session layer captures what happened in recent interactions. These are
            conversational moments and events that provide continuity between sessions.
            Session memories fade within weeks — just like how you remember yesterday&apos;s
            conversation clearly but last month&apos;s becomes hazy.
          </p>
          <ul>
            <li><strong>Token budget</strong>: 400 tokens</li>
            <li><strong>Half-life</strong>: 14 days</li>
            <li><strong>Decay factor</strong>: <code>0.5^(age_days / 14)</code></li>
            <li><strong>Types allowed</strong>: EVENT</li>
          </ul>
          <p><strong>Example memories:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`"Yesterday we discussed the roadmap priorities"  → EVENT (priority 4)
"Beaux mentioned flipping the repo to public"    → EVENT (priority 4)
"We debugged a Salesforce campaign ID bug"       → EVENT (priority 4)
"Reviewed the memory intelligence red team"      → EVENT (priority 4)`}
          </pre>
          <p>
            Session memories benefit most from the <strong>novelty boost</strong> — a +0.15
            temporary score increase that tapers linearly over 7 days. This ensures
            &quot;I just told you this!&quot; moments don&apos;t happen.
          </p>

          <h3>TASK — Ephemeral action items</h3>
          <p>
            The task layer is for the most transient memories: immediate action items,
            reminders, and short-lived context. These decay the fastest of any layer and
            don&apos;t have a dedicated token budget in context assembly — they&apos;re loaded
            on-demand when relevant.
          </p>
          <ul>
            <li><strong>Token budget</strong>: No dedicated budget (loaded on-demand)</li>
            <li><strong>Half-life</strong>: 3 days</li>
            <li><strong>Decay factor</strong>: <code>0.5^(age_days / 3)</code></li>
            <li><strong>Types allowed</strong>: TASK, EVENT</li>
          </ul>
          <p><strong>Example memories:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`"Review PR #123 by Friday"                      → TASK (priority 2)
"Run the migration on dev database"              → TASK (priority 2)
"Check if agent self-memories are captured"      → TASK (priority 2)
"Urgent: clean up README.md before going public" → TASK (priority 2)`}
          </pre>
          <p>
            After just 3 days, a task memory retains only 50% of its score. After 6 days, 25%.
            This aggressive decay prevents stale todos from cluttering context. Important tasks
            that persist should be promoted to the PROJECT layer or pinned by the user.
          </p>

          <h2>Summary Table</h2>

          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Budget</th>
                <th>Half-Life</th>
                <th>Decay</th>
                <th>Types</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>IDENTITY</strong></td>
                <td>800 tokens</td>
                <td>∞</td>
                <td>None</td>
                <td>CONSTRAINT, PREFERENCE, FACT</td>
                <td>Who the user is</td>
              </tr>
              <tr>
                <td><strong>PROJECT</strong></td>
                <td>600 tokens</td>
                <td>60 days</td>
                <td>Slow</td>
                <td>TASK, FACT</td>
                <td>Current work context</td>
              </tr>
              <tr>
                <td><strong>SESSION</strong></td>
                <td>400 tokens</td>
                <td>14 days</td>
                <td>Medium</td>
                <td>EVENT</td>
                <td>Recent conversations</td>
              </tr>
              <tr>
                <td><strong>TASK</strong></td>
                <td>On-demand</td>
                <td>3 days</td>
                <td>Fast</td>
                <td>TASK, EVENT</td>
                <td>Ephemeral action items</td>
              </tr>
            </tbody>
          </table>

          <h2>How Layers Interact with Retrieval</h2>

          <h3>Effective Score</h3>
          <p>
            Every memory has an <code>effectiveScore</code> — a unified importance metric
            computed from base score, decay, novelty, usage, and pin status. The layer
            determines how quickly the decay component erodes that score over time.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`effectiveScore = max(
  safetyFloor,
  (baseScore × decayFactor) + noveltyBoost + usageBoost + pinnedBoost
)

Where decayFactor depends on layer:
  IDENTITY: 1.0 (always)
  PROJECT:  0.5^(age_days / 60)
  SESSION:  0.5^(age_days / 14)
  TASK:     0.5^(age_days / 3)

Minimum decay factor: 0.1 — memories never fully vanish from scoring.`}
          </pre>

          <h3>Priority-Based Loading</h3>
          <p>
            Context assembly loads each layer independently, filling its token budget using
            a strict priority order:
          </p>
          <ol>
            <li>
              <strong>Priority first</strong> — CONSTRAINT (1) loads before PREFERENCE (2)
              before FACT (3) before EVENT (4)
            </li>
            <li>
              <strong>Pinned second</strong> — User-pinned memories within the same priority
              load before unpinned ones
            </li>
            <li>
              <strong>Recency third</strong> — Among same-priority, same-pin-status memories,
              newer ones win
            </li>
          </ol>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`async loadContext(userId, options) {
  const layers = {
    identity: await loadLayer(userId, 'IDENTITY', 800, options),
    project:  await loadLayer(userId, 'PROJECT',  600, options),
    session:  await loadLayer(userId, 'SESSION',  400, options),
  };
  // TASK memories loaded on-demand based on active tasks
  return assembleLayers(layers);
}`}
          </pre>

          <h3>Overflow & Eviction</h3>
          <p>
            When a layer exceeds its token budget, eviction follows strict rules to protect
            important memories:
          </p>
          <ul>
            <li>
              <strong>Rule 1: Higher priority is never evicted by lower priority.</strong>{' '}
              A PREFERENCE cannot push out a CONSTRAINT. A FACT cannot push out a PREFERENCE.
            </li>
            <li>
              <strong>Rule 2: Within same priority, recency wins.</strong>{' '}
              A newer PREFERENCE can replace an older PREFERENCE. Pinned memories are treated
              as &quot;now&quot; for recency purposes.
            </li>
            <li>
              <strong>Rule 3: CONSTRAINTS have a protected reserve.</strong>{' '}
              The IDENTITY layer reserves 200 tokens exclusively for CONSTRAINT memories,
              ensuring safety-critical items always have space.
            </li>
          </ul>

          <h3>Concrete Example</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`User has in IDENTITY layer:
  3 CONSTRAINTS (150 tokens): peanut allergy, shellfish allergy, medication
  25 PREFERENCES (900 tokens): coffee order, dark mode, meeting times...
  10 FACTS (400 tokens): location, job, relationships...

IDENTITY budget: 800 tokens

Eviction process:
  1. Reserve 200 tokens for CONSTRAINTS → all 3 fit (150 tokens)
  2. Remaining budget: 650 tokens
  3. Fill with PREFERENCES by recency → ~18 fit
  4. 7 older PREFERENCES evicted
  5. 0 FACTS fit (PREFERENCES have higher priority)

Result:
  ✅ All CONSTRAINTS — always present
  ✅ 18 recent PREFERENCES — present
  ❌ 7 older PREFERENCES — evicted
  ❌ 10 FACTS — evicted (lower priority)

The peanut allergy is NEVER forgotten.`}
          </pre>

          <h2>Decay Visualization</h2>
          <p>
            How a memory with base score 0.8 decays across layers over time:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Day   | IDENTITY | PROJECT | SESSION |  TASK
------+----------+---------+---------+-------
  0   |   0.80   |  0.80   |  0.80   | 0.80
  3   |   0.80   |  0.77   |  0.69   | 0.40
  7   |   0.80   |  0.74   |  0.56   | 0.15
 14   |   0.80   |  0.69   |  0.40   | 0.08*
 30   |   0.80   |  0.59   |  0.19   | 0.08*
 60   |   0.80   |  0.40   |  0.08*  | 0.08*
120   |   0.80   |  0.20   |  0.08*  | 0.08*

* Minimum decay factor of 0.1 applied (0.8 × 0.1 = 0.08)`}
          </pre>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`enum MemoryLayer {
  IDENTITY   // Permanent — who the user is
  PROJECT    // Long-term — current work context
  SESSION    // Medium-term — recent conversations
  TASK       // Short-term — ephemeral action items
}

model Memory {
  // ...
  layer           MemoryLayer
  memoryType      MemoryType?     // CONSTRAINT, PREFERENCE, FACT, TASK, EVENT
  priority        Int  @default(3) // 1=highest, 4=lowest
  effectiveScore  Float @default(0.5)
  safetyCritical  Boolean @default(false)
  userPinned      Boolean @default(false)
  retrievalCount  Int  @default(0)
  usedCount       Int  @default(0)
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Let the LLM classify layers.</strong> Engram&apos;s extraction prompt
              determines the appropriate layer based on content. Manual overrides are available
              but rarely needed.
            </li>
            <li>
              <strong>Pin important memories.</strong> If a memory keeps getting evicted but
              matters, pin it. Pinned memories get a +0.50 score boost and are treated as
              maximally recent.
            </li>
            <li>
              <strong>Trust the decay.</strong> Task memories <em>should</em> fade after a few
              days. If a task is still relevant after a week, it belongs in the PROJECT layer.
            </li>
            <li>
              <strong>Mark safety-critical items.</strong> Memories flagged
              as <code>safetyCritical</code> get a score floor of 0.6, ensuring they always
              surface regardless of age or layer.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
