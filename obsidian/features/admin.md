---
title: "Admin Feature"
type: feature
updated: 2026-04-11
tags: [admin, management, dashboard, convex, layout]
---

# Admin Feature

The Admin area provides internal management pages for platform content and configuration. It is protected by an `IsAdminComponent` auth guard and sits under the `/[locale]/admin` route group, separate from the public site.

## Layout Rule (MANDATORY)

> **All admin pages use a centered layout by default.**
> Every new admin page MUST keep its content inside a centered, consistent container.

This is enforced by the shared admin layout at `src/app/[locale]/admin/layout.tsx`:

```tsx
<main className="w-full">
  <div className="w-full mt-20 px-4 md:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-6xl">{children}</div>
  </div>
</main>
```

Max-width is `max-w-6xl` with responsive horizontal padding. Do not override this in individual page components.

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/[locale]/admin` | `src/app/[locale]/admin/page.tsx` | Admin dashboard (stub) |
| `/[locale]/admin/academy/courses` | `src/app/[locale]/admin/academy/courses/page.tsx` | List all courses; toggle Premium inclusion |
| `/[locale]/admin/academy/courses/new` | `src/app/[locale]/admin/academy/courses/new/` | Create a new course |
| `/[locale]/admin/academy/courses/[id]/sections` | `src/app/[locale]/admin/academy/courses/[id]/sections/page.tsx` | Manage sections/lessons for a course |
| `/[locale]/admin/shorts` | `src/app/[locale]/admin/shorts/page.tsx` | Manage YouTube Shorts |
| `/[locale]/admin/shorts/new` | `src/app/[locale]/admin/shorts/new/` | Add a new Short |
| `/[locale]/admin/subscriptions` | `src/app/[locale]/admin/subscriptions/page.tsx` | Manage subscriptions |

## Shared Layout Components

| Component | Path | Role |
|-----------|------|------|
| `AdminAppSidebar` | `src/components/layout/sidebars/admin-app-sidebar.tsx` | Collapsible sidebar with nav links to all admin sections |
| `Topbar` | `src/components/layout/topbar.tsx` | Top navigation bar (shared with main site) |
| `SidebarProvider` | `src/components/ui/sidebar.tsx` | Context provider that drives sidebar open/closed state |
| `IsAdminComponent` | `src/components/auth/is-admin-component.tsx` | Renders children only when the current user has admin role |

## Convex Data Accessed

| Query / Mutation | Table | Used in |
|-----------------|-------|---------|
| `api.academyCourses.listAllCourses` | `academyCourses` | Admin courses list page |
| `api.academyCourses.setIncludedInPremium` | `academyCourses` | Toggle Premium flag per course |
| Shorts queries (via `YouTubeShorts` / admin shorts pages) | `shorts` | Shorts management |

The admin courses page (`src/app/[locale]/admin/academy/courses/page.tsx`) is a client component that uses `useQuery` + `useMutation` directly.

The sections page (`src/app/[locale]/admin/academy/courses/[id]/sections/page.tsx`) contains `formatPrice` and `parseDurationToSeconds` helpers mirroring those in the public course-detail page.

## Auth Protection

`IsAdminComponent` (at `src/components/auth/is-admin-component.tsx`) wraps protected content and returns nothing if the user is not an admin. The admin layout does not currently redirect unauthenticated users at the route level — access control is component-level.

## Current Status

- Dashboard (`/admin`): stub page — "Hola Admin" placeholder only.
- Academy course management: fully implemented (list, premium toggle, sections view).
- Shorts management: route structure exists (`/admin/shorts`, `/admin/shorts/new`).
- Subscriptions management: route exists (`/admin/subscriptions`).
- Auth protection: component-level via `IsAdminComponent`; route-level middleware not yet added.

## Related Notes

- [[features/academy]] — Public-facing academy feature
- [[architecture/convex]] — Convex schema and mutation patterns
- [[architecture/frontend]] — Route groups and layout hierarchy
- [[flows/convex-query-flow]] — How admin pages read/write Convex data
