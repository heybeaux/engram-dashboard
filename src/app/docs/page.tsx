'use client';

import Link from 'next/link';

const docs = [
  {
    category: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/introduction', description: 'What is Engram and why it exists' },
      { title: 'Quick Start', href: '/docs/quickstart', description: '5-minute setup guide' },
      { title: 'Architecture', href: '/docs/architecture', description: 'System design and components' },
    ],
  },
  {
    category: 'Core Concepts',
    items: [
      { title: 'Memory Layers', href: '/docs/concepts/layers', description: 'IDENTITY, PROJECT, SESSION, TASK' },
      { title: 'Memory Types', href: '/docs/concepts/types', description: 'CONSTRAINT, PREFERENCE, FACT, EVENT' },
      { title: 'Extraction Pipeline', href: '/docs/concepts/extraction', description: '5W1H extraction and entity recognition' },
    ],
  },
  {
    category: 'Memory Intelligence v2',
    items: [
      { title: 'Effective Score', href: '/docs/intelligence/effective-score', description: 'Dynamic importance scoring' },
      { title: 'Safety Detection', href: '/docs/intelligence/safety', description: 'Protecting critical memories' },
      { title: 'Sleep Consolidation', href: '/docs/intelligence/consolidation', description: 'Pattern promotion and gist extraction' },
    ],
  },
  {
    category: 'Integration',
    items: [
      { title: 'OpenClaw Hook', href: '/docs/integration/openclaw', description: 'Auto-capture from conversations' },
      { title: 'API Reference', href: '/docs/api', description: 'REST API endpoints' },
      { title: 'SDK', href: '/docs/sdk', description: 'TypeScript client library' },
    ],
  },
  {
    category: 'Operations',
    items: [
      { title: 'Self Hosting', href: '/docs/operations/self-hosting', description: 'Deploy your own Engram instance' },
      { title: 'Configuration', href: '/docs/operations/configuration', description: 'Environment variables and options' },
      { title: 'Health Monitoring', href: '/docs/operations/health', description: 'System health and metrics' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-gray-400">
            Everything you need to understand and use Engram — persistent memory for AI agents.
          </p>
        </div>

        <div className="grid gap-12">
          {docs.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-semibold mb-6 text-purple-400">{section.category}</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
                  >
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
