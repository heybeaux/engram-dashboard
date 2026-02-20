import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('api-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getApiBaseUrl', () => {
    it('returns NEXT_PUBLIC_ENGRAM_API_URL when set', async () => {
      process.env.NEXT_PUBLIC_ENGRAM_API_URL = 'https://custom.api.com';
      const { getApiBaseUrl } = await import('@/lib/api-config');
      expect(getApiBaseUrl()).toBe('https://custom.api.com');
    });

    it('falls back to ENGRAM_API_URL', async () => {
      delete process.env.NEXT_PUBLIC_ENGRAM_API_URL;
      process.env.ENGRAM_API_URL = 'https://server-only.api.com';
      const { getApiBaseUrl } = await import('@/lib/api-config');
      expect(getApiBaseUrl()).toBe('https://server-only.api.com');
    });

    it('returns default URL when no env vars set', async () => {
      delete process.env.NEXT_PUBLIC_ENGRAM_API_URL;
      delete process.env.ENGRAM_API_URL;
      const { getApiBaseUrl } = await import('@/lib/api-config');
      expect(getApiBaseUrl()).toBe('https://api.openengram.ai');
    });
  });

  describe('getApiKey', () => {
    it('returns NEXT_PUBLIC_ENGRAM_API_KEY when set', async () => {
      process.env.NEXT_PUBLIC_ENGRAM_API_KEY = 'test-key-123';
      const { getApiKey } = await import('@/lib/api-config');
      expect(getApiKey()).toBe('test-key-123');
    });

    it('falls back to ENGRAM_API_KEY', async () => {
      delete process.env.NEXT_PUBLIC_ENGRAM_API_KEY;
      process.env.ENGRAM_API_KEY = 'server-key-456';
      const { getApiKey } = await import('@/lib/api-config');
      expect(getApiKey()).toBe('server-key-456');
    });

    it('returns empty string when no key set', async () => {
      delete process.env.NEXT_PUBLIC_ENGRAM_API_KEY;
      delete process.env.ENGRAM_API_KEY;
      const { getApiKey } = await import('@/lib/api-config');
      expect(getApiKey()).toBe('');
    });
  });

  describe('getDefaultUserId', () => {
    it('returns NEXT_PUBLIC_ENGRAM_USER_ID when set', async () => {
      process.env.NEXT_PUBLIC_ENGRAM_USER_ID = 'user-abc';
      const { getDefaultUserId } = await import('@/lib/api-config');
      expect(getDefaultUserId()).toBe('user-abc');
    });

    it('returns empty string when no user ID set', async () => {
      delete process.env.NEXT_PUBLIC_ENGRAM_USER_ID;
      delete process.env.ENGRAM_USER_ID;
      const { getDefaultUserId } = await import('@/lib/api-config');
      expect(getDefaultUserId()).toBe('');
    });
  });

  describe('buildAuthHeaders', () => {
    it('includes API key when provided', async () => {
      const { buildAuthHeaders } = await import('@/lib/api-config');
      const headers = buildAuthHeaders({ apiKey: 'my-key' });
      expect(headers['X-AM-API-Key']).toBe('my-key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('includes user ID when provided', async () => {
      const { buildAuthHeaders } = await import('@/lib/api-config');
      const headers = buildAuthHeaders({ userId: 'user-123' });
      expect(headers['X-AM-User-ID']).toBe('user-123');
    });

    it('merges extra headers', async () => {
      const { buildAuthHeaders } = await import('@/lib/api-config');
      const headers = buildAuthHeaders({ extraHeaders: { 'X-Custom': 'value' } });
      expect(headers['X-Custom']).toBe('value');
    });
  });
});
