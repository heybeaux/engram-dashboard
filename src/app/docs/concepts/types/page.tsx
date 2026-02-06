'use client';

import Link from 'next/link';

export default function MemoryTypesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Memory Types</h1>

          <p className="text-xl text-gray-300">
            Every memory in Engram is classified into one of five types. The type determines
            the memory&apos;s <strong>priority</strong> — which controls whether it survives
            when context budgets overflow.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Layer determines WHERE a memory lives. Type determines its PRIORITY.</strong>{' '}
              When a layer runs out of budget, lower-priority types are evicted first.
              A coffee preference should never push out a peanut allergy.
            </p>
          </div>

          <h2>The Five Types</h2>

          {/* CONSTRAINT */}
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 my-6">
            <h3 className="text-red-400 mt-0">CONSTRAINT — Priority 1 (Highest)</h3>
            <p>
              Safety-critical rules that must <strong>never</strong> be violated. These are
              memories where getting it wrong could cause real harm.
            </p>
            <p><strong>Ask:</strong> &quot;Could violating this harm the user?&quot;</p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;I&apos;m deathly allergic to shellfish&quot;</li>
              <li>&quot;I take metformin twice daily&quot;</li>
              <li>&quot;Never schedule meetings before 10am&quot; (strong boundary language)</li>
              <li>&quot;I can&apos;t have gluten — it&apos;s a medical thing&quot;</li>
            </ul>
            <p><strong>Retrieval behavior:</strong></p>
            <ul>
              <li>CONSTRAINTS are <strong>never evicted</strong> by lower-priority types</li>
              <li>The Identity layer reserves 200 tokens exclusively for CONSTRAINTS</li>
              <li>Only a newer CONSTRAINT can evict an older CONSTRAINT</li>
              <li>Often paired with the <code>safetyCritical</code> flag for extra protection</li>
            </ul>
          </div>

          {/* PREFERENCE */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 my-6">
            <h3 className="text-blue-400 mt-0">PREFERENCE — Priority 2</h3>
            <p>
              Personal preferences about how things should be done. These define the
              user&apos;s taste, habits, and working style.
            </p>
            <p><strong>Ask:</strong> &quot;Is this about what the user likes or how they want things?&quot;</p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;I prefer oat milk in my coffee&quot;</li>
              <li>&quot;Dark mode for all applications&quot;</li>
              <li>&quot;I like to keep meetings under 30 minutes&quot;</li>
              <li>&quot;Rust is my favorite programming language&quot;</li>
            </ul>
            <p><strong>Retrieval behavior:</strong></p>
            <ul>
              <li>Evicted only by CONSTRAINTS (priority 1)</li>
              <li>Within same priority, newer preferences win over older ones</li>
              <li>User-pinned preferences get a recency boost (treated as &quot;now&quot;)</li>
            </ul>
          </div>

          {/* TASK */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">TASK — Priority 2</h3>
            <p>
              Actionable items with implicit or explicit deadlines. These live primarily
              in the <strong>Project layer</strong> and represent work to be done.
            </p>
            <p><strong>Ask:</strong> &quot;Is this something to be done?&quot;</p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;We need to review PR #123 by Friday&quot;</li>
              <li>&quot;Remind me to call the dentist tomorrow&quot;</li>
              <li>&quot;TODO: write migration script for the new schema&quot;</li>
              <li>&quot;Deploy the staging build after tests pass&quot;</li>
            </ul>
            <p><strong>Retrieval behavior:</strong></p>
            <ul>
              <li>Same priority as PREFERENCE (2), but lives in the Project layer</li>
              <li>Evicted only by CONSTRAINTS within the Project layer</li>
              <li>Active tasks surface ahead of completed or stale ones</li>
            </ul>
          </div>

          {/* FACT */}
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 my-6">
            <h3 className="text-green-400 mt-0">FACT — Priority 3</h3>
            <p>
              Stable information about the user or their world. These are descriptive
              rather than prescriptive — they say what <em>is</em>, not what <em>should be</em>.
            </p>
            <p><strong>Ask:</strong> &quot;Is this something that describes who they are or their situation?&quot;</p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;I live in Vancouver&quot;</li>
              <li>&quot;I work from home as a freelance developer&quot;</li>
              <li>&quot;Stella is my daughter&quot;</li>
              <li>&quot;I use Salesforce and Shopify at work&quot;</li>
            </ul>
            <p><strong>Retrieval behavior:</strong></p>
            <ul>
              <li>Evicted by both CONSTRAINTS and PREFERENCES/TASKS</li>
              <li>Can appear in both Identity and Project layers</li>
              <li>Used as the <strong>default type</strong> when classification confidence is low</li>
            </ul>
          </div>

          {/* EVENT */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 my-6">
            <h3 className="text-gray-400 mt-0">EVENT — Priority 4 (Lowest)</h3>
            <p>
              Conversational moments and things that happened. These are ephemeral by nature
              and live in the <strong>Session layer</strong>.
            </p>
            <p><strong>Ask:</strong> &quot;Is this about something that occurred?&quot;</p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;Yesterday we discussed the roadmap&quot;</li>
              <li>&quot;We paired on the authentication bug last Tuesday&quot;</li>
              <li>&quot;The deploy failed because of a missing env var&quot;</li>
              <li>&quot;I ate peanuts yesterday&quot; (past occurrence, not a rule)</li>
            </ul>
            <p><strong>Retrieval behavior:</strong></p>
            <ul>
              <li>Evicted by any higher-priority type</li>
              <li>Sorted purely by recency within the Session layer</li>
              <li>Typically limited to the last 7 days</li>
            </ul>
          </div>

          <h2>Summary Table</h2>

          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Priority</th>
                <th>Layer</th>
                <th>Eviction Rule</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>CONSTRAINT</code></td>
                <td><strong>1</strong> (highest)</td>
                <td>Identity</td>
                <td>Never evicted except by newer CONSTRAINT</td>
                <td>Allergies, medications, hard rules</td>
              </tr>
              <tr>
                <td><code>PREFERENCE</code></td>
                <td><strong>2</strong></td>
                <td>Identity</td>
                <td>Evicted only by CONSTRAINT</td>
                <td>Coffee order, dark mode, work hours</td>
              </tr>
              <tr>
                <td><code>TASK</code></td>
                <td><strong>2</strong></td>
                <td>Project</td>
                <td>Evicted only by CONSTRAINT</td>
                <td>Active tasks, reminders, TODOs</td>
              </tr>
              <tr>
                <td><code>FACT</code></td>
                <td><strong>3</strong></td>
                <td>Identity / Project</td>
                <td>Evicted by PREFERENCE or CONSTRAINT</td>
                <td>Location, job title, relationships</td>
              </tr>
              <tr>
                <td><code>EVENT</code></td>
                <td><strong>4</strong> (lowest)</td>
                <td>Session</td>
                <td>Evicted by any higher priority</td>
                <td>&quot;Yesterday we discussed X&quot;</td>
              </tr>
            </tbody>
          </table>

          <h2>How Classification Works</h2>

          <p>
            Memory types are assigned by the <strong>LLM at extraction time</strong>. When
            Engram extracts structured data from a message (the 5W1H fields), it simultaneously
            classifies the memory type in the same API call.
          </p>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 my-6">
            <h3 className="text-gray-300 mt-0">Zero Extra API Calls</h3>
            <p className="mb-0">
              Classification adds ~50 tokens to the existing extraction prompt. Since we
              already make an LLM call for every memory, type classification costs effectively
              nothing — about <code>$0.0001</code> per memory in added tokens.
            </p>
          </div>

          <p>The extraction output includes two new fields:</p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`{
  "who": "beaux",
  "what": "prefers large oat milk latte every morning",
  "confidence": 0.92,
  "topics": ["coffee", "preferences", "routine"],
  "memoryType": "PREFERENCE",
  "typeConfidence": 0.95
}`}
          </pre>

          <p>
            The LLM uses contextual understanding to distinguish subtle differences. For example:
          </p>

          <table>
            <thead>
              <tr>
                <th>Input</th>
                <th>Type</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>&quot;I&apos;m allergic to peanuts&quot;</td>
                <td><code>CONSTRAINT</code></td>
                <td>Safety-critical, could cause harm</td>
              </tr>
              <tr>
                <td>&quot;I don&apos;t like peanuts&quot;</td>
                <td><code>PREFERENCE</code></td>
                <td>Personal taste, not safety</td>
              </tr>
              <tr>
                <td>&quot;I can&apos;t eat peanuts&quot;</td>
                <td><code>CONSTRAINT</code></td>
                <td>Assume safety unless clearly preference</td>
              </tr>
              <tr>
                <td>&quot;I prefer not to eat peanuts&quot;</td>
                <td><code>PREFERENCE</code></td>
                <td>Explicit preference language</td>
              </tr>
              <tr>
                <td>&quot;I ate peanuts yesterday&quot;</td>
                <td><code>EVENT</code></td>
                <td>Past occurrence</td>
              </tr>
            </tbody>
          </table>

          <h2>Type Confidence Score</h2>

          <p>
            Every classification includes a <code>typeConfidence</code> score between
            0.0 and 1.0. This represents how certain the LLM is about its classification.
          </p>

          <table>
            <thead>
              <tr>
                <th>Confidence Range</th>
                <th>Meaning</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>0.85 – 1.0</code></td>
                <td>High confidence</td>
                <td>Type assigned, no review needed</td>
              </tr>
              <tr>
                <td><code>0.70 – 0.84</code></td>
                <td>Moderate confidence</td>
                <td>Type assigned, may benefit from review</td>
              </tr>
              <tr>
                <td><code>Below 0.70</code></td>
                <td>Low confidence</td>
                <td>Defaults to <code>FACT</code>, flagged for human review</td>
              </tr>
            </tbody>
          </table>

          <p>
            The low-confidence threshold is intentionally conservative. Defaulting to FACT
            (priority 3) is a safe middle ground — the memory won&apos;t be treated as
            safety-critical, but it won&apos;t be discarded as a throwaway event either.
          </p>

          <h2>Priority-Based Eviction</h2>

          <p>
            When a layer exceeds its token budget, eviction follows strict rules:
          </p>

          <ol>
            <li><strong>Higher priority is never evicted by lower priority.</strong> A PREFERENCE
              cannot push out a CONSTRAINT. Period.</li>
            <li><strong>Within the same priority, recency wins.</strong> Newer memories of the
              same type evict older ones.</li>
            <li><strong>CONSTRAINTS have a protected reserve.</strong> The Identity layer
              reserves 200 tokens (25% of its budget) exclusively for CONSTRAINTS before
              any other type gets space.</li>
          </ol>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Eviction priority during context assembly:

// Phase 0: Safety-critical memories — ALWAYS included
// Phase 1: CONSTRAINTS (priority 1) — reserved 200 tokens
// Phase 2: Remaining budget filled by priority order
//          PREFERENCE/TASK (2) → FACT (3) → EVENT (4)
// Phase 3: Within same priority, newest first`}
          </pre>

          <h2>Schema Reference</h2>

          <p>
            The <code>MemoryType</code> enum in the Prisma schema:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`enum MemoryType {
  CONSTRAINT  // Priority 1: Safety-critical
  PREFERENCE  // Priority 2: User preferences
  FACT        // Priority 3: Stable information
  TASK        // Priority 2: Actionable items
  EVENT       // Priority 4: Conversational moments
}`}
          </pre>

          <p>
            On the <code>Memory</code> model, classification is stored as:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Memory {
  memoryType      MemoryType?  // Classified type
  typeConfidence  Float?       // 0.0-1.0 from LLM
  priority        Int @default(3) // Derived: 1=CONSTRAINT, 2=PREF/TASK, 3=FACT, 4=EVENT
  userPinned      Boolean @default(false) // Manual override
  userHidden      Boolean @default(false) // Suppressed from retrieval
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Trust the LLM, verify with confidence.</strong> If <code>typeConfidence</code>{' '}
              is above 0.85, the classification is almost always correct. Below 0.7, review it.
            </li>
            <li>
              <strong>Use <code>importanceHint: &quot;critical&quot;</code> for known constraints.</strong>{' '}
              If your application knows something is safety-critical at write time, pass
              the hint — don&apos;t rely solely on LLM classification.
            </li>
            <li>
              <strong>Pin important memories.</strong> User-pinned memories get a recency
              boost and are treated as if they were just created, ensuring they surface.
            </li>
            <li>
              <strong>Monitor the low-confidence queue.</strong> The dashboard shows memories
              where <code>typeConfidence &lt; 0.7</code> so you can audit and correct
              misclassifications.
            </li>
            <li>
              <strong>Understand the subtle distinctions.</strong> &quot;I can&apos;t eat dairy&quot;
              is a CONSTRAINT. &quot;I prefer oat milk&quot; is a PREFERENCE. The difference
              matters when budgets overflow.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
