import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  const cookie = request.cookies.get('measurely-session');
  const logged = cookie !== undefined;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('is-authenticated', logged ? 'true' : 'false');
  requestHeaders.set('x-request-pathname', url);

  // if (url === '/register/') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  if (logged) {
    if (url === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (url.includes('sign-in') || url.includes('register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    if (url === '/home/') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (url.includes('sign-in') || url.includes('register')) {
      return NextResponse.next();
    }
  }

  if (
    url.includes('dashboard') ||
    url.includes('new-app') ||
    url.includes('new-metric')
  ) {
    if (!logged) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/pricing',
    '/sign-in',
    '/register',
    '/forgot-password',
    '/new-project',
    '/dashboard',
    '/dashboard/:appname*',
  ],
};
