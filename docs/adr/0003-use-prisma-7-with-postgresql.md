# ADR-0003: Use Prisma 7 with PostgreSQL

**Status:** Accepted

**Date:** 2025-12-31

**Deciders:** Development Team

---

## Context

Motubas needs a database and ORM for storing:
- User accounts and authentication data
- Car information (make, model, year, mileage)
- Service records with relationships
- Maintenance reminders
- AI conversation history
- Future: Bengkel (workshop) data

Key requirements:
- Type-safe queries (TypeScript integration)
- Good developer experience
- Support for complex relationships (users → cars → service records → reminders)
- Migration system for schema changes
- Compatible with Vercel serverless environment
- PostgreSQL as database (relational data with strong consistency needs)

## Decision

We will use **Prisma 7 ORM** with **PostgreSQL** as the database.

**Specific configuration:**
- Prisma version: 7.1.0
- Database: PostgreSQL (via Vercel Postgres for production)
- Prisma adapter: `@prisma/adapter-pg` with `pg` driver (required for Prisma 7 + serverless)
- Schema location: `prisma/schema.prisma`
- Client generation: TypeScript types auto-generated
- Migration strategy: Prisma Migrate for development and production

**Critical implementation detail:**
```typescript
// lib/db.ts - Using PG adapter for serverless
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

## Consequences

### Positive
- **Type safety:** Auto-generated TypeScript types for all queries
- **Great DX:** Prisma Studio for visual database browsing, excellent autocomplete
- **Migration system:** Prisma Migrate handles schema changes reliably
- **Prisma 7 improvements:** Rust-free (faster client generation), TypeScript-based, better serverless support
- **PostgreSQL benefits:** ACID compliance, strong data consistency, JSON support, full-text search
- **Vercel integration:** Vercel Postgres works seamlessly with Prisma
- **Relationship handling:** Easy to query nested data (user → cars → services)
- **Schema as code:** Single source of truth in `schema.prisma`

### Negative
- **Learning curve:** Prisma-specific query syntax different from raw SQL
- **Abstraction overhead:** Some complex queries harder than raw SQL
- **Migration complexity:** Schema changes require careful migration management
- **Serverless adapter required:** Must use PG adapter (extra setup vs Prisma 6)
- **Query performance:** ORM queries sometimes less optimized than hand-written SQL
- **Vendor dependency:** Locked into Prisma's approach and update cycle

### Risks
- **Breaking changes in Prisma updates:** Major version migrations may be needed
- **Serverless connection limits:** PostgreSQL connection pooling critical in serverless
- **Cold start performance:** Prisma client initialization adds latency
- **Complex query limitations:** May need raw SQL for advanced queries

**Mitigation:**
- Pin Prisma version (7.1.0) for stability
- Use singleton pattern for Prisma client to reuse connections
- Implement connection pooling with PG adapter
- Use Prisma raw queries (`$executeRaw`, `$queryRaw`) when needed
- Monitor query performance and optimize indexes

## Alternatives Considered

### Option 1: Drizzle ORM
- **Pros:** Lightweight, SQL-like syntax, TypeScript-first, fast
- **Cons:** Newer (less mature), smaller ecosystem, less tooling (no Studio equivalent)
- **Why rejected:** Prisma's maturity and DX outweigh performance benefits for MVP

### Option 2: TypeORM
- **Pros:** Mature, decorator-based (familiar to NestJS users), Active Record pattern
- **Cons:** Less modern, slower development, weaker TypeScript support than Prisma
- **Why rejected:** Prisma has better TypeScript support and DX

### Option 3: Kysely
- **Pros:** Type-safe SQL query builder, very close to SQL, excellent TypeScript
- **Cons:** No schema management, no migrations built-in, more manual work
- **Why rejected:** Need migration system and prefer ORM abstraction for team

### Option 4: Raw SQL with pg library
- **Pros:** Maximum performance, full control, no abstraction layer
- **Cons:** No type safety, manual migrations, SQL injection risks, more boilerplate
- **Why rejected:** Type safety and DX critical for fast development

### Option 5: Sequelize
- **Pros:** Very mature, large community, feature-rich
- **Cons:** Poor TypeScript support, callback-based API, slower than modern ORMs
- **Why rejected:** Outdated patterns, Prisma has better TypeScript support

## Database Choice: PostgreSQL vs Alternatives

### MongoDB (NoSQL)
- **Why rejected:** Service records have clear relationships (user → car → service → reminders), relational model fits better

### MySQL
- **Why rejected:** PostgreSQL has better JSON support (useful for AI conversation history), full-text search, and Vercel Postgres uses PostgreSQL

### SQLite
- **Why rejected:** Not suitable for production web apps, no good serverless hosting

## References

- [Prisma 7 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Prisma with PostgreSQL Quickstart](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/postgresql)
- [Prisma Adapter for PostgreSQL](https://www.prisma.io/docs/orm/overview/databases/postgresql#using-the-driver-adapter-with-prisma)
- [Vercel Postgres with Prisma](https://vercel.com/docs/storage/vercel-postgres/using-an-orm#prisma)

---

## Changelog

- **2025-12-31:** Initial decision - Prisma 7 with PostgreSQL chosen for database layer
