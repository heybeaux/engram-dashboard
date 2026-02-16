import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/register', '/terms', '/privacy', '/setup'];
const PUBLIC_PREFIXES = ['/docs', '/_next', '/api', '/favicon.ico', '/fonts'];

/** Routes that should only be accessible in self-hosted mode */
const SELF_HOSTED_ONLY_PATHS = ['/setup'];
/** Routes that should only be accessible in self-hosted mode (prefix match) */
const SELF_HOSTED_ONLY_PREFIXES = ['/code'];

const IS_CLOUD = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root redirect: authenticated → /dashboard, otherwise → /login
  if (pathname === '/') {
    const token = request.cookies.get('engram_token')?.value;
    const target = token ? '/dashboard' : '/login';
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

  // Protect ALL other routes — if no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
