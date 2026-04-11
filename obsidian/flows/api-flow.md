---
title: "API Flow"
type: flow
updated: 2026-04-11
tags: [api, vps, proxy, revenuecat, webhook, route-handler, http]
---

# API Flow

This project exposes several Next.js Route Handlers. The two dominant patterns are the **VPS proxy** (forwarding requests to a self-hosted backend) and the **RevenueCat subscription flows** (checkout initiation and subscription sync).

Related architecture: [[architecture/frontend]] · [[architecture/convex]]

---

## Sub-flow 1: VPS Proxy (`proc_5_post` / `proc_3_post` adjacent)

**GitNexus process:** none directly — the VPS handler is a standalone catch-all route.

**Trigger:** Any client-side fetch to `/api/vps/<path>` (e.g. `/api/vps/chat`, `/api/vps/services`).

### Step-by-step

1. **`handler`** (`src/app/api/vps/[...path]/route.ts`) receives the request (GET, POST, PUT, PATCH, or DELETE — all exported and point to the same function).
2. Resolves `VPS_API_URL` from environment. Returns 500 if not configured.
3. **Path allowlist check:** `path[0]` must be in `Set(['chat', 'services'])`. Any other path returns 404. This prevents the proxy from being used as an open forwarder.
4. Constructs `targetUrl = ${VPS_API_URL}/${path.join('/')}`.
5. **Forwards selective headers:** only `Authorization` and `Content-Type` are forwarded. Host, cookie, and other headers are dropped.
6. Calls `fetch(targetUrl, { method, headers, body, duplex: 'half' })`. The `duplex: 'half'` flag is required for streaming request bodies in Node.js.
7. **On upstream error:** returns 502 with `{ error: 'VPS unreachable' }`.
8. **On success:** strips `transfer-encoding` and `connection` from upstream response headers (Next.js sets these itself), then streams the upstream response body back to the client with its original status code.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `handler` | `src/app/api/vps/[...path]/route.ts` | Catch-all VPS reverse proxy |

### Error handling

| Condition | Response |
|-----------|----------|
| `VPS_API_URL` not set | 500 `{ error: 'VPS_API_URL not configured' }` |
| Path not in allowlist | 404 `{ error: 'Not found' }` |
| Upstream fetch throws | 502 `{ error: 'VPS unreachable' }` |
| Upstream returns error status | Proxied as-is with original status |

---

## Sub-flow 2: RevenueCat Checkout (`proc_3_post`)

**GitNexus process:** `proc_3_post` — `POST → RcHeaders` (3 steps), entry: `POST` in `checkout/route.ts`, terminal: `rcHeaders` in `revenuecat.ts`.

**Trigger:** Client POSTs to `/api/revenuecat/checkout` with `{ planType: "monthly" | "annual", locale: string }`.

### Step-by-step

1. **Auth check:** `auth()` from Clerk. Returns 401 if no `userId`.
2. **Input validation:** `planType` must be `"monthly"` or `"annual"`. Returns 400 otherwise.
3. **Convex query:** `ConvexHttpClient` queries `api.subscriptionOfferings.listOfferings` (unauthenticated, public query) to find the active offering. Returns 404 if none found.
4. **Resolves `productId`** from the active offering's `revenueCatProductIdMonthly` or `revenueCatProductIdAnnual` field.
5. **Clerk user fetch (non-fatal):** Fetches the Clerk user to get their email and display name. Calls `setSubscriberAttributes(userId, { email, displayName, username })` on RevenueCat to pre-populate checkout. Errors here are warned but do not abort the flow.
6. **`createWebBillingCheckout`** (`src/lib/revenuecat.ts`) calls RevenueCat's web billing API to create a checkout session URL. Passes `successUrl` and `cancelUrl` based on `NEXT_PUBLIC_APP_URL`.
7. Returns `{ checkoutUrl }` to the client.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `POST` | `src/app/api/revenuecat/checkout/route.ts` | Checkout session creation |
| `createWebBillingCheckout` | `src/lib/revenuecat.ts` | RevenueCat web billing API call |
| `setSubscriberAttributes` | `src/lib/revenuecat.ts` | Pre-populates RC subscriber attributes |
| `rcHeaders` | `src/lib/revenuecat.ts` | Builds `Authorization: Bearer` headers for RC API |

### Error handling

| Condition | Response |
|-----------|----------|
| Not authenticated | 401 |
| Invalid `planType` | 400 |
| No active offering in Convex | 404 |
| Clerk user fetch fails | Warn + continue (non-fatal) |
| `createWebBillingCheckout` throws | 500 with error message |

---

## Sub-flow 3: RevenueCat Subscription Sync (`proc_5_post`)

**GitNexus process:** `proc_5_post` — `POST → RcHeaders` (3 steps), entry: `POST` in `sync/route.ts`, terminal: `rcHeaders` in `revenuecat.ts`.

**Trigger:** Client POSTs to `/api/revenuecat/sync` (no body required). Called after returning from a successful RevenueCat checkout to force-sync subscription state before showing the updated UI.

### Step-by-step

1. **Auth check:** `auth()` returns `userId` and `getToken`. Returns 401 if no `userId`.
2. **`getSubscriber(userId)`** — calls RevenueCat REST API (`GET /v1/subscribers/:userId`) using `REVENUECAT_SECRET_KEY`. Returns 502 on failure.
3. **Finds active entitlement:** iterates `subscriber.entitlements` to find one where `expires_date` is null or in the future.
4. If no active entitlement: returns `{ synced: false, reason: "no_active_entitlement" }` (soft failure, not an error).
5. **Derives subscription metadata:** `status` (active / cancelled / billing_issue), `planType` (monthly / annual from product ID string), `currentPeriodEnd` (Unix timestamp).
6. **Convex mutation (authenticated):** Gets a Clerk JWT via `getToken({ template: "convex" })`, attaches it to `ConvexHttpClient`, calls `api.subscriptions.syncSubscriptionFromRC` to upsert the subscription record.
7. **Clerk metadata update:** PATCHes `https://api.clerk.com/v1/users/:userId/metadata` with `{ public_metadata: { isPremium: true } }` so client-side Clerk token claims reflect premium status.
8. Returns `{ synced: true, status, planType }`.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `POST` | `src/app/api/revenuecat/sync/route.ts` | Manual RC→Convex sync |
| `getSubscriber` | `src/lib/revenuecat.ts` | Fetches RC subscriber state |
| `rcHeaders` | `src/lib/revenuecat.ts` | RC API auth headers |
| `syncSubscriptionFromRC` | `convex/subscriptions.ts` | Convex mutation: upsert subscription |

### Error handling

| Condition | Response |
|-----------|----------|
| Not authenticated | 401 |
| RC API call fails | 502 |
| No active entitlement | `{ synced: false, reason: "no_active_entitlement" }` |
| Convex JWT missing | Skips Convex mutation silently |
| Clerk metadata update fails | Not caught (fire-and-forget) |
