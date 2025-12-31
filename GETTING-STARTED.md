# Getting Started with Motubas Development

Welcome to Motubas! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js:** Version 20.9 or higher
- **PostgreSQL:** Local installation OR Vercel Postgres account
- **Google Cloud:** Account for OAuth and Gemini API
- **Vercel:** Account (optional for MVP, required for production)
- **Git:** For version control

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd /Users/faisalnurhidayat/repo/Motubas
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```bash
# Generate AUTH_SECRET with:
openssl rand -base64 32

# Get Google OAuth credentials from:
# https://console.cloud.google.com/apis/credentials

# Get Gemini API key from:
# https://aistudio.google.com/app/apikey
```

### 3. Setup Database

**Option A: Vercel Postgres (Recommended)**
```bash
npm install -g vercel
vercel login
vercel link
vercel postgres create
vercel env pull .env.local
```

**Option B: Local PostgreSQL**
```bash
createdb motubas
# Update DATABASE_URL in .env.local
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 📚 Documentation Structure

### Quick Reference
- **README.md** - Full setup guide and tech stack info
- **GETTING-STARTED.md** - This file (quick start)
- **PROJECT-STATUS.md** - Implementation roadmap and checklist
- **.clinerules** - Project instructions for Claude Code
- **.claude.md** - Project context (auto-loaded by Claude)

### Architecture Decisions
- **docs/adr/** - All architectural decisions documented
  - [ADR-0001: Use ADRs](docs/adr/0001-use-architecture-decision-records.md)
  - [ADR-0002: Next.js 15](docs/adr/0002-choose-nextjs-15-as-frontend-framework.md)
  - [ADR-0003: Prisma + PostgreSQL](docs/adr/0003-use-prisma-7-with-postgresql.md)
  - [ADR-0004: Gemini Flash AI](docs/adr/0004-use-google-gemini-flash-for-ai-assistant.md)
  - [ADR-0005: Auth.js v5](docs/adr/0005-use-authjs-v5-for-authentication.md)

### Implementation Guides (Agent Skills)
- **skills/prisma/** - Database query patterns
- **skills/service-records/** - Service CRUD workflow with photo upload
- **skills/ai-assistant/** - Gemini AI integration guide

## 🎯 What to Build Next?

The foundation is complete. Choose your starting point:

### Option 1: Car Management (Recommended First)
**Why:** Foundation for all other features

**Files to create:**
```
app/(dashboard)/cars/page.tsx
app/(dashboard)/cars/add/page.tsx
app/(dashboard)/cars/[id]/edit/page.tsx
app/api/cars/route.ts
app/actions/cars.ts
components/car-card.tsx
```

**Guide:** See `skills/prisma/SKILL.md` for database patterns

### Option 2: Service Records
**Why:** Core feature of the app

**Files to create:**
```
app/(dashboard)/cars/[id]/services/page.tsx
app/(dashboard)/cars/[id]/services/add/page.tsx
app/api/services/route.ts
app/api/upload/route.ts
components/service-form.tsx
components/invoice-upload.tsx
```

**Guide:** See `skills/service-records/SKILL.md` for complete workflow

### Option 3: AI Assistant (Om Motu)
**Why:** Differentiating feature

**Files to create:**
```
app/(dashboard)/om-motu/page.tsx
app/api/ai/chat/route.ts
components/om-motu-chat.tsx
lib/ai-prompts.ts
```

**Guide:** See `skills/ai-assistant/SKILL.md` for implementation

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma client (after schema changes)
npx prisma migrate dev   # Create new migration
npx prisma migrate reset # Reset database (WARNING: deletes all data)
npx prisma studio        # Open database GUI at localhost:5555
npx prisma format        # Format schema file
npx prisma validate      # Validate schema

# Git
git add .
git commit -m "feat: description"  # Follow conventional commits
git push
```

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] Run `npm run lint` and fix all errors
- [ ] Run `npx prisma format` if you changed schema
- [ ] Run `npx prisma validate` if you changed schema
- [ ] Test your feature manually
- [ ] Verify Indonesian language in UI
- [ ] Check freemium limits work (1 car for FREE tier)
- [ ] Ensure error messages are user-friendly

## 🎓 Key Concepts

### Server vs Client Components

**Server Components (default):**
```typescript
// app/(dashboard)/cars/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function CarsPage() {
  const session = await auth(); // ✅ Can use directly
  const cars = await db.car.findMany(); // ✅ Database queries here
  return <div>...</div>;
}
```

**Client Components (when needed):**
```typescript
'use client'; // ⚠️ Add only when you need:
// - useState, useEffect, other hooks
// - Browser APIs (localStorage, window)
// - Event handlers (onClick, onChange)
// - Real-time updates

import { useState } from 'react';

export function CarForm() {
  const [data, setData] = useState({}); // ✅ Now can use hooks
  return <form>...</form>;
}
```

### Server Actions

```typescript
'use server'; // app/actions/cars.ts

import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function createCar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }
  
  try {
    await db.car.create({ data: { /* ... */ } });
    return { success: true };
  } catch (error) {
    return { error: 'Gagal membuat mobil' }; // Indonesian error
  }
}
```

### Indonesian UI Labels

```typescript
// ✅ Good
const labels = {
  addCar: 'Tambah Mobil',
  editCar: 'Edit Mobil',
  deleteCar: 'Hapus Mobil',
  licensePlate: 'Plat Nomor',
  mileage: 'Kilometer',
};

// ❌ Bad
const labels = {
  addCar: 'Add Car',
  editCar: 'Edit Car',
  // ...
};
```

## 🐛 Common Issues

### "Module not found" errors
```bash
npm install
npx prisma generate
```

### Database connection errors
```bash
# Check .env.local has correct DATABASE_URL
# Verify PostgreSQL is running
# Try: npx prisma migrate reset
```

### Auth errors
```bash
# Verify AUTH_SECRET is set
# Check Google OAuth credentials
# Ensure redirect URI matches in Google Console
```

### Prisma errors
```bash
# After schema changes:
npx prisma generate
npx prisma migrate dev

# If stuck:
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 📖 Additional Resources

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Auth.js Docs:** https://authjs.dev
- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **shadcn/ui Components:** https://ui.shadcn.com

## 🤝 Need Help?

1. Check **PROJECT-STATUS.md** for implementation roadmap
2. Read relevant **ADR** in `docs/adr/` for architecture context
3. Review **Agent Skills** in `skills/` for step-by-step guides
4. Check **.clinerules** for project requirements
5. Search existing code for similar patterns

## 🎉 You're Ready!

Your Motubas development environment is set up. Start building features and refer to the documentation as needed.

**Recommended first feature:** Car Management → Service Records → Reminders → AI → Analytics

Happy coding! 🚗💨
