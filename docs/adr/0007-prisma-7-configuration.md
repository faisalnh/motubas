# ADR-0007: Prisma 7 Configuration with prisma.config.ts

**Status:** Accepted  
**Date:** 2025-12-31

## Context

Prisma 7 introduced breaking changes in how database connections and configurations are managed. The traditional approach of defining the datasource URL in `schema.prisma` is deprecated in favor of a new `prisma.config.ts` file at the project root.

Key changes in Prisma 7:
- Database connection URLs moved from `schema.prisma` to `prisma.config.ts`
- The `url` property in datasource blocks is no longer supported
- Driver adapters are no longer a preview feature
- Configuration is now centralized in a TypeScript config file

## Decision

We will adopt the Prisma 7 configuration approach:

1. **Create `prisma.config.ts` at project root:**
   - Define database connection URL
   - Configure schema location
   - Set migrations path

2. **Update `schema.prisma`:**
   - Remove `url` property from datasource block
   - Remove deprecated `driverAdapters` preview feature
   - Keep only the provider definition

3. **Use PostgreSQL adapter in application code:**
   - Configure `PrismaPg` adapter in `lib/db.ts`
   - Use connection pooling with `pg` library
   - Maintain singleton pattern for Prisma Client

## Implementation

### prisma.config.ts
```typescript
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
```

### schema.prisma datasource
```prisma
datasource db {
  provider = "postgresql"
}
```

### lib/db.ts
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

## Consequences

### Positive
- **Centralized Configuration:** All database and migration settings in one place
- **Type Safety:** TypeScript-based configuration with IDE support
- **Better Development Experience:** Clear separation between schema definition and runtime configuration
- **Migration Support:** Proper support for migration commands with correct database URL
- **No Preview Features:** Driver adapters are now stable, no need for preview flags

### Negative
- **Breaking Change:** Requires migration from Prisma 6 configuration
- **Environment Variable Handling:** Need to handle missing DATABASE_URL during build (using placeholder)
- **Learning Curve:** New configuration approach for developers familiar with Prisma 6

### Neutral
- **File Management:** One additional config file at root level
- **Documentation:** Need to update team documentation and ADRs

## Alternatives Considered

### 1. Stay on Prisma 6
- **Pros:** No breaking changes, familiar configuration
- **Cons:** Missing out on Prisma 7 improvements, deprecated features, no long-term support

### 2. Use `url` in schema.prisma (deprecated)
- **Pros:** Simpler initial setup
- **Cons:** Deprecated and will be removed, migration errors, not future-proof

### 3. Use environment variable directly in config
- **Pros:** Cleaner code using `env('DATABASE_URL')`
- **Cons:** Fails during build if env var not set, requires build-time environment setup

## Migration Notes

When setting up the project:
1. Ensure `.env.local` has `DATABASE_URL` defined
2. Run `npm install` which triggers `prisma generate`
3. The placeholder URL in config allows builds to succeed without a database
4. Runtime database connection uses actual `DATABASE_URL` from environment

## References

- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma 7 Configuration Issues](https://github.com/prisma/prisma/issues/28573)
- [How I Configured Prisma 7](https://medium.com/@gargdev010300/how-i-configured-prisma-7-new-changes-issues-and-how-i-solved-them-d5ca728c5b9f)
