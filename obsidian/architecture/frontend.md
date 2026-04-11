---
title: "Frontend Architecture"
type: architecture
updated: 2026-04-11
tags: [architecture, frontend, nextjs, app-router, components, layouts, routes]
---

# Frontend Architecture

The frontend is a Next.js 15 App Router application in `src/`. All user-facing routes live under the `[locale]` dynamic segment for `next-intl` i18n support. See [[architecture/overview]] for the full stack context.

## Root Layout (`src/app/[locale]/layout.tsx`)

The root layout wraps every page with the provider stack (outermost → innermost):

```
NextIntlClientProvider (locale + messages)
  ThemeProvider (next-themes: system/light/dark)
    ThemeColorProvider (per-user color preference)
      ClerkProviderTheme (Clerk auth + theming)
        ConvexClientProvider (ConvexProviderWithClerk)
          TopLoader (nextjs-toploader)
          {children}
          ToastCustomContainer (react-toastify)
```

Fonts: **Geist Sans** and **Geist Mono** loaded via `next/font/google`.

## Route Structure

### Public Site — `[locale]/(root)/(main)/`

All routes under this group share the main layout (header + sidebar navigation).

| Route | Page |
|-------|------|
| `/` | Home |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post |
| `/music` | Music listing |
| `/music/artist/[id]` | Artist detail |
| `/videos` | Videos listing |
| `/jobs` | Jobs listing |
| `/shorts/[page]/[videoId]` | YouTube Shorts player (has `layout.tsx`) |
| `/academy` | Academy landing |
| `/academy/courses/[courseSlug]` | Course detail + enroll |
| `/academy/courses/[courseSlug]/success` | Post-purchase success page |
| `/pricing` | Pricing / subscription plans |
| `/product/[design]/[model]/[color]/[size]` | Product detail (nested dynamic segments) |
| `/subscription/callback` | RevenueCat subscription callback handler |

### AI Mini-App — `[locale]/(root)/app/`

Gated AI tools powered by Google Gemini:

| Route | Feature |
|-------|---------|
| `/app` | Mini-app hub |
| `/app/calories` | Food calorie analyser |
| `/app/find_food` | Find food restaurants |
| `/app/find_place` | Map-based place finder (Leaflet) |
| `/app/passport` | Visa analysis tool |
| `/app/trip_image` | Place history from image |
| `/app/trip_planning` | Trip planner |

### Account Area — `[locale]/account/`

Protected (Clerk auth required). Has its own `layout.tsx`.

| Route | Feature |
|-------|---------|
| `/account` | Profile overview |
| `/account/courses` | Enrolled courses list |
| `/account/courses/[courseSlug]` | Course player / progress |
| `/account/favorites` | Saved items |
| `/account/notifications` | Notifications |
| `/account/privacy` | Privacy settings |
| `/account/settings` | Account settings |
| `/account/subscription` | Subscription management |

### Admin Panel — `[locale]/admin/`

Protected by `is-admin-component`. Has its own centered `layout.tsx`.

| Route | Feature |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/shorts` | Shorts list |
| `/admin/shorts/new` | Create short |
| `/admin/shorts/[id]/edit` | Edit short |
| `/admin/academy/courses` | Courses list |
| `/admin/academy/courses/new` | Create course |
| `/admin/academy/courses/[id]/edit` | Edit course |
| `/admin/academy/courses/[id]/sections` | Manage sections |
| `/admin/academy/courses/[id]/sections/new` | Create section |
| `/admin/subscriptions` | Subscription overview |

### Auth Routes

| Route | Purpose |
|-------|---------|
| `/login/[[...rest]]` | Clerk sign-in (catch-all for Clerk's multi-step flow) |
| `/auth/sso-callback` | Clerk SSO callback handler |

### API Route Handlers (`src/app/api/`)

| Path | Purpose |
|------|---------|
| `api/ai/analyze-food` | POST — Gemini food calorie analysis |
| `api/ai/analyze-place` | POST — Gemini place analysis |
| `api/ai/chat` | POST — Gemini chat (streaming) |
| `api/ai/find-restaurants` | POST — Gemini restaurant finder |
| `api/ai/identify-place` | POST — Gemini place identification from image |
| `api/ai/trips/create` | POST — Gemini trip creation |
| `api/ai/visa-analysis` | POST — Gemini visa/passport analysis |
| `api/blog/[slug]` | GET — Blog post by slug |
| `api/stripe/checkout` | POST — Create Stripe Checkout session |
| `api/stripe/products` | GET — List Stripe products |
| `api/stripe/session` | GET — Retrieve Stripe session |
| `api/revenuecat/checkout` | POST — RevenueCat checkout initiation |
| `api/revenuecat/sync` | POST — Manual subscription sync |
| `api/vps/[...path]` | Proxy to VPS backend (allowlist-validated paths) |
| `api/youtube/resolve-short` | GET — Resolve YouTube Short URL to video ID |

## Key Components

### Navigation & Layout (`src/components/nav/`, `src/components/layout/`)

- `Header.tsx` — top header bar with logo, nav links, auth controls
- `SideBar.tsx` / `SideBarLink.tsx` / `sidebar-content.tsx` — collapsible sidebar
- `mobile-sidebar-drawer.tsx` — mobile drawer via Vaul
- `account-sheet.tsx` — slide-out account sheet
- `floating-action-button.tsx` — mobile FAB for primary actions
- `topbar.tsx` — contextual top bar
- `language-selector.tsx` — locale switcher
- `mode-toggle.tsx` — light/dark/system theme toggle
- `top-loader.tsx` — route transition progress bar (nextjs-toploader)
- `toast-custom-container.tsx` — toast notification container (react-toastify)

### Auth Guard (`src/components/auth/`)

- `require-auth.tsx` — wraps pages requiring authentication; redirects to `/login`
- `is-admin-component.tsx` — gates admin pages; checks Clerk role/metadata

### Providers (`src/lib/providers/`)

- `convex-provider.tsx` — `ConvexProviderWithClerk` setup; makes Convex queries reactive and auth-aware
- `clerk-provider.tsx` — `ClerkProvider` with `next-themes` integration for theme-aware Clerk UI
- `theme-color-provider.tsx` — reads/persists user's preferred accent color

### Stores (`src/lib/stores/`)

- `music-store.ts` — Zustand store for music player state (current track, play state)
- `sidebar-store.ts` — Zustand store for sidebar open/collapsed state

### Hooks (`src/lib/hooks/`)

- `use-media-query.tsx` — responsive breakpoint detection
- `use-mobile.ts` — boolean hook for mobile viewport
- `use-scroll-url.ts` — syncs scroll position with URL hash

## i18n Routing

`next-intl` is configured via `src/i18n/routing.ts` with the locale prefix strategy. `src/middleware.ts` handles locale detection and redirect. Message files live in `src/i18n/messages/`. The root layout calls `getLocale()` and `getMessages()` from `next-intl/server` to pass locale/messages to `NextIntlClientProvider`.

## Related Notes

- [[architecture/overview]] — full stack diagram and provider chain
- [[architecture/modules]] — all modules and their file locations
- [[architecture/convex]] — Convex tables and how frontend consumes them
