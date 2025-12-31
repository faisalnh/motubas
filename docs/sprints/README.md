# Sprint Planning & Tracking

This directory contains all sprint planning, reviews, and retrospectives for Motubas development.

## Sprint Structure

- **Duration:** 2 weeks (10 working days)
- **Story Points:** Fibonacci (1, 2, 3, 5, 8, 13)
- **Ceremonies:**
  - Sprint Planning: Start of sprint (2 hours)
  - Daily Standup: Async (15 min)
  - Sprint Review: End of sprint (1 hour)
  - Sprint Retrospective: End of sprint (30 min)

## File Naming Convention

```
sprint-XX-planning.md      # Sprint planning document
sprint-XX-review.md        # Sprint review outcomes
sprint-XX-retro.md         # Sprint retrospective
```

## Current Sprint Status

- **Sprint 1:** Planning phase (see sprint-01-planning.md)

## Sprint Index

| Sprint | Dates | Goal | Status |
|--------|-------|------|--------|
| [01](sprint-01-planning.md) | TBD | MVP Foundation + Car Management | 🔄 Planned |

## Story Point Reference

| Points | Complexity | Time Estimate | Examples |
|--------|-----------|---------------|----------|
| 1 | Trivial | Few hours | Update text, add button |
| 2 | Simple | Half day | Simple form, basic API route |
| 3 | Moderate | 1 day | CRUD feature, single page |
| 5 | Complex | 2-3 days | Feature with tests, multi-step workflow |
| 8 | Very complex | 3-5 days | Complex feature, integration, multiple files |
| 13 | Epic | 1 week+ | Needs breaking down into smaller stories |

## Definition of Done

For a story to be considered "Done":

- [ ] Code implemented and working
- [ ] Unit tests written (if business logic)
- [ ] Integration tests added (if API)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Manually tested
- [ ] Deployed to development environment
- [ ] Acceptance criteria met

## Sprint Velocity Tracking

Track velocity to improve estimation:

| Sprint | Planned Points | Completed Points | Velocity |
|--------|---------------|------------------|----------|
| 01 | TBD | TBD | - |

Target velocity will stabilize after 3 sprints.

## Templates

### Planning Template
See `sprint-01-planning.md` for template structure.

### Review Template
See review template in planning doc.

### Retrospective Template
- What went well?
- What could be improved?
- Action items for next sprint

## Best Practices

1. **Keep sprints focused:** 1 clear sprint goal
2. **Don't overcommit:** Use velocity from previous sprints
3. **Break down epics:** Stories should be completable in 1 sprint
4. **Update daily:** Track progress regularly
5. **Honest retrospectives:** Focus on improvement, not blame
6. **Celebrate wins:** Acknowledge completed work

## Tools

- **Task tracking:** GitHub Issues/Projects
- **Time tracking:** Optional (Toggl, Clockify)
- **Communication:** Slack/Discord for async standups
- **Documentation:** Markdown files in this directory

---

**Last Updated:** 2025-12-31
