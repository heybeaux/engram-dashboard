'use client';

import Link from 'next/link';

export default function EffectiveScorePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Effective Score</h1>
          
          <p className="text-xl text-gray-300">
            The effective score is a unified importance metric that determines which memories 
            surface during retrieval and context loading.
          </p>

          <h2>The Formula</h2>
          
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`effectiveScore = max(
  safetyFloor,
  (baseScore × decayFactor) + noveltyBoost + usageBoost + pinnedBoost
)`}
          </pre>

          <h2>Components</h2>

          <h3>Base Score</h3>
          <p>
            The initial importance score (0.0–1.0) assigned when the memory is created. 
            This comes from the LLM classification or can be set explicitly via <code>importanceHint</code>.
          </p>

          <h3>Decay Factor</h3>
          <p>
            Memories fade over time based on their layer. This mimics how human memory works — 
            recent events are vivid, older ones fade unless reinforced.
          </p>

          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Half-Life</th>
                <th>Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IDENTITY</td>
                <td>∞</td>
                <td>Never decays — who you are persists</td>
              </tr>
              <tr>
                <td>PROJECT</td>
                <td>60 days</td>
                <td>Slow decay — project context fades after months</td>
              </tr>
              <tr>
                <td>SESSION</td>
                <td>14 days</td>
                <td>Medium decay — conversations fade after weeks</td>
              </tr>
              <tr>
                <td>TASK</td>
                <td>3 days</td>
                <td>Fast decay — immediate tasks expire quickly</td>
              </tr>
            </tbody>
          </table>

          <p>
            The decay uses exponential half-life: <code>factor = 0.5 ^ (age_days / half_life_days)</code>
          </p>
          <p>
            Minimum decay factor is 0.1 — memories never completely disappear from scoring.
          </p>

          <h3>Novelty Boost</h3>
          <p>
            Brand new memories get a temporary visibility boost to ensure they surface 
            before the user forgets they mentioned something.
          </p>
          <ul>
            <li><strong>Max boost</strong>: +0.15 at day 0</li>
            <li><strong>Taper</strong>: Linear decay to 0 over 7 days</li>
          </ul>
          <p>
            This solves the &quot;I just told you this!&quot; problem — recent mentions bubble up.
          </p>

          <h3>Usage Boost</h3>
          <p>
            Memories that are frequently retrieved or marked as used get reinforced — 
            like how recalling a memory strengthens it in human cognition.
          </p>
          <ul>
            <li><strong>Per use</strong>: +0.02</li>
            <li><strong>Max boost</strong>: +0.30</li>
          </ul>
          <p>
            Usage is tracked via <code>retrievalCount</code> (searched and returned) and 
            <code>usedCount</code> (explicitly marked as used by the agent).
          </p>

          <h3>Pinned Boost</h3>
          <p>
            Users can pin important memories to ensure they always surface.
          </p>
          <ul>
            <li><strong>Pinned boost</strong>: +0.50</li>
          </ul>

          <h3>Safety Floor</h3>
          <p>
            Safety-critical memories (allergies, medications, emergency contacts) have a 
            minimum score of <strong>0.6</strong> regardless of age or decay.
          </p>
          <p>
            This ensures that forgetting someone&apos;s peanut allergy is literally impossible.
          </p>

          <h2>Example Calculations</h2>

          <h3>New Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Memory: "Beaux prefers dark mode"
Layer: IDENTITY
Age: 0 days
Base score: 0.5

Calculation:
  decayFactor = 1.0 (IDENTITY never decays)
  noveltyBoost = 0.15 (brand new)
  usageBoost = 0.0 (never used yet)
  pinnedBoost = 0.0 (not pinned)
  
  effectiveScore = (0.5 × 1.0) + 0.15 + 0 + 0 = 0.65`}
          </pre>

          <h3>Old Task Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Memory: "Review PR by Friday"
Layer: TASK
Age: 6 days (2 half-lives)
Base score: 0.6

Calculation:
  decayFactor = 0.5^(6/3) = 0.25
  noveltyBoost = 0.0 (>7 days old)
  usageBoost = 0.0
  
  effectiveScore = (0.6 × 0.25) = 0.15`}
          </pre>

          <h3>Safety-Critical Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Memory: "Beaux is allergic to shellfish"
Layer: IDENTITY
Age: 365 days
Base score: 0.5
Safety-critical: true

Calculation:
  computed = (0.5 × 1.0) + 0 + 0 + 0 = 0.5
  safetyFloor = 0.6
  
  effectiveScore = max(0.6, 0.5) = 0.6`}
          </pre>

          <h2>Database Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Memory {
  // ... other fields
  
  effectiveScore   Float     @default(0.5)
  scoreComputedAt  DateTime?
  safetyCritical   Boolean   @default(false)
  userPinned       Boolean   @default(false)
  retrievalCount   Int       @default(0)
  usedCount        Int       @default(0)
}`}
          </pre>

          <h2>When Scores Are Computed</h2>
          <ul>
            <li><strong>On creation</strong>: Initial score computed and stored</li>
            <li><strong>On retrieval</strong>: Score recomputed with current date (for decay)</li>
            <li><strong>Batch update</strong>: Cron job can refresh all scores periodically</li>
          </ul>

          <h2>API Usage</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Load context ordered by effective score
POST /v1/context
{
  "userId": "beaux",
  "maxTokens": 4000
}

# Response includes memories sorted by effectiveScore
{
  "context": "...",
  "memoriesIncluded": 42,
  "layers": {
    "identity": 15,
    "project": 12,
    "session": 15
  }
}`}
          </pre>
        </article>
      </div>
    </div>
  );
}
