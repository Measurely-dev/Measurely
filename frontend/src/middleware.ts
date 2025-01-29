import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function to handle authentication and route protection
export default async function middleware(request: NextRequest) {
  // Extract URL pathname and check authentication status from cookie
  const url = request.nextUrl.pathname;
  const cookie = request.cookies.get('measurely-session');
  const logged = cookie !== undefined;
  // Set custom headers for authentication state and request path
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('is-authenticated', logged ? 'true' : 'false');
  requestHeaders.set('x-request-pathname', url);

  // Redirect /home to root path
  if (url === '/home' || url === '/home/') {
    return NextResponse.redirect(new URL('/', request.url), 308);
  }

  // Redirect /register/ to root path
  if (url === '/register/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Handle authentication redirects
  if (logged) {
    // Redirect authenticated users away from auth pages
    if (
      url.includes('sign-in') ||
      url.includes('register') ||
      url.includes('waitlist')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // Allow unauthenticated users to access auth pages
    if (
      url.includes('sign-in') ||
      url.includes('register') ||
      url.includes('waitlist')
    ) {
      return NextResponse.next();
    }
  }

  // Protect routes that require authentication
  if (
    url.includes('dashboard') ||
    url.includes('new-app') ||
    url.includes('new-metric')
  ) {
    if (!logged) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Continue with the request and pass along custom headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    '/',
    '/home',
    '/pricing',
    '/sign-in',
    '/register',
    '/waitlist',
    '/forgot-password',
    '/new-project',
    '/dashboard',
    '/dashboard/:appname*',
    '/docs/:slug*',
  ],
};
