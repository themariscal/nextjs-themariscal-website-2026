# RevenueCat Integration Design

**Date:** 2026-04-09  
**Branch:** claude-reveneucat-integration  
**Status:** Approved

---

## Overview

Integrate RevenueCat as the unified subscription management layer for web, iOS, and Android. The app already has Stripe and RevenueCat accounts connected. We use **RevenueCat Web Billing** on web (which uses Stripe under the hood) so RevenueCat is the single source of truth across all platforms.

**Subscription plans:**
- Monthly: $50/month
- Annual: $500/year

---

## Architecture

```
Usuario web                iOS/Android
     │                         │
     ▼                         ▼
RevenueCat Web Billing    RevenueCat SDK nativo
     │                         │
     └──────────┬──────────────┘
                ▼
        RevenueCat (fuente de verdad)
                │
                ▼ webhook
        /api/webhooks/revenuecat
                │
        ┌───────┴───────┐
        ▼               ▼
     Convex          Clerk
  subscriptions   publicMetadata
     table        { isPremium: true }
        │
        ▼
  Course gating +
  Admin dashboard
```

**Web purchase flow:**
1. User clicks "Subscribe" → server generates RevenueCat Web Billing checkout URL
2. User pays → RevenueCat charges via Stripe
3. RevenueCat sends webhook → `/api/webhooks/revenuecat`
4. Handler updates Convex `subscriptions` + Clerk `publicMetadata.isPremium`
5. Next Clerk JWT already carries `isPremium: true` → AI API verifies from token directly

**iOS/Android:** Same webhook, same handler, fully unified.

---

## Data Model

### New table: `subscriptions`

```ts
subscriptions: defineTable({
  clerkUserId: v.string(),           // lookup by user
  revenueCatCustomerId: v.string(),  // RC customer ID
  productIdentifier: v.string(),     // e.g. "premium_monthly"
  entitlementId: v.string(),         // e.g. "premium"
  status: v.union(
    v.literal("active"),
    v.literal("expired"),
    v.literal("cancelled"),
    v.literal("billing_issue")
  ),
  planType: v.union(v.literal("monthly"), v.literal("annual")),
  currentPeriodEnd: v.number(),      // Unix timestamp
  revenueCatEventType: v.string(),   // last event received
})
.index("by_clerk_user", ["clerkUserId"])
.index("by_revenuecat_customer", ["revenueCatCustomerId"])
```

### New table: `subscriptionOfferings`

Admin-managed display and product config:

```ts
subscriptionOfferings: defineTable({
  name: v.string(),                        // "Premium"
  description: v.string(),
  monthlyPriceUsd: v.number(),             // 50
  annualPriceUsd: v.number(),              // 500
  revenueCatProductIdMonthly: v.string(),  // RC product ID
  revenueCatProductIdAnnual: v.string(),   // RC product ID
  revenueCatOfferingId: v.string(),        // link to RC offering
  isActive: v.boolean(),
})
```

### Modified table: `academyCourses`

Add field:
```ts
includedInPremium: v.optional(v.boolean())
```

---

## Components to Build

### 1. Webhook handler — `/api/webhooks/revenuecat/route.ts`

- Verify webhook signature using `REVENUECAT_WEBHOOK_SECRET`
- Events that **activate** premium: `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION`
- Events that **deactivate** premium: `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`
- Updates Convex `subscriptions` record
- Updates Clerk `publicMetadata.isPremium`
- Idempotent: check if record exists before creating

### 2. Checkout API — `/api/revenuecat/checkout/route.ts`

- Receives `planType: "monthly" | "annual"` + authenticated Clerk user ID
- Sets RevenueCat `appUserId` = Clerk user ID (critical: this is how the webhook knows which Clerk user to update)
- Calls RevenueCat API to generate Web Billing checkout URL
- Returns URL for client redirect

### 3. Course gating update — `convex/academyCourses.ts`

Update `hasCourseAccess` query:
```
access = individual purchase OR (user is premium AND course.includedInPremium === true)
```

### 4. Admin dashboard — `/admin/subscriptions/`

- List subscription offerings from `subscriptionOfferings`
- Edit form: name, description, prices (display only), RevenueCat product IDs, offering ID → saves to Convex
- Actual price changes managed in Stripe/RevenueCat dashboards — admin UI provides direct links to both
- Direct link to offering in RevenueCat dashboard
- View active subscribers (from `subscriptions` table)

### 5. User account popover — `user-account-popover.tsx`

- Add "Premium" badge with `Crown` icon (lucide-react) when Clerk session has `isPremium: true`

### 6. Account subscription page — `/account/subscription`

- Show active plan, renewal date, plan type
- "Manage subscription" button → RevenueCat/Stripe customer portal

### 7. Course admin toggle

- In existing course admin UI, add `includedInPremium` toggle per course

---

## AI API Premium Verification

No Convex query needed — JWT carries the flag:

```ts
const { sessionClaims } = await auth()
const isPremium = sessionClaims?.publicMetadata?.isPremium === true
if (!isPremium) return new Response("Upgrade required", { status: 402 })
```

## Clerk metadata update (server-side, from webhook handler)

```ts
await clerkClient.users.updateUserMetadata(clerkUserId, {
  publicMetadata: { isPremium: true }
})
```

---

## Error Handling

- Webhook handler returns 500 on Convex or Clerk failure → RevenueCat auto-retries
- Webhook is idempotent: check existing record before upsert
- Log all webhook events for debugging

---

## Environment Variables (new)

```
REVENUECAT_SECRET_KEY          # Server-side RC API key
REVENUECAT_WEBHOOK_SECRET      # Webhook signature verification
REVENUECAT_WEB_BILLING_URL     # Base URL for Web Billing checkout
```

---

## Out of Scope

- Trial periods (can be added later via RevenueCat dashboard config)
- Promo codes (RevenueCat handles natively, no code needed)
- Refund handling (managed in RevenueCat/Stripe dashboards)
