# RevenueCat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate RevenueCat Web Billing as the unified subscription layer (web + iOS/Android), sync premium status to Convex + Clerk JWT, add admin management UI and premium course gating.

**Architecture:** RevenueCat Web Billing handles web checkout; native SDKs handle iOS/Android. All platforms trigger RC webhooks → `/api/webhooks/revenuecat` → updates Convex `subscriptions` table + Clerk `publicMetadata.isPremium`. Clerk JWT carries `isPremium` for instant AI API verification without Convex round-trip.

**Tech Stack:** RevenueCat REST API, Next.js Route Handlers, Convex mutations/queries, `@clerk/nextjs/server` clerkClient, lucide-react Crown icon, shadcn/ui components.

---

## File Map

**New files:**
- `convex/subscriptions.ts` — upsert/query subscription records
- `convex/subscriptionOfferings.ts` — CRUD for admin-managed offerings
- `src/lib/revenuecat.ts` — RevenueCat API client
- `src/app/api/webhooks/revenuecat/route.ts` — RC webhook → Convex + Clerk
- `src/app/api/revenuecat/checkout/route.ts` — generate Web Billing checkout URL
- `src/app/[locale]/admin/subscriptions/page.tsx` — admin offerings + subscribers
- `src/app/[locale]/admin/academy/courses/page.tsx` — course list with premium toggle

**Modified files:**
- `convex/schema.ts` — add subscriptions, subscriptionOfferings tables; add `includedInPremium` to academyCourses
- `convex/academyCourses.ts` — add `setIncludedInPremium` mutation + `listAllCourses` query
- `convex/coursePurchases.ts` — update `hasPurchasedCourse` to check premium subscription
- `src/components/popovers/user-account-popover.tsx` — add Crown badge for premium users
- `src/components/layout/sidebars/admin-app-sidebar.tsx` — add Subscriptions nav item
- `src/app/[locale]/account/subscription/page.tsx` — full subscription info + checkout page
- `.env.local` — add 3 RevenueCat env vars

---

### Task 1: Add RevenueCat environment variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add vars to .env.local**

Add these three lines to `.env.local` (get values from RevenueCat Dashboard → Project Settings → API Keys):

```
REVENUECAT_SECRET_KEY=sk_...
REVENUECAT_WEBHOOK_SECRET=your_shared_secret_here
NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY=rcb_...
```

- [ ] **Step 2: Commit (empty — .env.local is gitignored)**

```bash
git commit --allow-empty -m "chore: add RevenueCat env vars to .env.local (gitignored)"
```

---

### Task 2: Update Convex schema

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add `includedInPremium` to academyCourses table**

In `convex/schema.ts`, find the `academyCourses` table definition. Add `includedInPremium` before the closing `})`:

```ts
  academyCourses: defineTable({
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    includedInPremium: v.optional(v.boolean()),
  })
    .index("by_language", ["languageId"])
    .index("by_instructor", ["instructorId"]),
```

- [ ] **Step 2: Add `subscriptions` and `subscriptionOfferings` tables**

At the end of the schema (before the closing `}`), add:

```ts
  subscriptions: defineTable({
    clerkUserId: v.string(),
    revenueCatCustomerId: v.string(),
    productIdentifier: v.string(),
    entitlementId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("billing_issue")
    ),
    planType: v.union(v.literal("monthly"), v.literal("annual")),
    currentPeriodEnd: v.number(),
    revenueCatEventType: v.string(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_revenuecat_customer", ["revenueCatCustomerId"]),

  subscriptionOfferings: defineTable({
    name: v.string(),
    description: v.string(),
    monthlyPriceUsd: v.number(),
    annualPriceUsd: v.number(),
    revenueCatProductIdMonthly: v.string(),
    revenueCatProductIdAnnual: v.string(),
    revenueCatOfferingId: v.string(),
    isActive: v.boolean(),
  }),
```

- [ ] **Step 3: Verify schema compiles**

```bash
npx convex dev --once
```

Expected: schema pushes with no errors.

- [ ] **Step 4: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add subscriptions and subscriptionOfferings to Convex schema"
```

---

### Task 3: Convex subscriptions functions

**Files:**
- Create: `convex/subscriptions.ts`

- [ ] **Step 1: Create file**

Create `convex/subscriptions.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called from the RC webhook handler. Upserts subscription state for a user.
 * Using regular mutation (not internalMutation) so it's callable from
 * the Next.js webhook route via ConvexHttpClient.
 */
export const upsertSubscription = mutation({
  args: {
    clerkUserId: v.string(),
    revenueCatCustomerId: v.string(),
    productIdentifier: v.string(),
    entitlementId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("billing_issue")
    ),
    planType: v.union(v.literal("monthly"), v.literal("annual")),
    currentPeriodEnd: v.number(),
    revenueCatEventType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        revenueCatCustomerId: args.revenueCatCustomerId,
        productIdentifier: args.productIdentifier,
        entitlementId: args.entitlementId,
        status: args.status,
        planType: args.planType,
        currentPeriodEnd: args.currentPeriodEnd,
        revenueCatEventType: args.revenueCatEventType,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", args);
  },
});

/**
 * Returns the subscription record for the authenticated user.
 * Used on the account/subscription page.
 */
export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

/**
 * Admin: list all active subscribers.
 */
export const listActiveSubscribers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(200);
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add convex/subscriptions.ts
git commit -m "feat: add Convex subscription queries and mutations"
```

---

### Task 4: Convex subscriptionOfferings functions

**Files:**
- Create: `convex/subscriptionOfferings.ts`

- [ ] **Step 1: Create file**

Create `convex/subscriptionOfferings.ts`:

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listOfferings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptionOfferings").collect();
  },
});

export const getOffering = query({
  args: { id: v.id("subscriptionOfferings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createOffering = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    monthlyPriceUsd: v.number(),
    annualPriceUsd: v.number(),
    revenueCatProductIdMonthly: v.string(),
    revenueCatProductIdAnnual: v.string(),
    revenueCatOfferingId: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptionOfferings", args);
  },
});

export const updateOffering = mutation({
  args: {
    id: v.id("subscriptionOfferings"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    monthlyPriceUsd: v.optional(v.number()),
    annualPriceUsd: v.optional(v.number()),
    revenueCatProductIdMonthly: v.optional(v.string()),
    revenueCatProductIdAnnual: v.optional(v.string()),
    revenueCatOfferingId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once
```

Expected: no errors.

- [ ] **Step 3: Seed initial offering via Convex dashboard**

Go to https://dashboard.convex.dev → your project → Functions → run `subscriptionOfferings:createOffering` with this payload (replace RC product IDs with actual IDs from your RevenueCat dashboard → Products):

```json
{
  "name": "Premium",
  "description": "Acceso a cursos exclusivos y contenido premium.",
  "monthlyPriceUsd": 50,
  "annualPriceUsd": 500,
  "revenueCatProductIdMonthly": "premium_monthly",
  "revenueCatProductIdAnnual": "premium_annual",
  "revenueCatOfferingId": "premium",
  "isActive": true
}
```

- [ ] **Step 4: Commit**

```bash
git add convex/subscriptionOfferings.ts
git commit -m "feat: add Convex subscriptionOfferings queries and mutations"
```

---

### Task 5: Update hasPurchasedCourse for premium access

**Files:**
- Modify: `convex/coursePurchases.ts`

- [ ] **Step 1: Replace hasPurchasedCourse**

In `convex/coursePurchases.ts`, replace the entire `hasPurchasedCourse` export (lines 94–132) with:

```ts
/**
 * Returns true if the authenticated user has access to this course.
 * Access = individual purchase OR (active premium sub AND course.includedInPremium).
 */
export const hasPurchasedCourse = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Check individual purchase by userId
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (user) {
      const byUser = await ctx.db
        .query("coursePurchases")
        .withIndex("by_user_and_course", (q) =>
          q.eq("userId", user._id).eq("courseId", args.courseId)
        )
        .first();
      if (byUser?.status === "completed") return true;
    }

    // Check by email (guest purchases not yet linked to account)
    const email = identity.email;
    if (email) {
      const byEmail = await ctx.db
        .query("coursePurchases")
        .withIndex("by_email_and_course", (q) =>
          q.eq("email", email).eq("courseId", args.courseId)
        )
        .first();
      if (byEmail?.status === "completed") return true;
    }

    // Check premium subscription + course flag
    const course = await ctx.db.get(args.courseId);
    if (course?.includedInPremium) {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
        .unique();
      if (subscription?.status === "active") return true;
    }

    return false;
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add convex/coursePurchases.ts
git commit -m "feat: grant premium subscribers access to includedInPremium courses"
```

---

### Task 6: Add Convex mutations for course premium toggle

**Files:**
- Modify: `convex/academyCourses.ts`

- [ ] **Step 1: Add setIncludedInPremium mutation**

At the bottom of `convex/academyCourses.ts`, add:

```ts
export const setIncludedInPremium = mutation({
  args: {
    courseId: v.id("academyCourses"),
    includedInPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, {
      includedInPremium: args.includedInPremium,
    });
  },
});

export const listAllCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("academyCourses").collect();
  },
});
```

- [ ] **Step 2: Verify**

```bash
npx convex dev --once
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add convex/academyCourses.ts
git commit -m "feat: add setIncludedInPremium mutation and listAllCourses query"
```

---

### Task 7: RevenueCat API client

**Files:**
- Create: `src/lib/revenuecat.ts`

- [ ] **Step 1: Create file**

Create `src/lib/revenuecat.ts`:

```ts
const RC_BASE_URL = "https://api.revenuecat.com/v1";

function rcHeaders() {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) throw new Error("Missing REVENUECAT_SECRET_KEY");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

/**
 * Creates a RevenueCat Web Billing checkout session.
 * Returns the hosted checkout URL to redirect the user to.
 *
 * Verify the exact endpoint at:
 * https://www.revenuecat.com/docs/web/web-billing/integration-guide
 *
 * The appUserId MUST be the Clerk user ID so the webhook can
 * map back to the correct Clerk user.
 */
export async function createWebBillingCheckout({
  appUserId,
  productId,
  successUrl,
  cancelUrl,
}: {
  appUserId: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const res = await fetch(`${RC_BASE_URL}/web_billing/checkouts`, {
    method: "POST",
    headers: rcHeaders(),
    body: JSON.stringify({
      app_user_id: appUserId,
      product_id: productId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RC checkout creation failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { checkout_url: string };
  return data.checkout_url;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/revenuecat.ts
git commit -m "feat: add RevenueCat API client"
```

---

### Task 8: RevenueCat webhook handler

**Files:**
- Create: `src/app/api/webhooks/revenuecat/route.ts`

- [ ] **Step 1: Create the handler**

Create `src/app/api/webhooks/revenuecat/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import { clerkClient } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const ACTIVATE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
]);

const DEACTIVATE_EVENTS = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
]);

type RCEvent = {
  type: string;
  app_user_id: string;
  product_id: string;
  expiration_at_ms?: number;
  entitlement_ids?: string[];
};

export async function POST(req: NextRequest) {
  // RevenueCat sends the shared secret in the Authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let event: RCEvent;
  try {
    const payload = (await req.json()) as { event: RCEvent };
    event = payload.event;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const { type: eventType, app_user_id: clerkUserId, product_id } = event;

  console.log(`[rc-webhook] type=${eventType} user=${clerkUserId} product=${product_id}`);

  // Ignore event types we don't handle
  if (!ACTIVATE_EVENTS.has(eventType) && !DEACTIVATE_EVENTS.has(eventType)) {
    return NextResponse.json({ received: true });
  }

  const isActive = ACTIVATE_EVENTS.has(eventType);

  const status = isActive
    ? "active"
    : eventType === "CANCELLATION"
      ? "cancelled"
      : eventType === "BILLING_ISSUE"
        ? "billing_issue"
        : "expired";

  const planType: "monthly" | "annual" = product_id.includes("annual")
    ? "annual"
    : "monthly";

  const currentPeriodEnd = event.expiration_at_ms
    ? Math.floor(event.expiration_at_ms / 1000)
    : 0;

  const entitlementId = event.entitlement_ids?.[0] ?? "premium";

  try {
    await convex.mutation(api.subscriptions.upsertSubscription, {
      clerkUserId,
      revenueCatCustomerId: clerkUserId,
      productIdentifier: product_id,
      entitlementId,
      status,
      planType,
      currentPeriodEnd,
      revenueCatEventType: eventType,
    });

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { isPremium: isActive },
    });

    console.log(`[rc-webhook] done. clerkUserId=${clerkUserId} isPremium=${isActive}`);
  } catch (err) {
    console.error("[rc-webhook] error:", err);
    // Return 500 so RevenueCat will retry
    return new NextResponse("Internal error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Configure webhook in RevenueCat dashboard**

In RevenueCat Dashboard → Project → Integrations → Webhooks:
- Webhook URL: `https://your-domain.com/api/webhooks/revenuecat`
- Authorization header: `Bearer <value of REVENUECAT_WEBHOOK_SECRET>`

- [ ] **Step 3: Test with curl (dev server running)**

```bash
curl -X POST http://localhost:3000/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_webhook_secret_here" \
  -d '{
    "event": {
      "type": "INITIAL_PURCHASE",
      "app_user_id": "user_test_clerk_id",
      "product_id": "premium_monthly",
      "entitlement_ids": ["premium"],
      "expiration_at_ms": 1764547200000
    }
  }'
```

Expected response: `{"received":true}` with status 200.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/revenuecat/route.ts
git commit -m "feat: add RevenueCat webhook handler syncing Convex and Clerk"
```

---

### Task 9: Checkout API route

**Files:**
- Create: `src/app/api/revenuecat/checkout/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/revenuecat/checkout/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createWebBillingCheckout } from "@/lib/revenuecat";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planType, locale } = (await req.json()) as {
    planType: "monthly" | "annual";
    locale: string;
  };

  if (planType !== "monthly" && planType !== "annual") {
    return NextResponse.json({ error: "Invalid planType" }, { status: 400 });
  }

  const offerings = await convex.query(api.subscriptionOfferings.listOfferings);
  const activeOffering = offerings.find((o) => o.isActive);

  if (!activeOffering) {
    return NextResponse.json(
      { error: "No active subscription offering found" },
      { status: 404 }
    );
  }

  const productId =
    planType === "monthly"
      ? activeOffering.revenueCatProductIdMonthly
      : activeOffering.revenueCatProductIdAnnual;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  try {
    const checkoutUrl = await createWebBillingCheckout({
      appUserId: userId,
      productId,
      successUrl: `${baseUrl}/${locale}/account/subscription?success=true`,
      cancelUrl: `${baseUrl}/${locale}/account/subscription`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[rc/checkout POST]", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test unauthenticated returns 401**

```bash
curl -X POST http://localhost:3000/api/revenuecat/checkout \
  -H "Content-Type: application/json" \
  -d '{"planType":"monthly","locale":"es"}'
```

Expected: `{"error":"Unauthorized"}` with status 401.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/revenuecat/checkout/route.ts
git commit -m "feat: add RevenueCat checkout API route"
```

---

### Task 10: Crown badge in user account popover

**Files:**
- Modify: `src/components/popovers/user-account-popover.tsx`

- [ ] **Step 1: Add Crown to imports**

In `user-account-popover.tsx`, update the lucide-react import to include `Crown`:

```ts
import {
  User,
  Heart,
  Settings,
  LogOut,
  Bell,
  Shield,
  CreditCard,
  ShieldCheck,
  FlaskConical,
  Crown,
} from "lucide-react";
```

- [ ] **Step 2: Read isPremium from Clerk**

After the line `const email = user?.emailAddresses?.[0]?.emailAddress || 'test@test.com';`, add:

```ts
const isPremium = user?.publicMetadata?.isPremium === true;
```

- [ ] **Step 3: Add badge to user info section**

Find this block inside `<PopoverContent>`:

```tsx
<div className="flex-1">
  <p className="text-sm font-medium">{displayName}</p>
  <p className="text-xs text-muted-foreground">{email}</p>
</div>
```

Replace with:

```tsx
<div className="flex-1">
  <div className="flex items-center gap-2">
    <p className="text-sm font-medium">{displayName}</p>
    {isPremium && (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
        <Crown className="size-3" />
        Premium
      </span>
    )}
  </div>
  <p className="text-xs text-muted-foreground">{email}</p>
</div>
```

- [ ] **Step 4: Verify**

Start dev server. Log in — no crown for non-premium user. To test the badge: temporarily hardcode `const isPremium = true;`, confirm crown shows, revert.

- [ ] **Step 5: Commit**

```bash
git add src/components/popovers/user-account-popover.tsx
git commit -m "feat: add Premium crown badge to user account popover"
```

---

### Task 11: Account subscription page

**Files:**
- Modify: `src/app/[locale]/account/subscription/page.tsx`

- [ ] **Step 1: Replace placeholder with full page**

Replace the entire content of `src/app/[locale]/account/subscription/page.tsx` with:

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "#convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Crown, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionPage() {
  const { user } = useUser();
  const subscription = useQuery(api.subscriptions.getMySubscription);
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const locale = params.locale as string;

  const isPremium = user?.publicMetadata?.isPremium === true;
  const activeOffering = offerings?.find((o) => o.isActive);
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()
    : null;

  async function handleSubscribe(planType: "monthly" | "annual") {
    setLoading(true);
    try {
      const res = await fetch("/api/revenuecat/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, locale }),
      });
      const data = (await res.json()) as { checkoutUrl?: string; error?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (isPremium && subscription) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="size-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">Plan Premium activo</h1>
            <p className="text-muted-foreground">Tienes acceso a todos los cursos Premium</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de tu suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <Badge variant="secondary">
                {subscription.planType === "monthly" ? "Mensual" : "Anual"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge className="bg-green-100 text-green-700">Activo</Badge>
            </div>
            {renewalDate && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Próxima renovación
                </span>
                <span className="text-sm font-medium">{renewalDate}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" asChild>
          <a
            href="https://billing.revenuecat.com/manage"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4 mr-2" />
            Gestionar suscripción
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscripción Premium</h1>
        <p className="text-muted-foreground mt-1">
          Accede a cursos exclusivos y contenido premium
        </p>
      </div>

      {activeOffering && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="size-5 text-amber-500" />
                Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                ${activeOffering.monthlyPriceUsd}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
              <p className="text-sm text-muted-foreground">{activeOffering.description}</p>
              <Button
                className="w-full"
                onClick={() => void handleSubscribe("monthly")}
                disabled={loading}
              >
                <CreditCard className="size-4 mr-2" />
                Suscribirse mensual
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="size-5 text-amber-500" />
                Anual
                <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                  Ahorra ${activeOffering.monthlyPriceUsd * 12 - activeOffering.annualPriceUsd}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                ${activeOffering.annualPriceUsd}
                <span className="text-base font-normal text-muted-foreground">/año</span>
              </p>
              <p className="text-sm text-muted-foreground">{activeOffering.description}</p>
              <Button
                className="w-full"
                onClick={() => void handleSubscribe("annual")}
                disabled={loading}
              >
                <CreditCard className="size-4 mr-2" />
                Suscribirse anual
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify page renders**

Navigate to `/account/subscription` — two plan cards show with correct prices from Convex.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/account/subscription/page.tsx"
git commit -m "feat: implement account subscription page with RC Web Billing checkout"
```

---

### Task 12: Admin subscriptions page

**Files:**
- Create: `src/app/[locale]/admin/subscriptions/page.tsx`

- [ ] **Step 1: Create directory and page**

```bash
mkdir -p "src/app/[locale]/admin/subscriptions"
```

Create `src/app/[locale]/admin/subscriptions/page.tsx`:

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "#convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Crown } from "lucide-react";
import type { Id } from "#convex/_generated/dataModel";

type Offering = {
  _id: Id<"subscriptionOfferings">;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  revenueCatProductIdMonthly: string;
  revenueCatProductIdAnnual: string;
  revenueCatOfferingId: string;
  isActive: boolean;
};

export default function AdminSubscriptionsPage() {
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const activeSubscribers = useQuery(api.subscriptions.listActiveSubscribers);
  const updateOffering = useMutation(api.subscriptionOfferings.updateOffering);

  const [editingId, setEditingId] = useState<Id<"subscriptionOfferings"> | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    monthlyPriceUsd: "",
    annualPriceUsd: "",
    revenueCatProductIdMonthly: "",
    revenueCatProductIdAnnual: "",
    revenueCatOfferingId: "",
  });

  function startEdit(offering: Offering) {
    setEditingId(offering._id);
    setForm({
      name: offering.name,
      description: offering.description,
      monthlyPriceUsd: String(offering.monthlyPriceUsd),
      annualPriceUsd: String(offering.annualPriceUsd),
      revenueCatProductIdMonthly: offering.revenueCatProductIdMonthly,
      revenueCatProductIdAnnual: offering.revenueCatProductIdAnnual,
      revenueCatOfferingId: offering.revenueCatOfferingId,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateOffering({
      id: editingId,
      name: form.name,
      description: form.description,
      monthlyPriceUsd: Number(form.monthlyPriceUsd),
      annualPriceUsd: Number(form.annualPriceUsd),
      revenueCatProductIdMonthly: form.revenueCatProductIdMonthly,
      revenueCatProductIdAnnual: form.revenueCatProductIdAnnual,
      revenueCatOfferingId: form.revenueCatOfferingId,
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Crown className="size-6 text-amber-500" />
        <h1 className="text-2xl font-bold">Suscripciones</h1>
      </div>

      {/* Active subscribers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Suscriptores activos ({activeSubscribers?.length ?? "—"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeSubscribers?.slice(0, 20).map((sub) => (
              <div key={sub._id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <span className="font-mono text-muted-foreground text-xs">{sub.clerkUserId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{sub.planType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    hasta {new Date(sub.currentPeriodEnd * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {!activeSubscribers?.length && (
              <p className="text-sm text-muted-foreground">Sin suscriptores activos aún.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offerings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ofertas de suscripción</h2>
        {offerings?.map((offering) => (
          <Card key={offering._id}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {offering.name}
                <Badge variant={offering.isActive ? "default" : "secondary"}>
                  {offering.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://app.revenuecat.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3 mr-1" />
                    RevenueCat
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(offering as Offering)}
                >
                  Editar
                </Button>
              </div>
            </CardHeader>

            {editingId === offering._id ? (
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Precio mensual (USD)</Label>
                      <Input
                        type="number"
                        value={form.monthlyPriceUsd}
                        onChange={(e) => setForm({ ...form, monthlyPriceUsd: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Precio anual (USD)</Label>
                      <Input
                        type="number"
                        value={form.annualPriceUsd}
                        onChange={(e) => setForm({ ...form, annualPriceUsd: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>RC Product ID (mensual)</Label>
                    <Input
                      value={form.revenueCatProductIdMonthly}
                      onChange={(e) => setForm({ ...form, revenueCatProductIdMonthly: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>RC Product ID (anual)</Label>
                    <Input
                      value={form.revenueCatProductIdAnnual}
                      onChange={(e) => setForm({ ...form, revenueCatProductIdAnnual: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>RC Offering ID</Label>
                    <Input
                      value={form.revenueCatOfferingId}
                      onChange={(e) => setForm({ ...form, revenueCatOfferingId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => void saveEdit()}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para cambiar precios reales, hazlo en{" "}
                  <a href="https://app.revenuecat.com" target="_blank" rel="noopener noreferrer" className="underline">RevenueCat</a>
                  {" "}y{" "}
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">Stripe</a>.
                  Actualiza los IDs aquí si los cambias allá.
                </p>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{offering.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mensual: </span>
                    <span className="font-medium">${offering.monthlyPriceUsd}/mes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anual: </span>
                    <span className="font-medium">${offering.annualPriceUsd}/año</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RC ID mensual: </span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{offering.revenueCatProductIdMonthly}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RC ID anual: </span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{offering.revenueCatProductIdAnnual}</code>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Navigate to `/admin/subscriptions` — see the offering card and subscriber list.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/admin/subscriptions/page.tsx"
git commit -m "feat: add admin subscriptions management page"
```

---

### Task 13: Admin academy courses page with premium toggle

**Files:**
- Create: `src/app/[locale]/admin/academy/courses/page.tsx`

- [ ] **Step 1: Check if Switch component is installed**

```bash
ls src/components/ui/switch.tsx 2>/dev/null && echo "exists" || echo "missing"
```

If missing, install it:

```bash
npx shadcn@latest add switch
```

- [ ] **Step 2: Create the courses admin page**

Create `src/app/[locale]/admin/academy/courses/page.tsx`:

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "#convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminAcademyCoursesPage() {
  const courses = useQuery(api.academyCourses.listAllCourses);
  const setIncludedInPremium = useMutation(api.academyCourses.setIncludedInPremium);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academy — Cursos</h1>

      <div className="space-y-3">
        {courses?.map((course) => (
          <div
            key={course._id}
            className="flex items-center justify-between p-4 border rounded-lg bg-card"
          >
            <div className="space-y-1">
              <p className="font-medium">{course.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {(course.price ?? 0) === 0
                    ? "Gratuito"
                    : `$${(course.price ?? 0) / 100}`}
                </Badge>
                {course.includedInPremium && (
                  <Badge className="text-xs bg-amber-100 text-amber-700">
                    <Crown className="size-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor={`premium-${course._id}`} className="text-sm text-muted-foreground">
                Incluido en Premium
              </Label>
              <Switch
                id={`premium-${course._id}`}
                checked={course.includedInPremium ?? false}
                onCheckedChange={(checked) =>
                  void setIncludedInPremium({
                    courseId: course._id,
                    includedInPremium: checked,
                  })
                }
              />
            </div>
          </div>
        ))}
        {!courses?.length && (
          <p className="text-muted-foreground text-sm">Sin cursos creados aún.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify toggle**

Navigate to `/admin/academy/courses`, toggle a course's Premium switch. Check Convex dashboard that `includedInPremium` updates on the record.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/admin/academy/courses/page.tsx"
git commit -m "feat: add admin academy courses page with includedInPremium toggle"
```

---

### Task 14: Add Subscriptions to admin sidebar

**Files:**
- Modify: `src/components/layout/sidebars/admin-app-sidebar.tsx`

- [ ] **Step 1: Add Crown import and Subscriptions item**

In `admin-app-sidebar.tsx`, update the lucide-react import to include `Crown`:

```ts
import { usePathname } from "next/navigation";
import { ChevronDown, Clapperboard, Crown, GraduationCap, Image, User2 } from "lucide-react";
```

Add a Subscriptions entry to the `items` array (after Shorts):

```ts
const items = [
  {
    title: "Users",
    icon: User2,
    url: "/admin/users",
  },
  {
    title: "Images",
    icon: Image,
    url: "/admin/images/app",
  },
  {
    title: "Shorts",
    icon: Clapperboard,
    url: "/admin/shorts",
  },
  {
    title: "Suscripciones",
    icon: Crown,
    url: "/admin/subscriptions",
  },
];
```

- [ ] **Step 2: Verify sidebar**

Open the admin panel — "Suscripciones" should appear in the sidebar with a Crown icon.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebars/admin-app-sidebar.tsx
git commit -m "feat: add Suscripciones link to admin sidebar"
```

---

## Self-Review Checklist

- [x] **Schema**: subscriptions, subscriptionOfferings, includedInPremium — covered in Task 2
- [x] **Webhook handler**: signature check, activate/deactivate events, Convex + Clerk update — Task 8
- [x] **Checkout API**: auth check, productId from offering, RC Web Billing URL — Task 9
- [x] **Course gating**: premium check in hasPurchasedCourse — Task 5
- [x] **Admin dashboard**: offerings list, edit form, active subscribers — Task 12
- [x] **Crown badge**: isPremium from publicMetadata, Crown icon — Task 10
- [x] **Account subscription page**: active plan view + subscribe cards — Task 11
- [x] **Course premium toggle**: admin academy courses page — Task 13
- [x] **Admin sidebar**: Suscripciones nav item — Task 14
- [x] **RC appUserId = Clerk userId**: set in checkout route (Task 9), read back in webhook handler (Task 8)
- [x] **Type names consistent**: `upsertSubscription` used in both Task 3 and Task 8; `listOfferings` used in Tasks 4 and 9
