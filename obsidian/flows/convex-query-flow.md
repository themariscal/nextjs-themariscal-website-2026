---
title: "Convex Query Flow"
type: flow
updated: 2026-04-11
tags: [convex, useQuery, useMutation, realtime, subscription, provider, clerk]
---

# Convex Query Flow

Convex is the primary backend for this project. It handles real-time data subscriptions, mutations, and internal business logic. Client components connect via `ConvexReactClient` authenticated through Clerk.

Related architecture: [[architecture/convex]] · [[architecture/frontend]]

---

## Sub-flow 1: Provider Setup (App Bootstrap)

**Trigger:** App renders. `ConvexClientProvider` wraps the entire React tree.

### Step-by-step

1. **`ConvexClientProvider`** (`src/lib/providers/convex-provider.tsx`) creates a singleton `ConvexReactClient` using `NEXT_PUBLIC_CONVEX_URL`.
2. Wraps children in **`ConvexProviderWithClerk`** from `convex/react-clerk`, passing Clerk's `useAuth` hook.
3. `ConvexProviderWithClerk` monitors Clerk auth state. When the user signs in, it automatically fetches a short-lived Convex-compatible JWT from Clerk (using the `"convex"` JWT template) and attaches it to all outgoing Convex requests.
4. All `useQuery` and `useMutation` calls within the tree are now identity-aware — Convex functions can call `ctx.auth.getUserIdentity()` to validate the caller.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `ConvexClientProvider` | `src/lib/providers/convex-provider.tsx` | Wraps app with authenticated Convex context |

---

## Sub-flow 2: Shorts Player — Real-time Data (`proc_1_shortsplayerclient`)

**GitNexus process:** `proc_1_shortsplayerclient` — `ShortsPlayerClient → Navigate` (4 steps), intra-community, entry: `ShortsPlayerClient`, terminal: `navigate`.

**Trigger:** User navigates to `/[locale]/shorts/[page]/[videoId]`.

### Step-by-step

1. **`ShortsPlayerClient`** (`src/app/[locale]/(root)/(main)/shorts/[page]/[videoId]/shorts-player-client.tsx`) mounts. All data loading is reactive — no manual fetch calls.
2. **Convex queries fire simultaneously** (Convex de-duplicates and batches automatically):
   - `useQuery(api.youtubeShorts.getByVideoId, { videoId })` — loads current short metadata
   - `useQuery(api.youtubeShorts.getByPage, { page })` — loads all shorts for the current page (used for prev/next navigation)
   - `useQuery(api.youtubeShorts.getMyReaction, { videoId })` — loads authenticated user's reaction (like/dislike)
   - `useQuery(api.youtubeShorts.getReactionCounts, { videoId })` — loads aggregate reaction counts (real-time)
   - `useQuery(api.shortComments.getComments, { videoId })` — loads comments list (real-time)
3. **`useMutation(api.youtubeShorts.toggleReaction)`** is registered (not called yet).
4. **Reaction mutation:** User clicks like/dislike → `toggleReaction({ videoId, reaction })` is called. If user is not signed in, a login dialog opens instead and the pending reaction is stored in `localStorage` under key `pendingShortReaction` with `{ videoId, reaction, timestamp }`.
5. **Post-login reaction replay:** A `useEffect` watches `isSignedIn`. When the user returns from OAuth and `isSignedIn` becomes true, it reads `localStorage`, validates the pending reaction is for the current video and is recent (< 2 minutes), then calls `toggleReaction` automatically.
6. **Navigation (`navigate` function — process terminal):** `onWheel`, `onKeyDown`, and swipe gesture handlers all call `navigate(direction)`. `navigate` uses `router.push()` with the next/prev short's URL, protected by a module-level `navigatingGlobal` debounce flag (220ms `SHORT_TRANSITION_MS`) to prevent double-navigation.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `ShortsPlayerClient` | `src/app/.../shorts-player-client.tsx` | Main component — all data subscriptions |
| `navigate` | same file | Router push with debounce guard |
| `navigateOnce` | same file | Single-fire wrapper around `navigate` |
| `handleWheel` / `onWheel` | same file | Scroll-to-navigate trigger |
| `handleReaction` | same file | Like/dislike mutation + auth gate |

### GitNexus adjacent processes

- **`proc_2_onwheel`** (`OnWheel → Navigate`, 4 steps) — scroll-triggered navigation path
- **`proc_7_onkeydown`** (`OnKeyDown → Navigate`, 3 steps) — keyboard-triggered navigation path

Both share the same `navigate` terminal function as `proc_1_shortsplayerclient`.

---

## Sub-flow 3: Subscription Data Queries

**Trigger:** User visits `/[locale]/account/subscription`.

### Step-by-step

1. **`SubscriptionPage`** (`src/app/[locale]/account/subscription/page.tsx`) calls:
   - `useQuery(api.subscriptions.getMySubscription)` — returns the authenticated user's subscription row from Convex (or `null` if none).
2. If no active subscription, **`handleSubscribe`** function is available:
   - POSTs to `/api/revenuecat/checkout` (see [[flows/api-flow]] — RevenueCat Checkout sub-flow)
   - On success, redirects to `checkoutUrl`

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `SubscriptionPage` | `src/app/[locale]/account/subscription/page.tsx` | Subscription status display |
| `handleSubscribe` | same file | Initiates RevenueCat checkout |
| `getMySubscription` | `convex/subscriptions.ts` | Query: returns user's subscription row |

---

## Sub-flow 4: Convex from Server-side (HTTP Client)

**Trigger:** API routes that need to read/write Convex data server-side (no React hooks available).

### Pattern

```ts
// Unauthenticated read (public data):
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const offerings = await convex.query(api.subscriptionOfferings.listOfferings);

// Authenticated write (requires Clerk JWT):
const token = await getToken({ template: "convex" });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
convex.setAuth(token);
await convex.mutation(api.subscriptions.syncSubscriptionFromRC, { ... });
```

Used in: `src/app/api/revenuecat/checkout/route.ts` and `src/app/api/revenuecat/sync/route.ts`.

---

## Sub-flow 5: Subscription Upsert (Convex Mutation)

**Trigger:** Called from `sync/route.ts` after a successful RevenueCat subscription event, or from `convex/http.ts` webhook handler.

### Step-by-step

1. **`syncSubscriptionFromRC`** mutation (`convex/subscriptions.ts`) — public mutation, but validates `ctx.auth` identity internally.
2. Delegates to **`upsertSubscription`** internal mutation:
   - Queries `subscriptions` table by `by_clerk_user` index.
   - If record exists: `ctx.db.patch` with updated fields.
   - If new: `ctx.db.insert`.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `upsertSubscription` | `convex/subscriptions.ts` | Internal mutation: upsert subscription row |
| `getMySubscription` | `convex/subscriptions.ts` | Query: authenticated user's subscription |

---

## Admin Queries

Admin pages (`src/app/[locale]/admin/subscriptions/page.tsx`, `src/app/[locale]/admin/academy/courses/page.tsx`) also use `useQuery` to load Convex data. These follow the same provider-based pattern but typically call internal or admin-scoped queries. See [[features/admin]] for details.
