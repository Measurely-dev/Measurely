import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  if (url === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  const cookie = cookies().get('measurely-session');

  let logged = false;
  if (cookie !== undefined) {
    logged = true;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('is-authentificated', logged ? 'true' : 'false');

  if (
    url.includes('dashboard') ||
    url.includes('new-app') ||
    url.includes('new-metric')
  ) {
    if (!logged) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  } else if (url.includes('sign-in') || url.includes('register')) {
    if (logged) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/home',
    '/pricing',
    '/sign-in',
    '/register',
    '/forgot-password',
    '/new-app',
    '/dashboard',
    '/dashboard/:appname*',
  ],
};
