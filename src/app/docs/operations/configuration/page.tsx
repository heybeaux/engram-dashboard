'use client';

import Link from 'next/link';

export default function ConfigurationPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Configuration</h1>

          <p className="text-xl text-gray-300">
            All configuration is done via environment variables. Copy{' '}
            <code>.env.example</code> to <code>.env</code> and customize.
          </p>

          <hr className="border-gray-800" />

          <h2>Quick Reference</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Required</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>DATABASE_URL</code></td>
                  <td>✓</td>
                  <td>—</td>
                  <td>PostgreSQL connection string</td>
                </tr>
                <tr>
                  <td><code>PORT</code></td>
                  <td></td>
                  <td><code>3000</code></td>
                  <td>Server port</td>
                </tr>
                <tr>
                  <td><code>NODE_ENV</code></td>
                  <td></td>
                  <td><code>development</code></td>
                  <td>Environment mode</td>
                </tr>
                <tr>
                  <td><code>LLM_PROVIDER</code></td>
                  <td>✓</td>
                  <td><code>openai</code></td>
                  <td>LLM provider for extraction</td>
                </tr>
                <tr>
                  <td><code>LLM_MODEL</code></td>
                  <td></td>
                  <td><code>gpt-4o-mini</code></td>
                  <td>Model for chat/extraction</td>
                </tr>
                <tr>
                  <td><code>EMBEDDING_PROVIDER</code></td>
                  <td></td>
                  <td><code>openai</code></td>
                  <td>Provider for embeddings</td>
                </tr>
                <tr>
                  <td><code>OPENAI_API_KEY</code></td>
                  <td>*</td>
                  <td>—</td>
                  <td>OpenAI API key</td>
                </tr>
                <tr>
                  <td><code>ANTHROPIC_API_KEY</code></td>
                  <td>*</td>
                  <td>—</td>
                  <td>Anthropic API key</td>
                </tr>
                <tr>
                  <td><code>OLLAMA_URL</code></td>
                  <td></td>
                  <td><code>http://localhost:11434</code></td>
                  <td>Ollama server URL</td>
                </tr>
                <tr>
                  <td><code>LMSTUDIO_URL</code></td>
                  <td></td>
                  <td><code>http://localhost:1234/v1</code></td>
                  <td>LM Studio server URL</td>
                </tr>
                <tr>
                  <td><code>VECTOR_PROVIDER</code></td>
                  <td></td>
                  <td><code>pgvector</code></td>
                  <td>Vector storage backend</td>
                </tr>
                <tr>
                  <td><code>PINECONE_API_KEY</code></td>
                  <td>*</td>
                  <td>—</td>
                  <td>Pinecone API key</td>
                </tr>
                <tr>
                  <td><code>PINECONE_INDEX</code></td>
                  <td></td>
                  <td><code>engram</code></td>
                  <td>Pinecone index name</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400">
            * Required depending on chosen provider. At least one LLM provider API key is required.
          </p>

          <hr className="border-gray-800" />

          <h2>Database</h2>

          <h3>DATABASE_URL</h3>
          <p>
            <strong>Required.</strong> PostgreSQL connection string. Engram uses
            Prisma and requires PostgreSQL with the pgvector extension.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@localhost:5432/engram?schema=public"`}
          </pre>
          <p>Format: <code>postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA</code></p>
          <p>For production, use connection pooling:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@localhost:6543/engram?pgbouncer=true"`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Server</h2>

          <h3>PORT</h3>
          <p>Server port. Default: <code>3000</code></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PORT=3000`}
          </pre>

          <h3>NODE_ENV</h3>
          <p>
            Environment mode. Values: <code>development</code>,{' '}
            <code>production</code>, <code>test</code>
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`NODE_ENV=production`}
          </pre>
          <p>In production mode:</p>
          <ul>
            <li>Logging is JSON formatted</li>
            <li>Error stack traces are hidden</li>
            <li>Request validation is stricter</li>
          </ul>

          <hr className="border-gray-800" />

          <h2>LLM Provider</h2>
          <p>
            Engram needs an LLM for two tasks: <strong>extraction</strong>{' '}
            (analyzing memories for 5W1H structure) and{' '}
            <strong>embeddings</strong> (generating vectors for semantic search).
          </p>

          <h3>LLM_PROVIDER</h3>
          <p>The LLM provider for chat and extraction.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Description</th>
                  <th>API Key Required</th>
                  <th>Local</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>openai</code></td>
                  <td>OpenAI GPT models</td>
                  <td>Yes</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td><code>anthropic</code></td>
                  <td>Anthropic Claude models</td>
                  <td>Yes</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td><code>ollama</code></td>
                  <td>Local Ollama models</td>
                  <td>No</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td><code>lmstudio</code></td>
                  <td>Local LM Studio models</td>
                  <td>No</td>
                  <td>✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>LLM_MODEL</h3>
          <p>Model to use for extraction. Provider-specific.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# OpenAI
LLM_MODEL="gpt-4o-mini"       # Fast, cheap, good
LLM_MODEL="gpt-4o"            # Best quality

# Anthropic
LLM_MODEL="claude-3-5-sonnet-20241022"  # Best balance
LLM_MODEL="claude-3-haiku-20240307"     # Fastest

# Ollama
LLM_MODEL="llama3.2"          # Good general model
LLM_MODEL="mistral"           # Fast alternative

# LM Studio
LLM_MODEL="local-model"       # Whatever is loaded`}
          </pre>

          <h3>EMBEDDING_PROVIDER</h3>
          <p>
            Provider for generating embeddings. Not all LLM providers support
            embeddings.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Supports Embeddings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>openai</code></td>
                  <td>✓ Yes</td>
                </tr>
                <tr>
                  <td><code>anthropic</code></td>
                  <td>✗ No</td>
                </tr>
                <tr>
                  <td><code>ollama</code></td>
                  <td>✓ Yes</td>
                </tr>
                <tr>
                  <td><code>lmstudio</code></td>
                  <td>✓ Yes (if embedding model loaded)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Common pattern:</strong> Use Anthropic for extraction, OpenAI
            for embeddings:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
EMBEDDING_PROVIDER="openai"
OPENAI_API_KEY="sk-..."`}
          </pre>

          <h3>Embedding Dimensions</h3>
          <p>Different embedding models produce different dimension vectors:</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Dimensions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OpenAI <code>text-embedding-3-small</code></td>
                  <td>1536</td>
                </tr>
                <tr>
                  <td>OpenAI <code>text-embedding-3-large</code></td>
                  <td>3072</td>
                </tr>
                <tr>
                  <td>Ollama <code>nomic-embed-text</code></td>
                  <td>768</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400">
            If using Pinecone, ensure your index dimensions match your embedding model.
          </p>

          <hr className="border-gray-800" />

          <h2>API Keys</h2>

          <h3>OPENAI_API_KEY</h3>
          <p>Required if using OpenAI for LLM or embeddings.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`OPENAI_API_KEY="sk-proj-..."`}
          </pre>
          <p className="text-sm text-gray-400">
            Get your key:{' '}
            <a href="https://platform.openai.com/api-keys" className="text-purple-400 hover:text-purple-300" target="_blank" rel="noopener noreferrer">
              platform.openai.com/api-keys
            </a>
          </p>

          <h3>ANTHROPIC_API_KEY</h3>
          <p>Required if using Anthropic for LLM.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`ANTHROPIC_API_KEY="sk-ant-api03-..."`}
          </pre>
          <p className="text-sm text-gray-400">
            Get your key:{' '}
            <a href="https://console.anthropic.com/" className="text-purple-400 hover:text-purple-300" target="_blank" rel="noopener noreferrer">
              console.anthropic.com
            </a>
          </p>

          <h3>OLLAMA_URL</h3>
          <p>
            URL for Ollama server. Default: <code>http://localhost:11434</code>
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`OLLAMA_URL="http://localhost:11434"`}
          </pre>
          <p>Make sure required models are pulled:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`ollama pull llama3.2
ollama pull nomic-embed-text  # For embeddings`}
          </pre>

          <h3>LMSTUDIO_URL</h3>
          <p>
            URL for LM Studio server. Default:{' '}
            <code>http://localhost:1234/v1</code>
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`LMSTUDIO_URL="http://localhost:1234/v1"`}
          </pre>
          <p className="text-sm text-gray-400">
            Load a model in LM Studio GUI before starting Engram.
          </p>

          <hr className="border-gray-800" />

          <h2>Vector Store</h2>

          <h3>VECTOR_PROVIDER</h3>
          <p>Where to store embedding vectors.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Use Case</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>pgvector</code></td>
                  <td>PostgreSQL extension</td>
                  <td>Local, &lt; 1M vectors</td>
                  <td>Free</td>
                </tr>
                <tr>
                  <td><code>pinecone</code></td>
                  <td>Cloud vector DB</td>
                  <td>Scale, &gt; 1M vectors</td>
                  <td>$$</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`VECTOR_PROVIDER="pgvector"  # Default`}
          </pre>
          <p>
            <strong>pgvector</strong> is the default and requires no additional
            setup beyond PostgreSQL. It comes bundled with Engram&apos;s Prisma
            schema — just run <code>pnpm prisma migrate dev</code>.
          </p>

          <h3>Pinecone Configuration</h3>

          <h4>PINECONE_API_KEY</h4>
          <p>Required if using Pinecone.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PINECONE_API_KEY="pcsk_..."`}
          </pre>
          <p className="text-sm text-gray-400">
            Get your key:{' '}
            <a href="https://app.pinecone.io/" className="text-purple-400 hover:text-purple-300" target="_blank" rel="noopener noreferrer">
              app.pinecone.io
            </a>
          </p>

          <h4>PINECONE_INDEX</h4>
          <p>
            Pinecone index name. Default: <code>engram</code>
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`PINECONE_INDEX="engram"`}
          </pre>
          <p>Create an index in the Pinecone console with:</p>
          <ul>
            <li>
              <strong>Dimensions:</strong> <code>1536</code> (for OpenAI
              embeddings)
            </li>
            <li>
              <strong>Metric:</strong> Cosine
            </li>
          </ul>

          <h3>pgvector Performance Tips</h3>
          <p>For better performance with large datasets, create an HNSW index:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`-- Create HNSW index for faster searches
CREATE INDEX ON memories
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Memory Intelligence</h2>
          <p>
            Memory Intelligence v2 controls how memories are scored, decayed, and
            prioritized. These settings are configured in the scoring engine with
            sensible defaults.
          </p>

          <h3>Importance Scoring</h3>
          <p>
            Effective score is computed as:{' '}
            <code>
              max(safetyFloor, baseScore × decayFactor + noveltyBoost +
              usageBoost + pinnedBoost)
            </code>
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>pinnedBoost</code></td>
                  <td><code>0.5</code></td>
                  <td>Score boost when a memory is user-pinned</td>
                </tr>
                <tr>
                  <td><code>maxUsageBoost</code></td>
                  <td><code>0.3</code></td>
                  <td>Maximum boost from retrieval/use counts</td>
                </tr>
                <tr>
                  <td><code>usageBoostPerUse</code></td>
                  <td><code>0.02</code></td>
                  <td>Score increment per retrieval or use</td>
                </tr>
                <tr>
                  <td><code>noveltyBoostMax</code></td>
                  <td><code>0.15</code></td>
                  <td>Maximum novelty boost for brand-new memories</td>
                </tr>
                <tr>
                  <td><code>noveltyBoostDays</code></td>
                  <td><code>7</code></td>
                  <td>Days over which novelty tapers linearly to 0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Decay Rates</h3>
          <p>
            Memories decay exponentially based on their layer. The formula is:{' '}
            <code>factor = 0.5 ^ (ageDays / halfLifeDays)</code>
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Half-Life</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>IDENTITY</code></td>
                  <td>∞ (no decay)</td>
                  <td>Core user facts — never fade</td>
                </tr>
                <tr>
                  <td><code>PROJECT</code></td>
                  <td>60 days</td>
                  <td>Project-scoped memories decay slowly</td>
                </tr>
                <tr>
                  <td><code>SESSION</code></td>
                  <td>14 days</td>
                  <td>Session context fades over two weeks</td>
                </tr>
                <tr>
                  <td><code>TASK</code></td>
                  <td>3 days</td>
                  <td>Ephemeral task details decay quickly</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Minimum decay factor:</strong> <code>0.1</code> — memories
            never fully disappear from decay alone.
          </p>

          <h3>Safety Patterns</h3>
          <p>
            Safety-critical memories are automatically detected and given a{' '}
            <strong>minimum score floor of <code>0.6</code></strong>, ensuring
            they are never evicted from context by decay or low importance.
          </p>
          <p>Built-in safety detection patterns:</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Detects</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Allergy</strong></td>
                  <td>allergy, allergic, anaphylaxis, epipen</td>
                </tr>
                <tr>
                  <td><strong>Medication</strong></td>
                  <td>medication, prescription, blood thinner, insulin</td>
                </tr>
                <tr>
                  <td><strong>Medical</strong></td>
                  <td>diabetes, asthma, heart condition, pacemaker, blood type</td>
                </tr>
                <tr>
                  <td><strong>Seizure</strong></td>
                  <td>epilepsy, seizures</td>
                </tr>
                <tr>
                  <td><strong>Emergency</strong></td>
                  <td>emergency contact</td>
                </tr>
                <tr>
                  <td><strong>Medical Directive</strong></td>
                  <td>do not resuscitate, DNR</td>
                </tr>
                <tr>
                  <td><strong>Critical</strong></td>
                  <td>life-threatening, fatal, deadly</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400">
            Additional patterns can be added at runtime via the{' '}
            <code>SafetyDetectorService.addPattern()</code> method.
          </p>

          <h3>Token Budgets</h3>
          <p>
            When loading context via <code>POST /v1/context</code>, the{' '}
            <code>maxTokens</code> parameter controls the token budget. Memories
            are ranked by <code>effectiveScore</code> and packed until the budget
            is exhausted. Safety-critical items are never evicted.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`POST /v1/context
{
  "maxTokens": 4000,      // Token budget for context window
  "projectId": "proj_123" // Optional: include project memories
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Consolidation</h2>
          <p>
            Consolidation is Engram&apos;s &ldquo;sleep&rdquo; process — it
            clusters similar memories, generates a consolidated gist via LLM, and
            soft-deletes duplicates. Trigger it via the API:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Dry run — preview what would change
POST /v1/consolidate?dryRun=true

# Execute consolidation
POST /v1/consolidate`}
          </pre>
          <p>What consolidation does:</p>
          <ul>
            <li>
              <strong>Clusters</strong> similar memories using cosine similarity
              on embeddings
            </li>
            <li>
              <strong>Generates a gist</strong> — uses the LLM to compress a
              cluster into a single essential fact
            </li>
            <li>
              <strong>Promotes</strong> recurring SESSION memories to
              IDENTITY/PROJECT layers
            </li>
            <li>
              <strong>Soft-deletes</strong> duplicates with a{' '}
              <code>consolidatedInto</code> reference to the canonical memory
            </li>
          </ul>
          <p>
            Check consolidation readiness with the stats endpoint:
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`GET /v1/consolidate/stats

Response: {
  totalMemories: number,
  sessionMemories: number,
  identityMemories: number,
  projectMemories: number,
  consolidatedCount: number,
  potentialClusters: number
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Example Configurations</h2>

          <h3>Cloud (OpenAI Everything)</h3>
          <p>Simplest setup. Uses OpenAI for both extraction and embeddings.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@localhost:5432/engram"
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o-mini"
EMBEDDING_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
VECTOR_PROVIDER="pgvector"`}
          </pre>

          <h3>Hybrid (Claude + OpenAI)</h3>
          <p>
            Best extraction quality with Anthropic, embeddings with OpenAI.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@localhost:5432/engram"
LLM_PROVIDER="anthropic"
LLM_MODEL="claude-3-5-sonnet-20241022"
ANTHROPIC_API_KEY="sk-ant-..."
EMBEDDING_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
VECTOR_PROVIDER="pgvector"`}
          </pre>

          <h3>Fully Local (Ollama)</h3>
          <p>No cloud dependencies. All processing stays local.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@localhost:5432/engram"
LLM_PROVIDER="ollama"
LLM_MODEL="llama3.2"
EMBEDDING_PROVIDER="ollama"
OLLAMA_URL="http://localhost:11434"
VECTOR_PROVIDER="pgvector"

# Pull models first:
# ollama pull llama3.2
# ollama pull nomic-embed-text`}
          </pre>

          <h3>Production Scale (Pinecone)</h3>
          <p>For large-scale deployments with millions of memories.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`DATABASE_URL="postgresql://user:password@db.example.com:5432/engram"
NODE_ENV="production"
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o-mini"
EMBEDDING_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
VECTOR_PROVIDER="pinecone"
PINECONE_API_KEY="pcsk_..."
PINECONE_INDEX="engram-prod"`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Troubleshooting</h2>

          <h3>&ldquo;No LLM provider configured&rdquo;</h3>
          <p>Set at least one of:</p>
          <ul>
            <li><code>OPENAI_API_KEY</code></li>
            <li><code>ANTHROPIC_API_KEY</code></li>
            <li>Or configure Ollama / LM Studio</li>
          </ul>

          <h3>&ldquo;Provider does not support embeddings&rdquo;</h3>
          <p>
            Anthropic doesn&apos;t provide embeddings. Set{' '}
            <code>EMBEDDING_PROVIDER</code> to <code>openai</code> or{' '}
            <code>ollama</code>.
          </p>

          <h3>&ldquo;Ollama embedding failed&rdquo;</h3>
          <p>Pull the embedding model:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`ollama pull nomic-embed-text`}
          </pre>

          <h3>&ldquo;Pinecone index not found&rdquo;</h3>
          <p>
            Create an index in the Pinecone console with matching name and
            dimensions (<code>1536</code> for OpenAI embeddings, cosine metric).
          </p>
        </article>
      </div>
    </div>
  );
}
