'use client';

import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Architecture</h1>
          
          <p className="text-xl text-gray-300">
            Engram is built as a NestJS application with PostgreSQL + pgvector for storage 
            and configurable LLM providers for extraction.
          </p>

          <h2>System Overview</h2>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────────────┐
│                           Engram API                                │
│                         (NestJS + REST)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Memory    │  │    Auto     │  │  Dashboard  │  │   Agent    │ │
│  │  Controller │  │  Controller │  │  Controller │  │ Controller │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │                │        │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐ │
│  │                        Service Layer                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │
│  │  │   Memory    │  │ Extraction  │  │     Intelligence        │ │ │
│  │  │   Service   │  │   Service   │  │  ┌─────────────────────┐│ │ │
│  │  │             │  │             │  │  │ ImportanceScorer   ││ │ │
│  │  │  • CRUD     │  │  • 5W1H     │  │  │ SafetyDetector     ││ │ │
│  │  │  • Query    │  │  • Entities │  │  │ Consolidation      ││ │ │
│  │  │  • Context  │  │  • Types    │  │  └─────────────────────┘│ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │
│  │  │  Embedding  │  │    LLM      │  │       Backfill          │ │ │
│  │  │   Service   │  │   Service   │  │       Service           │ │ │
│  │  │             │  │             │  │                         │ │ │
│  │  │  • Generate │  │  • OpenAI   │  │  • User Identity        │ │ │
│  │  │  • Search   │  │  • Anthropic│  │  • Extraction Repair    │ │ │
│  │  │  • Store    │  │  • Ollama   │  │  • Score Backfill       │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                       Data Layer                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │ │
│  │  │   Prisma    │  │  pgvector   │  │  Optional: Pinecone     │ │ │
│  │  │   Client    │  │  Provider   │  │       Provider          │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │      PostgreSQL         │
                    │    + pgvector ext       │
                    │                         │
                    │  • memories             │
                    │  • memory_extractions   │
                    │  • entities             │
                    │  • memory_chain_links   │
                    │  • agents               │
                    │  • users                │
                    └─────────────────────────┘`}
          </pre>

          <h2>Core Components</h2>

          <h3>MemoryService</h3>
          <p>The heart of Engram. Handles:</p>
          <ul>
            <li><strong>remember()</strong> — Create memories with automatic extraction</li>
            <li><strong>recall()</strong> — Semantic search using embeddings</li>
            <li><strong>loadContext()</strong> — Load memories for agent context injection</li>
            <li><strong>update()</strong> — Modify existing memories</li>
            <li><strong>delete()</strong> — Soft-delete memories</li>
          </ul>

          <h3>ExtractionService</h3>
          <p>Processes raw text into structured data:</p>
          <ul>
            <li><strong>5W1H extraction</strong> — Who, What, When, Where, Why, How</li>
            <li><strong>Entity recognition</strong> — People, places, projects, concepts</li>
            <li><strong>Type classification</strong> — CONSTRAINT, PREFERENCE, FACT, TASK, EVENT</li>
            <li><strong>Confidence scoring</strong> — How certain is the extraction</li>
          </ul>

          <h3>EmbeddingService</h3>
          <p>Handles vector operations:</p>
          <ul>
            <li><strong>generate()</strong> — Convert text to embedding vector</li>
            <li><strong>search()</strong> — Find similar memories by cosine similarity</li>
            <li><strong>store()</strong> — Persist embeddings to vector store</li>
          </ul>

          <h3>Intelligence Services</h3>
          <p>Memory Intelligence v2 features:</p>
          <ul>
            <li><strong>ImportanceScorerService</strong> — Compute effective scores with decay, novelty, usage</li>
            <li><strong>SafetyDetectorService</strong> — Detect allergies, medications, emergency info</li>
            <li><strong>ConsolidationService</strong> — Cluster and compress similar memories</li>
          </ul>

          <h2>Data Model</h2>

          <h3>Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Memory {
  id              String       @id
  userId          String       // Who owns this memory
  raw             String       // Original text
  layer           MemoryLayer  // IDENTITY, PROJECT, SESSION, TASK
  
  // Classification
  memoryType      MemoryType?  // CONSTRAINT, PREFERENCE, FACT, etc.
  typeConfidence  Float?
  priority        Int          // 1-4 (lower = more important)
  
  // Scoring
  importanceScore Float        // Base importance
  effectiveScore  Float        // Computed importance
  safetyCritical  Boolean      // Never evict
  
  // User controls
  userPinned      Boolean
  userHidden      Boolean
  
  // Relationships
  extraction      MemoryExtraction?
  entities        Entity[]
  chainLinks      MemoryChainLink[]
}`}
          </pre>

          <h3>MemoryExtraction</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model MemoryExtraction {
  memoryId        String    @unique
  who             String?   // Subject of the memory
  what            String?   // Action or state
  when            DateTime? // Temporal anchor
  whereCtx        String?   // Location context
  why             String?   // Reason or motivation
  how             String?   // Method or manner
  topics          String[]  // Extracted topics
  
  // Classification
  memoryType      MemoryType?
  typeConfidence  Float?
  
  // Metadata
  rawJson         Json?     // Full LLM response + audit data
}`}
          </pre>

          <h2>Request Flow</h2>

          <h3>Creating a Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/memories
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Check for duplicates (semantic deduplication)        │
│    - Generate embedding                                 │
│    - Search for similar (>0.90 similarity)              │
│    - If found: reinforce existing, return               │
├─────────────────────────────────────────────────────────┤
│ 2. Extract structure                                    │
│    - Call LLM for 5W1H + entities + type                │
│    - Parse and normalize response                       │
├─────────────────────────────────────────────────────────┤
│ 3. Compute scores                                       │
│    - Calculate importance score                         │
│    - Detect safety-critical content                     │
│    - Compute initial effective score                    │
├─────────────────────────────────────────────────────────┤
│ 4. Store                                                │
│    - Create Memory record                               │
│    - Create MemoryExtraction record                     │
│    - Store embedding in vector store                    │
│    - Create/link entities                               │
│    - Create related memory links                        │
├─────────────────────────────────────────────────────────┤
│ 5. Return created memory                                │
└─────────────────────────────────────────────────────────┘`}
          </pre>

          <h3>Loading Context</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/context
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Fetch candidates by layer                            │
│    - IDENTITY: ~44% of token budget                     │
│    - PROJECT: ~33% of budget (if projectId provided)    │
│    - SESSION: ~22% of budget (last 7 days)              │
├─────────────────────────────────────────────────────────┤
│ 2. Sort by effectiveScore DESC                          │
│    - Safety-critical first (never evicted)              │
│    - Then constraints                                   │
│    - Then by score                                      │
├─────────────────────────────────────────────────────────┤
│ 3. Select within budget                                 │
│    - Estimate tokens per memory                         │
│    - Fill until budget exhausted                        │
├─────────────────────────────────────────────────────────┤
│ 4. Format as context string                             │
│    - Group by layer                                     │
│    - Add headers                                        │
│    - Return with metadata                               │
└─────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>LLM Providers</h2>
          <p>Engram supports multiple LLM providers:</p>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Use Case</th>
                <th>Config</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OpenAI</td>
                <td>Default (GPT-4o-mini)</td>
                <td><code>OPENAI_API_KEY</code></td>
              </tr>
              <tr>
                <td>Anthropic</td>
                <td>Claude models</td>
                <td><code>ANTHROPIC_API_KEY</code></td>
              </tr>
              <tr>
                <td>Ollama</td>
                <td>Local models</td>
                <td><code>OLLAMA_URL</code></td>
              </tr>
              <tr>
                <td>LM Studio</td>
                <td>Local models</td>
                <td><code>LMSTUDIO_URL</code></td>
              </tr>
            </tbody>
          </table>

          <h2>Identity Module</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────────────┐
│                      IDENTITY MODULE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │
│  │  Identity       │     │  Trust           │     │  Delegation   │ │
│  │  Service        │     │  Service         │     │  Service      │ │
│  │                 │     │                  │     │               │ │
│  │  • assemble()   │←────│  • getScores()   │←────│  • create()   │ │
│  │  • refresh()    │     │  • record()      │     │  • assign()   │ │
│  │  • getProfile() │     │  • challenge()   │     │  • complete() │ │
│  │  • maturity()   │     │  • decay()       │     │  • escalate() │ │
│  └────────┬────────┘     └────────┬────────┘     └───────┬───────┘ │
│           │                       │                       │         │
│           └───────────┬───────────┴───────────┬───────────┘         │
│                       │                       │                     │
│                       ▼                       ▼                     │
│              ┌─────────────────┐     ┌─────────────────┐           │
│              │  Memory         │     │  Awareness       │           │
│              │  Service        │     │  Service         │           │
│              │                 │     │                  │           │
│              │  Stores trust   │     │  Monitors trust  │           │
│              │  signals and    │     │  changes and     │           │
│              │  identity data  │     │  generates       │           │
│              │  as memories    │     │  insights        │           │
│              └─────────────────┘     └─────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>Delegation Flow</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Delegator Agent                  Engram                    Delegate Agent
      │                            │                            │
      │  POST /v1/delegations      │                            │
      │  {task, criteria, domain}  │                            │
      ├───────────────────────────→│                            │
      │                            │  1. Validate contract      │
      │                            │  2. Query agent identities │
      │                            │  3. Match: trust ≥ min     │
      │                            │     + capability fit       │
      │                            │  4. Select best delegate   │
      │                            │                            │
      │                            │  ASSIGN                    │
      │                            ├───────────────────────────→│
      │                            │                            │
      │                            │         IN_PROGRESS        │
      │                            │←───────────────────────────┤
      │                            │                            │
      │                            │         REVIEW             │
      │                            │←───────────────────────────┤
      │                            │                            │
      │                            │  5. Check acceptance       │
      │                            │     criteria               │
      │                            │  6. Record outcome         │
      │                            │  7. Update trust score     │
      │                            │  8. Refresh identity       │
      │                            │                            │
      │      COMPLETED             │                            │
      │←───────────────────────────┤                            │
      │                            │                            │`}
          </pre>

          <h2>Sync Architecture</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────┐              ┌─────────────────────────┐
│   LOCAL INSTANCE        │              │   CLOUD SERVICE         │
│                         │              │                         │
│  ┌───────────────────┐  │   PUSH       │  ┌───────────────────┐  │
│  │ Memory Service    │──┼──────────────┼─→│ Cloud Memory Store │  │
│  └───────────────────┘  │              │  └───────────────────┘  │
│                         │              │                         │
│  ┌───────────────────┐  │   PULL       │  ┌───────────────────┐  │
│  │ Sync Service      │←─┼──────────────┼──│ Sync Service      │  │
│  │                   │  │              │  │                   │  │
│  │ • Cursor tracking │  │              │  │ • Cursor tracking │  │
│  │ • Conflict detect │  │  RECONCILE   │  │ • Conflict detect │  │
│  │ • Identity mapping│──┼──────────────┼──│ • Identity mapping│  │
│  └───────────────────┘  │              │  └───────────────────┘  │
│                         │              │                         │
│  ┌───────────────────┐  │              │  ┌───────────────────┐  │
│  │ Identity Map      │  │              │  │ Identity Map      │  │
│  │ local_id ↔ cloud  │  │              │  │ cloud_id ↔ local  │  │
│  └───────────────────┘  │              │  └───────────────────┘  │
└─────────────────────────┘              └─────────────────────────┘

Sync modes: push-only | pull-only | bidirectional
Conflict resolution: local-wins | cloud-wins | newest-wins | manual`}
          </pre>

          <h2>Identity Module</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌─────────────────────────────────────────────────────────────────────┐
│                       Identity Module                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  Identity       │  │  Trust          │  │  Delegation         │ │
│  │  Service        │  │  Service        │  │  Service            │ │
│  │                 │  │                 │  │                     │ │
│  │  • Agent CRUD   │  │  • Score calc   │  │  • Task lifecycle   │ │
│  │  • Capability   │  │  • Signal       │  │  • Contract mgmt   │ │
│  │    tracking     │  │    processing   │  │  • Template engine  │ │
│  │  • Preference   │  │  • Time decay   │  │  • Outcome tracking │ │
│  │    evolution    │  │  • Challenge    │  │  • Trust feedback   │ │
│  │  • Maturity     │  │    protocol    │  │                     │ │
│  │    scoring      │  │                 │  │                     │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘ │
│           │                    │                       │            │
│           └────────────────────┴───────────────────────┘            │
│                                │                                    │
│                    ┌───────────┴───────────┐                       │
│                    │   Awareness Service   │                       │
│                    │                       │                       │
│                    │  • Waking Cycle       │                       │
│                    │  • Signal collection  │                       │
│                    │  • Insight generation │                       │
│                    │  • Notifications      │                       │
│                    └───────────────────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>Delegation Flow</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Delegation Request Flow:

POST /v1/delegations
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Validate delegation contract                         │
│    - Check delegator permissions                        │
│    - Validate acceptance criteria                       │
│    - Apply template (if templateId provided)            │
├─────────────────────────────────────────────────────────┤
│ 2. Check delegate trust & capability                    │
│    - Load delegate's AgentIdentity                      │
│    - Verify capability confidence for task type         │
│    - Check trust score meets priority threshold         │
│    - Reject if below minimum trust for priority level   │
├─────────────────────────────────────────────────────────┤
│ 3. Create delegation record (status: PROPOSED)          │
│    - Store contract with criteria and deadline          │
│    - Link context memories                              │
│    - Notify delegate agent                              │
├─────────────────────────────────────────────────────────┤
│ 4. Await acceptance                                     │
│    - Delegate reviews and accepts/rejects               │
│    - On accept: status → ACTIVE                         │
│    - On reject: route to next best agent                │
├─────────────────────────────────────────────────────────┤
│ 5. Completion & trust feedback                          │
│    - Delegate submits results                           │
│    - Verify acceptance criteria                         │
│    - Compute trust delta                                │
│    - Update TrustScore for the relationship             │
│    - Store delegation memory in identity layer          │
└─────────────────────────────────────────────────────────┘`}
          </pre>

          <h2>Sync Architecture</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌───────────────────┐         ┌───────────────────┐
│   Local Instance   │         │   Cloud / Hub     │
│                   │         │                   │
│  ┌─────────────┐  │  HTTPS  │  ┌─────────────┐  │
│  │  SyncService │◀─┼────────┼─▶│  SyncService │  │
│  │             │  │  JWT    │  │             │  │
│  │  • Push     │  │  Auth   │  │  • Receive   │  │
│  │  • Pull     │  │         │  │  • Store     │  │
│  │  • Reconcile│  │         │  │  • Broadcast │  │
│  └──────┬──────┘  │         │  └──────┬──────┘  │
│         │         │         │         │         │
│  ┌──────┴──────┐  │         │  ┌──────┴──────┐  │
│  │  SyncState  │  │         │  │  SyncState  │  │
│  │  • cursors  │  │         │  │  • cursors  │  │
│  │  • mode     │  │         │  │  • clients  │  │
│  └─────────────┘  │         │  └─────────────┘  │
│                   │         │                   │
│  ┌─────────────┐  │         │  ┌─────────────┐  │
│  │  Identity   │  │         │  │  Identity   │  │
│  │  Mapping    │  │         │  │  Mapping    │  │
│  └─────────────┘  │         │  └─────────────┘  │
└───────────────────┘         └───────────────────┘

Reconciliation on conflict:
  Safety > Pin > Newer > Higher Score > Cloud Wins`}
          </pre>

          <h2>Vector Storage</h2>
          <p>Two options for embedding storage:</p>

          <h3>pgvector (Default)</h3>
          <ul>
            <li>PostgreSQL extension</li>
            <li>No additional infrastructure</li>
            <li>Good for &lt;1M memories</li>
          </ul>

          <h3>Pinecone (Optional)</h3>
          <ul>
            <li>Managed vector database</li>
            <li>Better for scale</li>
            <li>Requires <code>PINECONE_API_KEY</code></li>
          </ul>
        </article>
      </div>
    </div>
  );
}
