# VPS Proxy + Rate Limiting Design

**Date:** 2026-04-09  
**Status:** Approved  

## Overview

Two coordinated changes:

1. **`bun-themariscal-api`** — Add daily rate limiting per user based on Clerk `isPremium` metadata, backed by Upstash Redis.
2. **Next.js frontend** — Add internal catch-all proxy route `/api/vps/[...path]` so the web never calls the VPS directly.

---

## Part 1: bun-themariscal-api — Rate Limiting

### Environment Variables

Add to `.env`:

```
USER_LIMIT=5
USER_PREMIUM_LIMIT=10
UPSTASH_REDIS_REST_URL=<from nextjs .env.local>
UPSTASH_REDIS_REST_TOKEN=<from nextjs .env.local>
```

### Architecture

New file: `middleware/rateLimit.ts`  
Responsibility: read Clerk metadata → check Redis counter → allow or reject.

**Chain in `index.ts` for `/chat`:**
```
requireAuth(req) → checkRateLimit(userId) → handler
```

### Rate Limit Logic

```
key = "rate:{userId}:{YYYY-MM-DD}"

count = INCR key
if count === 1:
    EXPIRE key 86400   // set TTL only on first increment

limit = isPremium ? USER_PREMIUM_LIMIT : USER_LIMIT
if count > limit:
    return 429 Too Many Requests
```

- Uses Upstash Redis REST API (fetch-based, no native driver needed in Bun)
- Reads `publicMetadata.isPremium` via `clerk.users.getUser(userId)`
- Resets daily at midnight UTC (key expires after 24h from first request of the day)
- Counter increments before the AI call (avoids gaming with failed requests)

### Response on limit exceeded

```json
HTTP 429
{ "error": "Daily limit reached", "limit": 5, "reset": "tomorrow UTC midnight" }
```

---

## Part 2: Next.js — VPS Proxy

### Environment Variable

Add to `.env.local`:

```
VPS_API_URL=http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io
```

No `/chat` suffix — just the base domain.

### Route

**File:** `src/app/api/vps/[...path]/route.ts`

**Handles:** GET, POST (and any future methods)

**Logic:**
1. Extract `path` segments from params → join as `/{path}`
2. Build target URL: `${VPS_API_URL}/${path}`
3. Forward: method, body, `Authorization` header, `Content-Type`
4. Pipe response body directly (supports streaming for `/chat`)
5. Forward `X-Service-Used` and other VPS response headers

**Supported routes (zero code changes needed for new ones):**
- `GET /api/vps/services` → `VPS_API_URL/services`
- `POST /api/vps/chat` → `VPS_API_URL/chat`
- `POST /api/vps/anything-future` → `VPS_API_URL/anything-future`

### Testing Page Update

`src/app/[locale]/testing/api-ai/page.tsx`:

- Remove hardcoded `VPS_BASE` constant
- Replace with `/api/vps` prefix for all fetch calls
- `/api/vps/services` instead of `VPS_BASE/services`
- `/api/vps/chat` instead of `VPS_BASE/chat`

---

## Data Flow

```
Browser → Next.js /api/vps/[...path] → bun-themariscal-api (VPS)
                                              ↓
                                        requireAuth (Clerk)
                                              ↓
                                        checkRateLimit (Redis + Clerk metadata)
                                              ↓
                                        AI service (Groq / Cerebras)
                                              ↓
                                        Streaming response back
```

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Not signed in | 401 from bun auth middleware |
| Daily limit reached | 429 from bun rate limit middleware |
| VPS unreachable | 502 from Next.js proxy |
| Redis unavailable | Fail open (allow request, log error) — avoid blocking users on Redis outage |

---

## Out of Scope

- Rate limiting on Next.js proxy side (bun-api handles it)
- Monthly/lifetime counters
- Rate limit UI in frontend (future work)
- Admin override for limits
