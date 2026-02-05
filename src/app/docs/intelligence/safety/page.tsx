'use client';

import Link from 'next/link';

export default function SafetyDetectionPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Safety Detection</h1>
          
          <p className="text-xl text-gray-300">
            Some memories must never be forgotten. Engram automatically detects safety-critical 
            information and ensures it always surfaces during retrieval.
          </p>

          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 my-8">
            <h3 className="text-red-400 mt-0">The Peanut Allergy Problem</h3>
            <p className="mb-0">
              If someone tells an agent they&apos;re allergic to peanuts, that memory should 
              <strong> never</strong> decay below retrieval threshold — even after years. 
              Forgetting an allergy could be life-threatening.
            </p>
          </div>

          <h2>How It Works</h2>
          <p>
            When a memory is created or backfilled, the <code>SafetyDetectorService</code> scans 
            the content for patterns that indicate safety-critical information.
          </p>
          
          <p>If detected:</p>
          <ol>
            <li>The <code>safetyCritical</code> flag is set to <code>true</code></li>
            <li>The memory gets a minimum <code>effectiveScore</code> of <strong>0.6</strong></li>
            <li>The memory can <strong>never be evicted</strong> from context loading</li>
          </ol>

          <h2>Detected Patterns</h2>

          <h3>Allergies</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>/allerg(y|ic|ies)/i</code></td><td>allergy</td></tr>
              <tr><td><code>/anaphy(laxis|lactic)/i</code></td><td>allergy</td></tr>
              <tr><td><code>/epipen/i</code></td><td>allergy</td></tr>
            </tbody>
          </table>

          <h3>Medications</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>/medication|medicine|prescription|drug/i</code></td><td>medication</td></tr>
              <tr><td><code>/insulin/i</code></td><td>medication</td></tr>
              <tr><td><code>/blood thinner|anticoagulant/i</code></td><td>medication</td></tr>
            </tbody>
          </table>

          <h3>Medical Conditions</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>/diabet(es|ic)/i</code></td><td>diabetes</td></tr>
              <tr><td><code>/epilepsy|seizures?/i</code></td><td>seizure</td></tr>
              <tr><td><code>/asthma|inhaler/i</code></td><td>asthma</td></tr>
              <tr><td><code>/heart condition|cardiac/i</code></td><td>medical</td></tr>
              <tr><td><code>/pacemaker/i</code></td><td>medical</td></tr>
            </tbody>
          </table>

          <h3>Emergency Information</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>/emergency contact/i</code></td><td>emergency</td></tr>
              <tr><td><code>/blood type/i</code></td><td>medical</td></tr>
              <tr><td><code>/do not resuscitate|dnr/i</code></td><td>medical_directive</td></tr>
            </tbody>
          </table>

          <h3>Critical Severity</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>/life[- ]threatening/i</code></td><td>critical</td></tr>
              <tr><td><code>/deathly|fatal|deadly/i</code></td><td>critical</td></tr>
            </tbody>
          </table>

          <h2>API Response</h2>
          <p>
            Safety detection returns the matched indicators so you can see why a memory was flagged:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`{
  "isSafety": true,
  "indicators": ["allergy", "critical"]
}`}
          </pre>

          <h2>Context Loading Behavior</h2>
          <p>
            When loading context for an agent, safety-critical memories get special treatment:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// In selectMemoriesForBudget():

// Phase 0: Safety-critical memories ALWAYS included
const safetyCritical = candidates.filter(m => m.safetyCritical);
for (const memory of safetyCritical) {
  selected.push(memory);  // Never evicted
  usedTokens += estimateTokens(memory);
}

// Phase 1: Then CONSTRAINTS
// Phase 2: Then everything else by effectiveScore`}
          </pre>

          <h2>Extending Safety Patterns</h2>
          <p>
            You can add custom safety patterns at runtime:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Add a custom pattern
safetyDetector.addPattern(/\bnut[- ]free\b/i, 'allergy');

// Check the current patterns
const patterns = safetyDetector.getPatterns();`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Don&apos;t rely solely on detection</strong> — Explicitly mark critical 
              info with <code>&quot;importanceHint&quot;: &quot;critical&quot;</code>
            </li>
            <li>
              <strong>Review flagged memories</strong> — The health endpoint shows 
              <code>safetyCriticalCount</code> so you can audit
            </li>
            <li>
              <strong>Test with your domain</strong> — Add patterns for safety-critical 
              info specific to your use case
            </li>
          </ul>

          <h2>Health Monitoring</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/health

{
  "status": "healthy",
  "metrics": {
    "safetyCriticalCount": 3,
    // ... other metrics
  }
}`}
          </pre>
        </article>
      </div>
    </div>
  );
}
