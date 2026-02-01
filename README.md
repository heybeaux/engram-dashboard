# Engram Dashboard

Web UI for the [Engram](https://github.com/heybeaux/engram) memory infrastructure service.

## Features

- 📊 **Overview Dashboard** - Key metrics, health status, and API usage charts
- 🧠 **Memories Browser** - Search, filter, and inspect stored memories
- 👥 **Users Management** - View users and their memory statistics
- 🔑 **API Keys** - Create and manage API keys
- ⚙️ **Settings** - Configure LLM providers, vector storage, and webhooks

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
│   ├── page.tsx           # Overview dashboard
│   ├── memories/          # Memories browser
│   ├── users/             # Users management
│   ├── api-keys/          # API keys management
│   └── settings/          # Settings page
├── components/
│   ├── layout/            # Sidebar, Header
│   └── ui/                # shadcn/ui components
└── lib/
    ├── api.ts             # Engram API client
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

## License

MIT
