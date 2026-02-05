'use client';

import Link from 'next/link';

export default function OpenClawIntegrationPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>OpenClaw Integration</h1>
          
          <p className="text-xl text-gray-300">
            Automatically capture memories from OpenClaw conversations using hooks.
          </p>

          <h2>Overview</h2>
          <p>
            The Engram hook for OpenClaw provides two key capabilities:
          </p>
          <ol>
            <li><strong>Memory injection</strong> — Load relevant memories into agent context at session start</li>
            <li><strong>Auto-capture</strong> — Extract and store memories from conversations in real-time</li>
          </ol>

          <h2>Setup</h2>

          <h3>1. Create Hook Directory</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`mkdir -p ~/clawd/hooks/engram`}
          </pre>

          <h3>2. Create HOOK.md</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# ~/clawd/hooks/engram/HOOK.md

name: engram
description: Memory injection and auto-capture via Engram
enabled: true
events:
  - agent:bootstrap    # Inject memories at session start
  - message:sent       # Capture assistant responses
  - message:received   # Capture user messages`}
          </pre>

          <h3>3. Create handler.ts</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// ~/clawd/hooks/engram/handler.ts

import { HookEvent, HookResult } from '@openclaw/types';

const ENGRAM_API_URL = process.env.ENGRAM_API_URL || 'http://localhost:3001';
const ENGRAM_API_KEY = process.env.ENGRAM_API_KEY;
const ENGRAM_USER_ID = process.env.ENGRAM_USER_ID || 'default';
const ENGRAM_AGENT_ID = process.env.ENGRAM_AGENT_ID;

export async function handle(event: HookEvent): Promise<HookResult> {
  if (!ENGRAM_API_KEY) {
    return { ok: true }; // Skip if not configured
  }

  switch (event.type) {
    case 'agent:bootstrap':
      return handleBootstrap(event);
    case 'message:sent':
    case 'message:received':
      return handleMessage(event);
    default:
      return { ok: true };
  }
}

async function handleBootstrap(event: HookEvent): Promise<HookResult> {
  try {
    // Load memory context
    const response = await fetch(\`\${ENGRAM_API_URL}/v1/context\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AM-API-Key': ENGRAM_API_KEY!,
        'X-AM-User-ID': ENGRAM_USER_ID,
      },
      body: JSON.stringify({
        maxTokens: 2000,
        agentId: ENGRAM_AGENT_ID,
      }),
    });

    if (!response.ok) {
      console.error('[Engram] Failed to load context:', await response.text());
      return { ok: true };
    }

    const data = await response.json();
    
    // Inject into bootstrap files
    if (data.context && event.context?.bootstrapFiles) {
      event.context.bootstrapFiles['engram-context'] = {
        content: \`# Memory Context (via Engram)\\n\\n\${data.context}\`,
        tokens: data.tokenCount,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Engram] Bootstrap error:', error);
    return { ok: true };
  }
}

async function handleMessage(event: HookEvent): Promise<HookResult> {
  try {
    const isUser = event.type === 'message:received';
    const content = event.data?.content || event.data?.message;
    
    if (!content || content.length < 20) {
      return { ok: true }; // Skip short messages
    }

    // Send to observe endpoint
    await fetch(\`\${ENGRAM_API_URL}/v1/observe\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AM-API-Key': ENGRAM_API_KEY!,
        'X-AM-User-ID': ENGRAM_USER_ID,
      },
      body: JSON.stringify({
        turns: [{
          role: isUser ? 'user' : 'assistant',
          content: content,
          timestamp: new Date().toISOString(),
        }],
        minImportance: 0.4,
      }),
    });

    return { ok: true };
  } catch (error) {
    console.error('[Engram] Message capture error:', error);
    return { ok: true };
  }
}

export default { handle };`}
          </pre>

          <h3>4. Configure Environment</h3>
          <p>Add to your OpenClaw config or workspace <code>.env</code>:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`ENGRAM_API_URL=http://localhost:3001
ENGRAM_API_KEY=eg_sk_live_xxxxxxxxxxxx
ENGRAM_USER_ID=Beaux
ENGRAM_AGENT_ID=rook`}
          </pre>

          <h2>How It Works</h2>

          <h3>Memory Injection (agent:bootstrap)</h3>
          <p>When an OpenClaw session starts:</p>
          <ol>
            <li>Hook calls <code>POST /v1/context</code></li>
            <li>Engram returns relevant memories sorted by effectiveScore</li>
            <li>Memories are injected into <code>bootstrapFiles</code></li>
            <li>Agent sees memories in its system context</li>
          </ol>

          <h3>Auto-Capture (message:sent/received)</h3>
          <p>When messages are exchanged:</p>
          <ol>
            <li>Hook captures both user and assistant messages</li>
            <li>Sends to <code>POST /v1/observe</code></li>
            <li>Engram extracts facts worth remembering</li>
            <li>Memories created with proper attribution</li>
          </ol>

          <h2>Example Output</h2>
          <p>Injected context appears in the agent&apos;s bootstrap:</p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`# Memory Context (via Engram)

*36 memories loaded, 575 tokens*

## User Identity
- Beaux prefers dark mode for all applications
- Beaux never deploys on Fridays
- Beaux's daughter Stella is 4 years old
- Beaux has a husky named Kali

## Recent Context
- Working on Engram memory system
- Implemented effectiveScore and safetyCritical features
- Dashboard needs authentication`}
          </pre>

          <h2>Configuration Options</h2>

          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>ENGRAM_API_URL</code></td>
                <td>Yes</td>
                <td>Engram server URL</td>
              </tr>
              <tr>
                <td><code>ENGRAM_API_KEY</code></td>
                <td>Yes</td>
                <td>Your agent API key</td>
              </tr>
              <tr>
                <td><code>ENGRAM_USER_ID</code></td>
                <td>Yes</td>
                <td>User identifier for memories</td>
              </tr>
              <tr>
                <td><code>ENGRAM_AGENT_ID</code></td>
                <td>No</td>
                <td>Include agent self-memories</td>
              </tr>
            </tbody>
          </table>

          <h2>Filtering Captures</h2>
          <p>
            Not every message needs to become a memory. The <code>/v1/observe</code> endpoint 
            uses LLM classification to filter:
          </p>
          <ul>
            <li><strong>minImportance: 0.4</strong> — Skip trivial messages</li>
            <li><strong>Deduplication</strong> — Similar facts are reinforced, not duplicated</li>
            <li><strong>Type classification</strong> — Only CONSTRAINT, PREFERENCE, FACT stored by default</li>
          </ul>

          <h2>Bidirectional Capture</h2>
          <p>
            The hook captures <strong>both</strong> user and assistant messages. This is important because:
          </p>
          <ul>
            <li>User messages contain preferences and facts about them</li>
            <li>Assistant messages may contain decisions, learnings, and commitments</li>
            <li>The conversation flow provides context for extraction</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Memories not appearing in context</h3>
          <ul>
            <li>Check <code>ENGRAM_API_KEY</code> is valid</li>
            <li>Check <code>ENGRAM_USER_ID</code> matches</li>
            <li>Verify Engram server is running: <code>curl http://localhost:3001/v1/health</code></li>
          </ul>

          <h3>Messages not being captured</h3>
          <ul>
            <li>Check hook is enabled in HOOK.md</li>
            <li>Messages under 20 chars are skipped</li>
            <li>Check Engram logs for extraction errors</li>
          </ul>

          <h3>Too many memories created</h3>
          <ul>
            <li>Increase <code>minImportance</code> threshold (default: 0.4)</li>
            <li>Run consolidation to compress similar memories</li>
          </ul>
        </article>
      </div>
    </div>
  );
}
