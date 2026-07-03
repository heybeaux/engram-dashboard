import { describe, expect, it } from 'vitest';
import { buildGaConfigScript, buildOpenPanelScript, sanitizeAnalyticsId } from '@/lib/analytics-script';

describe('analytics script helpers', () => {
  it('trims empty and whitespace-padded analytics ids', () => {
    expect(sanitizeAnalyticsId(undefined)).toBeUndefined();
    expect(sanitizeAnalyticsId('   \n')).toBeUndefined();
    expect(sanitizeAnalyticsId(' G-TEST123 \n')).toBe('G-TEST123');
  });

  it('emits a parse-safe OpenPanel inline script when the client id contains newlines or quotes', () => {
    const script = buildOpenPanelScript(' client-"quoted"\n');

    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain('clientId:" client-\\"quoted\\"\\n"');
    expect(script).not.toContain('clientId:" client-"quoted"\n"');
  });

  it('emits a parse-safe GA config script when the measurement id contains newlines or quotes', () => {
    const script = buildGaConfigScript(' G-"quoted"\n');

    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain('gtag(\'config\'," G-\\"quoted\\"\\n")');
  });
});
