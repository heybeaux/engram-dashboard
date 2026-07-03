import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ensemble drift client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('queues drift analysis with the async endpoint', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          jobId: 'drift-job-1',
          status: 'queued',
          createdAt: '2026-07-03T17:00:00.000Z',
          progress: { current: 0, total: 0, message: 'Queued drift analysis' },
        }),
        { status: 202, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { analyzeDrift } = await import('@/lib/ensemble-client');
    const result = await analyzeDrift();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/engram/v1/ensemble/drift/analyze',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toMatchObject({
      jobId: 'drift-job-1',
      status: 'queued',
      progress: { current: 0, total: 0 },
    });
  });

  it('polls drift analysis job status', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          jobId: 'drift-job-1',
          status: 'succeeded',
          createdAt: '2026-07-03T17:00:00.000Z',
          completedAt: '2026-07-03T17:01:00.000Z',
          progress: { current: 1, total: 1, message: 'All models within normal drift range' },
          snapshots: [
            {
              modelId: 'model-a',
              avgDrift: 0.05,
              maxDrift: 0.08,
              sampleCount: 1,
              alertLevel: 'normal',
            },
          ],
          summary: 'All models within normal drift range',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getDriftAnalyzeJob } = await import('@/lib/ensemble-client');
    const result = await getDriftAnalyzeJob('drift-job-1');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/engram/v1/ensemble/drift/analyze/jobs/drift-job-1',
      expect.any(Object),
    );
    expect(result.status).toBe('succeeded');
    expect(result.summary).toContain('normal');
    expect(result.snapshots).toHaveLength(1);
  });
});
