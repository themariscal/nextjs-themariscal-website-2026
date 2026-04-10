# Academy Page — Design Spec
**Date:** 2026-04-09  
**Branch:** claude-academy-page  
**Route:** `/[locale]/(root)/(main)/academy/page.tsx`

---

## Overview

New `/academy` listing page with three main zones:
1. YouTube Shorts filtered by `section="academy"`
2. 4-column courses grid with access-aware CTA buttons
3. Sticky right sidebar promoting the masterclass at €199

Inspired by the music page layout (`hideSidebar`) and the course page purchase sidebar pattern.

---

## Architecture

```
/academy/page.tsx
  └─ MainLayout (hideSidebar=true)
      └─ AcademyLayout (flex row)
          ├─ AcademyMain (flex-1)
          │   ├─ AcademyShorts (section="academy")
          │   └─ AcademyCoursesGrid
          │       └─ CourseCard × N
          └─ AcademyMasterclassSidebar (sticky, ~300px)
```

**New files:**
- `src/app/[locale]/(root)/(main)/academy/page.tsx`
- `src/components/elements/academy/academy-layout.tsx`
- `src/components/elements/academy/academy-shorts.tsx`
- `src/components/elements/academy/academy-courses-grid.tsx`
- `src/components/elements/academy/course-card.tsx`
- `src/components/elements/academy/academy-masterclass-sidebar.tsx`

---

## Section 1 — Shorts

Reuses existing `<YouTubeShorts page="academy" />` component unchanged.  
Requires shorts in Convex with `section="academy"` (min 5–6 videos to seed).

---

## Section 2 — Courses Grid

**Layout:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

### CourseCard anatomy
| Element | Detail |
|---|---|
| Thumbnail | `https://i.ytimg.com/vi/{youtubeVideoId}/hqdefault.jpg` |
| Name | Course name |
| Instructor | Instructor name |
| Badge | `Bestseller` / `Incluido en Premium` / `Gratis` / `⭐ Curso Estrella` |
| Rating | Fake static 4.7–4.9 stars |
| Price | Formatted: `Gratis` / `€9.99` / `€14.99` / `€29.99` / `€199` |
| CTA | See below |

### CTA logic
```
hasAccess = isEnrolled OR (isPremium AND course.includedInPremium)

if hasAccess:
  → Button "Ver curso"  (→ /account/courses/[slug])
else:
  → Button "Ver detalles"  (→ /academy/courses/[slug])
```

The masterclass (`includedInPremium: false`, price: €199):
- Premium users do NOT get access
- Only enrolled (purchased) users see "Ver curso"

---

## Section 3 — Right Sidebar (Sticky)

Models `CoursePurchaseSidebar`. Always visible on `lg+`, hidden on mobile.

**Content:**
- YouTube thumbnail of masterclass
- Title: "Claude Code Masterclass"
- Badge: red "No incluido en Premium"
- Price: **€199**
- Feature list: 4 secciones · 14 videos · Certificado · Acceso de por vida
- CTA: "Comprar ahora" → `/academy/courses/claude-code-masterclass`
- If already purchased: "Ver curso" → `/account/courses/claude-code-masterclass`

---

## Section 4 — Convex Data

### Schema changes
**None.** `includedInPremium` already exists on `academyCourses`.

### Data to seed (via MCP Convex)

**Update existing 2 courses:**
- Set `includedInPremium: true`

**Create masterclass course:**
- Name: "Claude Code Masterclass"
- Price: 19900 (cents) / EUR
- `includedInPremium: false`
- 4 sections, 14 videos total (fake YouTube video IDs)

| Section | Videos |
|---|---|
| Introducción a Claude Code | 3 |
| Comandos y Flujo de Trabajo | 4 |
| Agentes y Automatización | 4 |
| Casos Avanzados y Deploy | 3 |

**Create 10 additional courses** with varied pricing:

| Price | Count | includedInPremium |
|---|---|---|
| Gratis (0) | 2 | true |
| €9.99 | 3 | true |
| €14.99 | 3 | true |
| €29.99 | 2 | false |

Each course: 2–3 sections, 3–5 videos per section, fake YouTube video IDs.

**Seed academy shorts:** Add 5–6 `youtubeShorts` with `section="academy"`.

### New Convex query
`getAcademyCoursesWithAccess` — returns all courses enriched with:
```ts
{
  hasAccess: boolean  // isEnrolled || (isPremium && includedInPremium)
}
```

---

## Access Rules Summary

| User state | includedInPremium course | Masterclass (not premium) |
|---|---|---|
| Not logged in | Ver detalles | Ver detalles |
| Logged in, no premium, not enrolled | Ver detalles | Ver detalles |
| Premium active | **Ver curso** | Ver detalles |
| Enrolled (purchased) | **Ver curso** | **Ver curso** |
| Premium + enrolled in masterclass | **Ver curso** | **Ver curso** |

---

## Out of Scope
- Filtering/tabs by price or category
- Search within academy
- Course reviews/ratings (kept static/fake for now)
- Left sidebar (hidden via `hideSidebar`)
