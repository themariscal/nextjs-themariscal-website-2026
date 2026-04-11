---
title: "Academy Feature"
type: feature
updated: 2026-04-11
tags: [academy, courses, pricing, convex, frontend]
---

# Academy Feature

The Academy is the learning hub of The Mariscal platform. It provides a browseable catalog of courses (with pricing and premium-membership access), a featured masterclass sidebar, and per-course detail pages. Content is stored in Convex and access rights are resolved per-user at query time.

## Routes

| Route | File |
|-------|------|
| `/[locale]/academy` | `src/app/[locale]/(root)/(main)/academy/page.tsx` |
| `/[locale]/academy/courses/[courseSlug]` | `src/app/[locale]/(root)/(main)/academy/courses/[courseSlug]/page.tsx` |

The academy pages sit inside the `(root)/(main)` route group, which provides the main site shell. The academy page uses `<MainLayout hideSidebar>` — the global sidebar is suppressed in favour of the custom academy sidebar.

## Key Components

| Component | Path | Role |
|-----------|------|------|
| `AcademyLayout` | `src/components/elements/academy/academy-layout.tsx` | Top-level layout: Shorts section + courses grid + sticky sidebar. Client component — owns the Convex query. |
| `AcademyCoursesGrid` | `src/components/elements/academy/academy-courses-grid.tsx` | Renders the full course catalog as a responsive grid. |
| `AcademyMasterclassSidebar` | `src/components/elements/academy/academy-masterclass-sidebar.tsx` | Sticky right-hand sidebar (desktop only) highlighting the "Curso Estrella" (`claude-code-masterclass`). |
| `CourseCard` | `src/components/elements/academy/course-card.tsx` | Individual course card — thumbnail (YouTube), rating badge, price, and CTA. |

### CourseCard logic

- Rating is deterministically derived from the course `_id` hash (values: 4.7, 4.8, 4.9).
- Price is formatted from cents (e.g. `5000` → `€50.00`); `0` or missing = "Gratis".
- CTA links to `/account/courses/[slug]` if the user already has access, otherwise to `/academy/courses/[slug]`.
- The `claude-code-masterclass` slug is special-cased as "Curso Estrella" with a `ring-2 ring-primary` visual treatment.

## Convex Data

| Query / Mutation | Table | Purpose |
|-----------------|-------|---------|
| `api.academyCourses.getAcademyCoursesWithAccess` | `academyCourses` | Returns all courses enriched with a per-user `hasAccess` flag. Used in `AcademyLayout`. |
| `api.academyCourses.listAllCourses` | `academyCourses` | Full course list without access filtering (used in admin). |
| `api.academyCourses.setIncludedInPremium` | `academyCourses` | Mutation to toggle a course's Premium inclusion flag. |

The `CourseWithAccess` TypeScript type (defined in `course-card.tsx`) is the canonical shape flowing from Convex to all academy client components:

```ts
type CourseWithAccess = {
  _id: string;
  name: string;
  youtubeVideoId: string;
  price?: number;           // cents
  currency?: string;
  includedInPremium?: boolean;
  instructorName: string | null;
  slug: string;
  hasAccess: boolean;
};
```

## YouTube Shorts Integration

The academy listing page embeds `<YouTubeShorts page="academy" />` at the top, driven by the `shorts` Convex table filtered to the `"academy"` page context.

## Current Status

- Academy listing page: fully implemented (grid + sidebar + shorts).
- Course detail page (`[courseSlug]`): implemented with `formatCoursePrice` and `parseDurationToSeconds` helpers.
- Pricing: supports free, paid (cents), and premium-included courses.
- Access control: resolved server-side in the Convex query — client just reads `hasAccess`.
- Admin management: available at `/admin/academy/courses` (see [[features/admin]]).

## Related Notes

- [[architecture/convex]] — Convex schema, tables, and query patterns
- [[architecture/frontend]] — Next.js app structure and route groups
- [[flows/convex-query-flow]] — How Convex queries flow from backend to client components
