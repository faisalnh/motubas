# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Motubas project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences. ADRs help us:

- Preserve institutional knowledge
- Understand why decisions were made
- Onboard new team members faster
- Avoid re-discussing settled topics
- Track the evolution of the architecture

## ADR Format

Each ADR follows this structure:

1. **Title:** Short, descriptive name
2. **Status:** Proposed | Accepted | Deprecated | Superseded
3. **Date:** When the decision was made
4. **Deciders:** Who was involved
5. **Context:** What prompted this decision
6. **Decision:** What we decided
7. **Consequences:** Positive, negative, and risks
8. **Alternatives Considered:** What else we evaluated
9. **References:** Supporting documentation

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-use-architecture-decision-records.md) | Use Architecture Decision Records | Accepted | 2025-12-31 |
| [0002](0002-choose-nextjs-15-as-frontend-framework.md) | Choose Next.js 15 as Frontend Framework | Accepted | 2025-12-31 |
| [0003](0003-use-prisma-7-with-postgresql.md) | Use Prisma 7 with PostgreSQL | Accepted | 2025-12-31 |
| [0004](0004-use-google-gemini-flash-for-ai-assistant.md) | Use Google Gemini Flash for AI Assistant | Accepted | 2025-12-31 |
| [0005](0005-use-authjs-v5-for-authentication.md) | Use Auth.js v5 for Authentication | Accepted | 2025-12-31 |
| [0006](0006-adopt-development-best-practices.md) | Adopt Development Best Practices | Accepted | 2025-12-31 |
| [0007](0007-prisma-7-configuration.md) | Prisma 7 Configuration with prisma.config.ts | Accepted | 2025-12-31 |

## How to Create an ADR

1. Copy the template from ADR-0001
2. Increment the number (find next available in sequence)
3. Use kebab-case for the filename: `XXXX-descriptive-title.md`
4. Fill in all sections
5. Update this README index
6. Update the ADR index in `.clinerules`
7. Create a pull request or commit directly

## When to Create an ADR

Create an ADR for decisions about:

- ✅ Technology choices (frameworks, libraries, databases)
- ✅ Architectural patterns (structure, data flow, state management)
- ✅ Development practices (testing, deployment, CI/CD)
- ✅ API design decisions
- ✅ Security approaches
- ✅ Third-party service integrations
- ✅ Data modeling approaches
- ✅ Performance optimization strategies

Don't create ADRs for:

- ❌ Minor implementation details
- ❌ Temporary workarounds
- ❌ Bug fixes
- ❌ Routine maintenance
- ❌ Easily reversible decisions

## Updating ADRs

ADRs are immutable records of decisions at a point in time. When a decision changes:

1. **Don't edit the original ADR** (except for typos/formatting)
2. **Create a new ADR** that supersedes the old one
3. **Update the old ADR's status** to "Superseded by ADR-XXXX"
4. **Link between the ADRs** in both directions

## ADR Lifecycle

```
Proposed → Accepted → Deprecated/Superseded
           ↓
         Rejected
```

- **Proposed:** Under discussion, not yet decided
- **Accepted:** Decision made and implemented
- **Deprecated:** No longer relevant but kept for history
- **Superseded:** Replaced by a newer decision (link to new ADR)
- **Rejected:** Considered but not chosen

## Best Practices

1. **Be concise:** Aim for < 500 words, focus on key points
2. **Be specific:** Provide concrete details, avoid vague statements
3. **Show alternatives:** Demonstrate you considered options
4. **Include context:** Explain the situation at decision time
5. **Update promptly:** Create ADR during or right after decision-making
6. **Link liberally:** Reference related ADRs, docs, discussions
7. **Keep it real:** Document actual decisions, not ideal scenarios

## Tools & References

- [ADR Tools](https://github.com/npryce/adr-tools) - Command-line tools for managing ADRs
- [ADR GitHub Organization](https://adr.github.io/) - Templates and examples
- [MADR Template](https://adr.github.io/madr/) - Markdown ADR template

---

**Last Updated:** 2025-12-31
