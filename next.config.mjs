import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    // Allow self-hosted API/code URLs in CSP connect-src.
    const apiUrl = process.env.NEXT_PUBLIC_ENGRAM_API_URL || '';
    const codeUrl = process.env.NEXT_PUBLIC_ENGRAM_CODE_URL || 'https://code.openengram.ai';
    const extraConnectSrc = [apiUrl, codeUrl]
      .filter((url) => url && !url.includes('localhost'))
      .map((url) => ` ${url}`)
      .join('');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://us.i.posthog.com https://www.googletagmanager.com https://openpanel.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              `connect-src 'self' http://localhost:3001 http://localhost:3002 http://10.0.0.55:3001 http://10.0.0.55:3002 https://api.openengram.ai https://staging-api.openengram.ai https://us.i.posthog.com https://api.openpanel.dev https://*.sentry.io https://www.google-analytics.com https://region1.google-analytics.com https://www.google.com${extraConnectSrc}`,
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
