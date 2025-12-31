# Sprint 01 Planning

**Dates:** TBD (2 weeks from start date)

**Sprint Goal:** Complete MVP foundation setup and deliver car management feature

---

## Team Capacity

- Developer: 10 days (assuming full-time)
- Velocity: Unknown (first sprint, will establish baseline)
- Estimated capacity: 20-25 story points

---

## Sprint Backlog

### Committed Stories

#### 1. Setup Development Infrastructure (5 points)
**User Story:** As a developer, I need proper tooling set up so that I can develop efficiently with quality checks.

**Tasks:**
- [x] Install and configure commitlint + husky
- [x] Set up Vitest for testing
- [x] Configure GitHub branch protection (manual setup required)
- [x] Create PR template
- [x] Add pre-commit hooks (lint, format)

**Acceptance Criteria:**
- Commits must follow conventional commit format
- Tests run on pre-push
- PRs require approval to merge to main
- Linting passes before commit

**Priority:** High (foundation for all other work)

---

#### 2. Car Management - Add Car (8 points)
**User Story:** As a user, I want to add my car details so that I can start tracking service records.

**Tasks:**
- [ ] Create `app/(dashboard)/cars/add/page.tsx`
- [ ] Create `app/api/cars/route.ts` (POST endpoint)
- [ ] Create `app/actions/cars.ts` (createCar action)
- [ ] Create `components/car-form.tsx`
- [ ] Add Zod validation schema
- [ ] Enforce 1-car limit for FREE tier
- [ ] Write unit tests for tier enforcement
- [ ] Add form validation and error handling

**Acceptance Criteria:**
- User can add car with: make, model, year, license plate, mileage
- FREE tier users blocked from adding 2nd car
- Form shows Indonesian error messages
- Validation prevents invalid data
- Successful submission redirects to car list
- Tests pass for freemium enforcement

**Priority:** High (core feature)

---

#### 3. Car Management - View Cars (5 points)
**User Story:** As a user, I want to see my car details so that I know what's being tracked.

**Tasks:**
- [ ] Create `app/(dashboard)/cars/page.tsx`
- [ ] Create `app/api/cars/route.ts` (GET endpoint)
- [ ] Create `components/car-card.tsx`
- [ ] Display car information (make, model, year, plate, mileage)
- [ ] Add "Add Car" button (only if under limit)
- [ ] Handle empty state (no cars)

**Acceptance Criteria:**
- Car details display correctly
- Current mileage shown prominently
- "Add Car" button hidden if at tier limit
- Empty state shows helpful message
- Responsive design works on mobile

**Priority:** High

---

#### 4. Car Management - Edit Car (3 points)
**User Story:** As a user, I want to edit my car details so that I can keep information up to date.

**Tasks:**
- [ ] Create `app/(dashboard)/cars/[id]/edit/page.tsx`
- [ ] Create `app/api/cars/[id]/route.ts` (PATCH endpoint)
- [ ] Reuse car-form component with edit mode
- [ ] Add update car server action
- [ ] Allow updating current mileage

**Acceptance Criteria:**
- All car fields editable
- Form pre-filled with current values
- Validation same as create
- Success redirects to car list
- Mileage can be updated

**Priority:** Medium

---

#### 5. Car Management - Delete Car (2 points)
**User Story:** As a user, I want to delete my car so that I can remove incorrect entries.

**Tasks:**
- [ ] Add delete button to car page
- [ ] Create DELETE endpoint in cars API
- [ ] Add confirmation dialog
- [ ] Cascade delete related records (service records, reminders)
- [ ] Handle database transaction

**Acceptance Criteria:**
- Confirmation required before delete
- All related data deleted (cascade)
- Redirect to cars page after delete
- Indonesian confirmation message

**Priority:** Low

---

### Stretch Goals (If Time Permits)

#### 6. Documentation - Reference Docs (3 points)
**User Story:** As a developer, I need API reference documentation so that I can understand endpoints.

**Tasks:**
- [ ] Create `docs/reference/api.md`
- [ ] Document car API endpoints
- [ ] Document auth API
- [ ] Add request/response examples

**Priority:** Low

---

## Total Story Points

- **Committed:** 23 points
- **Stretch:** 3 points
- **Total potential:** 26 points

---

## Sprint Goal Success Criteria

At the end of Sprint 01, we should have:

- [x] Development tooling configured (commits, tests, CI)
- [ ] Users can add their first car
- [ ] Users can view car details
- [ ] Users can edit car information
- [ ] FREE tier limit (1 car) enforced
- [ ] All features tested manually
- [ ] Code reviewed and merged to develop

---

## Risks & Dependencies

### Risks
1. **First sprint velocity unknown** - May over/under commit
2. **Vercel Postgres setup** - Could have connection issues
3. **Learning Vitest** - Team unfamiliar with testing framework

### Mitigation
- Start with smaller stories, add from stretch if ahead
- Test database connection in setup phase
- Allocate time for Vitest learning

### Dependencies
- Vercel Postgres access
- Google OAuth credentials (for testing auth)
- No external dependencies for car management

---

## Daily Standup Format (Async)

Post daily in Slack/Discord:

```
**Yesterday:** What I completed
**Today:** What I'm working on
**Blockers:** Any issues preventing progress
```

---

## Sprint Review Template

To be filled at end of sprint:

### Completed Stories
- [ ] Story 1 (points)
- [ ] Story 2 (points)

### Incomplete Stories
- [ ] Story X (points) - Reason: ...

### Demo
- Video/screenshots of completed features

### Metrics
- Planned: X points
- Completed: Y points
- Velocity: Y points

---

## Sprint Retrospective Template

To be filled at end of sprint:

### What Went Well? ✅
- 

### What Could Be Improved? 🔄
- 

### Action Items for Next Sprint 🎯
- [ ] Action 1
- [ ] Action 2

---

**Created:** 2025-12-31  
**Status:** Planning  
**Next Review:** Sprint end date TBD
