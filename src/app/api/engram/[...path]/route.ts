import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

const ENGRAM_API_URL = process.env.ENGRAM_API_URL || process.env.NEXT_PUBLIC_ENGRAM_API_URL || 'https://api.openengram.ai';
const ENGRAM_API_KEY = process.env.ENGRAM_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

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

  const url = new URL(`/${params.path.join('/')}`, ENGRAM_API_URL);
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
