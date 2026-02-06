'use client';

import Link from 'next/link';

export default function SdkPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>TypeScript SDK</h1>

          <p className="text-xl text-gray-300">
            The official SDK for integrating Engram into your AI agents.
          </p>

          <h2>Installation</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`npm install @engram/sdk
# or
pnpm add @engram/sdk
# or
yarn add @engram/sdk`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Quick Start</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`import { Engram } from '@engram/sdk';

// Initialize
const engram = new Engram({
  apiKey: 'eg_sk_your_key_here',
  userId: 'user_123',
  baseUrl: 'http://localhost:3000',  // Your Engram server
});

// Store a memory
await engram.remember("User prefers dark mode");

// Recall memories
const memories = await engram.recall("user preferences");

// Load context for system prompt
const context = await engram.loadContext({ maxTokens: 4000 });`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Constructor Options</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const engram = new Engram({
  // Required
  apiKey: string,      // Your API key (eg_sk_...)
  userId: string,      // The end-user's identifier

  // Optional
  baseUrl?: string,    // Server URL (default: https://api.engram.ai)
  timeout?: number,    // Request timeout in ms (default: 30000)
  retries?: number,    // Retry attempts (default: 3)
});`}
          </pre>

          <h3>Environment Variables</h3>
          <p>The SDK can also read from environment variables:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`ENGRAM_API_KEY=eg_sk_...
ENGRAM_BASE_URL=http://localhost:3000`}
          </pre>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Reads from env vars automatically
const engram = new Engram({ userId: 'user_123' });`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Core Methods</h2>

          <h3>remember()</h3>
          <p>Store a single memory.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`remember(text: string, options?: RememberOptions): Promise<Memory>`}
          </pre>
          <p><strong>Basic usage:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const memory = await engram.remember("User is building a SaaS product");`}
          </pre>
          <p><strong>With options:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`await engram.remember("Never deploy on Fridays", {
  layer: 'identity',          // 'identity' | 'project' | 'session' | 'task'
  importance: 'critical',     // 'low' | 'medium' | 'high' | 'critical'
  projectId: 'proj_123',
  sessionId: 'sess_456',
});`}
          </pre>
          <ul>
            <li><strong>layer</strong>: Memory layer (<code>identity</code>, <code>project</code>, <code>session</code>, <code>task</code>)</li>
            <li><strong>importance</strong>: Importance hint (<code>low</code>, <code>medium</code>, <code>high</code>, <code>critical</code>)</li>
            <li><strong>projectId</strong>: Associate with a project</li>
            <li><strong>sessionId</strong>: Associate with a session</li>
          </ul>

          <hr className="border-gray-800" />

          <h3>recall()</h3>
          <p>Semantic search for memories.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`recall(query: string, options?: RecallOptions): Promise<QueryResult>`}
          </pre>
          <p><strong>Basic usage:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const result = await engram.recall("authentication");

for (const memory of result.memories) {
  console.log(memory.raw);
  console.log(\`Score: \${memory.importanceScore}\`);
}`}
          </pre>
          <p><strong>With filters:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const result = await engram.recall("user preferences", {
  layers: ['identity', 'project'],
  limit: 5,
  projectId: 'proj_123',
  includeChains: true,
});`}
          </pre>
          <ul>
            <li><strong>layers</strong>: Filter by memory layers (string array)</li>
            <li><strong>limit</strong>: Max results (default: 10)</li>
            <li><strong>projectId</strong>: Filter by project</li>
            <li><strong>includeChains</strong>: Include reasoning chains</li>
          </ul>
          <p><strong>Response shape:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface QueryResult {
  memories: Memory[];
  queryTokens: number;
  latencyMs: number;
}`}
          </pre>

          <hr className="border-gray-800" />

          <h3>loadContext()</h3>
          <p>Load formatted context for session start. Returns a string ready for system prompt injection.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`loadContext(options?: ContextOptions): Promise<ContextResult>`}
          </pre>
          <p><strong>Example:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const { context, tokenCount } = await engram.loadContext({
  maxTokens: 4000,
  projectId: 'proj_dashboard',
});

// Use in system prompt
const systemPrompt = \`You are a helpful assistant.

## User Context
\${context}

Assist the user with their request.\`;`}
          </pre>
          <ul>
            <li><strong>maxTokens</strong>: Token budget (default: 4000)</li>
            <li><strong>projectId</strong>: Include project memories</li>
            <li><strong>sessionId</strong>: Include session memories</li>
          </ul>
          <p><strong>Response shape:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface ContextResult {
  context: string;          // Formatted markdown string
  tokenCount: number;       // Estimated tokens used
  memoriesIncluded: number;
  layers: {
    identity: number;
    project: number;
    session: number;
  };
}`}
          </pre>

          <hr className="border-gray-800" />

          <h3>observe()</h3>
          <p>Automatically extract and store memories from conversation turns. Powered by the <code>/v1/observe</code> endpoint.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Observe conversation turns for auto-extraction
const result = await engram.observe({
  turns: [
    { role: 'user', content: 'I prefer dark mode' },
    { role: 'assistant', content: 'Noted! I\\'ll remember that.' },
  ],
  projectId: 'proj_123',       // Optional
  sessionId: 'sess_456',       // Optional
  minImportance: 0.4,          // Optional: filter threshold
});

console.log(result.memoriesCreated);  // Memory[]
console.log(result.factsExtracted);   // number`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Batch Operations</h2>

          <h3>rememberAll()</h3>
          <p>Store multiple memories at once. More efficient than individual <code>remember()</code> calls.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`rememberAll(memories: MemoryInput[], options?: BatchOptions): Promise<BatchResult>`}
          </pre>
          <p><strong>Example:</strong></p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const result = await engram.rememberAll([
  { raw: "Working on auth system" },
  { raw: "Uses OAuth2 with Google" },
  { raw: "Meeting notes from standup" },
], {
  projectId: 'proj_auth',
});

console.log(result.created);  // 3
console.log(result.failed);   // 0`}
          </pre>
          <p><strong>Use cases:</strong></p>
          <ul>
            <li>Import conversation history</li>
            <li>Bulk onboarding</li>
            <li>Migration from other systems</li>
          </ul>

          <hr className="border-gray-800" />

          <h2>Feedback Methods</h2>

          <h3>used()</h3>
          <p>Mark a memory as used (implicit feedback). Boosts the memory&apos;s importance score.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// After using a memory in your response
await engram.used(memory.id);`}
          </pre>

          <h3>helpful()</h3>
          <p>Mark a memory as helpful (explicit feedback).</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// When user confirms memory was useful
await engram.helpful(memory.id);`}
          </pre>

          <h3>correct()</h3>
          <p>Correct an inaccurate memory. Creates a new memory and marks the original as superseded.</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// User says: "Actually, I prefer light mode"
const corrected = await engram.correct(
  memory.id,
  "User prefers light mode with high contrast"
);`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Error Handling</h2>
          <p>The SDK throws typed errors for easy handling:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`import {
  Engram,
  EngramError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
} from '@engram/sdk';

try {
  await engram.remember("test");
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.error(\`Rate limited. Retry after \${error.retryAfter}s\`);
  } else if (error instanceof ValidationError) {
    console.error("Invalid request parameters");
  } else if (error instanceof NotFoundError) {
    console.error("Memory not found");
  } else if (error instanceof EngramError) {
    console.error(\`Engram error: \${error.message}\`);
  }
}`}
          </pre>

          <h3>Retry &amp; Timeout</h3>
          <p>The SDK automatically retries failed requests with exponential backoff:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`const engram = new Engram({
  apiKey: '...',
  userId: 'user_123',
  timeout: 30000,   // 30 second timeout
  retries: 3,       // Retry up to 3 times
});`}
          </pre>
          <p>Retries only apply to:</p>
          <ul>
            <li>Network errors</li>
            <li>5xx server errors</li>
            <li>429 rate limit (waits for <code>retryAfter</code>)</li>
          </ul>

          <hr className="border-gray-800" />

          <h2>Types</h2>

          <h3>Memory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface Memory {
  id: string;
  userId: string;
  raw: string;
  layer: 'IDENTITY' | 'PROJECT' | 'SESSION' | 'TASK';
  source: 'EXPLICIT_STATEMENT' | 'AGENT_OBSERVATION' | 'CORRECTION'
        | 'PATTERN_DETECTED' | 'SYSTEM';
  importanceHint?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  importanceScore: number;
  confidence: number;
  retrievalCount: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
  extraction?: MemoryExtraction;
}`}
          </pre>

          <h3>MemoryExtraction</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface MemoryExtraction {
  who: string | null;
  what: string | null;
  when: string | null;
  whereCtx: string | null;
  why: string | null;
  how: string | null;
  topics: string[];
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Agent Integration</h2>

          <h3>OpenClaw Hook Pattern</h3>
          <p>
            Integrate Engram into an OpenClaw agent using the hook pattern.
            Memory is loaded at session start and observations are captured automatically.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`import { Engram } from '@engram/sdk';

const engram = new Engram({
  apiKey: process.env.ENGRAM_API_KEY!,
  userId: 'user_123',
});

// Hook: onSessionStart — inject context into the system prompt
async function onSessionStart() {
  const { context } = await engram.loadContext({ maxTokens: 3000 });

  return {
    systemPrompt: \`You are a helpful assistant.

## Memory Context
\${context}

Assist the user with their request.\`,
  };
}

// Hook: onUserMessage — recall relevant memories
async function onUserMessage(message: string) {
  const { memories } = await engram.recall(message, { limit: 5 });

  return {
    additionalContext: memories.map(m => \`- \${m.raw}\`).join('\\n'),
    memoryIds: memories.map(m => m.id),
  };
}

// Hook: onAssistantResponse — observe and store new facts
async function onAssistantResponse(
  userMessage: string,
  assistantResponse: string,
  memoryIds: string[],
) {
  // Mark used memories
  for (const id of memoryIds) {
    await engram.used(id);
  }

  // Auto-observe for new facts
  await engram.observe({
    turns: [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantResponse },
    ],
  });
}`}
          </pre>

          <h3>With OpenAI</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`import OpenAI from 'openai';
import { Engram } from '@engram/sdk';

const openai = new OpenAI();
const engram = new Engram({
  apiKey: process.env.ENGRAM_API_KEY!,
  userId: 'user_123',
});

async function chat(userMessage: string) {
  // 1. Load context
  const { context } = await engram.loadContext({ maxTokens: 3000 });

  // 2. Recall relevant memories
  const { memories } = await engram.recall(userMessage, { limit: 5 });

  // 3. Build system prompt
  const systemPrompt = \`You are a helpful assistant.

## User Context
\${context}

## Relevant Memories
\${memories.map(m => \`- \${m.raw}\`).join('\\n')}
\`;

  // 4. Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  // 5. Mark used memories
  for (const memory of memories) {
    await engram.used(memory.id);
  }

  return response.choices[0].message.content;
}`}
          </pre>

          <hr className="border-gray-800" />

          <h2>Best Practices</h2>

          <h3>Store Facts, Not Conversations</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// ❌ Don't store raw conversation
await engram.remember("User: What's the weather? Assistant: It's sunny!");

// ✅ Store extracted facts
await engram.remember("User's location is San Francisco", { layer: 'identity' });`}
          </pre>

          <h3>Use Appropriate Layers</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Identity: permanent facts
await engram.remember("User is a software developer", { layer: 'identity' });

// Project: workstream context
await engram.remember("Dashboard v2 uses React", { layer: 'project' });

// Session: conversation context
await engram.remember("Currently debugging login issue", { layer: 'session' });

// Task: immediate, short-lived
await engram.remember("Looking at line 142 of auth.ts", { layer: 'task' });`}
          </pre>

          <h3>Provide Feedback</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Always mark used memories
const { memories } = await engram.recall(query);
for (const m of memories) {
  await engram.used(m.id);
}

// Mark helpful when explicitly confirmed
if (userSaysHelpful) {
  await engram.helpful(memory.id);
}`}
          </pre>

          <h3>Batch When Possible</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// ❌ Multiple individual calls
for (const fact of facts) {
  await engram.remember(fact);
}

// ✅ Single batch call
await engram.rememberAll(facts.map(f => ({ raw: f })));`}
          </pre>

          <h3>Handle Token Budgets</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Calculate available tokens
const maxContextTokens = 8000;
const systemPromptTokens = 500;
const responseBuffer = 2000;

const availableForMemory = maxContextTokens - systemPromptTokens - responseBuffer;

const { context } = await engram.loadContext({
  maxTokens: availableForMemory,
});`}
          </pre>
        </article>
      </div>
    </div>
  );
}
