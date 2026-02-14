'use client';

import Link from 'next/link';
import { Brain, Layers, Search, Zap, Shield, GitBranch, ArrowRight, Github, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Brain,
    title: 'Semantic Memory',
    description: 'Vector embeddings enable semantic search. Your agent finds relevant memories by meaning, not keywords.',
  },
  {
    icon: Layers,
    title: 'Layered Context',
    description: 'Identity, project, and session layers. The right memories surface at the right time.',
  },
  {
    icon: Zap,
    title: 'Auto-Extraction',
    description: 'Drop in conversation turns. Engram extracts entities, facts, and preferences automatically.',
  },
  {
    icon: Search,
    title: 'Smart Retrieval',
    description: 'Priority-based retrieval ensures constraints are never forgotten, even under token pressure.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant',
    description: 'User isolation by default. Each user gets their own memory space, cryptographically separated.',
  },
  {
    icon: GitBranch,
    title: 'Memory Graph',
    description: 'Entities link to memories. Visualize the knowledge graph your agent builds over time.',
  },
];

const codeExample = `// Observe a conversation
await engram.observe({
  turns: [
    { role: 'user', content: 'I am allergic to peanuts' },
    { role: 'assistant', content: 'Noted! I will remember that.' }
  ]
});

// Load context for next session
const { context } = await engram.loadContext({
  maxTokens: 2000
});
// → "User has a peanut allergy (CONSTRAINT)"`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Open Engram',
  description: 'Persistent memory for AI agents — store, recall, and evolve memories with semantic search, knowledge graphs, and autonomous consolidation.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cloud',
  url: 'https://openengram.ai',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', description: '1,000 memories, 100 API calls/day' },
    { '@type': 'Offer', name: 'Starter', price: '9', priceCurrency: 'USD', description: '10,000 memories, 1,000 API calls/day' },
    { '@type': 'Offer', name: 'Pro', price: '39', priceCurrency: 'USD', description: '100,000 memories, knowledge graph' },
    { '@type': 'Offer', name: 'Scale', price: '99', priceCurrency: 'USD', description: '1,000,000 memories, unlimited API calls' },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Engram</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/heybeaux/engram" 
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="/docs" 
                className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
              >
                Docs
              </Link>
              <Button asChild>
                <Link href="/dashboard">Dashboard →</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Memory Infrastructure for{' '}
              <span className="text-primary">AI Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your agents wake up blank every session. Engram gives them persistent, 
              semantic, layered memory — so they remember what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/heybeaux/engram" target="_blank">
                  <Github className="mr-2 h-4 w-4" /> View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Simple API, Powerful Memory
            </h2>
            <div className="bg-zinc-950 rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything Your Agent Needs to Remember
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built for production. Designed for developers who want their agents to actually remember.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory Types */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            Memory Intelligence
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Not all memories are equal. Engram classifies and prioritizes automatically.
          </p>
          <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { type: 'CONSTRAINT', desc: 'Never forget', color: 'bg-red-500/10 border-red-500/30 text-red-500' },
              { type: 'PREFERENCE', desc: 'Personalization', color: 'bg-blue-500/10 border-blue-500/30 text-blue-500' },
              { type: 'TASK', desc: 'Action items', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' },
              { type: 'FACT', desc: 'Knowledge', color: 'bg-green-500/10 border-green-500/30 text-green-500' },
              { type: 'EVENT', desc: 'History', color: 'bg-purple-500/10 border-purple-500/30 text-purple-500' },
            ].map((item) => (
              <div
                key={item.type}
                className={`p-4 rounded-lg border text-center ${item.color}`}
              >
                <div className="font-mono font-bold text-sm">{item.type}</div>
                <div className="text-xs mt-1 opacity-80">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Constraints are protected — they&apos;re never evicted, even under token pressure.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Give Your Agent Memory?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Self-hosted, open source, and built for developers. 
            Start remembering in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://docs.engram.dev" target="_blank">
                <BookOpen className="mr-2 h-4 w-4" /> Read the Docs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="h-5 w-5" />
              <span>Engram</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built by{' '}
              <Link 
                href="https://heybeaux.dev" 
                target="_blank" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Beaux Walton
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/heybeaux/engram" 
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
