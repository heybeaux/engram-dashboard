import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {};

const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
