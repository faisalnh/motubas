# ADR-0004: Use Google Gemini Flash for AI Assistant

**Status:** Accepted

**Date:** 2025-12-31

**Deciders:** Development Team

---

## Context

Motubas needs an AI assistant ("Om Motu") to help users troubleshoot car problems. Requirements:
- Understand Indonesian language (Bahasa Indonesia) fluently
- Provide car troubleshooting advice based on symptoms
- Support image inputs (users can send photos of car issues)
- Cost-effective for freemium model (10 free queries/month)
- Fast response times for good UX
- Reliable and production-ready

The AI should act as a friendly advisor, using Indonesian idioms and culturally appropriate language (using "Om" as a respectful term).

## Decision

We will use **Google Gemini 2.5 Flash** as the AI model for Om Motu assistant.

**Specific configuration:**
- Model: `gemini-2.5-flash` (via `@google/genai` SDK v1.34.0)
- Input support: Text and images (multimodal)
- API endpoint: Google AI Studio (not Vertex AI)
- Rate limiting: 1 request per 5 seconds per user
- Free tier quota: 10 queries per month per user
- Conversation history: Stored in PostgreSQL for context

**System prompt approach:**
```typescript
const SYSTEM_PROMPT = `Kamu adalah Om Motu, asisten digital untuk 
pemilik mobil tua di Indonesia. [Indonesian personality and rules]`;
```

## Consequences

### Positive
- **Cost-effective:** $0.075 per 1M input tokens (much cheaper than GPT-4)
- **Multimodal support:** Native image understanding for visual diagnostics
- **Fast responses:** Flash model optimized for speed
- **Indonesian language:** Excellent Bahasa Indonesia understanding
- **Free tier available:** 60 requests/minute free quota from Google
- **Simple integration:** Official SDK with good TypeScript support
- **Good context window:** Sufficient for conversation history
- **Gemini 3 Flash coming:** Even better performance in future

### Negative
- **API dependency:** Reliant on Google AI availability
- **Cost at scale:** Paid after free tier exhausted (estimated $5-15/month for 1000 users)
- **Safety filters:** May block legitimate car troubleshooting content
- **Rate limits:** 60 requests/minute shared across app
- **No fine-tuning:** Cannot customize model specifically for old Indonesian cars

### Risks
- **Service downtime:** Google AI outage affects Om Motu
- **Cost overrun:** Unexpected high usage could increase costs
- **API changes:** Google may deprecate or change API
- **Content policy:** Indonesian car terminology might trigger false safety flags
- **Quality variance:** Response quality may vary, no guarantees

**Mitigation:**
- Implement credit system to control usage (10 free/month)
- Add rate limiting per user (1 request/5 seconds)
- Cache common questions/answers to reduce API calls
- Monitor costs with alerts
- Have fallback responses if API fails
- Test safety filters with Indonesian car terminology early

## Alternatives Considered

### Option 1: OpenAI GPT-4o-mini
- **Pros:** Well-known, excellent quality, good documentation
- **Cons:** More expensive ($0.15-0.60 per 1M tokens), image support more complex
- **Why rejected:** Cost 2-8x higher, budget constraint for freemium model

### Option 2: Claude 3 Haiku (Anthropic)
- **Pros:** Fast, cost-effective, good at following instructions
- **Cons:** No native image support, less Indonesian language data
- **Why rejected:** Need multimodal support for visual diagnostics

### Option 3: Llama 3 (Self-hosted via Replicate/Together)
- **Pros:** Open source, potentially cheaper, full control
- **Cons:** Infrastructure complexity, less reliable, weaker Indonesian
- **Why rejected:** Higher operational burden, MVP needs simplicity

### Option 4: GPT-3.5-turbo
- **Pros:** Cheaper than GPT-4, decent quality
- **Cons:** No image support, older model being phased out
- **Why rejected:** Gemini Flash is cheaper AND supports images

### Option 5: Google Gemini Pro
- **Pros:** Higher quality than Flash, same multimodal support
- **Cons:** ~10x more expensive than Flash
- **Why rejected:** Flash quality sufficient for car troubleshooting, cost too high

### Option 6: No AI (Rule-based system)
- **Pros:** No API costs, full control, deterministic
- **Cons:** Requires extensive manual rule creation, can't understand images
- **Why rejected:** Would take months to build comparable capability

## Why Not Vertex AI?

Google offers Gemini via both AI Studio and Vertex AI:
- **AI Studio (chosen):** Simpler, API key auth, good for startups
- **Vertex AI:** More enterprise features, GCP integration, complex billing

**Why AI Studio:** 
- Simpler setup (API key vs GCP service account)
- Easier billing tracking
- Sufficient features for MVP
- Can migrate to Vertex AI later if needed

## Image Support Consideration

Gemini Flash supports images natively, which is critical for:
- Users showing dashboard warning lights
- Photos of engine problems
- Visual damage assessment
- Fluid leak identification

This capability justifies choosing multimodal AI over text-only alternatives.

## References

- [Google Gemini Models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini 2.5 Flash Announcement](https://blog.google/products/gemini/gemini-2-5-flash/)
- [Gemini API Quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [@google/genai SDK](https://www.npmjs.com/package/@google/genai)
- [Gemini Flash Pricing](https://ai.google.dev/pricing)

---

## Changelog

- **2025-12-31:** Initial decision - Google Gemini 2.5 Flash chosen for Om Motu AI assistant
