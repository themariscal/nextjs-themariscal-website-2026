# VPS Proxy + Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily per-user rate limiting to bun-themariscal-api (backed by Upstash Redis + Clerk metadata), and create a Next.js catch-all proxy so the frontend never calls the VPS directly.

**Architecture:** A new `checkRateLimit` middleware chains after `requireAuth` in bun-api. Limits are read from env vars; user tier (`isPremium`) is read from Clerk `publicMetadata`. The Next.js proxy at `/api/vps/[...path]` forwards all methods and streams responses from the VPS.

**Tech Stack:** Bun + bun:test, @clerk/backend, Upstash Redis REST (fetch-based), Next.js 15 App Router route handlers.

---

## File Map

### bun-themariscal-api (repo: `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/`)

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `.env` | Add USER_LIMIT, USER_PREMIUM_LIMIT, Upstash vars |
| Create | `middleware/rateLimit.ts` | Redis counter check, Clerk isPremium read |
| Create | `middleware/rateLimit.test.ts` | Unit tests for rate limit middleware |
| Modify | `index.ts` | Chain checkRateLimit after requireAuth in /chat |

### Next.js frontend (repo: `/Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/`)

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `.env.local` | Add VPS_API_URL |
| Create | `src/app/api/vps/[...path]/route.ts` | Catch-all proxy to VPS |
| Modify | `src/app/[locale]/testing/api-ai/page.tsx` | Replace VPS_BASE with /api/vps |

---

## Task 1: Add env vars to bun-themariscal-api

**Files:**
- Modify: `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/.env`

- [ ] **Step 1: Add rate limit vars to .env**

Open `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/.env` and append:

```
USER_LIMIT=5
USER_PREMIUM_LIMIT=10
UPSTASH_REDIS_REST_URL=<copy from nextjs .env.local: UPSTASH_REDIS_REST_URL>
UPSTASH_REDIS_REST_TOKEN=<copy from nextjs .env.local: UPSTASH_REDIS_REST_TOKEN>
```

The Upstash values are already in the Next.js `.env.local` — copy them exactly.

- [ ] **Step 2: Commit**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
git add .env
git commit -m "chore: add rate limit and Upstash env vars"
```

---

## Task 2: Write failing tests for checkRateLimit

**Files:**
- Create: `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/middleware/rateLimit.test.ts`

- [ ] **Step 1: Create test file**

```typescript
// middleware/rateLimit.test.ts
import { describe, expect, it, mock, beforeEach } from 'bun:test';

// --- Mock Clerk ---
const mockGetUser = mock(async (_userId: string) => ({
  publicMetadata: { isPremium: false },
}));

mock.module('@clerk/backend', () => ({
  createClerkClient: () => ({
    users: { getUser: mockGetUser },
  }),
}));

// --- Mock fetch (Upstash REST) ---
let mockFetchResponses: Array<{ result: number }> = [];
let fetchCallCount = 0;

const originalFetch = global.fetch;

mock.module('./rateLimit', async () => {
  // Defer to actual module once we set up mocks
  return await import('./rateLimit');
});

// We override fetch globally for each test
function mockFetch(responses: Array<{ result: number }>) {
  fetchCallCount = 0;
  mockFetchResponses = responses;
  global.fetch = mock(async (_url: string) => {
    const response = mockFetchResponses[fetchCallCount] ?? { result: 1 };
    fetchCallCount++;
    return new Response(JSON.stringify(response), { status: 200 });
  }) as typeof fetch;
}

function restoreFetch() {
  global.fetch = originalFetch;
}

const { checkRateLimit } = await import('./rateLimit');

describe('checkRateLimit', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    restoreFetch();
  });

  it('allows request when count is under free limit (5)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: false } });
    mockFetch([{ result: 3 }]); // INCR returns 3, under limit

    await expect(checkRateLimit('user_free')).resolves.toBeUndefined();

    restoreFetch();
  });

  it('throws 429 when free user exceeds limit (5)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: false } });
    mockFetch([{ result: 6 }]); // INCR returns 6, over limit

    const thrown = await checkRateLimit('user_free').catch(e => e);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(429);

    restoreFetch();
  });

  it('allows premium user up to premium limit (10)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: true } });
    mockFetch([{ result: 10 }]); // INCR returns 10, exactly at limit

    await expect(checkRateLimit('user_premium')).resolves.toBeUndefined();

    restoreFetch();
  });

  it('throws 429 when premium user exceeds limit (10)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: true } });
    mockFetch([{ result: 11 }]); // INCR returns 11, over limit

    const thrown = await checkRateLimit('user_premium').catch(e => e);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(429);

    restoreFetch();
  });

  it('sets TTL when count is 1 (first request of the day)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: false } });
    // First call: INCR returns 1. Second call: EXPIRE.
    mockFetch([{ result: 1 }, { result: 1 }]);

    await checkRateLimit('user_new');
    expect(fetchCallCount).toBe(2); // INCR + EXPIRE

    restoreFetch();
  });

  it('does not set TTL when count > 1 (not first request)', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: false } });
    mockFetch([{ result: 2 }]); // INCR returns 2, no EXPIRE needed

    await checkRateLimit('user_returning');
    expect(fetchCallCount).toBe(1); // Only INCR

    restoreFetch();
  });

  it('fails open when Redis is unavailable', async () => {
    process.env.USER_LIMIT = '5';

    mockGetUser.mockResolvedValueOnce({ publicMetadata: { isPremium: false } });
    global.fetch = mock(async () => { throw new Error('Connection refused'); }) as typeof fetch;

    // Should not throw — fail open
    await expect(checkRateLimit('user_123')).resolves.toBeUndefined();

    restoreFetch();
  });

  it('defaults to non-premium when Clerk getUser fails', async () => {
    process.env.USER_LIMIT = '5';
    process.env.USER_PREMIUM_LIMIT = '10';

    mockGetUser.mockRejectedValueOnce(new Error('Clerk unavailable'));
    mockFetch([{ result: 3 }]); // Should use USER_LIMIT (5), not premium

    await expect(checkRateLimit('user_123')).resolves.toBeUndefined();

    restoreFetch();
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
bun test middleware/rateLimit.test.ts
```

Expected: `Cannot find module './rateLimit'` or similar import error.

---

## Task 3: Implement checkRateLimit middleware

**Files:**
- Create: `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/middleware/rateLimit.ts`

- [ ] **Step 1: Create rateLimit.ts**

```typescript
// middleware/rateLimit.ts
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

const USER_LIMIT = parseInt(process.env.USER_LIMIT ?? '5', 10);
const USER_PREMIUM_LIMIT = parseInt(process.env.USER_PREMIUM_LIMIT ?? '10', 10);

async function redisIncr(key: string): Promise<number> {
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/incr/${encodeURIComponent(key)}`,
    { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
  );
  const data = await res.json() as { result: number };
  return data.result;
}

async function redisExpire(key: string, seconds: number): Promise<void> {
  await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/expire/${encodeURIComponent(key)}/${seconds}`,
    { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
  );
}

export async function checkRateLimit(userId: string): Promise<void> {
  let isPremium = false;
  try {
    const user = await clerk.users.getUser(userId);
    isPremium = !!(user.publicMetadata?.isPremium);
  } catch (e) {
    console.error('[RateLimit] Failed to read Clerk metadata, defaulting to free tier:', e);
  }

  const limit = isPremium ? USER_PREMIUM_LIMIT : USER_LIMIT;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `rate:${userId}:${today}`;

  let count: number;
  try {
    count = await redisIncr(key);
    if (count === 1) {
      await redisExpire(key, 86400);
    }
  } catch (e) {
    console.error('[RateLimit] Redis unavailable, failing open:', e);
    return;
  }

  if (count > limit) {
    throw new Response(
      JSON.stringify({ error: 'Daily limit reached', limit, reset: 'tomorrow UTC midnight' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

- [ ] **Step 2: Run tests — expect them to pass**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
bun test middleware/rateLimit.test.ts
```

Expected output:
```
✓ allows request when count is under free limit (5)
✓ throws 429 when free user exceeds limit (5)
✓ allows premium user up to premium limit (10)
✓ throws 429 when premium user exceeds limit (10)
✓ sets TTL when count is 1 (first request of the day)
✓ does not set TTL when count > 1 (not first request)
✓ fails open when Redis is unavailable
✓ defaults to non-premium when Clerk getUser fails

8 pass, 0 fail
```

- [ ] **Step 3: Commit**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
git add middleware/rateLimit.ts middleware/rateLimit.test.ts
git commit -m "feat: add daily rate limiting middleware backed by Upstash Redis"
```

---

## Task 4: Wire checkRateLimit into the /chat route

**Files:**
- Modify: `/Users/martinmacbook/00-NuevasApps/bun-themariscal-api/index.ts`

- [ ] **Step 1: Add import at top of index.ts**

After line 3 (`import { requireAuth } from './middleware/auth';`), add:

```typescript
import { checkRateLimit } from './middleware/rateLimit';
```

- [ ] **Step 2: Chain checkRateLimit after requireAuth**

Replace the existing auth block in the `/chat` handler (lines 50-57):

```typescript
try {
  await requireAuth(req);
  console.log('[Auth] OK');
} catch (e) {
  console.log('[Auth] FAILED:', e instanceof Response ? `${(e as Response).status}` : e);
  if (e instanceof Response) return e;
  return new Response('Internal Server Error', { status: 500 });
}
```

With:

```typescript
let chatUserId: string;
try {
  const auth = await requireAuth(req);
  chatUserId = auth.userId;
  console.log('[Auth] OK');
} catch (e) {
  console.log('[Auth] FAILED:', e instanceof Response ? `${(e as Response).status}` : e);
  if (e instanceof Response) return e;
  return new Response('Internal Server Error', { status: 500 });
}

try {
  await checkRateLimit(chatUserId);
  console.log('[RateLimit] OK');
} catch (e) {
  console.log('[RateLimit] EXCEEDED:', e instanceof Response ? `${(e as Response).status}` : e);
  if (e instanceof Response) return new Response(e.body, { status: e.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  return new Response('Internal Server Error', { status: 500 });
}
```

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
bun test
```

Expected: all existing tests + new rate limit tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
git add index.ts
git commit -m "feat: wire rate limit check into /chat endpoint"
```

---

## Task 5: Add VPS_API_URL to Next.js .env.local

**Files:**
- Modify: `/Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/.env.local`

- [ ] **Step 1: Append VPS_API_URL**

Open `.env.local` and add at the end:

```
VPS_API_URL=http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io
```

No trailing slash. No `/chat`. Just the base domain.

- [ ] **Step 2: Verify it's not already in the file**

```bash
grep VPS_API_URL /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/.env.local
```

Expected: `VPS_API_URL=http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io`

Note: `.env.local` is gitignored — no commit needed for this step.

---

## Task 6: Create the Next.js catch-all VPS proxy route

**Files:**
- Create: `src/app/api/vps/[...path]/route.ts`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/src/app/api/vps/\[...path\]
```

Create `/Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/src/app/api/vps/[...path]/route.ts`:

```typescript
import { NextRequest } from 'next/server';

const VPS_API_URL = process.env.VPS_API_URL;

type Params = { path: string[] };

async function handler(
  req: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<Response> {
  if (!VPS_API_URL) {
    return new Response(JSON.stringify({ error: 'VPS_API_URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { path } = await params;
  const targetUrl = `${VPS_API_URL}/${path.join('/')}`;

  const forwardHeaders: Record<string, string> = {};
  const auth = req.headers.get('Authorization');
  if (auth) forwardHeaders['Authorization'] = auth;
  const contentType = req.headers.get('Content-Type');
  if (contentType) forwardHeaders['Content-Type'] = contentType;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // Required for streaming request bodies in Node.js
      // @ts-ignore
      duplex: 'half',
    });
  } catch (e) {
    console.error('[VPS Proxy] Upstream unreachable:', e);
    return new Response(JSON.stringify({ error: 'VPS unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const responseHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    // Skip headers that Next.js will set itself
    if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
cat "/Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/src/app/api/vps/[...path]/route.ts" | head -5
```

Expected: first line is `import { NextRequest } from 'next/server';`

- [ ] **Step 3: Commit**

```bash
cd /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api
git add "src/app/api/vps/[...path]/route.ts"
git commit -m "feat: add catch-all VPS proxy route /api/vps/[...path]"
```

---

## Task 7: Update testing page to use internal proxy

**Files:**
- Modify: `src/app/[locale]/testing/api-ai/page.tsx`

- [ ] **Step 1: Replace VPS_BASE with proxy prefix**

On line 10, replace:
```typescript
const VPS_BASE = "http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io";
```

With:
```typescript
const VPS_BASE = "/api/vps";
```

That's the only change. All existing fetch calls (`${VPS_BASE}/services`, `${VPS_BASE}/chat`) work unchanged since they already append the path.

- [ ] **Step 2: Verify the change**

```bash
grep -n "VPS_BASE" /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api/src/app/\[locale\]/testing/api-ai/page.tsx
```

Expected:
```
10: const VPS_BASE = "/api/vps";
167:         const res = await fetch(`${VPS_BASE}/services`, {
211:       const res = await fetch(`${VPS_BASE}/chat`, {
```

- [ ] **Step 3: Build check**

```bash
cd /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api
npx next build 2>&1 | tail -20
```

Expected: build completes without TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api
git add src/app/\[locale\]/testing/api-ai/page.tsx
git commit -m "feat: route testing page through internal VPS proxy"
```

---

## Task 8: Manual smoke test

- [ ] **Step 1: Start bun API locally**

```bash
cd /Users/martinmacbook/00-NuevasApps/bun-themariscal-api
bun run index.ts
```

Expected: `Server is running on http://localhost:3000`

- [ ] **Step 2: Start Next.js dev server**

```bash
cd /Users/martinmacbook/00-NuevasApps/nextjs-themariscal-website-2026/.worktrees/claude-new-conecction-api
npm run dev
```

- [ ] **Step 3: Test proxy routing**

Open `http://localhost:3001/testing/api-ai` (or whatever port Next.js uses), send a chat message. Verify:
- Network tab shows request to `/api/vps/chat` (not the VPS directly)
- Response streams correctly
- Service selector still works (loads from `/api/vps/services`)

- [ ] **Step 4: Test rate limiting on VPS**

Send 6+ messages while logged in. After the 5th (for free users), expect:
- 429 response
- Error shown in UI: `Error del servidor (429): {"error":"Daily limit reached",...}`
