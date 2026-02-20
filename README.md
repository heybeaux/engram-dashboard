<p align="center">
  <h1 align="center">Engram Dashboard</h1>
  <p align="center"><strong>Web UI for the Engram memory ecosystem.</strong></p>
  <p align="center">
    <strong>Ecosystem:</strong>&nbsp;
    <a href="https://github.com/heybeaux/engram">Memory API</a> •
    <a href="https://github.com/heybeaux/engram-code">Code Search</a> •
    <a href="https://github.com/heybeaux/engram-embed">Local Embeddings</a> •
    <b>Dashboard</b>
  </p>
</p>

Visualize, search, and manage your AI agent's memory. Built with Next.js, Tailwind, and shadcn/ui.

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Overview** | Key metrics, health status, API usage charts |
| 🧠 **Memories** | Browse, search, filter, and edit stored memories |
| 📈 **Analytics** | Memory trends, type distribution, layer breakdown |
| 🔗 **Ensemble** | Multi-model embedding management, coverage stats |
| 🕸️ **Graph** | D3 force-directed visualization of memory relationships |
| 👥 **Users** | View users and their memory statistics |
| 🔑 **API Keys** | Create and manage API keys |
| ⚙️ **Settings** | Configure LLM providers, vector storage, webhooks |
| 📚 **Docs** | Built-in documentation and quickstart guides |

## Screenshots

```
┌─────────────────────────────────────────────────────────────┐
│  Engram Dashboard                    🔔 ⚙️  beaux ▼        │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  📊 Overview │  ┌────────────────────────────────────────┐  │
│  🧠 Memories │  │  Total Memories: 1,247                 │  │
│  📈 Analytics│  │  Active Users: 3                       │  │
│  🔗 Ensemble │  │  API Calls (24h): 4,521                │  │
│  🕸️ Graph    │  │  Health: ✅ All systems operational    │  │
│  👥 Users    │  └────────────────────────────────────────┘  │
│  🔑 API Keys │                                              │
│  ⚙️ Settings │  ┌────────────────────────────────────────┐  │
│              │  │         Memory Type Distribution        │  │
│  ─────────── │  │  ████████████ FACT (45%)               │  │
│  📚 Docs     │  │  ████████     PREFERENCE (32%)         │  │
│              │  │  ████         EVENT (15%)              │  │
│              │  │  ██           TASK (6%)                │  │
│              │  │  █            CONSTRAINT (2%)          │  │
│              │  └────────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/heybeaux/engram-dashboard
cd engram-dashboard

# Install
pnpm install

# Configure
cp .env.example .env.local
# Edit NEXT_PUBLIC_ENGRAM_API_URL if needed

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Requirements:**
- Node.js 18+
- Engram API running on localhost:3001

## LAN Access

To access the dashboard from other devices on your network:

```bash
# Start with host binding
pnpm dev --hostname 0.0.0.0

# Or for production
pnpm build
pnpm start --hostname 0.0.0.0
```

Then access from any device: `http://<your-ip>:3000`

**Finding your IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_ENGRAM_API_URL` | `http://localhost:3001` | Engram API URL |
| `NEXT_PUBLIC_CODE_API_URL` | `http://localhost:3002` | engram-code API URL (optional) |

**For LAN access**, set the API URL to your machine's IP:
```env
NEXT_PUBLIC_ENGRAM_API_URL=http://192.168.1.100:3001
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     engram-dashboard                         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Next.js 14 (App Router)             │  │
│  │                                                        │  │
│  │  /dashboard     - Overview metrics                     │  │
│  │  /memories      - Memory browser                       │  │
│  │  /memories/:id  - Memory detail + embeddings tab       │  │
│  │  /analytics     - Trends and charts                    │  │
│  │  /ensemble      - Multi-model management               │  │
│  │  /graph         - D3 memory visualization              │  │
│  │  /users         - User management                      │  │
│  │  /api-keys      - Key management                       │  │
│  │  /settings      - Configuration                        │  │
│  │  /docs          - Documentation                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │              API Clients                              │   │
│  │                                                       │   │
│  │   engram-client.ts    → Engram Memory API (3001)     │   │
│  │   ensemble-client.ts  → Ensemble/Re-embedding API    │   │
│  │   code-client.ts      → engram-code API (3002)       │   │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │              UI Components (shadcn/ui)                │   │
│  │                                                       │   │
│  │   Button, Card, Dialog, Table, Badge, Chart...       │   │
│  │   + custom: MemoryCard, GraphView, EnsemblePanel...  │   │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Memory Browser

Search, filter, and explore stored memories:

```
┌─────────────────────────────────────────────────────────────┐
│  Memories                                         + Create  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search...    Type: [All ▼]  Layer: [All ▼]  User: beaux│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🏥 CONSTRAINT                       Score: 0.95     │   │
│  │ I'm allergic to peanuts             2 hours ago     │   │
│  │ Safety-critical • Never evicted                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⭐ PREFERENCE                       Score: 0.82     │   │
│  │ I prefer dark mode                  Yesterday       │   │
│  │ Layer: IDENTITY                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 FACT                             Score: 0.78     │   │
│  │ I live in Vancouver                 3 days ago      │   │
│  │ Layer: IDENTITY                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Memory Detail

Click a memory to view details:

| Tab | Content |
|-----|---------|
| **Overview** | Full content, 5W1H extraction, confidence scores |
| **Embeddings** | Per-model embedding status (✅ embedded, ⏳ pending, ❌ failed) |
| **Relationships** | Linked memories, contradictions |
| **History** | Creation, updates, access log |

## Ensemble Overview

Multi-model embedding management:

```
┌─────────────────────────────────────────────────────────────┐
│  Ensemble Overview                                          │
├─────────────────────────────────────────────────────────────┤
│  Model Registry                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Model      │ Status │ Dims │ Weight │ Coverage      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  bge-base   │ Active │ 768  │ 1.0    │ ██████ 100%   │  │
│  │  nomic      │ Active │ 768  │ 0.8    │ █████░ 85%    │  │
│  │  minilm     │ Shadow │ 384  │ 0.5    │ ███░░░ 50%    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Re-embedding Jobs                              [Run Now]   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Job #42    │ Complete │ 1,247/1,247 │ 3m 24s        │  │
│  │  Job #41    │ Complete │ 856/856     │ 2m 12s        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Graph Visualization

Interactive D3 force-directed graph showing memory relationships:

```
                    ┌──────────────┐
                    │ Allergic to  │
                    │   peanuts    │  🏥 Safety-critical
                    └──────┬───────┘
                           │ related
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
        │  Health   │ │  Diet   │ │ Emergency │
        │  records  │ │ prefs   │ │ contacts  │
        └───────────┘ └─────────┘ └───────────┘

Legend:
  ● CONSTRAINT (red ring)     ○ FACT
  ◐ PREFERENCE               ◑ EVENT
  ⬤ Large = high score       ○ Small = low score
```

**Interactions:**
- Drag nodes to reposition
- Click node to view memory details
- Scroll to zoom
- Hover for tooltip

## Project Structure

```
engram-dashboard/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/     # Overview
│   │   │   ├── memories/      # Memory browser
│   │   │   │   └── [id]/      # Memory detail
│   │   │   ├── analytics/     # Charts & trends
│   │   │   ├── ensemble/      # Multi-model view
│   │   │   ├── graph/         # D3 visualization
│   │   │   ├── users/         # User management
│   │   │   ├── api-keys/      # Key management
│   │   │   └── settings/      # Configuration
│   │   └── docs/              # Documentation pages
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   ├── ensemble/          # Multi-model components
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── engram-client.ts   # Memory API client
│       ├── ensemble-client.ts # Ensemble API client
│       ├── types.ts           # Type definitions
│       └── utils.ts           # Utilities
├── public/
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit
```

## API Endpoints Used

### Core Memory API (Engram)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/health` | GET | Health check and metrics |
| `/v1/memories` | GET | List memories |
| `/v1/memories/:id` | GET | Get memory detail |
| `/v1/memories/query` | POST | Semantic search |
| `/v1/memories/graph` | GET | Graph data |
| `/v1/context` | POST | Load context |

### Ensemble API

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/ensemble/status` | GET | Ensemble config | ✅ |
| `/ensemble/models` | GET | Model registry | 🔧 Proposed |
| `/ensemble/coverage` | GET | Coverage stats | 🔧 Proposed |
| `/v1/reembedding/status` | GET | Job status | ✅ |
| `/v1/reembedding/run` | POST | Trigger job | ✅ |

Endpoints marked "Proposed" gracefully degrade with placeholder data.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Graph | D3.js |
| Icons | Lucide React |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and `pnpm build`
5. Submit a pull request

## License

MIT

---

<p align="center">
  <em>See what your AI remembers.</em>
</p>
