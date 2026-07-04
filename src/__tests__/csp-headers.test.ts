import { describe, expect, it } from 'vitest';

describe('Content-Security-Policy headers', () => {
  it('allows GA/GTM collection endpoints while keeping the dashboard CSP explicit', async () => {
    const config = (await import('../../next.config.mjs')).default;
    expect(config.headers).toBeDefined();

    const headersConfig = await config.headers?.();
    if (!headersConfig) {
      throw new Error('Expected Next config headers to be defined');
    }

    const csp = headersConfig
      .flatMap((entry: { headers: Array<{ key: string; value: string }> }) => entry.headers)
      .find((header: { key: string }) => header.key === 'Content-Security-Policy')?.value;

    expect(csp).toBeTruthy();
    expect(csp).toContain('https://www.googletagmanager.com');
    expect(csp).toContain('https://www.google-analytics.com');
    expect(csp).toContain('https://region1.google-analytics.com');
    expect(csp).toContain('https://www.google.com');
    expect(csp).toMatch(/script-src[^;]*https:\/\/openpanel\.dev/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/api\.openpanel\.dev/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/www\.google\.com/);
  });
});
