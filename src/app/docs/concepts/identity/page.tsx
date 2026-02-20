'use client';

import Link from 'next/link';

export default function IdentityFrameworkPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Agent Identity</h1>

          <p className="text-xl text-gray-300">
            In Engram, identity isn&apos;t a static profile — it&apos;s an emergent property of
            accumulated memories. An agent&apos;s identity is who it <em>becomes</em> through
            interaction, not who it&apos;s told to be.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Identity emerges from memory.</strong> Just as a human&apos;s personality
              is shaped by their experiences, an agent&apos;s identity is the living sum of its
              memories — capabilities it has demonstrated, preferences it has learned, trust it
              has earned, and patterns in how it works.
            </p>
          </div>

          <h2>What Is Agent Identity?</h2>

          <p>
            Traditional agent systems define identity through configuration files — a name, a
            system prompt, a list of tools. Engram takes a fundamentally different approach:
            identity is a <strong>structured projection of memory</strong>.
          </p>

          <p>
            When you ask &quot;who is this agent?&quot;, Engram answers by querying memories
            across four identity layers, assembling a living portrait that evolves with every
            interaction.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                     AGENT IDENTITY                          │
│              (Emergent from Memory Layers)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CAPABILITIES                                               │
│  ├─ What the agent can do                                   │
│  ├─ Tools it has access to                                  │
│  ├─ Skills demonstrated over time                           │
│  └─ Domains of expertise                                    │
│                                                              │
│  PREFERENCES                                                │
│  ├─ How the agent likes to work                             │
│  ├─ Communication style                                     │
│  ├─ Formatting choices                                      │
│  └─ Interaction patterns                                    │
│                                                              │
│  TRUST                                                      │
│  ├─ Earned through successful delegation                    │
│  ├─ Time-decayed confidence scores                          │
│  ├─ Domain-specific trust levels                            │
│  └─ Challenge protocol history                              │
│                                                              │
│  WORK STYLE                                                 │
│  ├─ How the agent approaches tasks                          │
│  ├─ Speed vs. thoroughness tendencies                       │
│  ├─ Collaboration patterns                                  │
│  └─ Error handling behavior                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>The Four Identity Layers</h2>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 my-6">
            <h3 className="text-blue-400 mt-0">Capabilities</h3>
            <p>
              What the agent can do. This layer tracks tools, skills, and domains of expertise.
              Capabilities are <strong>discovered through use</strong> — when an agent
              successfully completes a coding task, its &quot;coding&quot; capability score
              increases. When it fails at image generation, that capability is noted too.
            </p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;Can write TypeScript with high proficiency&quot;</li>
              <li>&quot;Has access to web search, file system, and browser tools&quot;</li>
              <li>&quot;Successfully completed 12 database migration tasks&quot;</li>
              <li>&quot;Struggles with CSS layout — delegate to specialist&quot;</li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 my-6">
            <h3 className="text-green-400 mt-0">Preferences</h3>
            <p>
              How the agent prefers to work and communicate. These emerge from user feedback
              and interaction patterns over time. A user who always reformats the agent&apos;s
              bullet lists into prose is teaching the agent a preference.
            </p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;User prefers concise responses over detailed explanations&quot;</li>
              <li>&quot;Always use TypeScript strict mode in code examples&quot;</li>
              <li>&quot;Format API responses as tables, not JSON blocks&quot;</li>
              <li>&quot;Avoid emojis in technical documentation&quot;</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 my-6">
            <h3 className="text-yellow-400 mt-0">Trust</h3>
            <p>
              How much confidence has been earned through past performance. Trust is
              domain-specific — an agent might be highly trusted for code review but untrusted
              for financial decisions. Trust scores decay over time, requiring ongoing
              demonstration. See the{' '}
              <Link href="/docs/concepts/trust" className="text-yellow-400 hover:text-yellow-300">
                Trust Model
              </Link>{' '}
              page for details.
            </p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;Trust score 0.92 for code generation (47 successful tasks)&quot;</li>
              <li>&quot;Trust score 0.41 for deployment — failed last 2 attempts&quot;</li>
              <li>&quot;Elevated trust for documentation after 3-month track record&quot;</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 my-6">
            <h3 className="text-gray-300 mt-0">Work Style</h3>
            <p>
              Behavioral patterns observed over time. How does the agent approach problems?
              Does it ask clarifying questions or dive in? Does it produce detailed plans
              or iterate quickly? Work style is inferred from memory patterns, not configured.
            </p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li>&quot;Tends to break large tasks into subtasks before starting&quot;</li>
              <li>&quot;Asks for confirmation before destructive operations&quot;</li>
              <li>&quot;Produces working code on first attempt 78% of the time&quot;</li>
              <li>&quot;Prefers incremental commits over large PRs&quot;</li>
            </ul>
          </div>

          <h2>Identity Lifecycle</h2>

          <p>
            Agent identity follows a natural lifecycle from creation through maturity. Like
            a new employee, an agent starts with minimal identity and builds it over time.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Phase 1: BOOTSTRAP
  │  Agent is created with base configuration
  │  No memories → no identity beyond defaults
  │  Trust starts at baseline (0.5)
  │
Phase 2: LEARNING
  │  First interactions build initial memories
  │  Capabilities discovered through tool use
  │  Preferences learned from user feedback
  │  Trust begins accumulating from task outcomes
  │
Phase 3: ESTABLISHED
  │  Rich identity across all four layers
  │  Trust scores reflect real track record
  │  Work style patterns are stable
  │  Identity informs delegation decisions
  │
Phase 4: EVOLVED
     Identity continues adapting
     Old patterns decay if not reinforced
     New capabilities can be added at any time
     Trust remains dynamic — never permanent`}
          </pre>

          <h3>Identity Assembly</h3>
          <p>
            When Engram needs to describe an agent&apos;s identity (for delegation decisions,
            context loading, or the dashboard), it assembles the identity from memory:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`async assembleIdentity(agentId: string): Promise<AgentIdentity> {
  const capabilities = await this.queryLayer(agentId, 'CAPABILITY');
  const preferences  = await this.queryLayer(agentId, 'PREFERENCE');
  const trustScores  = await this.trustService.getScores(agentId);
  const workPatterns = await this.inferWorkStyle(agentId);

  return {
    agentId,
    capabilities: capabilities.map(toCapabilityProfile),
    preferences:  preferences.map(toPreferenceProfile),
    trust:        trustScores,
    workStyle:    workPatterns,
    maturity:     this.calculateMaturity(agentId),
    lastUpdated:  new Date(),
  };
}`}
          </pre>

          <h2>Identity vs. Configuration</h2>

          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Traditional (Config)</th>
                <th>Engram (Memory-Based)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Source</td>
                <td>Static YAML/JSON file</td>
                <td>Accumulated memories</td>
              </tr>
              <tr>
                <td>Updates</td>
                <td>Manual edits, redeploy</td>
                <td>Automatic from interactions</td>
              </tr>
              <tr>
                <td>Trust</td>
                <td>Binary (allowed/denied)</td>
                <td>Continuous score, domain-specific</td>
              </tr>
              <tr>
                <td>Capabilities</td>
                <td>Declared upfront</td>
                <td>Discovered through use</td>
              </tr>
              <tr>
                <td>Preferences</td>
                <td>Hardcoded in prompt</td>
                <td>Learned from feedback</td>
              </tr>
              <tr>
                <td>Portability</td>
                <td>Copy the config file</td>
                <td>Sync via cloud (identity travels with memories)</td>
              </tr>
            </tbody>
          </table>

          <h2>Schema</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model AgentIdentity {
  id              String   @id @default(cuid())
  agentId         String   @unique
  
  // Computed from memories
  capabilities    Json     // CapabilityProfile[]
  preferences     Json     // PreferenceProfile[]
  trustScores     Json     // Record<domain, TrustScore>
  workStyle       Json     // WorkStyleProfile
  
  // Lifecycle
  maturityPhase   String   // BOOTSTRAP | LEARNING | ESTABLISHED | EVOLVED
  memoryCount     Int      // Total memories contributing to identity
  firstMemoryAt   DateTime
  lastMemoryAt    DateTime
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  agent           Agent    @relation(fields: [agentId], references: [id])
}

interface CapabilityProfile {
  domain:       string;    // e.g. "typescript", "devops", "writing"
  proficiency:  number;    // 0.0–1.0
  taskCount:    number;    // Tasks completed in this domain
  successRate:  number;    // Fraction of successful outcomes
  lastUsed:     Date;
}

interface TrustScore {
  domain:       string;
  score:        number;    // 0.0–1.0, time-decayed
  evidence:     number;    // Number of trust-relevant events
  trend:        'rising' | 'stable' | 'declining';
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Let identity emerge naturally.</strong> Resist the urge to manually
              configure every aspect of an agent&apos;s identity. The best identities are
              built through real interaction.
            </li>
            <li>
              <strong>Seed capabilities, don&apos;t assume them.</strong> When creating a new
              agent, provide initial capability hints (e.g., &quot;has access to GitHub
              API&quot;) but let proficiency scores emerge from actual use.
            </li>
            <li>
              <strong>Review identity periodically.</strong> The dashboard shows each
              agent&apos;s assembled identity. Check it periodically to ensure the emergent
              identity matches your expectations.
            </li>
            <li>
              <strong>Trust the decay.</strong> If an agent hasn&apos;t demonstrated a
              capability recently, its proficiency score naturally declines. This is by design —
              stale capabilities shouldn&apos;t drive delegation decisions.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
