# Stripe Lifetime Purchase Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Stripe Checkout (hosted) for one-time course purchases: Convex purchase tracking, admin product management, guest checkout, and account linking by email.

**Architecture:** Next.js API routes handle all Stripe API calls using the Stripe Node.js SDK. `ConvexHttpClient` writes purchase data back to Convex from API routes. Free course enrollment goes directly via Convex mutation from the browser. Account linking is inlined into the existing `upsertFromClerk` mutation.

**Tech Stack:** `stripe` npm package, `ConvexHttpClient` from `convex/browser`, Next.js 15 App Router route handlers, Clerk auth, Convex v1.34

---

## File Map

### New files
- `src/lib/stripe.ts` — Stripe client singleton (server-only)
- `convex/coursePurchases.ts` — purchase mutations and queries
- `src/app/api/stripe/products/route.ts` — POST create / PATCH update Stripe Product + Price
- `src/app/api/stripe/checkout/route.ts` — POST create Checkout Session
- `src/app/api/stripe/webhook/route.ts` — POST handle `checkout.session.completed`
- `src/app/api/stripe/session/route.ts` — GET verify session status for success page
- `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/success/page.tsx` — post-payment success page

### Modified files
- `convex/schema.ts` — add price/stripe fields to `academyCourses`; add `coursePurchases` table
- `convex/academyCourses.ts` — add price/currency to createCourse + updateCourse; add `updateStripeIds`, `updateStripePriceId` mutations
- `convex/users.ts` — inline guest-purchase linking in `upsertFromClerk` (user.created)
- `src/lib/schemas/academy-schemas.ts` — add `price` and `currency` to `createCourseSchema`
- `src/app/[locale]/admin/academy/courses/new/page.tsx` — price/currency fields + POST /api/stripe/products call
- `src/app/[locale]/admin/academy/courses/[id]/edit/page.tsx` — price/currency fields + price-change logic
- `src/app/[locale]/admin/academy/courses/[id]/sections/page.tsx` — price badge + "Ver en Stripe" button
- `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/page.tsx` — dynamic price, 4-state buy button

---

## Task 1: Branch + install Stripe + env vars

**Files:**
- Create: `.env.local` (local only, not committed)

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feature/stripe-integration
```

- [ ] **Step 2: Install Stripe SDK**

```bash
npm install stripe
```

Expected: `stripe` appears in `package.json` dependencies.

- [ ] **Step 3: Add env vars to `.env.local`**

Open `.env.local` and add:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get keys from: Stripe Dashboard → Developers → API keys (test mode).
Webhook secret: generated in Task 9 when running Stripe CLI.

- [ ] **Step 4: Commit setup**

```bash
git add package.json package-lock.json
git commit -m "feat: install stripe SDK"
```

---

## Task 2: Convex schema — add price fields and coursePurchases table

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Read current schema**

Open `convex/schema.ts`. It currently defines `academyCourses` without price/stripe fields.

- [ ] **Step 2: Update schema**

Replace the `academyCourses` table definition and add the new `coursePurchases` table. The full updated `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  youtubeShorts: defineTable({
    videoId: v.string(),
    title: v.string(),
    section: v.optional(v.string()),
    page: v.optional(v.string()),
    order: v.optional(v.number()),
  })
    .index("bySection", ["section"])
    .index("bySectionAndOrder", ["section", "order"])
    .index("byPage", ["page"])
    .index("byPageAndOrder", ["page", "order"]),

  shortSections: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  courseLanguages: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  courseInstructors: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  academyCourses: defineTable({
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
    // Pricing (stored in cents, e.g. 4900 = €49.00; 0 = free)
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    // Stripe
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
  })
    .index("by_language", ["languageId"])
    .index("by_instructor", ["instructorId"]),

  academyCourseSections: defineTable({
    courseId: v.id("academyCourses"),
    name: v.string(),
    order: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_and_order", ["courseId", "order"]),

  academyCourseSectionElements: defineTable({
    sectionId: v.id("academyCourseSections"),
    type: v.union(
      v.literal("video"),
      v.literal("quiz"),
      v.literal("resource"),
      v.literal("note")
    ),
    title: v.string(),
    order: v.optional(v.number()),
    durationLabel: v.optional(v.string()),
    isPreview: v.optional(v.boolean()),
    contentUrl: v.optional(v.string()),
    contentText: v.optional(v.string()),
  })
    .index("by_section", ["sectionId"])
    .index("by_section_and_order", ["sectionId", "order"]),

  shortReactions: defineTable({
    tokenIdentifier: v.string(),
    videoId: v.string(),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  })
    .index("by_token_and_video", ["tokenIdentifier", "videoId"])
    .index("by_video", ["videoId"]),

  shortComments: defineTable({
    videoId: v.string(),
    tokenIdentifier: v.string(),
    text: v.string(),
    authorName: v.optional(v.string()),
    authorImage: v.optional(v.string()),
    parentId: v.optional(v.id("shortComments")),
  })
    .index("by_video", ["videoId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_parent", ["parentId"]),

  users: defineTable({
    externalId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  })
    .index("byExternalId", ["externalId"])
    .index("byEmail", ["email"])
    .index("byUsername", ["username"]),

  coursePurchases: defineTable({
    courseId: v.id("academyCourses"),
    userId: v.optional(v.id("users")),
    email: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded")
    ),
    amountTotal: v.number(),
    currency: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_course", ["courseId"])
    .index("by_session", ["stripeSessionId"])
    .index("by_user", ["userId"])
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_email_and_course", ["email", "courseId"]),
});
```

- [ ] **Step 3: Verify Convex picks up the schema**

```bash
npx convex dev
```

Expected: Convex logs show schema updated with no errors.

- [ ] **Step 4: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add price/stripe fields to academyCourses and coursePurchases table"
```

---

## Task 3: Create `convex/coursePurchases.ts`

**Files:**
- Create: `convex/coursePurchases.ts`

- [ ] **Step 1: Read Convex guidelines**

Open `convex/_generated/ai/guidelines.md` — note: use `internalMutation` for private functions, always include arg validators.

- [ ] **Step 2: Create the file**

Create `convex/coursePurchases.ts`:

```typescript
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Called from POST /api/stripe/webhook after signature verification.
 * Idempotent — safe to call multiple times with same session.
 */
export const completePurchase = mutation({
  args: {
    courseId: v.id("academyCourses"),
    email: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    amountTotal: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if already processed
    const existing = await ctx.db
      .query("coursePurchases")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
    if (existing) return existing._id;

    // Link to user account if one exists with this email
    const user = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .unique();

    return await ctx.db.insert("coursePurchases", {
      courseId: args.courseId,
      userId: user?._id,
      email: args.email,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "completed",
      amountTotal: args.amountTotal,
      currency: args.currency,
    });
  },
});

/**
 * Called directly from the browser when enrolling in a free course.
 */
export const enrollForFree = mutation({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Curso no encontrado.");
    if ((course.price ?? 0) !== 0) throw new Error("Este curso no es gratuito.");

    const identity = await ctx.auth.getUserIdentity();

    const user = identity
      ? await ctx.db
          .query("users")
          .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
          .unique()
      : null;

    const email = identity?.email ?? "";

    // Idempotency: skip if already enrolled
    if (user) {
      const existing = await ctx.db
        .query("coursePurchases")
        .withIndex("by_user_and_course", (q) =>
          q.eq("userId", user._id).eq("courseId", args.courseId)
        )
        .unique();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("coursePurchases", {
      courseId: args.courseId,
      userId: user?._id,
      email,
      stripeSessionId: `free_${args.courseId}_${Date.now()}`,
      status: "completed",
      amountTotal: 0,
      currency: "eur",
    });
  },
});

/**
 * Returns true if the authenticated user has a completed purchase for this course.
 */
export const hasPurchasedCourse = query({
  args: {
    courseId: v.id("academyCourses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Check by userId
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

    // Check by email (covers guest purchases not yet linked)
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

    return false;
  },
});
```

- [ ] **Step 3: Verify Convex compiles**

```bash
npx convex dev
```

Expected: No TypeScript errors in convex output.

- [ ] **Step 4: Commit**

```bash
git add convex/coursePurchases.ts
git commit -m "feat: add coursePurchases convex module (completePurchase, enrollForFree, hasPurchasedCourse)"
```

---

## Task 4: Update `convex/academyCourses.ts` — price fields + Stripe ID mutations

**Files:**
- Modify: `convex/academyCourses.ts`

- [ ] **Step 1: Add price/currency to `createCourse`**

In `convex/academyCourses.ts`, find the `createCourse` mutation. Update its `args` and `handler`:

```typescript
export const createCourse = mutation({
  args: {
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [language, instructor] = await Promise.all([
      ctx.db.get(args.languageId),
      ctx.db.get(args.instructorId),
    ]);

    if (!language) throw new Error("Idioma inválido.");
    if (!instructor) throw new Error("Instructor inválido.");

    return await ctx.db.insert("academyCourses", {
      name: args.name.trim(),
      youtubeUrl: args.youtubeUrl.trim(),
      youtubeVideoId: args.youtubeVideoId.trim(),
      languageId: args.languageId,
      instructorId: args.instructorId,
      description: args.description.trim(),
      price: args.price,
      currency: args.currency,
    });
  },
});
```

- [ ] **Step 2: Add price/currency to `updateCourse`**

Find the `updateCourse` mutation and update it:

```typescript
export const updateCourse = mutation({
  args: {
    courseId: v.id("academyCourses"),
    name: v.string(),
    youtubeUrl: v.string(),
    youtubeVideoId: v.string(),
    languageId: v.id("courseLanguages"),
    instructorId: v.id("courseInstructors"),
    description: v.string(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [course, language, instructor] = await Promise.all([
      ctx.db.get(args.courseId),
      ctx.db.get(args.languageId),
      ctx.db.get(args.instructorId),
    ]);

    if (!course) throw new Error("Curso inválido.");
    if (!language) throw new Error("Idioma inválido.");
    if (!instructor) throw new Error("Instructor inválido.");

    await ctx.db.patch(args.courseId, {
      name: args.name.trim(),
      youtubeUrl: args.youtubeUrl.trim(),
      youtubeVideoId: args.youtubeVideoId.trim(),
      languageId: args.languageId,
      instructorId: args.instructorId,
      description: args.description.trim(),
      price: args.price,
      currency: args.currency,
    });

    return args.courseId;
  },
});
```

- [ ] **Step 3: Add Stripe ID mutations**

Append these two mutations at the end of `convex/academyCourses.ts`:

```typescript
/**
 * Called from POST /api/stripe/products after creating a new Stripe Product + Price.
 */
export const updateStripeIds = mutation({
  args: {
    courseId: v.id("academyCourses"),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Curso no encontrado.");
    await ctx.db.patch(args.courseId, {
      stripeProductId: args.stripeProductId,
      stripePriceId: args.stripePriceId,
    });
  },
});

/**
 * Called from PATCH /api/stripe/products after archiving old Price + creating new one.
 */
export const updateStripePriceId = mutation({
  args: {
    courseId: v.id("academyCourses"),
    stripePriceId: v.string(),
    price: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Curso no encontrado.");
    await ctx.db.patch(args.courseId, {
      stripePriceId: args.stripePriceId,
      price: args.price,
      currency: args.currency,
    });
  },
});
```

- [ ] **Step 4: Verify Convex compiles**

```bash
npx convex dev
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add convex/academyCourses.ts
git commit -m "feat: add price/currency to course mutations and Stripe ID update mutations"
```

---

## Task 5: Inline account linking in `convex/users.ts`

**Files:**
- Modify: `convex/users.ts`

- [ ] **Step 1: Update `upsertFromClerk`**

When a new user is created (not updated), automatically link any guest `coursePurchases` matching their email. Replace the current `upsertFromClerk` mutation:

```typescript
export const upsertFromClerk = internalMutation({
  args: {
    data: v.any(),
  },
  async handler(ctx, { data }) {
    const email = (
      data.email_addresses as Array<{ email_address: string }>
    )[0]?.email_address as string | undefined;

    const userAttributes = {
      externalId: data.id as string,
      email: email ?? "",
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      username: data.username ?? undefined,
      imageUrl: data.image_url ?? undefined,
    };

    const existing = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", data.id))
      .unique();

    if (existing === null) {
      const userId = await ctx.db.insert("users", userAttributes);

      // Link guest purchases to this new account
      if (email) {
        const guestPurchases = await ctx.db
          .query("coursePurchases")
          .withIndex("by_email", (q) => q.eq("email", email))
          .collect();

        for (const purchase of guestPurchases) {
          if (purchase.userId === undefined) {
            await ctx.db.patch(purchase._id, { userId });
          }
        }
      }
    } else {
      await ctx.db.patch(existing._id, userAttributes);
    }
  },
});
```

- [ ] **Step 2: Verify Convex compiles**

```bash
npx convex dev
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "feat: link guest course purchases to user account on Clerk signup"
```

---

## Task 6: Create `src/lib/stripe.ts`

**Files:**
- Create: `src/lib/stripe.ts`

- [ ] **Step 1: Create Stripe singleton**

Create `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

This file is server-only — never import it in client components.

- [ ] **Step 2: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat: add Stripe singleton"
```

---

## Task 7: API route — POST/PATCH `/api/stripe/products`

**Files:**
- Create: `src/app/api/stripe/products/route.ts`

This route is called from the admin when creating or updating a course with a paid price.

- [ ] **Step 1: Create the route**

Create `src/app/api/stripe/products/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST: Create a new Stripe Product + Price and save IDs to Convex.
 * Called when admin creates a new paid course or turns a free course into paid.
 *
 * Body: { courseId: string, name: string, price: number (cents), currency: string }
 */
export async function POST(req: NextRequest) {
  const { courseId, name, price, currency } = (await req.json()) as {
    courseId: string;
    name: string;
    price: number;
    currency: string;
  };

  const product = await stripe.products.create({ name });

  const stripePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(price),
    currency: currency.toLowerCase(),
  });

  await convex.mutation(api.academyCourses.updateStripeIds, {
    courseId: courseId as Id<"academyCourses">,
    stripeProductId: product.id,
    stripePriceId: stripePrice.id,
  });

  return NextResponse.json({ stripeProductId: product.id, stripePriceId: stripePrice.id });
}

/**
 * PATCH: Archive existing Stripe Price and create a new one (price update).
 * Stripe does not allow editing a Price — you must create a new one.
 *
 * Body: { courseId: string, stripeProductId: string, newPrice: number (cents), currency: string }
 */
export async function PATCH(req: NextRequest) {
  const { courseId, stripeProductId, newPrice, currency } = (await req.json()) as {
    courseId: string;
    stripeProductId: string;
    newPrice: number;
    currency: string;
  };

  // Archive all active prices on this product
  const activePrices = await stripe.prices.list({ product: stripeProductId, active: true });
  await Promise.all(activePrices.data.map((p) => stripe.prices.update(p.id, { active: false })));

  // Create new price
  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(newPrice),
    currency: currency.toLowerCase(),
  });

  await convex.mutation(api.academyCourses.updateStripePriceId, {
    courseId: courseId as Id<"academyCourses">,
    stripePriceId: stripePrice.id,
    price: Math.round(newPrice),
    currency: currency.toLowerCase(),
  });

  return NextResponse.json({ stripePriceId: stripePrice.id });
}
```

- [ ] **Step 2: Manual verify (after Task 12 is done)**

From the admin create-course form, save a course with price €49 / EUR. Check Stripe Dashboard → Products — a new product should appear.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/stripe/products/route.ts"
git commit -m "feat: add Stripe products API route (POST create, PATCH update price)"
```

---

## Task 8: API route — POST `/api/stripe/checkout`

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/stripe/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST: Create a Stripe Checkout Session and return the session URL.
 * Client redirects to the returned URL.
 *
 * Body: { courseId: string, courseSlug: string, locale: string }
 */
export async function POST(req: NextRequest) {
  const { courseId, courseSlug, locale } = (await req.json()) as {
    courseId: string;
    courseSlug: string;
    locale: string;
  };

  const course = await convex.query(api.academyCourses.getCourseById, {
    courseId: courseId as Id<"academyCourses">,
  });

  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  if (!course.stripePriceId) {
    return NextResponse.json(
      { error: "Este curso no tiene precio configurado en Stripe" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: course.stripePriceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/${locale}/academy/courses/${courseSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/academy/courses/${courseSlug}`,
    metadata: {
      courseId,
      courseSlug,
      locale,
    },
  });

  return NextResponse.json({ sessionUrl: session.url });
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/stripe/checkout/route.ts"
git commit -m "feat: add Stripe checkout session API route"
```

---

## Task 9: API route — POST `/api/stripe/webhook`

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Create the route**

Create `src/app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import type Stripe from "stripe";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId } = session.metadata ?? {};
    const email = session.customer_details?.email ?? "";

    if (courseId && email) {
      await convex.mutation(api.coursePurchases.completePurchase, {
        courseId: courseId as Id<"academyCourses">,
        email,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Get webhook secret from Stripe CLI**

In a new terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret printed in the terminal into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

Restart the Next.js dev server after updating `.env.local`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/stripe/webhook/route.ts"
git commit -m "feat: add Stripe webhook handler (checkout.session.completed)"
```

---

## Task 10: API route — GET `/api/stripe/session`

**Files:**
- Create: `src/app/api/stripe/session/route.ts`

Used by the success page to verify the payment before showing the congratulations UI.

- [ ] **Step 1: Create the route**

Create `src/app/api/stripe/session/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return NextResponse.json({
    status: session.status,
    courseSlug: session.metadata?.courseSlug ?? null,
    locale: session.metadata?.locale ?? null,
    courseId: session.metadata?.courseId ?? null,
    customerEmail: session.customer_details?.email ?? null,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/stripe/session/route.ts"
git commit -m "feat: add Stripe session verification API route"
```

---

## Task 11: Update `src/lib/schemas/academy-schemas.ts` — add price/currency

**Files:**
- Modify: `src/lib/schemas/academy-schemas.ts`

- [ ] **Step 1: Add price and currency to createCourseSchema**

In `src/lib/schemas/academy-schemas.ts`, find `createCourseSchema` and add these two fields:

```typescript
createCourseSchema: z.object({
  name: z.string().trim().min(3, { message: "El nombre del curso debe tener al menos 3 caracteres." }),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, { message: "La URL de YouTube es requerida." })
    .regex(youtubeUrlRegex, { message: "Debe ser una URL válida de YouTube." }),
  languageId: z.string().trim().min(1, { message: "Seleccioná un idioma." }),
  instructorId: z.string().trim().min(1, { message: "Seleccioná un instructor." }),
  description: z.string().trim().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  // New pricing fields
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0, { message: "El precio no puede ser negativo." }).optional()
  ),
  currency: z.string().length(3, { message: "Moneda inválida." }).optional().default("eur"),
}),
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/schemas/academy-schemas.ts
git commit -m "feat: add price/currency fields to academy course schema"
```

---

## Task 12: Admin — create course form with price/currency

**Files:**
- Modify: `src/app/[locale]/admin/academy/courses/new/page.tsx`

- [ ] **Step 1: Add price/currency state and form fields**

In `src/app/[locale]/admin/academy/courses/new/page.tsx`, make these changes:

**1. Update the type:**
```typescript
type CreateCourseType = z.infer<typeof createCourseSchema>;
```
(already inferred, no change needed — just ensure `price` and `currency` are part of it)

**2. Update `defaultValues`:**
```typescript
const form = useForm<CreateCourseType>({
  resolver: zodResolver(createCourseSchema),
  defaultValues: {
    name: "",
    youtubeUrl: "",
    languageId: "",
    instructorId: "",
    description: "",
    price: undefined,
    currency: "eur",
  },
});
```

**3. Update `handleCreateCourse` to call Stripe after saving:**
```typescript
const handleCreateCourse = form.handleSubmit(async (values) => {
  try {
    setError(null);
    setIsSaving(true);

    const videoId = extractYouTubeVideoId(values.youtubeUrl);
    if (!videoId) {
      setError("No pudimos extraer el videoId desde la URL de YouTube.");
      return;
    }

    // Price in cents (Stripe requires integers)
    const priceInCents =
      values.price !== undefined && values.price > 0
        ? Math.round(values.price * 100)
        : 0;

    const courseId = await createCourse({
      name: values.name,
      youtubeUrl: values.youtubeUrl,
      youtubeVideoId: videoId,
      languageId: values.languageId as Id<"courseLanguages">,
      instructorId: values.instructorId as Id<"courseInstructors">,
      description: values.description,
      price: priceInCents > 0 ? priceInCents : 0,
      currency: values.currency ?? "eur",
    });

    // If paid, create Stripe Product + Price
    if (priceInCents > 0 && courseId) {
      const res = await fetch("/api/stripe/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          name: values.name,
          price: priceInCents,
          currency: values.currency ?? "eur",
        }),
      });
      if (!res.ok) {
        setError("Curso guardado pero hubo un error al crear el producto en Stripe. Editá el curso para reintentar.");
      }
    }

    toast.success("Curso agregado.");
    router.push(`/${locale}/admin/academy/courses`);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error al guardar el curso.");
  } finally {
    setIsSaving(false);
  }
});
```

**4. Add the price and currency form fields** (insert after the `description` FormField, before the submit buttons):

```tsx
{/* Price */}
<div className="grid grid-cols-2 gap-3">
  <FormField
    name="price"
    control={form.control}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Precio (dejar vacío = gratis)</FormLabel>
        <FormControl>
          <Input
            {...field}
            type="number"
            min="0"
            step="0.01"
            placeholder="49.00"
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    name="currency"
    control={form.control}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Moneda</FormLabel>
        <Select value={field.value ?? "eur"} onValueChange={field.onChange}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="EUR" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="eur">EUR — Euro</SelectItem>
            <SelectItem value="usd">USD — Dólar</SelectItem>
            <SelectItem value="gbp">GBP — Libra</SelectItem>
            <SelectItem value="ars">ARS — Peso Argentino</SelectItem>
            <SelectItem value="mxn">MXN — Peso Mexicano</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>
```

- [ ] **Step 2: Verify in dev**

1. Run `npm run dev` + `npx convex dev`
2. Go to `/admin/academy/courses/new`
3. Fill form with price `49` and currency `EUR`
4. Submit — course should save and a Stripe product should appear in the Stripe test dashboard

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/admin/academy/courses/new/page.tsx"
git commit -m "feat: add price/currency fields to create course form with Stripe product creation"
```

---

## Task 13: Admin — edit course form with price/currency

**Files:**
- Modify: `src/app/[locale]/admin/academy/courses/[id]/edit/page.tsx`

- [ ] **Step 1: Update default values loading**

In `src/app/[locale]/admin/academy/courses/[id]/edit/page.tsx`, find the `useEffect` that populates the form with existing course data (look for `form.reset(...)` or `form.setValue(...)`). Add price and currency to the reset:

```typescript
// Inside the useEffect that sets form values from existing course:
form.reset({
  name: course.name,
  youtubeUrl: course.youtubeUrl,
  languageId: course.languageId,
  instructorId: course.instructorId,
  description: course.description,
  price: course.price !== undefined ? course.price / 100 : undefined, // cents → major units
  currency: course.currency ?? "eur",
});
```

- [ ] **Step 2: Update form defaultValues**

```typescript
const form = useForm<UpdateCourseType>({
  resolver: zodResolver(createCourseSchema),
  defaultValues: {
    name: "",
    youtubeUrl: "",
    languageId: "",
    instructorId: "",
    description: "",
    price: undefined,
    currency: "eur",
  },
});
```

- [ ] **Step 3: Update `handleUpdateCourse` submit handler**

Find the submit handler (where `updateCourse` mutation is called). Add Stripe logic after saving to Convex:

```typescript
const handleUpdateCourse = form.handleSubmit(async (values) => {
  try {
    setError(null);
    setIsSaving(true);

    const videoId = extractYouTubeVideoId(values.youtubeUrl);
    if (!videoId) {
      setError("No pudimos extraer el videoId desde la URL de YouTube.");
      return;
    }

    const priceInCents =
      values.price !== undefined && values.price > 0
        ? Math.round(values.price * 100)
        : 0;

    await updateCourse({
      courseId,
      name: values.name,
      youtubeUrl: values.youtubeUrl,
      youtubeVideoId: videoId,
      languageId: values.languageId as Id<"courseLanguages">,
      instructorId: values.instructorId as Id<"courseInstructors">,
      description: values.description,
      price: priceInCents,
      currency: values.currency ?? "eur",
    });

    // Handle Stripe price changes
    const oldPriceInCents = course?.price ?? 0;
    const priceChanged = priceInCents !== oldPriceInCents;

    if (priceInCents > 0 && priceChanged) {
      if (course?.stripeProductId) {
        // Update existing Stripe product with new price
        const res = await fetch("/api/stripe/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            stripeProductId: course.stripeProductId,
            newPrice: priceInCents,
            currency: values.currency ?? "eur",
          }),
        });
        if (!res.ok) {
          setError("Curso actualizado pero hubo un error al actualizar el precio en Stripe.");
        }
      } else {
        // Course didn't have a Stripe product yet — create one
        const res = await fetch("/api/stripe/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            name: values.name,
            price: priceInCents,
            currency: values.currency ?? "eur",
          }),
        });
        if (!res.ok) {
          setError("Curso actualizado pero hubo un error al crear el producto en Stripe.");
        }
      }
    }

    toast.success("Curso actualizado.");
    router.push(`/${locale}/admin/academy/courses`);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error al actualizar el curso.");
  } finally {
    setIsSaving(false);
  }
});
```

- [ ] **Step 4: Add price/currency form fields**

Add the same price/currency field block from Task 12 Step 1 to the edit form (after description, before buttons). Identical JSX.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/admin/academy/courses/[id]/edit/page.tsx"
git commit -m "feat: add price/currency to edit course form with Stripe price update logic"
```

---

## Task 14: Admin — sections page: price badge + "Ver en Stripe" button

**Files:**
- Modify: `src/app/[locale]/admin/academy/courses/[id]/sections/page.tsx`

The sections page already fetches `course` via `useQuery(api.academyCourses.getCourseById, { courseId })`. Add price display and Stripe link to the course header area.

- [ ] **Step 1: Add price formatting helper**

At the top of the file (after the existing helper functions), add:

```typescript
function formatPrice(price: number | undefined, currency: string | undefined): string {
  if (!price || price === 0) return "Gratis";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: (currency ?? "eur").toUpperCase(),
  }).format(price / 100);
}
```

- [ ] **Step 2: Add Stripe badge and button to the course header**

Find the section in the JSX where `course.name` is displayed (in the `AdminFormLayout` or wherever the course title appears). Add after the course name or description:

```tsx
{/* Price badge + Stripe link */}
{course && (
  <div className="flex items-center gap-3 mt-2">
    <Badge variant="secondary">
      {formatPrice(course.price, course.currency)}
    </Badge>
    {course.stripeProductId && (
      <a
        href={`https://dashboard.stripe.com/test/products/${course.stripeProductId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button type="button" variant="outline" size="sm">
          Ver en Stripe ↗
        </Button>
      </a>
    )}
  </div>
)}
```

- [ ] **Step 3: Verify in dev**

Go to `/admin/academy/courses/[id]/sections` for a course that has a Stripe product. Confirm the price badge and "Ver en Stripe" button appear. Clicking the button should open the Stripe dashboard product page.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/admin/academy/courses/[id]/sections/page.tsx"
git commit -m "feat: add price badge and Stripe product link to admin course sections page"
```

---

## Task 15: Public course page — dynamic price + 4-state buy button

**Files:**
- Modify: `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/page.tsx`

The course page is large. Make targeted changes only.

- [ ] **Step 1: Add new imports**

At the top of the file, add these imports (alongside existing ones):

```typescript
import { useMutation, useQuery } from "convex/react";
// useMutation is likely already imported — just add api.coursePurchases imports:
// api is already imported
```

- [ ] **Step 2: Remove hardcoded prices**

Find and delete these two lines (around line 90-91):
```typescript
const COURSE_BASE_PRICE = 10.99;
const COURSE_PREVIOUS_PRICE = 49.99;
```

- [ ] **Step 3: Add buy state and handlers inside the main component**

Find the main component function (it starts with `const courseSlug = (params.courseSlug as string) ?? ""`). Add these after the existing query/state declarations:

```typescript
const hasPurchased = useQuery(
  api.coursePurchases.hasPurchasedCourse,
  course ? { courseId: course._id } : "skip"
);
const enrollForFree = useMutation(api.coursePurchases.enrollForFree);
const [isBuying, setIsBuying] = useState(false);
const [isEnrolling, setIsEnrolling] = useState(false);

const formattedPrice = course?.price && course.price > 0
  ? new Intl.NumberFormat("en", {
      style: "currency",
      currency: (course.currency ?? "eur").toUpperCase(),
    }).format(course.price / 100)
  : null;

const handleBuyNow = async () => {
  if (!course) return;
  setIsBuying(true);
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course._id,
        courseSlug,
        locale,
      }),
    });
    if (!res.ok) throw new Error("Error al crear la sesión de pago");
    const { sessionUrl } = await res.json();
    window.location.href = sessionUrl;
  } catch {
    toast.error("Error al procesar el pago. Intentá de nuevo.");
    setIsBuying(false);
  }
};

const handleEnrollFree = async () => {
  if (!course) return;
  setIsEnrolling(true);
  try {
    await enrollForFree({ courseId: course._id });
    toast.success("¡Te inscribiste al curso!");
  } catch {
    toast.error("Error al inscribirte. Intentá de nuevo.");
  } finally {
    setIsEnrolling(false);
  }
};
```

- [ ] **Step 4: Replace buy button in JSX**

Search the JSX for the existing "buy now" or price button (search for `COURSE_BASE_PRICE` or the buy button text). Replace the buy button section with this buy button component:

```tsx
{/* Buy button — 4 states */}
{course === undefined || hasPurchased === undefined ? (
  <Skeleton className="h-11 w-full rounded-md" />
) : hasPurchased ? (
  <Button className="w-full" size="lg">
    Continuar aprendiendo →
  </Button>
) : (course.price ?? 0) === 0 ? (
  <Button
    className="w-full"
    size="lg"
    onClick={handleEnrollFree}
    disabled={isEnrolling}
  >
    {isEnrolling ? "Inscribiendo..." : "Inscribirme gratis"}
  </Button>
) : (
  <Button
    className="w-full"
    size="lg"
    onClick={handleBuyNow}
    disabled={isBuying}
  >
    {isBuying ? "Redirigiendo..." : `Comprar — ${formattedPrice}`}
  </Button>
)}
```

Also, anywhere the old `COURSE_BASE_PRICE` was displayed as a price label, replace it with:
```tsx
{formattedPrice ?? "Gratis"}
```

- [ ] **Step 5: Verify in dev**

1. Open a course page that has `stripePriceId` set
2. Button should show "Comprar — €49.00"
3. Click → should redirect to Stripe Checkout page
4. For a free course (price=0): button shows "Inscribirme gratis"
5. After enrolling: button shows "Continuar aprendiendo →"

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/page.tsx"
git commit -m "feat: dynamic price and 4-state buy button on course page"
```

---

## Task 16: Create success page

**Files:**
- Create: `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/success/page.tsx`

- [ ] **Step 1: Create the success page**

Create `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/success/page.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

type SessionData = {
  status: string;
  courseSlug: string | null;
  locale: string | null;
  courseId: string | null;
  customerEmail: string | null;
};

export default function CourseSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const sessionId = searchParams.get("session_id");
  const courseSlug = params.courseSlug as string;
  const locale = (params.locale as string) ?? "en";

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace(`/${locale}/academy/courses/${courseSlug}`);
      return;
    }

    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data: SessionData) => {
        if (data.status !== "complete") {
          router.replace(`/${locale}/academy/courses/${courseSlug}`);
          return;
        }
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        router.replace(`/${locale}/academy/courses/${courseSlug}`);
      });
  }, [sessionId, locale, courseSlug, router]);

  if (loading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">¡Pago exitoso!</h1>
          <p className="text-muted-foreground">
            Ya tenés acceso al curso. Para comenzar a verlo necesitás una cuenta.
          </p>
        </div>

        {isSignedIn ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/${locale}/academy/courses/${courseSlug}`)}
          >
            Comenzar a ver →
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Creá tu cuenta para continuar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Usá el email <strong>{session.customerEmail}</strong> para que tu compra quede vinculada automáticamente.
              </p>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full">
                  Crear cuenta
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="w-full">
                  Ya tengo cuenta — Iniciar sesión
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: End-to-end test with Stripe test payment**

1. Start Stripe CLI listener: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Open a paid course page → click "Comprar"
3. On Stripe Checkout, use test card: `4242 4242 4242 4242`, any future date, any CVC
4. Should redirect to success page showing the congratulations UI
5. Check Convex dashboard → `coursePurchases` table should have a new record with `status: "completed"`
6. If not logged in: "Crear cuenta" button should appear
7. Create account with same email → check `coursePurchases` record gets `userId` linked
8. Return to course page → buy button should now show "Continuar aprendiendo →"

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/success/page.tsx"
git commit -m "feat: add purchase success page with account creation prompt"
```

---

## Self-Review Notes

**Spec coverage:**
- [x] Schema: `academyCourses` price fields + `coursePurchases` table — Tasks 2, 4
- [x] `completePurchase` / `enrollForFree` / `hasPurchasedCourse` — Task 3
- [x] Account linking on signup — Task 5
- [x] Stripe singleton — Task 6
- [x] `/api/stripe/products` POST + PATCH — Task 7
- [x] `/api/stripe/checkout` — Task 8
- [x] `/api/stripe/webhook` — Task 9
- [x] `/api/stripe/session` — Task 10
- [x] Zod schema price/currency — Task 11
- [x] Admin create course with Stripe — Task 12
- [x] Admin edit course with price update — Task 13
- [x] Admin Stripe badge + button — Task 14
- [x] Course page buy button — Task 15
- [x] Success page — Task 16

**Type consistency:**
- `completePurchase` args match webhook call in Task 9 ✓
- `updateStripeIds` args match products route call in Task 7 ✓
- `updateStripePriceId` args match PATCH call in Task 7 ✓
- `getCourseById` used in checkout route — already exists in `academyCourses.ts`, returns new `price`/`currency`/`stripePriceId` fields after Task 4 ✓

**Important:** The `by_email_and_course` and `by_user_and_course` compound indexes in Task 2 are required by the `hasPurchasedCourse` query in Task 3. Task 2 must complete before Task 3.
