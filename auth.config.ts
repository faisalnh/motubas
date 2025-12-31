import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (no Node.js modules like bcrypt or db)
// This is used by middleware which runs on edge runtime
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // Providers are configured in auth.ts for Node.js runtime
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/register');
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/cars') ||
        nextUrl.pathname.startsWith('/reminders') ||
        nextUrl.pathname.startsWith('/om-motu') ||
        nextUrl.pathname.startsWith('/profile');

      // Redirect to dashboard if already logged in and trying to access auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Redirect to login if not logged in and trying to access protected routes
      if (isDashboardRoute && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
