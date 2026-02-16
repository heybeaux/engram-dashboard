'use client';

import Link from 'next/link';

export default function IntroductionPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Introduction to Engram</h1>
          
          <p className="text-xl text-gray-300 lead">
            Engram is a memory storage and retrieval system for AI agents. It gives agents 
            persistent, semantic, layered memory — so they can remember who you are across sessions.
          </p>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 my-8">
            <p className="text-gray-300 italic m-0">
              &quot;Every agent on the planet wakes up blank. If we can solve memory — really solve it — 
              we&apos;re building infrastructure for agent consciousness.&quot;
            </p>
          </div>

          <h2>The Problem</h2>
          <p>
            AI agents have a fundamental limitation: they forget everything between sessions. 
            Every conversation starts from zero. They don&apos;t remember your preferences, your 
            projects, your family, or even their own mistakes.
          </p>
          <p>
            Current solutions (RAG, vector databases) treat memory as document retrieval. 
            But human memory isn&apos;t a filing cabinet — it&apos;s associative, emotional, layered, 
            and constantly consolidating.
          </p>

          <h2>What Engram Does</h2>
          
          <h3>1. Structured Extraction</h3>
          <p>
            Every memory is automatically processed to extract:
          </p>
          <ul>
            <li><strong>5W1H</strong>: Who, What, When, Where, Why, How</li>
            <li><strong>Entities</strong>: People, places, projects, concepts</li>
            <li><strong>Memory Type</strong>: CONSTRAINT, PREFERENCE, FACT, TASK, EVENT</li>
            <li><strong>Importance</strong>: Scored for relevance</li>
          </ul>

          <h3>2. Layered Organization</h3>
          <p>
            Memories are organized into layers based on permanence and scope:
          </p>
          <ul>
            <li><strong>IDENTITY</strong>: Who you are (never decays) — preferences, relationships, facts about you</li>
            <li><strong>PROJECT</strong>: What you&apos;re working on (60-day half-life) — goals, context, decisions</li>
            <li><strong>SESSION</strong>: Recent context (14-day half-life) — conversations, tasks, events</li>
            <li><strong>TASK</strong>: Ephemeral (3-day half-life) — immediate todos, reminders</li>
          </ul>

          <h3>3. Semantic Retrieval</h3>
          <p>
            Memories are embedded as vectors and retrieved by meaning, not keywords. 
            Ask &quot;what does Beaux like?&quot; and get preferences across all layers.
          </p>

          <h3>4. Memory Intelligence</h3>
          <p>
            Engram v2 adds intelligent memory management:
          </p>
          <ul>
            <li><strong>Effective Score</strong>: Dynamic importance combining decay, novelty, usage, and safety</li>
            <li><strong>Safety Detection</strong>: Allergies, medications, emergency contacts never fade</li>
            <li><strong>Sleep Consolidation</strong>: Similar memories compressed into essential facts</li>
          </ul>

          <h2>Key Concepts</h2>

          <h3>Memory Types</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Priority</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CONSTRAINT</td>
                <td>1 (highest)</td>
                <td>&quot;Beaux is allergic to shellfish&quot;</td>
              </tr>
              <tr>
                <td>PREFERENCE</td>
                <td>2</td>
                <td>&quot;Beaux prefers dark mode&quot;</td>
              </tr>
              <tr>
                <td>TASK</td>
                <td>2</td>
                <td>&quot;Review PR by Friday&quot;</td>
              </tr>
              <tr>
                <td>FACT</td>
                <td>3</td>
                <td>&quot;Beaux lives in Powell River&quot;</td>
              </tr>
              <tr>
                <td>EVENT</td>
                <td>4 (lowest)</td>
                <td>&quot;We discussed the roadmap today&quot;</td>
              </tr>
            </tbody>
          </table>

          <h3>Agent Self-Memory</h3>
          <p>
            Agents can store memories about themselves — their identity, lessons learned, 
            capabilities, and working style. This enables continuity across sessions.
          </p>

          <h2>Architecture Overview</h2>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│                        Engram API                           │
├─────────────────────────────────────────────────────────────┤
│  /v1/memories     - CRUD operations                         │
│  /v1/observe      - Auto-extract from conversations         │
│  /v1/context      - Load memories for injection             │
│  /v1/consolidation/dream-cycle  - Trigger consolidation     │
│  /v1/health       - System health metrics                   │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Extraction    │  │   Embedding     │  │   Intelligence  │
│   Service       │  │   Service       │  │   Services      │
│                 │  │                 │  │                 │
│  • 5W1H         │  │  • OpenAI       │  │  • Scoring      │
│  • Entities     │  │  • Ollama       │  │  • Safety       │
│  • Type Class.  │  │  • pgvector     │  │  • Consolidate  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  + pgvector     │
                    └─────────────────┘`}
          </pre>

          <h2>Getting Started</h2>
          <p>
            Ready to give your agent a memory?
          </p>
          <div className="flex gap-4 mt-6">
            <Link 
              href="/docs/quickstart" 
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors no-underline"
            >
              Quick Start →
            </Link>
            <Link 
              href="/docs/api" 
              className="px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors no-underline"
            >
              API Reference
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
