# Environment Variables

> Auto-audited from codebase on 2026-02-20.

## Client-Side (`NEXT_PUBLIC_*`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_ENGRAM_API_URL` | No | `https://api.openengram.ai` | Base URL for the Engram API (client-side requests) |
| `NEXT_PUBLIC_ENGRAM_USER_ID` | No | `"default"` | Default user ID for unauthenticated/local mode |
| `NEXT_PUBLIC_ENGRAM_API_KEY` | No | `""` | API key exposed to client (used in settings/cloud and consolidation pages) |
| `NEXT_PUBLIC_ENGRAM_CODE_URL` | No | `https://code.openengram.ai` | Base URL for the Engram Code semantic search service |
| `NEXT_PUBLIC_EDITION` | No | `"local"` | Edition mode: `"local"` (self-hosted) or `"cloud"` (managed SaaS). Controls sidebar nav, page access, feature flags |
| `NEXT_PUBLIC_DEPLOYMENT_MODE` | No | — | **Deprecated.** Legacy alias for EDITION. Used in middleware for cloud auth gating and in setup page |
| `NEXT_PUBLIC_GA_ID` | No | — | Google Analytics 4 measurement ID. Only loaded in production |
| `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` | No | — | OpenPanel analytics client ID. Only loaded in production |
| `NEXT_PUBLIC_SENTRY_DSN` | No | — | Sentry DSN. Enables Sentry error tracking when set |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | — | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog ingestion host |

## Server-Side Only

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENGRAM_API_URL` | No | Falls back to `NEXT_PUBLIC_ENGRAM_API_URL` then `https://api.openengram.ai` | Server-side Engram API URL (used by `/api/engram` proxy) |
| `ENGRAM_API_KEY` | **Yes** (for proxy) | `""` | Server-side API key for authenticating proxy requests to Engram |
| `ENGRAM_USER_ID` | No | `"default"` | Server-side user ID fallback (used in OpenClaw integration docs page) |
| `ENGRAM_AGENT_ID` | No | — | Agent ID for OpenClaw integration (docs page only) |
| `ENGRAM_CODE_URL` | No | Falls back to `NEXT_PUBLIC_ENGRAM_CODE_URL` | Server-side Code service URL fallback |
| `JWT_SECRET` | No | `""` | JWT secret for full signature verification in middleware/proxy. Without it, middleware still validates token expiry (decode-only) |
| `SENTRY_ORG` | No | — | Sentry organization slug (used in next.config.mjs build plugin) |
| `SENTRY_PROJECT` | No | — | Sentry project slug (used in next.config.mjs build plugin) |

## Built-in / Runtime

| Variable | Description |
|---|---|
| `NODE_ENV` | Standard Node.js env. Used to gate analytics scripts (production only) and Sentry environment tagging |

## Discrepancies

### In code but NOT in `.env.example`

- `NEXT_PUBLIC_ENGRAM_API_KEY` — used in `settings/cloud/page.tsx` and `consolidation/page.tsx`
- `NEXT_PUBLIC_SENTRY_DSN` — used in sentry configs and next.config.mjs
- `NEXT_PUBLIC_POSTHOG_KEY` — used in `posthog-provider.tsx` and `posthog.ts`
- `NEXT_PUBLIC_POSTHOG_HOST` — used in `posthog.ts`
- `NEXT_PUBLIC_DEPLOYMENT_MODE` — deprecated but still referenced in middleware and setup page
- `ENGRAM_AGENT_ID` — used in OpenClaw integration docs
- `ENGRAM_CODE_URL` — server-side fallback in `engram-code.ts`
- `SENTRY_ORG` — build-time Sentry config
- `SENTRY_PROJECT` — build-time Sentry config

### In `.env.example` but potentially redundant

- All vars in `.env.example` are actively used ✅

### Notes

- `NEXT_PUBLIC_ENGRAM_API_KEY` is exposed to the browser — this is intentional for local/self-hosted mode but should be reviewed for cloud deployments
- `NEXT_PUBLIC_DEPLOYMENT_MODE` is deprecated in favor of `NEXT_PUBLIC_EDITION` but is still actively checked in `middleware.ts` and `setup/page.tsx`
