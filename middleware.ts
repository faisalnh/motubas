import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
                      nextUrl.pathname.startsWith('/register');
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') ||
                           nextUrl.pathname.startsWith('/cars') ||
                           nextUrl.pathname.startsWith('/reminders') ||
                           nextUrl.pathname.startsWith('/om-motu') ||
                           nextUrl.pathname.startsWith('/profile');

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirect to login if not logged in and trying to access protected routes
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
