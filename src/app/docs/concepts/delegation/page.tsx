'use client';

import Link from 'next/link';

export default function DelegationConceptPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <nav className="mb-8">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300">
            ← Back to Docs
          </Link>
        </nav>

        <article className="prose prose-invert prose-purple max-w-none">
          <h1>Delegation System</h1>

          <p className="text-xl text-gray-300">
            Engram&apos;s delegation system enables agents to assign tasks to other agents
            with structured contracts, progress tracking, and trust feedback loops. It&apos;s
            how multi-agent collaboration actually works.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Delegation is a contract, not a fire-and-forget.</strong> Every delegated
              task has a clear lifecycle, acceptance criteria, and outcome tracking. Results
              feed back into the trust model, creating accountability between agents.
            </p>
          </div>

          <h2>Why Delegation?</h2>

          <p>
            In a multi-agent system, no single agent can (or should) do everything. Delegation
            lets agents specialize and collaborate:
          </p>
          <ul>
            <li>A coordinator agent breaks down complex requests into subtasks</li>
            <li>Specialized agents handle what they&apos;re best at</li>
            <li>Results flow back with quality signals that build (or erode) trust</li>
            <li>The system learns which agents are reliable for which tasks</li>
          </ul>

          <h2>Task Lifecycle</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ PROPOSED │────▶│ ACCEPTED │────▶│  ACTIVE  │────▶│ COMPLETE │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │                │                │                ▼
     │                │                │          ┌──────────┐
     │                │                └─────────▶│  FAILED  │
     │                │                           └──────────┘
     │                ▼
     │           ┌──────────┐
     └──────────▶│ REJECTED │
                 └──────────┘

Status Descriptions:
  PROPOSED  — Delegator has created the task, awaiting acceptance
  ACCEPTED  — Delegate has acknowledged and committed to the task
  ACTIVE    — Work is in progress
  COMPLETE  — Task finished successfully, results delivered
  FAILED    — Task could not be completed (with reason)
  REJECTED  — Delegate declined the task (capacity, capability, etc.)`}
          </pre>

          <h3>1. Proposal</h3>
          <p>
            The delegating agent creates a task with a clear description, acceptance criteria,
            deadline, and priority. The task enters <code>PROPOSED</code> status.
          </p>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`{
  "action": "delegate",
  "to": "agent_code_reviewer",
  "task": {
    "description": "Review PR #456 for security issues",
    "acceptanceCriteria": [
      "All SQL queries checked for injection",
      "Auth middleware verified on new endpoints",
      "No hardcoded secrets"
    ],
    "deadline": "2026-02-21T17:00:00Z",
    "priority": "high",
    "context": {
      "repo": "engram",
      "branch": "feat/new-endpoints",
      "files": ["src/api/*.ts"]
    }
  }
}`}
          </pre>

          <h3>2. Acceptance</h3>
          <p>
            The delegate agent reviews the task and either accepts or rejects it. Rejection
            isn&apos;t a failure — it&apos;s a signal that the task should be routed elsewhere.
            Agents can reject based on capacity, capability confidence, or missing context.
          </p>

          <h3>3. Execution</h3>
          <p>
            Once accepted, the task moves to <code>ACTIVE</code>. The delegate can post
            progress updates, request clarification, or flag blockers. The delegator
            receives notifications at key milestones.
          </p>

          <h3>4. Completion</h3>
          <p>
            The delegate marks the task complete with results. The delegator verifies
            acceptance criteria were met. This outcome — success, partial success, or
            failure — feeds directly into the trust model.
          </p>

          <h2>Delegation Contracts</h2>

          <p>
            Every delegation creates a <strong>contract</strong> — a structured agreement
            between delegator and delegate that ensures accountability.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface DelegationContract {
  id: string;
  delegatorId: string;        // Who's assigning
  delegateId: string;         // Who's doing the work
  
  // Task definition
  description: string;
  acceptanceCriteria: string[];
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Context
  templateId?: string;        // Optional template reference
  contextMemories: string[];  // Memory IDs for relevant context
  
  // Lifecycle
  status: DelegationStatus;
  proposedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  
  // Outcome
  result?: DelegationResult;
  trustDelta?: number;        // How much trust changed (+/-)
}`}
          </pre>

          <h2>Templates</h2>

          <p>
            For recurring delegation patterns, Engram supports <strong>templates</strong> —
            predefined task structures that standardize common workflows.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Built-in templates
const templates = {
  "code-review": {
    description: "Review {{branch}} for {{focus}}",
    acceptanceCriteria: [
      "All files reviewed",
      "Issues documented with line references",
      "Severity ratings assigned"
    ],
    defaultPriority: "medium",
    estimatedDuration: "30m"
  },
  
  "research": {
    description: "Research {{topic}} and summarize findings",
    acceptanceCriteria: [
      "At least 3 sources consulted",
      "Key findings summarized",
      "Recommendations provided"
    ],
    defaultPriority: "low",
    estimatedDuration: "1h"
  },
  
  "deployment": {
    description: "Deploy {{service}} to {{environment}}",
    acceptanceCriteria: [
      "Health checks passing",
      "Rollback plan documented",
      "Stakeholders notified"
    ],
    defaultPriority: "high",
    estimatedDuration: "15m"
  }
};`}
          </pre>

          <p>
            Templates can be customized per team and evolve over time as agents learn which
            acceptance criteria are most useful.
          </p>

          <h2>How Delegation Feeds Trust</h2>

          <p>
            Every completed delegation generates a <strong>trust signal</strong> that updates
            the relationship between delegator and delegate. This is the feedback loop that
            makes the system learn.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`Delegation Outcome → Trust Signal → Trust Score Update

┌─────────────────┬────────────────┬───────────────────────┐
│ Outcome         │ Trust Delta    │ Effect                │
├─────────────────┼────────────────┼───────────────────────┤
│ Completed       │ +0.05 to +0.15│ Strengthens trust     │
│ On Time         │ +0.03 bonus   │ Reliability signal    │
│ Exceeded Expect.│ +0.10 bonus   │ Strong positive       │
│ Partial Success │ -0.02 to +0.02│ Neutral/slight hit    │
│ Failed          │ -0.10 to -0.20│ Trust erosion         │
│ Rejected        │ 0.00          │ No penalty (honest)   │
│ Missed Deadline │ -0.05         │ Reliability concern   │
│ No Response     │ -0.15         │ Significant erosion   │
└─────────────────┴────────────────┴───────────────────────┘

Trust deltas are weighted by task priority:
  critical: 2.0x multiplier
  high:     1.5x
  medium:   1.0x
  low:      0.5x`}
          </pre>

          <p>
            Over time, this creates a rich trust graph where agents know exactly how much
            to rely on each other for different types of work. See the{' '}
            <Link href="/docs/concepts/trust" className="text-purple-400 hover:text-purple-300">
              Trust Model
            </Link>{' '}
            page for the full scoring system.
          </p>

          <h2>Delegation Flow</h2>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`User Request: "Review my PR and deploy if it looks good"
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Coordinator Agent                                       │
│  1. Breaks request into subtasks                        │
│  2. Checks trust scores for available agents            │
│  3. Matches capabilities to requirements                │
│  4. Creates delegation contracts                        │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Code Review Agent   │  │ DevOps Agent        │
│ (trust: 0.87)       │  │ (trust: 0.92)       │
│                     │  │                     │
│ Task: Review PR     │  │ Task: Deploy        │
│ Status: ACTIVE      │  │ Status: PROPOSED    │
│                     │  │ (blocked on review) │
└─────────┬───────────┘  └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ Review Complete ✓   │
│ Trust +0.08         │──── triggers DevOps task
└─────────────────────┘`}
          </pre>

          <h2>Schema</h2>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`model Delegation {
  id                String            @id
  delegatorId       String
  delegateId        String
  
  // Task
  description       String
  acceptanceCriteria String[]
  priority          DelegationPriority
  templateId        String?
  
  // Lifecycle
  status            DelegationStatus
  proposedAt        DateTime          @default(now())
  acceptedAt        DateTime?
  completedAt       DateTime?
  deadline          DateTime?
  
  // Outcome
  resultSummary     String?
  criteriaMetCount  Int?
  trustDelta        Float?
  
  // Relationships
  delegator         Agent             @relation("delegated", fields: [delegatorId], references: [id])
  delegate          Agent             @relation("received", fields: [delegateId], references: [id])
  contextMemories   Memory[]
}

enum DelegationStatus {
  PROPOSED
  ACCEPTED
  ACTIVE
  COMPLETE
  FAILED
  REJECTED
}

enum DelegationPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Write clear acceptance criteria.</strong> Vague tasks produce vague
              results. The more specific the criteria, the better the delegate can deliver
              and the more useful the trust signal.
            </li>
            <li>
              <strong>Use templates for recurring work.</strong> Templates standardize quality
              and make delegation faster. They also help new agents learn what&apos;s expected.
            </li>
            <li>
              <strong>Don&apos;t penalize honest rejections.</strong> An agent that rejects a
              task it can&apos;t handle is more trustworthy than one that accepts and fails.
              Rejections carry zero trust penalty by design.
            </li>
            <li>
              <strong>Set realistic deadlines.</strong> Missed deadlines erode trust. If timing
              isn&apos;t critical, omit the deadline rather than setting an artificial one.
            </li>
            <li>
              <strong>Let the trust system route.</strong> Rather than manually choosing which
              agent handles which task, let the delegation system match tasks to agents based
              on capability confidence and trust scores.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
