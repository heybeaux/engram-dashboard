'use client';

import Link from 'next/link';

export default function ExtractionPipelinePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Extraction Pipeline</h1>

          <p className="text-xl text-gray-300">
            Every memory in Engram passes through an extraction pipeline that transforms raw
            conversation text into structured, searchable, and semantically rich memory records.
            This page explains how that pipeline works — from ingestion to vector storage.
          </p>

          <h2>Pipeline Overview</h2>
          <p>
            When a conversation turn or explicit memory reaches Engram, it flows through
            a multi-stage pipeline. Each stage enriches the data, making it more useful
            for future retrieval.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌──────────────────────────────────────────────────────────────────────┐
│                      EXTRACTION PIPELINE                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────────┐     ┌───────────────────┐  │
│  │ Conversation │ ──▶ │  POST /v1/       │ ──▶ │  Deduplication    │  │
│  │    Turn      │     │  memories        │     │  Check            │  │
│  └─────────────┘     └─────────────────┘     └────────┬──────────┘  │
│                                                        │             │
│                                              ┌─────────▼──────────┐  │
│                                              │  LLM Extraction    │  │
│                                              │  ┌──────────────┐  │  │
│                                              │  │ 5W1H Parse   │  │  │
│                                              │  │ Type Classify │  │  │
│                                              │  │ Entity Detect │  │  │
│                                              │  └──────────────┘  │  │
│                                              └─────────┬──────────┘  │
│                                                        │             │
│                       ┌────────────────────────────────┼──────┐      │
│                       │                                │      │      │
│              ┌────────▼───────┐  ┌─────────────▼──┐  ┌▼────────────┐│
│              │ Memory Record  │  │   Embedding    │  │   Entity    ││
│              │ + Extraction   │  │   Generation   │  │   Linking   ││
│              └────────┬───────┘  └───────┬────────┘  └──────┬──────┘│
│                       │                  │                   │       │
│                       └──────────────────┼───────────────────┘       │
│                                          │                           │
│                               ┌──────────▼──────────┐               │
│                               │    PostgreSQL +      │               │
│                               │    pgvector Store    │               │
│                               └─────────────────────┘               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>Stage 1: Ingestion</h2>
          <p>
            Memories enter Engram through the REST API. The most common entry points are:
          </p>
          <ul>
            <li>
              <strong>POST /v1/memories</strong> — Store a single memory from a conversation
              turn or explicit statement
            </li>
            <li>
              <strong>POST /v1/memories/batch</strong> — Import multiple memories at once
              (e.g., replaying conversation history)
            </li>
          </ul>
          <p>
            Both endpoints accept raw text along with optional metadata like{' '}
            <code>layer</code>, <code>importanceHint</code>, and context IDs for
            project/session association.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories
Headers:
  X-AM-API-Key: eg_sk_your_key_here
  X-AM-User-ID: user_123

{
  "raw": "I'm deathly allergic to peanuts and I take metformin twice daily",
  "layer": "IDENTITY",
  "importanceHint": "CRITICAL"
}`}
          </pre>

          <h2>Stage 2: Deduplication Check</h2>
          <p>
            Before creating a new memory, Engram checks for semantic duplicates to avoid
            storing the same information multiple times.
          </p>

          <h3>How It Works</h3>
          <ol>
            <li>
              <strong>Generate embedding</strong> — The raw text is converted into a vector
              embedding using the configured embedding model
            </li>
            <li>
              <strong>Similarity search</strong> — The embedding is compared against existing
              memories using cosine similarity via pgvector
            </li>
            <li>
              <strong>Threshold check</strong> — If a match is found with similarity{' '}
              <code>&gt;0.90</code>, the existing memory is reinforced instead of creating a
              duplicate
            </li>
          </ol>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`┌─────────────────────────────────────────────────────────────┐
│ Deduplication Decision                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  New memory: "I prefer dark mode"                           │
│       │                                                     │
│       ▼                                                     │
│  Generate embedding → [0.12, -0.34, 0.56, ...]             │
│       │                                                     │
│       ▼                                                     │
│  Search existing memories (cosine similarity)               │
│       │                                                     │
│       ├─ Found: "User prefers dark mode" (sim: 0.94)        │
│       │  → DUPLICATE: Reinforce existing, return early      │
│       │                                                     │
│       └─ No match above 0.90                                │
│          → UNIQUE: Continue to extraction                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘`}
          </pre>

          <p>
            Reinforcement updates the existing memory&apos;s <code>retrievalCount</code> and{' '}
            <code>lastRetrievedAt</code>, boosting its effective score without creating
            redundant entries.
          </p>

          <h2>Stage 3: LLM Extraction (5W1H)</h2>
          <p>
            The core of the pipeline. Engram sends the raw text to a configured LLM
            provider (OpenAI, Anthropic, or Ollama) with a structured extraction prompt.
            The LLM returns a 5W1H decomposition plus classification metadata — all in
            a <strong>single API call</strong>.
          </p>

          <h3>The 5W1H Framework</h3>
          <p>
            Every memory is decomposed into six dimensions. This structured representation
            enables precise semantic search and contextual retrieval.
          </p>

          <table>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Field</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Who</strong></td>
                <td><code>who</code></td>
                <td>The subject — who the memory is about</td>
                <td>&quot;Beaux&quot;</td>
              </tr>
              <tr>
                <td><strong>What</strong></td>
                <td><code>what</code></td>
                <td>The action, state, or preference</td>
                <td>&quot;is allergic to peanuts&quot;</td>
              </tr>
              <tr>
                <td><strong>When</strong></td>
                <td><code>when</code></td>
                <td>Temporal anchor (absolute or relative)</td>
                <td>&quot;daily&quot;, &quot;2026-02-05&quot;</td>
              </tr>
              <tr>
                <td><strong>Where</strong></td>
                <td><code>whereCtx</code></td>
                <td>Location or context where it applies</td>
                <td>&quot;at home office&quot;</td>
              </tr>
              <tr>
                <td><strong>Why</strong></td>
                <td><code>why</code></td>
                <td>Reason or motivation behind it</td>
                <td>&quot;for better readability&quot;</td>
              </tr>
              <tr>
                <td><strong>How</strong></td>
                <td><code>how</code></td>
                <td>Method, manner, or details</td>
                <td>&quot;using Ollama locally&quot;</td>
              </tr>
            </tbody>
          </table>

          <h3>Classification (Same LLM Call)</h3>
          <p>
            In the same extraction call, the LLM also classifies the memory into one of
            five types. This classification drives the priority-based retrieval system
            described in the{' '}
            <Link href="/docs/architecture" className="text-purple-400 hover:text-purple-300">
              Architecture
            </Link>{' '}
            docs.
          </p>

          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Priority</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>CONSTRAINT</code></td>
                <td>1 (highest)</td>
                <td>Safety-critical rules that must never be violated</td>
                <td>&quot;Allergic to shellfish&quot;</td>
              </tr>
              <tr>
                <td><code>PREFERENCE</code></td>
                <td>2</td>
                <td>Personal preferences about how things should be done</td>
                <td>&quot;Prefers dark mode&quot;</td>
              </tr>
              <tr>
                <td><code>TASK</code></td>
                <td>2</td>
                <td>Actionable items with deadlines</td>
                <td>&quot;Review PR #123 by Friday&quot;</td>
              </tr>
              <tr>
                <td><code>FACT</code></td>
                <td>3</td>
                <td>Stable information about the user or their world</td>
                <td>&quot;Lives in Vancouver&quot;</td>
              </tr>
              <tr>
                <td><code>EVENT</code></td>
                <td>4 (lowest)</td>
                <td>Things that happened — conversational moments</td>
                <td>&quot;Met with design team yesterday&quot;</td>
              </tr>
            </tbody>
          </table>

          <p>
            Classification is <strong>LLM-based, not regex</strong>. The LLM understands
            nuance: &quot;I&apos;m allergic to peanuts&quot; is a <code>CONSTRAINT</code>,
            while &quot;I don&apos;t like peanuts&quot; is a <code>PREFERENCE</code>. This
            distinction is critical for safety — constraints are never evicted from context.
          </p>

          <h3>Confidence Scoring</h3>
          <p>
            Each extraction field includes a confidence score from 0.0 to 1.0:
          </p>
          <ul>
            <li><strong>1.0</strong> — Explicitly stated in the text</li>
            <li><strong>0.7–0.9</strong> — Strongly implied</li>
            <li><strong>0.4–0.6</strong> — Inferred from context</li>
            <li><strong>0.1–0.3</strong> — Guessed / low certainty</li>
          </ul>
          <p>
            If <code>typeConfidence &lt; 0.7</code>, the memory defaults to{' '}
            <code>FACT</code> (safe middle ground) and is flagged for human review
            in the dashboard.
          </p>

          <h2>Stage 4: Entity Recognition &amp; Linking</h2>
          <p>
            During extraction, the LLM also identifies named entities — people, places,
            projects, and concepts. These are normalized and stored in a dedicated entity
            table, then linked to the memory via a junction table.
          </p>

          <h3>Entity Model</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Entity {
  id             String   @id
  userId         String   // Scoped to user
  name           String   // Display name: "Beaux"
  type           String   // "PERSON", "PLACE", "PROJECT", etc.
  normalizedName String   // Lowercase deduplication key: "beaux"
  createdAt      DateTime
  updatedAt      DateTime
  memories       MemoryEntity[]

  @@unique([userId, normalizedName, type])
}

model MemoryEntity {
  id       String @id
  memoryId String
  entityId String

  @@unique([memoryId, entityId])
}`}
          </pre>

          <h3>Entity Linking Process</h3>
          <ol>
            <li>
              <strong>Detection</strong> — LLM identifies entities in the raw text
              (e.g., &quot;Beaux&quot;, &quot;Powell River&quot;, &quot;Engram&quot;)
            </li>
            <li>
              <strong>Normalization</strong> — Names are lowercased and trimmed to create
              a <code>normalizedName</code> key
            </li>
            <li>
              <strong>Upsert</strong> — If an entity with the same{' '}
              <code>(userId, normalizedName, type)</code> already exists, the existing record
              is reused. Otherwise a new entity is created
            </li>
            <li>
              <strong>Link</strong> — A <code>MemoryEntity</code> junction record connects
              the memory to each entity
            </li>
          </ol>
          <p>
            This enables powerful queries like &quot;show me everything related to
            Beaux&quot; or &quot;what do I know about the Engram project?&quot; by
            traversing entity relationships.
          </p>

          <h2>Stage 5: Embedding &amp; Storage</h2>
          <p>
            The final stage persists everything to PostgreSQL with pgvector:
          </p>
          <ol>
            <li>
              <strong>Memory record</strong> — Created with raw text, layer, type,
              priority, and computed importance scores
            </li>
            <li>
              <strong>MemoryExtraction record</strong> — Stores the 5W1H fields,
              classification, and confidence scores
            </li>
            <li>
              <strong>Embedding vector</strong> — Stored directly in the memory row
              using pgvector&apos;s <code>vector</code> type for cosine similarity search
            </li>
            <li>
              <strong>Entity links</strong> — Created or reused via the junction table
            </li>
            <li>
              <strong>Chain links</strong> — If the memory updates, supports, or
              contradicts an existing memory, a <code>MemoryChainLink</code> is created
            </li>
          </ol>

          <h2>MemoryExtraction Schema</h2>
          <p>
            The full extraction model as stored in the database:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model MemoryExtraction {
  id             String      @id
  memoryId       String      @unique

  // 5W1H structured fields
  who            String?     // Subject: "Beaux"
  what           String?     // Action/state: "is allergic to peanuts"
  when           DateTime?   // Temporal: 2026-02-05T00:00:00Z
  whereCtx       String?     // Location: "at work"
  why            String?     // Reason: "medical condition"
  how            String?     // Method: "carries an EpiPen"
  topics         String[]    // Tags: ["health", "allergies", "safety"]

  // LLM classification
  memoryType     MemoryType? // CONSTRAINT, PREFERENCE, FACT, TASK, EVENT
  typeConfidence Float?      // 0.0-1.0

  // Field-level confidence scores
  whoConfidence   Float?     // 1.0 = explicit, 0.4 = inferred
  whatConfidence  Float?
  whenConfidence  Float?
  whereConfidence Float?
  whyConfidence   Float?
  howConfidence   Float?

  // Audit data
  rawJson        Json?       // Full LLM response for debugging
  extractedAt    DateTime    // When extraction ran
  model          String?     // Which LLM model was used
}`}
          </pre>

          <h2>Example: Raw Input → Extracted Memories</h2>
          <p>
            Here&apos;s a concrete example showing how a single conversation turn produces
            structured memory data.
          </p>

          <h3>Raw Conversation Turn</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`User: "I work from home in Powell River, BC. I'm a freelance developer 
       and I absolutely need my large oat milk latte before I can 
       function in the morning. Oh, and I'm deathly allergic to peanuts."`}
          </pre>

          <h3>Extracted Memories</h3>
          <p>
            The LLM breaks this into multiple distinct memories, each with its own
            extraction and classification:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Memory 1: "Works from home in Powell River, BC"
───────────────────────────────────────────────
  Extraction:
    who:    "User"
    what:   "works from home"
    where:  "Powell River, BC"
    when:   null
    why:    null
    how:    "remotely"
    topics: ["work", "location", "remote"]
  Classification:
    memoryType:     FACT
    typeConfidence: 0.95
    priority:       3
  Entities:
    → "Powell River" (PLACE)

Memory 2: "Is a freelance developer"
───────────────────────────────────────────────
  Extraction:
    who:    "User"
    what:   "is a freelance developer"
    where:  null
    when:   null
    why:    null
    how:    null
    topics: ["career", "development", "freelance"]
  Classification:
    memoryType:     FACT
    typeConfidence: 0.93
    priority:       3

Memory 3: "Needs a large oat milk latte every morning"
───────────────────────────────────────────────
  Extraction:
    who:    "User"
    what:   "needs a large oat milk latte"
    where:  null
    when:   "every morning"
    why:    "can't function without it"
    how:    null
    topics: ["coffee", "preferences", "routine"]
  Classification:
    memoryType:     PREFERENCE
    typeConfidence: 0.92
    priority:       2
  Entities:
    → "oat milk latte" (CONCEPT)

Memory 4: "Deathly allergic to peanuts"
───────────────────────────────────────────────
  Extraction:
    who:    "User"
    what:   "is deathly allergic to peanuts"
    where:  null
    when:   null
    why:    "medical condition"
    how:    null
    topics: ["health", "allergies", "safety"]
  Classification:
    memoryType:     CONSTRAINT
    typeConfidence: 0.98
    priority:       1
    safetyCritical: true`}
          </pre>

          <p>
            Notice how the peanut allergy is classified as <code>CONSTRAINT</code> with
            priority 1 and flagged as <code>safetyCritical</code>. This memory will{' '}
            <strong>never</strong> be evicted from context, no matter how many other
            memories accumulate.
          </p>

          <h2>Deduplication &amp; Similarity</h2>
          <p>
            Engram uses a multi-layered approach to prevent redundant memories:
          </p>

          <h3>Semantic Deduplication</h3>
          <p>
            At ingestion time, the embedding of the new memory is compared against all
            existing memories for the same user. Cosine similarity is computed via
            pgvector:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- pgvector cosine similarity search
SELECT id, raw, 1 - (embedding <=> $1) AS similarity
FROM memories
WHERE user_id = $2
  AND deleted_at IS NULL
ORDER BY embedding <=> $1
LIMIT 5;

-- Threshold: similarity > 0.90 = duplicate`}
          </pre>

          <table>
            <thead>
              <tr>
                <th>Similarity</th>
                <th>Action</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>&gt;0.90</code></td>
                <td>Duplicate — reinforce existing memory</td>
                <td>&quot;I like dark mode&quot; vs &quot;I prefer dark mode&quot;</td>
              </tr>
              <tr>
                <td><code>0.70–0.90</code></td>
                <td>Related — create and link via <code>RELATED</code> chain</td>
                <td>&quot;I like dark mode&quot; vs &quot;I prefer high contrast&quot;</td>
              </tr>
              <tr>
                <td><code>&lt;0.70</code></td>
                <td>Unique — create as new memory</td>
                <td>&quot;I like dark mode&quot; vs &quot;I work in Vancouver&quot;</td>
              </tr>
            </tbody>
          </table>

          <h3>Consolidation</h3>
          <p>
            Beyond real-time deduplication, Engram runs periodic consolidation jobs
            that cluster related memories and compress them:
          </p>
          <ul>
            <li>
              <strong>Post-session</strong> — After a conversation ends, session memories
              are analyzed for patterns and redundancies
            </li>
            <li>
              <strong>Nightly</strong> — Batch process to find cross-session patterns and
              promote recurring themes to higher layers
            </li>
            <li>
              <strong>Manual</strong> — Triggered via the dashboard for on-demand cleanup
            </li>
          </ul>

          <h3>Contradiction Detection</h3>
          <p>
            When a new memory contradicts an existing one (e.g., &quot;I prefer tea&quot;
            after previously storing &quot;I prefer coffee&quot;), the system:
          </p>
          <ol>
            <li>Creates the new memory as a <code>CORRECTION</code> source</li>
            <li>Marks the old memory as <code>superseded</code></li>
            <li>Creates a <code>CONTRADICTS</code> chain link between them</li>
            <li>Preserves both for audit history</li>
          </ol>

          <h2>Pipeline Configuration</h2>
          <p>
            The extraction pipeline is configurable via environment variables:
          </p>

          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>LLM_PROVIDER</code></td>
                <td><code>openai</code></td>
                <td>LLM for extraction: openai, anthropic, ollama</td>
              </tr>
              <tr>
                <td><code>LLM_MODEL</code></td>
                <td><code>gpt-4o-mini</code></td>
                <td>Specific model for extraction calls</td>
              </tr>
              <tr>
                <td><code>EMBEDDING_MODEL</code></td>
                <td><code>text-embedding-3-small</code></td>
                <td>Model for vector embeddings</td>
              </tr>
              <tr>
                <td><code>DEDUP_THRESHOLD</code></td>
                <td><code>0.90</code></td>
                <td>Cosine similarity threshold for deduplication</td>
              </tr>
              <tr>
                <td><code>VECTOR_PROVIDER</code></td>
                <td><code>pgvector</code></td>
                <td>Vector store: pgvector or pinecone</td>
              </tr>
            </tbody>
          </table>

          <h2>Cost Efficiency</h2>
          <p>
            A key design decision: <strong>extraction and classification happen in a single
            LLM call</strong>. Adding memory type classification to the existing 5W1H
            extraction prompt costs approximately 50 extra tokens — about $0.0001 per
            memory. There is no second API call for classification.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`Single LLM call returns:
{
  "who": "beaux",
  "what": "prefers large oat milk latte every morning",
  "where": null,
  "when": "daily",
  "confidence": 0.92,
  "topics": ["coffee", "preferences", "routine"],
  "memoryType": "PREFERENCE",       // ← Added ~50 tokens
  "typeConfidence": 0.95,            // ← to existing prompt
  "entities": [
    { "name": "oat milk latte", "type": "CONCEPT" }
  ]
}`}
          </pre>
        </article>
      </div>
    </div>
  );
}
