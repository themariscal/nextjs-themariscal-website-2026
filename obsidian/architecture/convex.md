---
title: "Convex Backend"
type: architecture
updated: 2026-04-11
tags: [architecture, convex, database, backend, webhooks, mutations, queries]
---

# Convex Backend

The Mariscal uses [Convex](https://convex.dev) as its real-time serverless backend. All database tables, queries, mutations, and HTTP actions are defined in the `convex/` directory. See [[architecture/overview]] for where Convex fits in the full stack.

## Auth Integration

Convex uses Clerk JWTs for authentication. `convex/auth.config.ts` configures the Clerk issuer. On the frontend, `ConvexClientProvider` (`src/lib/providers/convex-provider.tsx`) wraps the app with `ConvexProviderWithClerk` so every query/mutation automatically receives the authenticated user's token. Authenticated records use `tokenIdentifier` (a string containing the Clerk user ID), not a Convex-native user `_id`.

## Tables (defined in `convex/schema.ts`)

### Content Tables

| Table | Key Fields | Indexes |
|-------|-----------|---------|
| `youtubeShorts` | `videoId`, `title`, `section?`, `page?`, `order?` | `bySection`, `bySectionAndOrder`, `byPage`, `byPageAndOrder` |
| `shortSections` | `name` | `by_name` |
| `shortReactions` | `tokenIdentifier`, `videoId`, `reaction` (like/dislike) | `by_token_and_video`, `by_video` |
| `shortComments` | `videoId`, `tokenIdentifier`, `text`, `authorName?`, `parentId?` | `by_video`, `by_token`, `by_parent` |

### Academy Tables

| Table | Key Fields | Indexes |
|-------|-----------|---------|
| `academyCourses` | `name`, `youtubeUrl`, `youtubeVideoId`, `languageId`, `instructorId`, `description`, `price?`, `stripeProductId?`, `stripePriceId?`, `includedInPremium?` | `by_language`, `by_instructor` |
| `academyCourseSections` | `courseId`, `name`, `order?` | `by_course`, `by_course_and_order` |
| `academyCourseSectionElements` | `sectionId`, `type` (video/quiz/resource/note), `title`, `order?`, `isPreview?`, `contentUrl?`, `contentText?` | `by_section`, `by_section_and_order` |
| `academyCourseEnrollments` | `tokenIdentifier`, `courseId`, `purchasedAt`, `completedAt?` | `by_token_and_course`, `by_token` |
| `academyCourseProgress` | `tokenIdentifier`, `courseId`, `sectionId`, `elementId`, `watchedSeconds?`, `manualCompleted?`, `autoCompleted?` | `by_token_and_course`, `by_token_and_element`, `by_course` |
| `academyCoursePlaybackState` | `tokenIdentifier`, `courseId`, `sectionId`, `elementId`, `positionSeconds`, `updatedAt` | `by_token_and_course`, `by_token_and_element` |
| `courseLanguages` | `name` | `by_name` |
| `courseInstructors` | `name` | `by_name` |

### Commerce Tables

| Table | Key Fields | Indexes |
|-------|-----------|---------|
| `coursePurchases` | `courseId`, `userId?`, `email`, `stripeSessionId`, `stripePaymentIntentId?`, `status` (pending/completed/refunded), `amountTotal`, `currency` | `by_email`, `by_course`, `by_session`, `by_user`, `by_user_and_course`, `by_email_and_course` |
| `subscriptions` | `clerkUserId`, `revenueCatCustomerId`, `productIdentifier`, `entitlementId`, `status` (active/expired/cancelled/billing_issue), `planType` (monthly/annual), `currentPeriodEnd` | `by_clerk_user`, `by_clerk_user_and_status`, `by_revenuecat_customer`, `by_status` |
| `subscriptionOfferings` | `name`, `description`, `monthlyPriceUsd`, `annualPriceUsd`, `revenueCatProductIdMonthly`, `revenueCatProductIdAnnual`, `revenueCatOfferingId`, `isActive` | (none) |

### User Table

| Table | Key Fields | Indexes |
|-------|-----------|---------|
| `users` | `externalId` (Clerk ID), `email`, `firstName?`, `lastName?`, `username?`, `imageUrl?` | `byExternalId`, `byEmail`, `byUsername` |

## Functions (`convex/*.ts`)

### `academyCourses.ts`
- `query`: list courses, get by slug, get with sections/elements, get enrollment status, get progress
- `mutation`: create/update course, create section + elements, upsert progress, mark element complete, save playback state
- `internalMutation`: `completePurchase` — called after Stripe webhook; grants enrollment

Key helpers:
- `toFriendlySlug()` — normalises slugs (strips accents, lowercases, hyphenates)
- `parseDurationToSeconds()` — parses `mm:ss`, `hh:mm:ss`, `Nm` formats
- `refreshEnrollmentCompletionState()` — recomputes course completion after element progress update

### `youtubeShorts.ts`
- `query`: `getByPage`, `getByPagePaginated`, `getAllPaginated`, `getById`
- `mutation`: `create`, `update`, `deleteById`

### `shortComments.ts`
- `query`: get comments by video (with pagination)
- `mutation`: create, delete comment

### `users.ts`
- `internalMutation`: `upsertFromClerk` — syncs Clerk user data; on new user links any guest `coursePurchases` by email
- `internalMutation`: `deleteFromClerk` — removes user record

### `subscriptions.ts`
- `internalMutation`: `upsertSubscription` — one record per user (patch if exists, insert if new)
- `query`: `getMySubscription` — returns subscription for authenticated user

### `coursePurchases.ts`
- `mutation`: `createPendingPurchase`
- `internalMutation`: `completePurchase` — marks purchase completed + triggers enrollment

### `subscriptionOfferings.ts`
- `query`: `getActiveOffering` — returns the active subscription plan config

## HTTP Actions (`convex/http.ts`)

Three inbound webhook routes:

| Path | Trigger | Action |
|------|---------|--------|
| `POST /clerk-users-webhook` | Clerk `user.created` / `user.updated` / `user.deleted` | Runs `users.upsertFromClerk` or `users.deleteFromClerk` via `svix` signature verification |
| `POST /stripe-webhook` | Stripe `checkout.session.completed` | Verifies HMAC-SHA256 manually (Web Crypto API), then runs `coursePurchases.completePurchase` |
| `POST /api/webhooks/revenuecat` | RevenueCat subscription events | Validates Bearer token, maps event type to status, runs `subscriptions.upsertSubscription` + patches Clerk `publicMetadata.isPremium` |

## Patterns

- **Guest purchase linking**: When a user registers after buying a course as a guest, `upsertFromClerk` scans `coursePurchases` by email and back-fills `userId`.
- **Subscription sync to Clerk**: After each RevenueCat webhook, `isPremium` is written to Clerk `publicMetadata` so the frontend can gate content without an extra Convex query.
- **Progress auto-completion**: Watching ≥ configured % of a video sets `autoCompleted`; `refreshEnrollmentCompletionState` recalculates overall course `completedAt`.

## Related Notes

- [[architecture/overview]] — full stack diagram
- [[architecture/modules]] — module list
- [[architecture/frontend]] — how Convex is consumed in the frontend
