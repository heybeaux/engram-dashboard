# Engram Dashboard

Web UI for the [Engram](https://github.com/heybeaux/engram) memory infrastructure service.

**Ecosystem:** [Core API](https://github.com/heybeaux/engram) • [Dashboard](https://github.com/heybeaux/engram-dashboard) • [Local Embeddings](https://github.com/heybeaux/engram-embed)

## Features

- 📊 **Overview Dashboard** - Key metrics, health status, and API usage charts
- 🧠 **Memories Browser** - Search, filter, and inspect stored memories with multi-model embedding visibility
- 📈 **Analytics** - Memory creation trends, type distribution, and layer breakdown
- 🔗 **Ensemble Overview** - Multi-model embedding management, coverage stats, and A/B test results
- 👥 **Users Management** - View users and their memory statistics
- 🔑 **API Keys** - Create and manage API keys
- ⚙️ **Settings** - Configure LLM providers, vector storage, and webhooks

### Multi-Model Embedding Features (v1.1)

- **Memory Detail Embeddings Tab** - View which models have embeddings for each memory, with status indicators (✅ embedded, ⏳ pending, ❌ failed), dimensions, timestamps, and drift scores
- **Ensemble Overview Page** - Comprehensive view of:
  - Model registry with status (active/shadow/deprecated) and RRF weights
  - Embedding coverage statistics across all models
  - A/B test results showing model hit rates and query type performance
- **Re-embedding Management** - Monitor and trigger batch re-embedding jobs with progress tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Engram API running on localhost:3001

### Installation

```bash
# Clone the repository
git clone https://github.com/heybeaux/engram-dashboard.git
cd engram-dashboard

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Engram API base URL | `http://localhost:3001` |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── dashboard/     # Overview dashboard
│   │   ├── memories/      # Memories browser
│   │   │   └── [id]/      # Memory detail with embeddings tab
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── ensemble/      # Ensemble overview (multi-model)
│   │   ├── graph/         # Memory graph visualization
│   │   ├── users/         # Users management
│   │   ├── api-keys/      # API keys management
│   │   └── settings/      # Settings page
│   └── docs/              # Documentation pages
├── components/
│   ├── ensemble/          # Multi-model embedding components
│   │   └── memory-embeddings-tab.tsx
│   ├── layout/            # Sidebar, Header
│   └── ui/                # shadcn/ui components
└── lib/
    ├── engram-client.ts   # Main Engram API client
    ├── ensemble-client.ts # Ensemble/re-embedding API client
    ├── ensemble-types.ts  # Multi-model type definitions
    ├── types.ts           # Core type definitions
    └── utils.ts           # Utility functions
```

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## API Integration

The dashboard connects to the Engram API. Make sure the Engram service is running:

```bash
cd ../engram
pnpm dev
```

See the [Engram API documentation](https://github.com/heybeaux/engram) for available endpoints.

### Ensemble API Endpoints Used

The multi-model features use these API endpoints:

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/ensemble/status` | GET | Ensemble configuration | ✅ Implemented |
| `/ensemble/models` | GET | List registered models | 🔧 Proposed |
| `/ensemble/memories/:id/embeddings` | GET | Per-memory embedding status | 🔧 Proposed |
| `/ensemble/coverage` | GET | Embedding coverage stats | 🔧 Proposed |
| `/ensemble/ab-results` | GET | A/B test results | 🔧 Proposed |
| `/v1/reembedding/enabled` | GET | Check if re-embedding enabled | ✅ Implemented |
| `/v1/reembedding/status` | GET | Current job status | ✅ Implemented |
| `/v1/reembedding/jobs` | GET | List all jobs | ✅ Implemented |
| `/v1/reembedding/run` | POST | Trigger batch re-embed | ✅ Implemented |
| `/v1/reembedding/memory/:id` | POST | Re-embed single memory | ✅ Implemented |

**Note:** Endpoints marked "Proposed" gracefully degrade with placeholder data until implemented in the Engram API.

## License

MIT
