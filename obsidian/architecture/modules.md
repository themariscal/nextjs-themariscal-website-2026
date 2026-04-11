---
title: "Architecture Modules"
type: architecture
updated: 2026-04-11
tags: [architecture, modules, clusters, dependencies]
---

# Modules & Clusters

GitNexus identified **65 clusters** across **1,733 symbols**. The major functional modules are listed below, mapped to their file system location.

## Frontend Modules (`src/`)

### `src/app` — Next.js App Router
Entry point for all pages and API routes. All page routes are nested under `[locale]` for i18n.

| Sub-module | Path | Purpose |
|-----------|------|---------|
| Public site | `[locale]/(root)/(main)` | Home, blog, music, videos, jobs, shorts, product, academy, pricing |
| AI mini-app | `[locale]/(root)/app` | AI-powered tools: calories, find_food, find_place, passport, trip_image, trip_planning |
| Account | `[locale]/account` | User profile, courses, favorites, notifications, settings, subscription |
| Admin | `[locale]/admin` | Manage shorts, academy courses, subscriptions |
| Auth | `[locale]/login`, `[locale]/auth` | Clerk-hosted sign-in, SSO callback |
| API routes | `api/` | AI endpoints, Stripe, RevenueCat, VPS proxy, YouTube, blog |

### `src/components` — Shared UI
Organised by concern:

| Directory | Contents |
|-----------|---------|
| `alerts/` | `alert-error-card`, `custom-alert-dialog` |
| `auth/` | `is-admin-component`, `require-auth` |
| `buttons/` | Shared button variants |
| `dialogs/` | Dialog components |
| `elements/` | Generic UI primitives |
| `flights/` | Flight-specific UI |
| `layout/` | `Header`, `SideBar`, `SideBarLink`, `TopLoader`, `ToastCustomContainer`, `mode-toggle`, `language-selector` |
| `models/` | 3D model components (Three.js) |
| `motionComponent/` | Framer Motion wrappers |
| `nav/` | Navigation: `topbar`, `mobile-sidebar-drawer`, `account-sheet`, `floating-action-button` |
| `popovers/` | Popover components |
| `ui/` | shadcn/ui auto-generated primitives (Radix-based) |
| `utils/` | Utility components |
| `views/` | View-level components: `productView`, `likesComponents`, `priceComponents`, etc. |

### `src/lib` — Application Logic

| Directory / File | Purpose |
|-----------------|---------|
| `ai/` | AI SDK helpers (Google Gemini prompt configs, streaming) |
| `hooks/` | `use-media-query`, `use-mobile`, `use-scroll-url` |
| `providers/` | `clerk-provider`, `convex-provider`, `theme-color-provider` |
| `stores/` | Zustand stores: `music-store`, `sidebar-store` |
| `schemas/` | Zod validation schemas |
| `services/` | Service layer (API call wrappers) |
| `types/` | TypeScript type definitions (alerts, auth, blog, dialogs, jobs, music, sidebar, trending, trip, videos) |
| `constants/` | App-wide constants |
| `utils.ts` | General utility functions |
| `api_routes.ts` | Route constant definitions |
| `stripe.ts` | Stripe SDK initialisation |
| `revenuecat.ts` | RevenueCat SDK helpers |
| `youtube-shorts.ts` | YouTube Shorts utility helpers |
| `flight-actions.ts` | Flight feature server actions |

### `src/i18n` — Internationalisation
`next-intl` configuration. `routing.ts` defines locale list. `messages/` holds per-locale JSON files. `request.ts` is the Next.js middleware request config.

### `src/middleware.ts`
Next.js middleware: handles locale detection and route protection (Clerk + next-intl).

## Backend Modules (`convex/`)

See [[architecture/convex]] for full detail.

| File | Role |
|------|------|
| `schema.ts` | All 16 table definitions |
| `academyCourses.ts` | Course CRUD + section management + progress tracking |
| `youtubeShorts.ts` | Shorts queries + admin mutations |
| `shortComments.ts` | Comment CRUD with threading |
| `users.ts` | User upsert/delete (from Clerk webhook) |
| `subscriptions.ts` | Subscription upsert + queries |
| `subscriptionOfferings.ts` | Offering read queries |
| `coursePurchases.ts` | Purchase creation + Stripe completion |
| `auth.config.ts` | Convex auth configuration (Clerk JWT) |
| `http.ts` | HTTP actions: `/clerk-users-webhook`, `/stripe-webhook`, `/api/webhooks/revenuecat` |

## Dependency Graph (high-level)

```
src/app pages
  → src/components (UI)
  → src/lib/providers (Convex, Clerk, Theme)
  → convex/_generated/api (type-safe Convex queries/mutations)
  → src/lib/hooks
  → src/lib/stores (Zustand)

src/app/api routes
  → src/lib/ai (Gemini AI SDK)
  → src/lib/stripe
  → src/lib/revenuecat
  → convex/_generated/api (server-side Convex calls)

convex/*.ts
  → convex/schema.ts
  → convex/_generated/server
```

## Related Notes

- [[architecture/overview]] — stack summary
- [[architecture/convex]] — Convex tables and functions
- [[architecture/frontend]] — routes and layouts
