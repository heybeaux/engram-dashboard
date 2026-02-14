import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/terms', '/privacy'];
const PUBLIC_PREFIXES = ['/docs', '/_next', '/api', '/favicon.ico', '/fonts'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root redirect: authenticated → /dashboard, otherwise → /login
  if (pathname === '/') {
    const token = request.cookies.get('engram_token')?.value;
    const target = token ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get('engram_token')?.value;

  // If accessing dashboard routes without token, redirect to login
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding') || pathname.startsWith('/settings'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
