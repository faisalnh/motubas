# Motubas Development Guide

Complete guide for developing Motubas following our established best practices.

**Version:** 1.0.0  
**Last Updated:** 2025-12-31  
**See also:** [ADR-0006](adr/0006-adopt-development-best-practices.md)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Testing Strategy](#testing-strategy)
4. [Git Workflow](#git-workflow)
5. [Code Standards](#code-standards)
6. [Documentation](#documentation)
7. [Sprint Process](#sprint-process)

---

## Getting Started

### Prerequisites
- Node.js 20.9+
- PostgreSQL
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone and install
git clone <repository-url>
cd Motubas
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start development
npm run dev
```

See [GETTING-STARTED.md](../GETTING-STARTED.md) for detailed setup.

---

## Development Workflow

### Starting a New Feature

```bash
# 1. Ensure you're on latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/car-management

# 3. Work on feature
# ... make changes ...

# 4. Run checks before committing
npm run lint
npm run test  # when tests are set up

# 5. Commit with conventional format
git add .
git commit -m "feat(cars): add car creation form"

# 6. Push and create PR
git push origin feature/car-management
# Create PR: feature/car-management -> develop
```

### PR Review Checklist

Before requesting review:
- [ ] Code follows TypeScript/Next.js conventions
- [ ] No linting errors (`npm run lint`)
- [ ] Tests pass (when implemented)
- [ ] Indonesian UI labels used
- [ ] Freemium limits enforced (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Manually tested feature

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature (→ MINOR version bump)
- `fix`: Bug fix (→ PATCH version bump)
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `perf`: Performance
- `test`: Tests
- `chore`: Tooling, dependencies

**Scopes:**
- `auth`, `cars`, `services`, `reminders`, `ai`, `dashboard`, `db`, `deps`

**Examples:**
```bash
feat(cars): add ability to edit car details
fix(auth): resolve Google OAuth redirect issue
docs(api): document car endpoints
test(services): add invoice validation tests
chore(deps): upgrade Next.js to 15.1.5
```

**Breaking changes:**
```bash
feat(api)!: change service record API structure

BREAKING CHANGE: API endpoints moved to /api/v2/
Migration guide: docs/migrations/v2.md
```

---

## Testing Strategy

### Test-Driven Development (TDD)

**Use TDD for:**
- ✅ Freemium tier enforcement (critical business rule)
- ✅ Service record validation (invoice requirements)
- ✅ Reminder calculations (maintenance intervals)
- ✅ AI credit system (deduction and limits)
- ✅ API endpoints (request/response validation)

**Skip TDD for:**
- ❌ UI components (use snapshot tests if needed)
- ❌ Exploratory features (spike solutions)
- ❌ One-off scripts

### TDD Process

```typescript
// 1. Write failing test first
describe('canAddCar', () => {
  it('should return false when FREE user has 1 car', () => {
    expect(canAddCar('FREE', 1)).toBe(false);
  });
});

// 2. Run test (should fail)
npm run test

// 3. Write minimal code to pass
export function canAddCar(tier: string, count: number) {
  if (tier === 'FREE') return count < 1;
  return true;
}

// 4. Test passes, refactor if needed
```

### Testing Tools

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (when implemented)
npm run test:e2e
```

### Coverage Targets

- **Business logic:** 80%+ (lib/, app/actions/)
- **API routes:** 70%+ (app/api/)
- **Components:** Not required (use sparingly)

---

## Git Workflow

### Branches

- `main`: Production code (protected)
- `develop`: Integration branch (protected)
- `feature/*`: Feature development
- `fix/*`: Bug fixes
- `release/*`: Release preparation

### Branch Protection Rules

**main:**
- Requires PR with 1 approval
- CI must pass
- No direct commits

**develop:**
- Requires PR
- CI must pass
- Can push directly during MVP (pre-v1.0.0)

### Release Process

```bash
# When ready to release
git checkout develop
git pull
git checkout -b release/v1.1.0

# Update version
npm version minor  # or patch, major
# This updates package.json and creates git tag

# Push release branch
git push origin release/v1.1.0

# Create PR: release/v1.1.0 -> main
# After merge, tag is automatically created
# Deploy to production from main branch
```

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR (1.0.0 → 2.0.0):** Breaking changes
- **MINOR (1.0.0 → 1.1.0):** New features (backward-compatible)
- **PATCH (1.0.0 → 1.0.1):** Bug fixes (backward-compatible)

**Pre-release:**
- MVP: `0.x.x` (allows breaking changes)
- Beta: `1.0.0-beta.1`
- RC: `1.0.0-rc.1`
- Stable: `1.0.0`

---

## Code Standards

### File Organization

```
app/
  (auth)/          # Public auth pages
  (dashboard)/     # Protected pages
  api/             # API routes
  actions/         # Server actions
components/
  ui/              # shadcn/ui only
  *.tsx            # Custom components
lib/               # Utilities, helpers
skills/            # Agent Skills (implementation guides)
```

### TypeScript Guidelines

```typescript
// ✅ Good: Type everything explicitly
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
}

export async function getCar(id: string): Promise<Car | null> {
  return await db.car.findUnique({ where: { id } });
}

// ❌ Bad: Using 'any'
export async function getCar(id: any): Promise<any> {
  return await db.car.findUnique({ where: { id } });
}
```

### Server vs Client Components

```typescript
// ✅ Server Component (default)
// app/(dashboard)/cars/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';

export default async function CarsPage() {
  const session = await auth();
  const cars = await db.car.findMany({ where: { userId: session.user.id } });
  return <div>{/* ... */}</div>;
}

// ✅ Client Component (when needed)
// components/car-form.tsx
'use client';
import { useState } from 'react';

export function CarForm() {
  const [data, setData] = useState({});
  return <form>{/* ... */}</form>;
}
```

### Indonesian UI Labels

```typescript
// ✅ Good: Indonesian for users
const labels = {
  addCar: 'Tambah Mobil',
  editCar: 'Edit Mobil',
  deleteCar: 'Hapus Mobil',
  licensePlate: 'Plat Nomor',
  mileage: 'Kilometer',
  serviceHistory: 'Riwayat Service',
};

// ❌ Bad: English UI
const labels = {
  addCar: 'Add Car',
  editCar: 'Edit Car',
  // ...
};
```

### Error Handling

```typescript
// ✅ Good: User-friendly Indonesian errors
try {
  await db.car.create({ data });
  return { success: true };
} catch (error) {
  if (error.code === 'P2002') {
    return { error: 'Mobil dengan plat nomor ini sudah terdaftar' };
  }
  return { error: 'Gagal menyimpan data mobil' };
}

// ❌ Bad: Technical English errors
try {
  await db.car.create({ data });
} catch (error) {
  throw new Error('Unique constraint violation');
}
```

---

## Documentation

Following [Diátaxis framework](https://diataxis.fr/):

### 1. Tutorials (Learning-oriented)
**Location:** `docs/tutorials/`, `GETTING-STARTED.md`  
**Purpose:** Teaching beginners  
**Format:** Step-by-step instructions  
**Example:** "Build your first feature"

### 2. How-To Guides (Task-oriented)
**Location:** `skills/`  
**Purpose:** Solving specific problems  
**Format:** Steps to accomplish task  
**Example:** "How to add photo upload"

### 3. Reference (Information-oriented)
**Location:** `docs/reference/`  
**Purpose:** Looking up details  
**Format:** Technical specifications  
**Example:** "API endpoint reference"

### 4. Explanation (Understanding-oriented)
**Location:** `docs/adr/`, `docs/explanation/`  
**Purpose:** Understanding concepts  
**Format:** Discussion of topics  
**Example:** "Why we chose Next.js"

### When to Update Documentation

| Change | Update |
|--------|--------|
| New feature | How-to guide in `skills/` |
| New API endpoint | Reference in `docs/reference/api.md` |
| Architecture decision | ADR in `docs/adr/` |
| New env variable | Reference in `docs/reference/environment-variables.md` |
| Setup process change | Tutorial in `GETTING-STARTED.md` |

---

## Sprint Process

### Sprint Structure

- **Duration:** 2 weeks
- **Capacity:** ~20-25 story points per sprint
- **Ceremonies:**
  - Planning: Monday Week 1 (2 hours)
  - Daily Standup: Async in Slack/Discord
  - Review: Friday Week 2 (1 hour)
  - Retrospective: Friday Week 2 (30 min)

### Sprint Planning

1. **Review backlog** in `docs/sprints/backlog.md`
2. **Set sprint goal** (one clear objective)
3. **Commit to stories** based on capacity
4. **Create sprint plan** in `docs/sprints/sprint-XX-planning.md`
5. **Break down tasks** for each story

### Story Points (Fibonacci)

| Points | Effort | Time |
|--------|--------|------|
| 1 | Trivial | Few hours |
| 2 | Simple | Half day |
| 3 | Moderate | 1 day |
| 5 | Complex | 2-3 days |
| 8 | Very complex | 3-5 days |
| 13 | Epic | Break down |

### Definition of Done

- [ ] Code implemented
- [ ] Tests written (if business logic)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Manually tested
- [ ] Deployed to dev
- [ ] Acceptance criteria met

### Daily Standup (Async)

Post in team channel:
```
**Yesterday:** Completed car creation form
**Today:** Working on car edit functionality
**Blockers:** None
```

---

## Tools & Automation

### Commitlint Setup

```bash
# Install
npm install -D @commitlint/cli @commitlint/config-conventional husky

# Configure
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Setup git hooks
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
npm run lint
npm run test  # when tests are set up
```

### Changelog Generation

```bash
# Install
npm install -D standard-version

# Generate changelog
npm run release

# package.json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

---

## Quick Reference

### Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run linting
npm run test             # Run tests
npm run test:coverage    # Test coverage
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
```

### Links
- **ADRs:** [docs/adr/](adr/)
- **Skills:** [skills/](../skills/)
- **Sprints:** [docs/sprints/](sprints/)
- **Reference:** [docs/reference/](reference/)

---

**Questions?** Check the documentation or create an issue.

**Want to contribute?** Read this guide and review our ADRs.

**Need help?** See [GETTING-STARTED.md](../GETTING-STARTED.md) or ask the team.
