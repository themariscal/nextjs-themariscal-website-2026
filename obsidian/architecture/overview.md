---
title: "Architecture Overview"
type: architecture
updated: 2026-04-11
tags: [architecture, nextjs, convex, vercel, overview]
---

# Architecture Overview

The Mariscal is a full-stack web platform built on Next.js 15 (App Router) with a Convex real-time backend, hosted on Vercel. It combines a public-facing content/commerce site with a private AI-powered travel mini-app and an admin panel.

## Stack Layers

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 15 (App Router, Turbopack) |
| Backend / Database | Convex (real-time serverless DB + functions) |
| Auth | Clerk (`@clerk/nextjs`) |
| Payments — one-time | Stripe |
| Payments — subscriptions | RevenueCat |
| AI | Google Gemini via `@ai-sdk/google` + `ai` SDK |
| i18n | `next-intl` (locale-based routing) |
| Styling | Tailwind CSS v4, shadcn/ui (Radix primitives) |
| Fonts | Geist Sans + Geist Mono (next/font/google) |
| State management | Zustand (`music-store`, `sidebar-store`) |
| Forms | React Hook Form + Zod |
| 3D / Animation | Three.js (`@react-three/fiber`, `@react-three/drei`), Framer Motion |
| Maps | Leaflet + react-leaflet |
| Hosting | Vercel (CDN + serverless functions) |

## High-Level Architecture

```
Browser
  └── Next.js App Router  (src/app)
        ├── [locale]/(root)/(main)  ← Public site (header + sidebar nav)
        ├── [locale]/(root)/app     ← AI mini-app tools
        ├── [locale]/account        ← Authenticated user area
        ├── [locale]/admin          ← Admin panel (protected)
        ├── [locale]/login          ← Clerk auth pages
        └── api/*                   ← Next.js Route Handlers (AI, Stripe, RevenueCat, VPS proxy)

Convex Cloud (convex.dev)
  ├── schema.ts              ← Table definitions (16 tables)
  ├── Queries / Mutations    ← academyCourses, youtubeShorts, users, subscriptions, …
  └── http.ts (HTTP actions) ← Webhooks: Clerk, Stripe, RevenueCat

External Services
  ├── Clerk  — user identity, JWT, SSO
  ├── Stripe — course one-time purchases
  ├── RevenueCat — subscription lifecycle (monthly / annual)
  └── Google Gemini — AI features (food, place, visa, trip, chat)
```

## GitNexus Index Stats (2026-04-11)

- **1,733 nodes** (symbols: functions, classes, types)
- **2,932 edges** (import/call relationships)
- **65 clusters** (functional groupings)
- **9 execution flows**

## Key Cross-Cutting Concerns

- **Auth** — Clerk JWT propagated to Convex via `ConvexClientProvider` (see [[architecture/frontend]]). Every authenticated Convex query/mutation uses `tokenIdentifier` (Clerk user ID) not Convex user `_id`.
- **i18n** — All public routes are under `[locale]` with `next-intl` message files in `src/i18n/messages/`.
- **Theme** — `next-themes` wraps the root layout; `ThemeColorProvider` adds per-user color preferences.

## Related Notes

- [[architecture/modules]] — breakdown of all major modules and clusters
- [[architecture/convex]] — Convex tables, queries, mutations, webhooks
- [[architecture/frontend]] — Next.js routes, layouts, components
