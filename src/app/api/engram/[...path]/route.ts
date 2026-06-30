import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

const ENGRAM_API_URL = process.env.ENGRAM_API_URL || process.env.NEXT_PUBLIC_ENGRAM_API_URL || 'https://api.openengram.ai';
const ENGRAM_API_KEY = process.env.ENGRAM_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

function fallbackForMissingDashboardEndpoint(pathname: string, request: NextRequest): NextResponse | null {
  const now = new Date().toISOString();
  const searchParams = request.nextUrl.searchParams;

  if (pathname === '/v1/analytics/summary') {
    return NextResponse.json({
      totalMemories: 0,
      memoriesToday: 0,
      memoriesThisWeek: 0,
      avgImportance: 0,
      timeline: [],
      typeDistribution: {},
      layerDistribution: [],
      lastUpdated: now,
    });
  }

  if (pathname === '/v1/analytics/timeline') {
    return NextResponse.json({
      granularity: searchParams.get('granularity') || 'day',
      data: [],
      total: 0,
      range: {
        start: searchParams.get('start') || now,
        end: searchParams.get('end') || now,
      },
    });
  }

  if (pathname === '/v1/analytics/breakdown/type') {
    return NextResponse.json({
      granularity: searchParams.get('granularity') || 'week',
      data: [],
      summary: {
        dominant: null,
        distribution: {},
      },
    });
  }

  if (pathname === '/v1/analytics/breakdown/layer') {
    const includeTrend = searchParams.get('includeTrend') === 'true';
    return NextResponse.json({
      current: [],
      total: 0,
      ...(includeTrend
        ? {
            trend: {
              granularity: searchParams.get('granularity') || 'week',
              data: [],
            },
          }
        : {}),
    });
  }

  if (pathname === '/v1/notifications/config') {
    return NextResponse.json({
      config: {
        enabled: false,
        confidenceThreshold: 0.7,
        webhookUrl: '',
        hmacSecret: '',
      },
      history: [],
    });
  }

  if (pathname === '/v1/notifications/configure') {
    return new NextResponse(null, { status: 204 });
  }

  const trustMatch = pathname.match(/^\/v1\/identity\/trust\/([^/]+)$/);
  if (trustMatch && trustMatch[1] !== 'bulk') {
    const agentId = decodeURIComponent(trustMatch[1]);
    return NextResponse.json({
      agentId,
      agentName: agentId,
      overallTrust: 0,
      domains: [],
      history: [],
    });
  }

  return null;
}

async function authenticateCaller(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('engram_token')?.value;
  if (!token) return { valid: false, error: 'Missing authentication token' };
  try {
    if (JWT_SECRET) {
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    } else {
      const payload = decodeJwt(token);
      if (payload.exp && payload.exp * 1000 < Date.now()) return { valid: false, error: 'Token expired' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Invalid token' };
  }
}

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Local edition: skip JWT auth (single-user, no abuse risk)
  const edition = process.env.NEXT_PUBLIC_EDITION || 'cloud';
  if (edition !== 'local') {
    const auth = await authenticateCaller(request);
    if (!auth.valid) return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const pathname = `/${params.path.join('/')}`;
  const url = new URL(pathname, ENGRAM_API_URL);
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };
  if (ENGRAM_API_KEY) headers['X-AM-API-Key'] = ENGRAM_API_KEY;
  const authHeader = request.headers.get('authorization');
  if (authHeader) headers['Authorization'] = authHeader;
  const userId = request.headers.get('x-am-user-id') || process.env.ENGRAM_USER_ID || '';
  if (userId) headers['X-AM-User-ID'] = userId;

  const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined;

  try {
    const upstream = await fetch(url.toString(), { method: request.method, headers, body });
    const rh = new Headers();
    upstream.headers.forEach((v, k) => {
      if (!['transfer-encoding', 'content-encoding'].includes(k.toLowerCase())) rh.set(k, v);
    });
    if (upstream.status === 404) {
      const fallback = fallbackForMissingDashboardEndpoint(pathname, request);
      if (fallback) return fallback;
    }
    if (upstream.status === 204) return new NextResponse(null, { status: 204, headers: rh });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: rh });
  } catch (err) {
    console.error('[engram-proxy]', err);
    return NextResponse.json({ error: 'Upstream API unavailable' }, { status: 502 });
  }
}

export async function GET(r: NextRequest, c: { params: { path: string[] } }) { return proxyRequest(r, c); }
export async function POST(r: NextRequest, c: { params: { path: string[] } }) { return proxyRequest(r, c); }
export async function PUT(r: NextRequest, c: { params: { path: string[] } }) { return proxyRequest(r, c); }
export async function DELETE(r: NextRequest, c: { params: { path: string[] } }) { return proxyRequest(r, c); }
export async function PATCH(r: NextRequest, c: { params: { path: string[] } }) { return proxyRequest(r, c); }
