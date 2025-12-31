# Environment Variables Reference

All environment variables used in Motubas.

## Required Variables

### Database

#### `DATABASE_URL`
**Type:** String (PostgreSQL connection string)  
**Required:** Yes  
**Example:** `postgresql://user:password@localhost:5432/motubas?schema=public`

**Description:** PostgreSQL database connection string. Used by Prisma for database operations.

**Where to get:**
- **Local:** `postgresql://postgres:password@localhost:5432/motubas`
- **Vercel Postgres:** Automatically set by `vercel postgres create`
- **Supabase:** Get from Supabase project settings

**Notes:**
- Must include `?schema=public` suffix
- Connection pooling handled by Prisma PG adapter

---

### Authentication

#### `AUTH_SECRET`
**Type:** String (base64)  
**Required:** Yes  
**Example:** `your-32-character-random-string`

**Description:** Secret key for signing Auth.js JWT tokens. Must be cryptographically random.

**How to generate:**
```bash
openssl rand -base64 32
```

**Security:**
- Never commit to git
- Different value for dev/staging/production
- Rotate periodically for security

---

#### `AUTH_URL`
**Type:** String (URL)  
**Required:** Yes  
**Example:** 
- Dev: `http://localhost:3000`
- Prod: `https://motubas.vercel.app`

**Description:** Base URL of your application. Used by Auth.js for OAuth redirects.

**Notes:**
- Must match actual deployment URL
- No trailing slash
- HTTPS required in production

---

#### `AUTH_GOOGLE_ID`
**Type:** String  
**Required:** Yes (for Google OAuth)  
**Example:** `123456789-abc123.apps.googleusercontent.com`

**Description:** Google OAuth 2.0 Client ID.

**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `{AUTH_URL}/api/auth/callback/google`

---

#### `AUTH_GOOGLE_SECRET`
**Type:** String  
**Required:** Yes (for Google OAuth)  
**Example:** `GOCSPX-abc123xyz789`

**Description:** Google OAuth 2.0 Client Secret.

**Where to get:** Same as `AUTH_GOOGLE_ID`, shown after client creation.

**Security:** Never expose publicly, rotate if compromised.

---

### AI (Gemini)

#### `GEMINI_API_KEY`
**Type:** String  
**Required:** Yes (for Om Motu AI)  
**Example:** `AIzaSy...`

**Description:** Google Gemini API key for AI assistant.

**Where to get:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key

**Usage limits:**
- Free tier: 60 requests/minute
- Monitor usage in AI Studio

**Notes:**
- Model used: `gemini-2.5-flash`
- Can use same key for dev/prod (monitor quota)

---

### File Storage

#### `BLOB_READ_WRITE_TOKEN`
**Type:** String  
**Required:** Yes (for invoice uploads)  
**Example:** `vercel_blob_rw_abc123xyz789`

**Description:** Vercel Blob Storage token with read/write permissions.

**Where to get:**
1. Vercel Dashboard → Storage → Blob
2. Create new store or use existing
3. Copy read-write token

**Permissions:** Must have `read` and `write` access.

---

## Optional Variables

### Email (Future)

#### `EMAIL_SERVER_HOST`
**Type:** String  
**Required:** No (not implemented in MVP)  
**Example:** `smtp.gmail.com`

**Description:** SMTP server for sending emails.

---

#### `EMAIL_SERVER_PORT`
**Type:** Number  
**Required:** No  
**Example:** `587`

**Description:** SMTP port (usually 587 for TLS, 465 for SSL).

---

#### `EMAIL_SERVER_USER`
**Type:** String  
**Required:** No  
**Example:** `noreply@motubas.com`

**Description:** SMTP username/email address.

---

#### `EMAIL_SERVER_PASSWORD`
**Type:** String  
**Required:** No  
**Example:** App password from email provider

**Description:** SMTP password or app-specific password.

---

#### `EMAIL_FROM`
**Type:** String  
**Required:** No  
**Example:** `Motubas <noreply@motubas.com>`

**Description:** From address for outgoing emails.

---

## Environment Files

### `.env.local` (Local Development)
```bash
# Copy from .env.example
# Git-ignored, safe for secrets
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
GEMINI_API_KEY="..."
BLOB_READ_WRITE_TOKEN="..."
```

### `.env.example` (Template)
```bash
# Committed to git
# No real values, only examples
DATABASE_URL="postgresql://user:password@localhost:5432/motubas?schema=public"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
# ...
```

### Vercel Environment Variables
Set in Vercel Dashboard → Settings → Environment Variables:
- Production: Used for `production` deployments
- Preview: Used for PR deployments
- Development: Pull with `vercel env pull`

---

## Validation

Check required variables at runtime:

```typescript
// lib/env.ts (optional validation)
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  GEMINI_API_KEY: z.string(),
  BLOB_READ_WRITE_TOKEN: z.string(),
});

envSchema.parse(process.env);
```

---

## Troubleshooting

### "Missing environment variable" error
1. Check `.env.local` exists in project root
2. Verify variable name matches exactly (case-sensitive)
3. Restart dev server after adding variables
4. Run `vercel env pull` to sync from Vercel

### Auth.js errors
- Verify `AUTH_URL` matches your domain
- Check `AUTH_SECRET` is set and random
- Ensure Google OAuth redirect URI is configured correctly

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL is running (local)
- Test connection: `npx prisma db pull`

### Vercel Blob errors
- Verify token has read+write permissions
- Check token is not expired
- Ensure project is linked: `vercel link`

---

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` (git-ignored)
   - Use Vercel environment variables for production

2. **Rotate secrets regularly**
   - `AUTH_SECRET`: Every 6 months
   - `AUTH_GOOGLE_SECRET`: If compromised
   - `GEMINI_API_KEY`: If leaked

3. **Use different values per environment**
   - Dev, staging, production should have separate secrets
   - Prevents cross-environment issues

4. **Limit token permissions**
   - Blob token: Only read+write, not admin
   - API keys: Set usage limits in provider dashboards

5. **Monitor usage**
   - Check Gemini API quota regularly
   - Set up alerts for unusual activity
   - Review Vercel Blob storage usage

---

**Last Updated:** 2025-12-31  
**See Also:** 
- [.env.example](../../.env.example) - Template file
- [ADR-0005](../adr/0005-use-authjs-v5-for-authentication.md) - Auth decisions
- [ADR-0004](../adr/0004-use-google-gemini-flash-for-ai-assistant.md) - AI decisions
