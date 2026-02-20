'use client';

import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (initialized) return;
  if (!POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
  });
  initialized = true;
}

/**
 * Hash a string to a hex digest using SHA-256.
 * Used to avoid sending PII (email) to PostHog (HEY-217).
 */
async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Identify a user in PostHog using a hashed identifier.
 * Never sends raw email or PII — uses SHA-256 hash instead (HEY-217).
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  // Strip PII: hash the userId (which may be an email) and remove email from properties
  const sanitized = { ...properties };
  delete sanitized.email;
  delete sanitized.name;
  sha256(userId.toLowerCase().trim()).then((hashedId) => {
    posthog.identify(hashedId, sanitized);
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function resetPostHog() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export { posthog };
