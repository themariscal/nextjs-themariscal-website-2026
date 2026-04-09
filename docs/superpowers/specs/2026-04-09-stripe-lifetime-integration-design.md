# Stripe Lifetime Purchase Integration

**Date:** 2026-04-09
**Branch:** feature/stripe-integration
**Scope:** One-time lifetime purchase per course via Stripe Checkout (hosted). RevenueCat/subscriptions excluded from this spec.

---

## Overview

Users can purchase individual courses with a one-time payment. Each course has a configurable price (including free). Purchases are tracked in Convex. Stripe products/prices are created automatically from the admin when a course is created or its price is updated. Guest checkout is supported; account linking happens by email match when the guest later creates a Clerk account.

---

## 1. Data Model

### `academyCourses` — new fields

```ts
price: v.optional(v.number()),          // in cents (e.g. 4900 = €49.00), 0 = free
currency: v.optional(v.string()),        // ISO currency code: "eur", "usd", etc.
stripeProductId: v.optional(v.string()), // Stripe Product ID: prod_xxxxx
stripePriceId: v.optional(v.string()),   // Stripe Price ID: price_xxxxx
```

### New table: `coursePurchases`

```ts
coursePurchases: defineTable({
  courseId: v.id("academyCourses"),
  userId: v.optional(v.id("users")),    // null for guest purchases
  email: v.string(),                     // buyer email (from Stripe session)
  stripeSessionId: v.string(),
  stripePaymentIntentId: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("refunded")
  ),
  amountTotal: v.number(),              // cents actually charged
  currency: v.string(),
})
  .index("by_email", ["email"])
  .index("by_course", ["courseId"])
  .index("by_session", ["stripeSessionId"])
  .index("by_user", ["userId"])
```

---

## 2. API Routes

### `POST /api/stripe/checkout`

- Input: `{ courseId: string, locale: string }`
- Fetches course from Convex via internal query (server-side)
- If `price === 0`: skips Stripe, creates `coursePurchases` record directly, returns `{ redirect: successUrl }`
- Otherwise: creates Stripe Checkout Session with:
  - `mode: "payment"`
  - `line_items`: uses `stripePriceId` from course
  - `allow_promotion_codes: true`
  - `customer_email`: pre-filled if user is logged in
  - `metadata: { courseId, locale, courseSlug }`
  - `success_url`: `/{locale}/academy/courses/{slug}/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `/{locale}/academy/courses/{slug}`
- Returns `{ sessionUrl: string }`

### `POST /api/stripe/webhook`

- Verifies Stripe signature with `stripe-signature` header
- Handles `checkout.session.completed`:
  1. Extract `email`, `courseId`, `courseSlug`, `locale` from session metadata
  2. Extract `payment_intent`, `amount_total`, `currency`
  3. Look up user by email in Convex
  4. Create `coursePurchases` record with `status: "completed"`, link `userId` if found
- Returns 200 immediately; all Convex writes happen in background

### `GET /api/stripe/session?session_id=xxx`

- Fetches Checkout Session from Stripe
- Returns `{ status: "complete" | "open" | "expired", courseSlug, locale }`
- Used by success page to verify payment before showing congratulations UI

### `POST /api/stripe/products`

- Input: `{ courseId: string, name: string, price: number, currency: string }`
- Creates Stripe Product + Price
- Saves `stripeProductId` + `stripePriceId` back to Convex via mutation
- Called from admin when creating a course with a paid price

### `PATCH /api/stripe/products`

- Input: `{ courseId: string, stripeProductId: string, newPrice: number, currency: string }`
- Archives old Stripe Price, creates new Price on same Product
- Updates `stripePriceId` in Convex

---

## 3. Convex Functions

### `convex/academyCourses.ts` — additions

- `createCourse` mutation: accepts optional `price`, `currency` fields
- `updateStripeIds` mutation: sets `stripeProductId`, `stripePriceId` on a course
- `updateStripePriceId` mutation: updates only `stripePriceId` (price change flow)
- `getCourseBySlug` query: already exists, ensure it returns new fields

### New file: `convex/coursePurchases.ts`

- `createPurchase` mutation: inserts a `coursePurchases` record
- `completePurchase` mutation: sets `status: "completed"`, links `userId` if provided
- `getPurchaseBySession` query: lookup by `stripeSessionId`
- `hasPurchasedCourse` query: `{ courseId, userId?, email? }` → boolean
- `linkPurchasesByEmail` mutation: sets `userId` on all purchases matching an email (called on Clerk user creation)

---

## 4. Admin Flows

### Create course

1. Admin fills form (name, YouTube URL, language, instructor, description, **price, currency**)
2. On submit → `createCourse` mutation → saves to Convex
3. If `price > 0` → POST `/api/stripe/products` → Stripe Product + Price created → IDs saved to Convex
4. If `price === 0` → no Stripe product needed (free course)

### Edit course — price change

1. Admin changes price in edit form
2. If old `stripePriceId` exists → PATCH `/api/stripe/products` → archive old price, create new → update Convex
3. If new price is 0 → archive old price, clear `stripePriceId` (free course)
4. If no prior Stripe product → POST `/api/stripe/products` (first time adding a price)

### Course detail page (admin)

- Shows price badge: "€49.00 EUR" or "Gratis"
- "Ver en Stripe" button → opens `https://dashboard.stripe.com/test/products/{stripeProductId}` in new tab
- Button only shown if `stripeProductId` exists

---

## 5. Public Course Page

### Buy button states

| State | Condition | UI |
|-------|-----------|-----|
| Free | `price === 0` | "Inscribirme gratis" |
| Purchase | `price > 0`, not purchased | "Buy Now — €49.00" |
| Purchased | record in `coursePurchases` | "Continuar aprendiendo" |
| Loading | checking access | Skeleton |

### Purchase flow

1. Click "Buy Now" → POST `/api/stripe/checkout` with `courseId`
2. Receive `sessionUrl` → `window.location.href = sessionUrl` (redirect to Stripe)
3. User completes payment on Stripe hosted page (supports Apple Pay, Google Pay, coupons natively)
4. Stripe redirects to success URL

---

## 6. Success Page (`/academy/courses/[courseSlug]/success`)

Route: `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/success/page.tsx`

1. Reads `?session_id` from URL
2. Calls `GET /api/stripe/session` to verify payment
3. If invalid/expired → redirect to course page
4. If valid:
   - Shows "¡Felicitaciones! Adquiriste [Course Name]"
   - **If logged in** → "Comenzar a ver" button → goes to course player
   - **If not logged in** → card: "Crea una cuenta para continuar" + sign-up link (Clerk)
5. No back-navigation (replace history entry)

---

## 7. Account Linking

**Trigger:** Clerk `user.created` webhook → `POST /api/webhooks/clerk`

**Logic:** On new user creation, call `linkPurchasesByEmail` Convex mutation with the user's email. This sets `userId` on all `coursePurchases` records where `email` matches and `userId` is null.

**Result:** Guest who purchased and then creates account immediately gets access to their courses.

---

## 8. Access Control

A user can view course content if:
- `hasPurchasedCourse({ courseId, userId })` returns true, OR
- `hasPurchasedCourse({ courseId, email })` returns true (email from Clerk session)

Free courses: always accessible (no purchase record needed).

---

## 9. Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

All in test mode during development.

---

## 10. Branch & Setup

- Branch: `feature/stripe-integration` (no worktree — pnpm incompatibility)
- Package: `stripe` (server SDK)
- No `@stripe/stripe-js` needed (Checkout hosted = redirect only, no client SDK)

---

## 11. Implementation Notes

- `courseSlug` is NOT a stored field. It is derived at runtime via `toFriendlySlug(course.name)` (already defined in `convex/academyCourses.ts`). The checkout API receives it from the client and passes it through Stripe metadata for the success URL redirect.
- Current course page has hardcoded `COURSE_BASE_PRICE = 10.99` and `COURSE_PREVIOUS_PRICE = 49.99`. These will be replaced by `course.price` and `course.currency` from Convex.
- Stripe test mode keys must be used during development (`sk_test_...`, `pk_test_...`).

---

## Out of Scope (this branch)

- RevenueCat integration
- Subscription plans
- Refund UI (handled in Stripe dashboard directly)
- Course player / content access UI
- Email receipts (Stripe sends these natively)
