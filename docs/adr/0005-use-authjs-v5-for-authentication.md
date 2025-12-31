# ADR-0005: Use Auth.js v5 for Authentication

**Status:** Accepted

**Date:** 2025-12-31

**Deciders:** Development Team

---

## Context

Motubas needs user authentication for:
- Email/password registration and login
- Google OAuth (social login)
- Session management
- Protected routes (dashboard requires login)
- User profile management
- Subscription tier tracking (FREE vs PREMIUM)

Requirements:
- Easy integration with Next.js 15
- Support multiple authentication providers
- Type-safe with TypeScript
- Secure by default
- Works in serverless environment (Vercel)
- Good developer experience

## Decision

We will use **Auth.js v5** (formerly NextAuth.js v5) for authentication.

**Specific configuration:**
- Version: 5.0.0-beta.25 (stable beta, production-ready)
- Providers: Credentials (email/password) + Google OAuth
- Session strategy: JWT (serverless-compatible)
- Database adapter: PrismaAdapter for user/session storage
- Password hashing: bcryptjs with 10 rounds
- Middleware: Route protection with `auth()` callback

**Implementation structure:**
```typescript
// auth.ts - Main configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [Google, Credentials],
});

// middleware.ts - Route protection
export default auth((req) => {
  // Redirect logic
});
```

## Consequences

### Positive
- **Official Next.js integration:** Auth.js is maintained by Vercel team
- **Multiple providers easily:** Can add more OAuth providers later (Facebook, Apple)
- **Type-safe:** Full TypeScript support with proper types
- **Serverless-friendly:** JWT sessions work perfectly on Vercel
- **Secure defaults:** CSRF protection, secure cookies, httpOnly flags
- **Database integration:** Prisma adapter stores users, accounts, sessions
- **Well-documented:** Excellent docs and large community
- **Standard callbacks:** Easy to customize with session, JWT callbacks
- **Built-in pages:** Can customize or use default auth pages

### Negative
- **Beta version:** v5 still in beta (though stable)
- **Migration complexity:** Different API from v4 (breaking changes)
- **JWT size limits:** Session data in JWT can hit cookie size limits
- **Learning curve:** Auth concepts (providers, adapters, callbacks) take time
- **Debugging difficulty:** Auth flow can be hard to debug when issues occur

### Risks
- **Breaking changes:** Beta version may have API changes before stable release
- **Token size:** Adding too much data to session JWT could exceed limits
- **Security misconfiguration:** Easy to misconfigure if not following best practices
- **OAuth provider changes:** Google may change OAuth API
- **Session expiry issues:** JWT expiry handling needs careful implementation

**Mitigation:**
- Pin to specific beta version (5.0.0-beta.25) tested as stable
- Keep session JWT minimal (only user ID, email, name)
- Follow Auth.js security best practices documentation
- Store additional user data in database, query when needed
- Implement session refresh logic
- Monitor for Auth.js v5 stable release and upgrade when available

## Alternatives Considered

### Option 1: Clerk
- **Pros:** Beautiful UI, easy setup, hosted auth, great DX
- **Cons:** Expensive ($25/month after free tier), vendor lock-in, external dependency
- **Why rejected:** Cost prohibitive for freemium model, prefer self-hosted

### Option 2: Auth0
- **Pros:** Enterprise-grade, comprehensive features, good UI
- **Cons:** Complex pricing, overkill for simple app, external service
- **Why rejected:** Too complex and expensive for MVP needs

### Option 3: Supabase Auth
- **Pros:** Free tier, simple, includes database
- **Cons:** Requires Supabase database (we use Vercel Postgres), another service to manage
- **Why rejected:** Already using Vercel Postgres, don't want to add Supabase

### Option 4: Firebase Auth
- **Pros:** Free tier, Google integration, many providers
- **Cons:** Google ecosystem lock-in, Firebase SDK overhead, not Next.js optimized
- **Why rejected:** Prefer Next.js-native solution

### Option 5: Custom Auth (Passport.js or manual)
- **Pros:** Full control, no dependencies, learn deeply
- **Cons:** Security risks, time-consuming, need to handle edge cases
- **Why rejected:** Security too critical to build from scratch for MVP

### Option 6: Lucia Auth
- **Pros:** Modern, TypeScript-first, framework agnostic, simpler than Auth.js
- **Cons:** Newer (less battle-tested), smaller community, more manual setup
- **Why rejected:** Auth.js has larger community and better Next.js integration

## Why Auth.js v5 (Beta) vs v4 (Stable)?

- **v5 improvements:**
  - Better App Router support (v4 was Pages Router focused)
  - Simplified API (single `auth()` function)
  - Better TypeScript types
  - Modern React patterns (Server Components)
  - Standard Web APIs

- **v5 beta stability:**
  - Used in production by many companies
  - Breaking changes unlikely at this stage
  - Vercel dogfoods it
  - Migration path to stable documented

**Risk accepted:** v5 beta chosen despite beta status because v4 doesn't work well with Next.js 15 App Router.

## Password Security

Using bcryptjs for password hashing:
```typescript
import { hash, compare } from 'bcryptjs';

// Registration
const hashedPassword = await hash(password, 10); // 10 rounds

// Login
const isValid = await compare(password, user.password);
```

- **10 rounds:** Balance between security and performance
- **bcryptjs vs bcrypt:** bcryptjs is pure JS (no native deps), works in serverless
- **No plaintext:** Passwords never stored or logged in plaintext

## OAuth Security

Google OAuth configured with:
- Verified redirect URIs (prevent open redirect attacks)
- PKCE flow (prevents authorization code interception)
- State parameter (CSRF protection)
- Secure cookie storage (httpOnly, sameSite)

## References

- [Auth.js v5 Documentation](https://authjs.dev)
- [Auth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Migrating to v5](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [bcryptjs on npm](https://www.npmjs.com/package/bcryptjs)

---

## Changelog

- **2025-12-31:** Initial decision - Auth.js v5 chosen for authentication system
