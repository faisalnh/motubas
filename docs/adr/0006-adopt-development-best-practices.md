# ADR-0006: Adopt Development Best Practices

**Status:** Accepted

**Date:** 2025-12-31

**Deciders:** Development Team

---

## Context

As Motubas grows from MVP to production, we need consistent development practices to ensure:
- Code quality and maintainability
- Clear communication in commits and releases
- Predictable development workflow
- Well-organized documentation
- Efficient sprint planning and tracking
- Reliable testing coverage

Without standardized practices, we risk:
- Inconsistent code quality across features
- Unclear commit history and version tracking
- Difficulty coordinating between team members
- Fragmented documentation that's hard to navigate
- Poor sprint planning leading to missed deadlines

## Decision

We will adopt the following development best practices for Motubas:

### 1. Testing Strategy

**Test-Driven Development (TDD) for Core Business Logic:**
- Write tests BEFORE implementation for:
  - Freemium tier enforcement (critical business rule)
  - Service record validation (invoice requirements)
  - Reminder calculations (maintenance intervals)
  - AI credit system (deduction and limits)
- Use TDD selectively, not universally (pragmatic approach)
- Skip TDD for UI components and exploratory features

**Testing Tools:**
- **Unit/Integration:** Vitest (faster than Jest, Vite-native)
- **E2E:** Playwright (for critical user flows)
- **Component:** React Testing Library
- **API Testing:** Vitest with supertest

**Coverage targets:**
- Core business logic: 80%+ coverage
- API routes: 70%+ coverage
- UI components: Not required (snapshot tests optional)

**BDD (Behavior-Driven Development):**
- NOT adopted for MVP due to overhead
- May revisit for v2 if team grows beyond 3 developers
- Current team size doesn't justify Given/When/Then ceremony

### 2. Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR:** Breaking changes (e.g., v2.0.0 when API changes)
- **MINOR:** New features, backward-compatible (e.g., v1.1.0 adds AI assistant)
- **PATCH:** Bug fixes, backward-compatible (e.g., v1.0.1 fixes login bug)

**Pre-release versions:**
- MVP: `0.x.x` (unstable, breaking changes allowed)
- Beta: `1.0.0-beta.1`, `1.0.0-beta.2`
- RC: `1.0.0-rc.1`
- Stable: `1.0.0`

**Tags:**
- Every release tagged in git: `git tag v1.0.0`
- Tags trigger deployment in CI/CD
- Changelog auto-generated from commits

### 3. Conventional Commits

Format: `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature (triggers MINOR version bump)
- `fix`: Bug fix (triggers PATCH version bump)
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructure, no behavior change
- `perf`: Performance improvement
- `test`: Add/modify tests
- `chore`: Build, config, dependencies
- `ci`: CI/CD changes

**Scopes:**
- `auth`: Authentication features
- `cars`: Car management
- `services`: Service records
- `reminders`: Maintenance reminders
- `ai`: Om Motu AI assistant
- `dashboard`: Dashboard/analytics
- `db`: Database schema/migrations

**Examples:**
```bash
feat(cars): add ability to edit car details
fix(auth): resolve Google OAuth redirect issue
docs(adr): add ADR-0006 for development practices
chore(deps): upgrade Next.js to 15.1.5
test(services): add tests for invoice validation
```

**Breaking changes:**
```bash
feat(api)!: change service record API to REST
BREAKING CHANGE: API endpoints now use /api/v2/
```

**Commit message structure:**
```
<type>(<scope>): <short description>

<longer description if needed>

<footer with references>
```

### 4. Git Workflow (Simplified Gitflow)

**Branches:**
- `main`: Production-ready code (protected)
- `develop`: Integration branch for features
- `feature/*`: Feature branches (e.g., `feature/car-management`)
- `fix/*`: Bug fix branches (e.g., `fix/login-redirect`)
- `release/*`: Release preparation (e.g., `release/v1.0.0`)

**Workflow:**
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/car-management

# Work and commit
git add .
git commit -m "feat(cars): add car creation form"

# Push and create PR
git push origin feature/car-management
# Create PR: feature/car-management -> develop

# After PR approval and merge to develop
# Release process:
git checkout develop
git pull
git checkout -b release/v1.1.0
# Bump version in package.json
git commit -m "chore(release): bump version to 1.1.0"
git push origin release/v1.1.0
# Create PR: release/v1.1.0 -> main
# After merge, tag main:
git checkout main
git pull
git tag v1.1.0
git push origin v1.1.0
```

**Branch protection:**
- `main`: Requires PR, 1 approval, CI passing
- `develop`: Requires PR, CI passing
- Direct commits forbidden on both

**MVP simplification:**
- During MVP (pre-v1.0.0), can push directly to `develop`
- Still require PRs for `main`
- Post-v1.0.0: Strict branch protection

### 5. Documentation Framework (Diátaxis)

Organize documentation into 4 quadrants:

**1. Tutorials (Learning-oriented)**
Location: `docs/tutorials/`
- Getting started guide ✅ (GETTING-STARTED.md)
- Building your first feature
- Deploying to production

**2. How-To Guides (Task-oriented)**
Location: `skills/` (Agent Skills)
- How to create a service record ✅
- How to integrate Gemini AI ✅
- How to implement photo upload ✅

**3. Reference (Information-oriented)**
Location: `docs/reference/`
- API documentation
- Database schema reference
- Component API reference
- Environment variables

**4. Explanation (Understanding-oriented)**
Location: `docs/adr/` and `docs/explanation/`
- Why we chose Next.js ✅ (ADR-0002)
- Understanding freemium model
- Architecture overview

**Documentation index:**
```
docs/
├── adr/              # Architecture decisions (Explanation)
├── tutorials/        # Step-by-step learning
├── reference/        # Technical specs
├── explanation/      # Conceptual understanding
└── sprints/          # Sprint planning
```

**Current mapping:**
- ✅ README.md → Tutorial (getting started)
- ✅ GETTING-STARTED.md → Tutorial
- ✅ skills/ → How-To Guides
- ✅ docs/adr/ → Explanation
- 🚧 docs/reference/ → To create
- 🚧 docs/tutorials/ → To expand

### 6. Agile Sprint Organization

**Sprint structure:**
- **Duration:** 2 weeks (10 working days)
- **Ceremonies:**
  - Sprint Planning: Monday Week 1 (2 hours)
  - Daily Standups: Async (Slack/Discord, 15 min)
  - Sprint Review: Friday Week 2 (1 hour)
  - Sprint Retrospective: Friday Week 2 (30 min)

**Sprint documentation:**
Location: `docs/sprints/`

Each sprint:
```
docs/sprints/
├── sprint-01-planning.md
├── sprint-01-review.md
├── sprint-01-retro.md
├── sprint-02-planning.md
...
```

**Sprint Planning Template:**
```markdown
# Sprint XX Planning

**Dates:** YYYY-MM-DD to YYYY-MM-DD
**Sprint Goal:** [One sentence goal]

## Team Capacity
- Developer 1: 8 days (2 days off)
- Developer 2: 10 days

## Backlog Items
### Committed
- [ ] Feature 1 (Story Points: 5)
- [ ] Feature 2 (Story Points: 3)

### Stretch Goals
- [ ] Feature 3 (Story Points: 2)

## Definition of Done
- Code reviewed and merged
- Tests passing (80% coverage for business logic)
- Deployed to staging
- Documentation updated
```

**Story Points (Fibonacci):**
- 1: Trivial (few hours)
- 2: Simple (half day)
- 3: Moderate (1 day)
- 5: Complex (2-3 days)
- 8: Very complex (3-5 days)
- 13: Epic (needs breaking down)

**MVP Sprint Plan (Example):**
- Sprint 1: Car Management + Database setup
- Sprint 2: Service Records + Photo upload
- Sprint 3: Maintenance Reminders
- Sprint 4: Om Motu AI assistant
- Sprint 5: Dashboard analytics + polish
- Sprint 6: Testing + deployment

### 7. Code Review Standards

**PR checklist:**
- [ ] Follows conventional commits
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No linting errors (`npm run lint`)
- [ ] Indonesian UI labels verified
- [ ] Freemium limits enforced (if applicable)
- [ ] Manually tested feature

**Review requirements:**
- All PRs require 1 approval (MVP)
- Critical changes require 2 approvals (auth, payments)
- Self-review before requesting review
- Review within 24 hours

## Consequences

### Positive
- **Consistent quality:** TDD for critical paths ensures correctness
- **Clear history:** Conventional commits make changelog automatic
- **Predictable releases:** SemVer communicates impact of changes
- **Organized docs:** Diátaxis makes information findable
- **Efficient sprints:** Lightweight Agile keeps team aligned
- **Better collaboration:** Git workflow prevents conflicts
- **Automated processes:** Conventional commits enable automation

### Negative
- **Initial overhead:** Learning curve for practices
- **Discipline required:** Team must consistently follow conventions
- **TDD slowdown:** Writing tests first can feel slower initially
- **Process bureaucracy:** Risk of over-process for small team
- **Documentation maintenance:** Keeping docs updated takes effort

### Risks
- **Incomplete adoption:** Team may skip practices under pressure
- **Over-engineering:** Following practices dogmatically vs pragmatically
- **Tooling issues:** Automation may break, requiring manual intervention
- **Sprint fatigue:** Ceremonies become rote instead of valuable

**Mitigation:**
- Start with MVP-friendly lightweight versions
- Automate enforcement where possible (commitlint, husky)
- Review practices in retrospectives
- Adjust sprint length if needed (1 week for faster iteration)
- Skip TDD for exploratory/UI work
- Keep documentation living (update as you go)

## Alternatives Considered

### Testing: Full BDD with Cucumber
- **Pros:** Business-readable tests, stakeholder communication
- **Cons:** Heavy ceremony, slow for small teams, requires PO involvement
- **Why rejected:** Team too small (1-2 devs), no dedicated PO for MVP

### Versioning: Calendar Versioning (CalVer)
- **Pros:** Clear release timing (e.g., 2025.01.15)
- **Cons:** Doesn't communicate breaking changes, less standard
- **Why rejected:** SemVer is industry standard, tools expect it

### Git: Trunk-Based Development
- **Pros:** Simpler, faster integration, no long-lived branches
- **Cons:** Requires feature flags, more discipline, CI/CD maturity
- **Why rejected:** Team needs feature isolation during MVP

### Git: GitHub Flow (main + feature branches only)
- **Pros:** Simpler than Gitflow, less ceremony
- **Cons:** No separation of release preparation, less control
- **Why rejected:** Want explicit release process for production

### Docs: No framework (ad-hoc organization)
- **Pros:** No overhead, write what's needed
- **Cons:** Hard to find information, inconsistent structure
- **Why rejected:** Diátaxis provides clear mental model

### Sprints: Kanban (no sprints)
- **Pros:** Continuous flow, no sprint planning overhead
- **Cons:** Less predictability, harder to align on goals
- **Why rejected:** Sprints provide rhythm and focus for small team

## Implementation Plan

### Phase 1: Immediate (Sprint 1)
- [x] Create ADR-0006
- [ ] Set up commitlint + husky for commit enforcement
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Create `docs/sprints/sprint-01-planning.md`
- [ ] Add testing setup (Vitest config)
- [ ] Create `docs/reference/` structure

### Phase 2: Sprint 2
- [ ] Write first TDD feature (freemium enforcement)
- [ ] Set up GitHub branch protection
- [ ] Create changelog automation (release-it or semantic-release)
- [ ] Document first sprint retrospective

### Phase 3: Ongoing
- [ ] Review practices every 3 sprints
- [ ] Update documentation framework as needed
- [ ] Add E2E tests for critical flows
- [ ] Expand reference documentation

## Tools & Automation

**Commit enforcement:**
```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky
```

**Changelog generation:**
```bash
npm install -D standard-version
# or
npm install -D semantic-release
```

**Git hooks:**
```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "test": "vitest",
    "lint": "next lint"
  }
}
```

**Commitlint config:**
```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'auth', 'cars', 'services', 'reminders', 
      'ai', 'dashboard', 'db', 'docs', 'deps'
    ]]
  }
};
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Gitflow Workflow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Diátaxis Documentation Framework](https://diataxis.fr/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Agile Manifesto](https://agilemanifesto.org/)
- [commitlint](https://commitlint.js.org/)
- [Vitest](https://vitest.dev/)

---

## Changelog

- **2025-12-31:** Initial ADR - Established development best practices for Motubas
