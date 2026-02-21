# Staging Dashboard Deploy

## How It Works

The dashboard **auto-deploys via Vercel** on every push to `main`. No manual deploy step is needed.

## Verify

1. Open [staging.openengram.ai](https://staging.openengram.ai) after push
2. Check the [Vercel dashboard](https://vercel.com) for build status — ensure the latest deployment is green

## Environment Variables

These must be set in the Vercel project settings:

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_ENGRAM_API_URL` | `https://staging-api.openengram.ai` |
| `NEXT_PUBLIC_APP_URL` | `https://staging.openengram.ai` |

Check Vercel project settings if the dashboard can't reach the API.

## Rollback

1. Go to the Vercel dashboard → Deployments
2. Find the last known-good deployment
3. Click **Promote to Production** (or **Redeploy**)

This instantly rolls back the staging dashboard without needing a code revert.
