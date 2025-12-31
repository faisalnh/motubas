# ADR-0002: Choose Next.js 15 as Frontend Framework

**Status:** Accepted

**Date:** 2025-12-31

**Deciders:** Development Team

---

## Context

Motubas needs a modern, production-ready web framework for building the MVP. Key requirements:
- Fast development velocity
- Server-side rendering for SEO (important for Indonesian market discovery)
- Easy deployment to Vercel
- Strong TypeScript support
- Built-in API routes to avoid separate backend
- Good performance for users in Indonesia with varying internet speeds
- Large ecosystem and community support

The app will eventually need mobile versions (iOS/Android), but MVP is web-only.

## Decision

We will use **Next.js 15 (App Router)** with TypeScript as the frontend framework for Motubas.

**Specific configuration:**
- Next.js version: 15.1.4 (latest stable as of 2025-12-31)
- TypeScript: 5.7.2
- App Router (not Pages Router)
- Turbopack for development (faster builds)
- Server Components by default
- Client Components only when necessary (forms, interactivity)

## Consequences

### Positive
- **Server-side rendering:** Improves SEO and initial page load performance
- **API routes included:** No need for separate backend setup, simplifies architecture
- **Vercel optimization:** Seamless deployment with automatic optimizations
- **Strong TypeScript support:** Excellent type safety and developer experience
- **Server Components:** Reduced JavaScript sent to browser, faster page loads
- **Large ecosystem:** Easy to find solutions, libraries, and developers
- **React 19 support:** Access to latest React features
- **Built-in image optimization:** Automatic image compression and lazy loading
- **Incremental Static Regeneration:** Can optimize static pages later if needed

### Negative
- **Learning curve for App Router:** Newer paradigm, less Stack Overflow answers than Pages Router
- **Server Components mental model:** Team needs to understand server vs client boundaries
- **Vendor lock-in to Vercel:** While can deploy elsewhere, optimized for Vercel
- **Bundle size:** Full-featured framework, larger than minimal alternatives
- **Overkill for simple pages:** Some features unused in MVP

### Risks
- **Breaking changes:** Next.js evolves fast, migrations may be needed
- **Performance with serverless:** Cold starts on Vercel functions could affect UX
- **Indonesia-specific issues:** Vercel CDN performance in Indonesia to be validated

**Mitigation:**
- Pin to specific Next.js version (15.1.4) for stability
- Use Vercel Edge Functions for critical paths to reduce cold starts
- Test performance from Indonesia early in development
- Keep components simple and composable for easy framework migration if needed

## Alternatives Considered

### Option 1: Create React App (CRA)
- **Pros:** Simple, well-known, React-only
- **Cons:** Deprecated, no SSR, requires separate backend, poor performance
- **Why rejected:** No longer maintained, doesn't meet SSR requirement

### Option 2: Remix
- **Pros:** Excellent server-side patterns, nested routing, web standards
- **Cons:** Smaller ecosystem, less Vercel optimization, newer framework
- **Why rejected:** Next.js has larger community and better Vercel integration

### Option 3: Astro
- **Pros:** Very fast, great for content sites, islands architecture
- **Cons:** Less suitable for interactive dashboards, smaller React ecosystem
- **Why rejected:** Motubas needs rich interactivity (forms, AI chat), not primarily content

### Option 4: SvelteKit
- **Pros:** Excellent performance, less boilerplate than React
- **Cons:** Smaller talent pool, less ecosystem, team unfamiliar with Svelte
- **Why rejected:** Hiring and knowledge sharing harder with Svelte

### Option 5: Vite + React Router
- **Pros:** Fast builds, flexible, lightweight
- **Cons:** No SSR out of box, manual setup for everything, requires separate backend
- **Why rejected:** Too much manual configuration, no SSR without extra work

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Vercel Next.js Performance](https://vercel.com/docs/frameworks/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## Changelog

- **2025-12-31:** Initial decision - Next.js 15 chosen as frontend framework
