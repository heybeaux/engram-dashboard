'use client';

import Link from 'next/link';

export default function DelegationSystemPage() {
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
            Delegation in Engram is how agents assign work to other agents — with contracts,
            accountability, and trust that builds over time. Every delegation is a memory
            that shapes future decisions.
          </p>

          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 my-8">
            <h3 className="text-purple-400 mt-0">Core Principle</h3>
            <p className="mb-0">
              <strong>Delegation is a contract, not a fire-and-forget.</strong> When an agent
              delegates a task, it creates a binding agreement with defined inputs, expected
              outputs, success criteria, and a trust feedback loop. The outcome of every
              delegation feeds back into the delegate&apos;s identity.
            </p>
          </div>

          <h2>Task Lifecycle</h2>

          <p>
            Every delegated task moves through a defined lifecycle. Each transition is recorded
            as a memory, building the audit trail that informs trust.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
{`CREATED ──→ ASSIGNED ──→ IN_PROGRESS ──→ REVIEW ──→ COMPLETED
   │            │              │             │            │
   │            │              │             │            └─ Trust +
   │            │              │             │
   │            │              │             └─ REJECTED ──→ Trust −
   │            │              │                    │
   │            │              │                    └─→ REASSIGNED
   │            │              │
   │            │              └─→ FAILED ──→ Trust −
   │            │                    │
   │            │                    └─→ ESCALATED
   │            │
   │            └─→ DECLINED ──→ No trust impact
   │
   └─→ CANCELLED ──→ No trust impact`}
          </pre>

          <h3>State Descriptions</h3>
          <ul>
            <li><strong>CREATED</strong> — Task defined but not yet assigned to an agent</li>
            <li><strong>ASSIGNED</strong> — Agent selected and notified; clock starts</li>
            <li><strong>IN_PROGRESS</strong> — Agent has acknowledged and begun work</li>
            <li><strong>REVIEW</strong> — Work submitted, awaiting validation</li>
            <li><strong>COMPLETED</strong> — Work accepted; positive trust signal</li>
            <li><strong>REJECTED</strong> — Work didn&apos;t meet criteria; negative trust signal</li>
            <li><strong>FAILED</strong> — Agent could not complete the task</li>
            <li><strong>ESCALATED</strong> — Failure routed to a higher-trust agent or human</li>
            <li><strong>DECLINED</strong> — Agent opted out before starting (no trust impact)</li>
            <li><strong>CANCELLED</strong> — Delegator withdrew the task</li>
          </ul>

          <h2>Delegation Contracts</h2>

          <p>
            A delegation contract defines the agreement between delegator and delegate. It&apos;s
            not just &quot;do this thing&quot; — it specifies what success looks like, what
            resources are available, and what happens on failure.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface DelegationContract {
  // Identity
  id:             string;
  delegatorId:    string;      // Agent assigning the task
  delegateId:     string;      // Agent receiving the task
  
  // Task definition
  task:           string;      // What needs to be done
  context:        string;      // Background information
  inputs:         Json;        // Structured input data
  
  // Success criteria
  expectedOutput: string;      // What the result should look like
  acceptance:     AcceptanceCriteria[];  // Measurable criteria
  
  // Constraints
  deadline:       DateTime?;   // When it must be done by
  maxRetries:     number;      // How many attempts allowed
  escalationPath: string[];    // Who to escalate to on failure
  
  // Resources
  tools:          string[];    // Tools the delegate may use
  permissions:    string[];    // Elevated permissions granted
  tokenBudget:    number?;     // Max tokens the delegate may consume
  
  // Trust
  requiredTrust:  number;      // Minimum trust score to accept
  trustDomain:    string;      // Domain this delegation falls under
  
  // Lifecycle
  status:         DelegationStatus;
  createdAt:      DateTime;
  completedAt:    DateTime?;
  outcome:        DelegationOutcome?;
}`}
          </pre>

          <h3>Acceptance Criteria</h3>
          <p>
            Each contract can define one or more acceptance criteria. These are the measurable
            checks that determine whether the delegation succeeded.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`interface AcceptanceCriteria {
  description:  string;        // Human-readable description
  type:         'automated' | 'manual' | 'llm-judged';
  check:        string;        // How to verify (test command, review prompt, etc.)
  required:     boolean;       // Must pass for completion
}

// Example criteria for a code task:
[
  { description: "TypeScript compiles without errors",
    type: "automated", check: "pnpm tsc --noEmit", required: true },
  { description: "All tests pass",
    type: "automated", check: "pnpm test", required: true },
  { description: "Code follows project conventions",
    type: "llm-judged", check: "Review against CONVENTIONS.md", required: false },
]`}
          </pre>

          <h2>Delegation Templates</h2>

          <p>
            Templates are reusable patterns for common delegation scenarios. Instead of
            writing a full contract every time, agents can instantiate a template with
            task-specific parameters.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// Built-in templates
const TEMPLATES = {
  'code-review': {
    acceptance: [
      { description: "No critical issues found", type: "llm-judged", required: true },
      { description: "Suggestions are actionable", type: "llm-judged", required: false },
    ],
    requiredTrust: 0.7,
    trustDomain: 'code-review',
  },

  'implementation': {
    acceptance: [
      { description: "Code compiles", type: "automated", required: true },
      { description: "Tests pass", type: "automated", required: true },
    ],
    requiredTrust: 0.6,
    trustDomain: 'coding',
    maxRetries: 2,
  },

  'research': {
    acceptance: [
      { description: "Sources cited", type: "llm-judged", required: true },
      { description: "Covers all requested topics", type: "llm-judged", required: true },
    ],
    requiredTrust: 0.4,
    trustDomain: 'research',
  },
};`}
          </pre>

          <h2>How Delegation Feeds Trust</h2>

          <p>
            Every completed delegation generates a trust signal. These signals are stored
            as memories and feed into the delegate&apos;s{' '}
            <Link href="/docs/concepts/trust" className="text-purple-400 hover:text-purple-300">
              trust score
            </Link>.
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`// After delegation completes:
async recordOutcome(contract: DelegationContract, outcome: DelegationOutcome) {
  // 1. Store the outcome as a memory
  await this.memoryService.remember({
    raw: \`Delegation \${contract.id}: \${outcome.status} — \${outcome.summary}\`,
    layer: 'PROJECT',
    memoryType: 'EVENT',
    metadata: { delegationId: contract.id, outcome },
  });

  // 2. Update trust score
  const signal: TrustSignal = {
    domain:    contract.trustDomain,
    agentId:   contract.delegateId,
    type:      outcome.status === 'COMPLETED' ? 'positive' : 'negative',
    weight:    this.calculateWeight(contract),  // Higher for harder tasks
    timestamp: new Date(),
  };
  await this.trustService.recordSignal(signal);

  // 3. Update agent identity
  await this.identityService.refresh(contract.delegateId);
}`}
          </pre>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 not-prose text-sm text-gray-300">
            <p className="font-medium text-purple-400 mb-2">💡 Trust Weight</p>
            <p>
              Not all delegations carry equal trust weight. A complex multi-hour implementation
              task affects trust more than a simple formatting request. Weight is calculated
              from task complexity, time invested, and the number of acceptance criteria.
            </p>
          </div>

          <h2>Agent Selection</h2>

          <p>
            When a task needs to be delegated, Engram selects the best agent by matching
            the task requirements against available agent identities:
          </p>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`async selectDelegate(task: TaskDefinition): Promise<Agent | null> {
  const candidates = await this.agentService.findByCapability(task.domain);
  
  // Filter by minimum trust
  const trusted = candidates.filter(agent => 
    agent.trustScores[task.domain]?.score >= task.requiredTrust
  );
  
  // Rank by fit
  const ranked = trusted.sort((a, b) => {
    const scoreA = this.calculateFit(a, task);
    const scoreB = this.calculateFit(b, task);
    return scoreB - scoreA;
  });
  
  return ranked[0] ?? null;  // null triggers escalation
}

calculateFit(agent: Agent, task: TaskDefinition): number {
  const trust       = agent.trustScores[task.domain]?.score ?? 0;
  const proficiency = agent.capabilities[task.domain]?.proficiency ?? 0;
  const availability = agent.currentLoad < agent.maxLoad ? 1.0 : 0.5;
  
  return (trust * 0.4) + (proficiency * 0.4) + (availability * 0.2);
}`}
          </pre>

          <h2>Schema</h2>

          <pre className="bg-gray-900 p-4 rounded-lg text-sm">
{`enum DelegationStatus {
  CREATED
  ASSIGNED
  IN_PROGRESS
  REVIEW
  COMPLETED
  REJECTED
  FAILED
  ESCALATED
  DECLINED
  CANCELLED
}

model Delegation {
  id              String            @id @default(cuid())
  delegatorId     String
  delegateId      String?
  
  // Contract
  task            String
  context         String?
  expectedOutput  String?
  acceptance      Json              // AcceptanceCriteria[]
  templateId      String?
  
  // Constraints
  deadline        DateTime?
  maxRetries      Int               @default(1)
  retryCount      Int               @default(0)
  escalationPath  String[]
  
  // Trust
  requiredTrust   Float             @default(0.5)
  trustDomain     String
  trustWeight     Float?
  
  // Lifecycle
  status          DelegationStatus  @default(CREATED)
  outcome         Json?             // DelegationOutcome
  
  createdAt       DateTime          @default(now())
  assignedAt      DateTime?
  completedAt     DateTime?
  
  delegator       Agent             @relation("delegated", fields: [delegatorId], references: [id])
  delegate        Agent?            @relation("received", fields: [delegateId], references: [id])
}`}
          </pre>

          <h2>Best Practices</h2>
          <ul>
            <li>
              <strong>Define acceptance criteria upfront.</strong> Vague delegations lead to
              vague outcomes. Even a simple &quot;TypeScript compiles&quot; check makes the
              contract meaningful.
            </li>
            <li>
              <strong>Use templates for recurring patterns.</strong> If you delegate the same
              type of task regularly, create a template. It ensures consistency and reduces
              contract setup overhead.
            </li>
            <li>
              <strong>Set realistic trust thresholds.</strong> Don&apos;t require 0.9 trust
              for routine tasks — it prevents new agents from ever getting work. Start low
              (0.4–0.5) for simple tasks and increase for critical ones.
            </li>
            <li>
              <strong>Always define an escalation path.</strong> If the delegate fails, who
              handles it? Without an escalation path, failed tasks just sit there.
            </li>
            <li>
              <strong>Let the system learn.</strong> Delegation outcomes are the primary
              source of trust data. The more you delegate, the smarter the system gets at
              matching agents to tasks.
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
