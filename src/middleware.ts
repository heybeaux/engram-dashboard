import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

const PUBLIC_PATHS = ['/login', '/signup', '/register', '/terms', '/privacy', '/setup'];
const PUBLIC_PREFIXES = ['/docs', '/_next', '/api', '/favicon.ico', '/fonts'];

/** Routes that should only be accessible in self-hosted mode */
const SELF_HOSTED_ONLY_PATHS = ['/setup'];
/** Routes that should only be accessible in self-hosted mode (prefix match) */
const SELF_HOSTED_ONLY_PREFIXES = ['/code'];

const IS_CLOUD = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud';

const JWT_SECRET = process.env.JWT_SECRET || '';

async function isValidToken(token: string): Promise<boolean> {
  try {
    if (JWT_SECRET) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return true;
    }
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root redirect: authenticated → /dashboard, otherwise → /login
  if (pathname === '/') {
    const token = request.cookies.get('engram_token')?.value;
    const valid = token ? await isValidToken(token) : false;
    const target = valid ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Block self-hosted-only routes on cloud deployments
  if (IS_CLOUD) {
    const isSelfHostedRoute =
      SELF_HOSTED_ONLY_PATHS.includes(pathname) ||
      SELF_HOSTED_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (isSelfHostedRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get('engram_token')?.value;

  // Protect ALL other routes — validate token, not just existence (HEY-204)
  if (!token || !(await isValidToken(token))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
