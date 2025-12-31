# Reference Documentation

This directory contains technical reference documentation for Motubas.

Following the [Diátaxis framework](https://diataxis.fr/), reference documentation is **information-oriented** and provides technical specifications.

---

## Available References

### API
- [API Endpoints](api.md) - HTTP endpoints, request/response formats
- Authentication API - Auth.js routes (to be documented)

### Database
- [Database Schema](database-schema.md) - Tables, relationships, indexes
- Prisma Schema - See `prisma/schema.prisma` (canonical source)

### Components
- [UI Components](components.md) - shadcn/ui component usage
- Custom Components - Project-specific components

### Environment
- [Environment Variables](environment-variables.md) - All env vars explained
- Configuration - App configuration options

### Types
- TypeScript Types - Auto-generated from Prisma
- Zod Schemas - Validation schemas

---

## How to Use Reference Docs

Reference documentation is for **looking things up**, not learning:

- ✅ Use when: "What parameters does this API accept?"
- ✅ Use when: "What's the database schema for cars?"
- ✅ Use when: "What environment variables are required?"
- ❌ Don't use for: Learning how to build features (use tutorials)
- ❌ Don't use for: Understanding concepts (use ADRs/explanation)

---

## Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| API Endpoints | 🚧 Planned | - |
| Database Schema | 🚧 Planned | - |
| UI Components | 🚧 Planned | - |
| Environment Variables | 🚧 Planned | - |

---

## Contributing to Reference Docs

### When to Update
- After adding new API endpoint
- After database schema changes
- After adding new environment variable
- After creating new reusable component

### Format
- Be concise and precise
- Use tables for structured data
- Include TypeScript types
- Show request/response examples
- Link to related documentation

### Template

```markdown
# [Feature] Reference

## Overview
Brief description of what this documents.

## [Item Name]

**Description:** What it does

**Signature:** TypeScript signature

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | ... |

**Returns:** Return type and description

**Example:**
```typescript
// Code example
```

**See also:** Links to related docs
```

---

**Last Updated:** 2025-12-31
