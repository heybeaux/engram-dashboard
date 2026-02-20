'use client';

import Link from 'next/link';

export default function IdentityConceptPage() {
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
            In Engram, identity isn&apos;t a static profile — it&apos;s a living construct that
            emerges from accumulated memories. An agent&apos;s identity is <strong>who it becomes</strong> through
            every interaction, preference, and learned behavior.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Identity is memory, crystallized.</strong> Rather than hardcoding agent
              personalities or capabilities, Engram lets identity emerge organically from the
              memories an agent accumulates over time.
            </p>
          </div>

          <h2>What Is Agent Identity?</h2>

          <p>
            Every agent in Engram develops an identity — a structured understanding of its own
            capabilities, preferences, trust relationships, and work patterns. This identity is
            not configured once and forgotten; it evolves as the agent works, learns, and
            interacts with users and other agents.
          </p>

          <p>
            Think of it like a new employee joining a team. On day one, they have a resume
            (initial capabilities) but no institutional knowledge. Over weeks and months, they
            develop preferences for how they work, build trust with colleagues, and establish
            patterns. Engram&apos;s identity framework captures this same organic growth — but
            for AI agents.
          </p>

          <h2>Identity Layers</h2>

          <p>
            Agent identity is composed of four interconnected layers, each capturing a different
            dimension of &quot;who this agent is.&quot;
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                      AGENT IDENTITY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CAPABILITIES                                               │
│  ├─ What the agent can do                                   │
│  ├─ Tools and integrations it has access to                 │
│  ├─ Domains of expertise (learned over time)                │
│  └─ Confidence levels per capability                        │
│                                                              │
│  PREFERENCES                                                │
│  ├─ How the agent prefers to work                           │
│  ├─ Communication style (concise vs. detailed)              │
│  ├─ Preferred tools and approaches                          │
│  └─ Learned from user feedback and reinforcement            │
│                                                              │
│  TRUST                                                      │
│  ├─ Who the agent trusts (and how much)                     │
│  ├─ Trust scores per relationship                           │
│  ├─ History of delegations and outcomes                     │
│  └─ Time-decayed — trust fades without reinforcement        │
│                                                              │
│  WORK STYLE                                                 │
│  ├─ Patterns in how the agent operates                      │
│  ├─ Response time tendencies                                │
│  ├─ Error handling preferences                              │
│  └─ Collaboration patterns with other agents                │
│                                                              │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <h3>Capabilities</h3>
          <p>
            The capabilities layer tracks what an agent can do. Initially seeded from
            configuration (available tools, API access, model capabilities), it grows as the
            agent demonstrates proficiency in new areas. An agent that successfully handles
            database migrations ten times develops a high confidence score for that capability.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`{
  "capabilities": {
    "code_review": { "confidence": 0.92, "lastUsed": "2026-02-18" },
    "database_migration": { "confidence": 0.87, "lastUsed": "2026-02-15" },
    "api_design": { "confidence": 0.78, "lastUsed": "2026-02-10" },
    "frontend_styling": { "confidence": 0.45, "lastUsed": "2026-01-20" }
  }
}`}
          </pre>

          <h3>Preferences</h3>
          <p>
            Preferences capture <em>how</em> the agent likes to work. These emerge from
            reinforcement — when a user says &quot;I like how you explained that&quot; or
            &quot;too verbose, keep it shorter,&quot; those signals shape the agent&apos;s
            communication style over time.
          </p>
          <ul>
            <li><strong>Communication style</strong> — verbose vs. concise, formal vs. casual</li>
            <li><strong>Tool preferences</strong> — which tools it reaches for first</li>
            <li><strong>Approach patterns</strong> — ask-first vs. act-first, cautious vs. bold</li>
            <li><strong>Output format</strong> — structured data vs. prose, with examples vs. without</li>
          </ul>

          <h3>Trust</h3>
          <p>
            The trust layer maps relationships with users and other agents. Trust is earned
            through successful interactions and decays over time without reinforcement. See the{' '}
            <Link href="/docs/concepts/trust" className="text-purple-400 hover:text-purple-300">
              Trust Model
            </Link>{' '}
            page for the full scoring system.
          </p>

          <h3>Work Style</h3>
          <p>
            Work style captures operational patterns — how the agent tends to approach tasks,
            its typical response times, how it handles errors, and its collaboration patterns.
            This layer helps Engram match agents to tasks they&apos;re well-suited for during
            delegation.
          </p>

          <h2>How Identity Emerges</h2>

          <p>
            Identity isn&apos;t assigned — it <strong>emerges</strong> from the accumulation
            of memories in the identity layer. Here&apos;s how:
          </p>

          <ol>
            <li>
              <strong>Initial seed.</strong> When an agent is created, it starts with a minimal
              identity: its name, model, and configured capabilities. This is the &quot;resume.&quot;
            </li>
            <li>
              <strong>Interaction accumulation.</strong> Every interaction generates memories.
              Preferences, feedback, and outcomes are stored in the identity layer with
              appropriate types (PREFERENCE, FACT, CONSTRAINT).
            </li>
            <li>
              <strong>Pattern crystallization.</strong> The Awareness system periodically scans
              identity-layer memories and detects patterns. Repeated behaviors become recognized
              traits. A series of &quot;user preferred concise answers&quot; events crystallizes
              into a PREFERENCE memory.
            </li>
            <li>
              <strong>Active reinforcement.</strong> When identity memories are retrieved and
              used successfully, their effective scores increase. Traits that prove useful
              strengthen; unused ones fade.
            </li>
          </ol>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Timeline of Identity Emergence:

Day 1:   Agent created → minimal identity (name, model, tools)
Day 7:   15 interactions → preferences begin forming
Day 30:  100+ interactions → stable communication style
Day 60:  Trust relationships established with regular users
Day 90:  Work style patterns recognized by Awareness
Day 180: Rich, multi-dimensional identity — the agent "knows itself"`}
          </pre>

          <h2>Identity Lifecycle</h2>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 my-6">
            <h3 className="text-gray-300 mt-0">Birth → Growth → Maturity → Evolution</h3>
            <p className="mb-0">
              Agent identity follows a natural lifecycle. New agents are like new hires —
              capable but generic. Over time, they develop distinctive personalities and
              working styles that make them uniquely suited to their roles.
            </p>
          </div>

          <h3>Birth</h3>
          <p>
            A new agent starts with a seed identity: its configured name, model, available
            tools, and any explicitly set preferences. The identity layer is mostly empty.
          </p>

          <h3>Growth</h3>
          <p>
            Through interactions, the agent accumulates identity memories. The Awareness
            system begins detecting patterns and generating INSIGHT memories that describe
            the agent&apos;s emerging traits.
          </p>

          <h3>Maturity</h3>
          <p>
            After sufficient interactions (typically 50–100), the agent has a stable identity.
            Its preferences are well-established, trust relationships are mapped, and work
            style patterns are recognized. Context assembly reliably surfaces the right
            identity memories.
          </p>

          <h3>Evolution</h3>
          <p>
            Identity is never static. As users change, projects shift, and new capabilities
            are added, the agent&apos;s identity evolves. Old preferences that stop being
            reinforced naturally decay, making room for new ones. This prevents identity
            from becoming stale.
          </p>

          <h2>Identity and Context Assembly</h2>

          <p>
            When Engram assembles context for an agent, identity memories get the largest
            token budget (800 tokens in the default configuration). This ensures the agent
            always knows &quot;who it is&quot; before processing any request.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Context Assembly Priority:

1. IDENTITY layer (800 tokens)
   ├─ CONSTRAINTS first (reserved 200 tokens)
   ├─ PREFERENCES next
   └─ FACTS last

2. PROJECT layer (600 tokens)
3. SESSION layer (400 tokens)

The agent's identity is ALWAYS present in context,
ensuring consistent behavior across sessions.`}
          </pre>

          <h2>Multi-Agent Identity</h2>

          <p>
            In multi-agent systems, each agent maintains its own identity. This enables
            specialization — one agent might develop an identity as a meticulous code reviewer
            while another becomes known for quick, creative brainstorming. The delegation
            system uses identity information to match tasks to the best-suited agent.
          </p>

          <ul>
            <li>
              <strong>Identity isolation.</strong> Each agent&apos;s identity memories are
              scoped to that agent. One agent&apos;s preferences don&apos;t leak into another&apos;s.
            </li>
            <li>
              <strong>Cross-agent trust.</strong> Trust relationships between agents are stored
              in each agent&apos;s identity layer, enabling informed delegation decisions.
            </li>
            <li>
              <strong>Identity-aware routing.</strong> The delegation system considers agent
              identities when choosing who to assign tasks to, matching capability confidence
              scores to task requirements.
            </li>
          </ul>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model AgentIdentity {
  id              String   @id
  agentId         String   @unique
  displayName     String
  modelProvider   String
  modelName       String
  
  // Identity layers (stored as structured JSON)
  capabilities    Json     // { capability: { confidence, lastUsed } }
  preferences     Json     // { dimension: value }
  workStyle       Json     // { pattern: frequency }
  
  // Metadata
  interactionCount Int     @default(0)
  maturityScore    Float   @default(0.0)  // 0.0 = newborn, 1.0 = mature
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relationships
  agent           Agent    @relation(fields: [agentId], references: [id])
  trustScores     TrustScore[]
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Let identity emerge naturally.</strong> Resist the urge to pre-configure
              every aspect of an agent&apos;s identity. The most authentic identities come from
              real interactions.
            </li>
            <li>
              <strong>Seed critical constraints early.</strong> While preferences should emerge,
              safety constraints (like &quot;never execute destructive commands without
              confirmation&quot;) should be seeded at creation time.
            </li>
            <li>
              <strong>Monitor maturity scores.</strong> The dashboard shows each agent&apos;s
              maturity score. Agents below 0.3 are still forming their identity and may behave
              inconsistently.
            </li>
            <li>
              <strong>Use identity for delegation.</strong> When delegating tasks, let the
              system match tasks to agents based on capability confidence scores rather than
              hardcoded routing rules.
            </li>
            <li>
              <strong>Review identity periodically.</strong> Check the dashboard to see what
              identity your agents have developed. You might be surprised — and you can always
              pin or correct memories that don&apos;t fit.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
