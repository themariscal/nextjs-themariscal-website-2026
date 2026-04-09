# Academy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/academy` page with YouTube Shorts, 4-column courses grid, and sticky masterclass sidebar, backed by a new Convex query that returns per-user access rights.

**Architecture:** A client-side `AcademyLayout` component fetches all courses + access state via `getAcademyCoursesWithAccess`, splits masterclass for the sticky sidebar, and renders all courses in a responsive grid. The page uses `MainLayout` with `hideSidebar` following the same pattern as the music page.

**Tech Stack:** Next.js App Router, Convex (queries/mutations), Clerk (auth), Tailwind CSS, shadcn/ui, lucide-react.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `convex/academyCourses.ts` | Add query + update mutations |
| Create | `src/components/elements/academy/course-card.tsx` | Single course card with access-aware CTA |
| Create | `src/components/elements/academy/academy-courses-grid.tsx` | 4-col responsive grid |
| Create | `src/components/elements/academy/academy-masterclass-sidebar.tsx` | Sticky promo sidebar |
| Create | `src/components/elements/academy/academy-layout.tsx` | Client layout, owns Convex hooks |
| Create | `src/app/[locale]/(root)/(main)/academy/page.tsx` | Server entry point |

---

## Task 1: Convex — backend additions to `academyCourses.ts`

**Files:**
- Modify: `convex/academyCourses.ts`

Four changes in one commit: (1) add `includedInPremium` param to `createCourse`, (2) add `patchIncludedInPremium` mutation for seeding, (3) add `getAcademyCoursesWithAccess` query, (4) update `getPurchasedCoursePlayerBySlug` to allow premium access on `includedInPremium` courses.

- [ ] **Step 1: Add `includedInPremium` param to `createCourse`**

In `convex/academyCourses.ts`, find the `createCourse` mutation args block (around line 148) and add the optional field:

```typescript
// Add to args object in createCourse:
includedInPremium: v.optional(v.boolean()),
```

And in the `ctx.db.insert("academyCourses", {...})` call, add:

```typescript
includedInPremium: args.includedInPremium ?? false,
```

- [ ] **Step 2: Add `patchIncludedInPremium` mutation (no auth, seeding only)**

Append after `setIncludedInPremium` (around line 1235):

```typescript
export const patchIncludedInPremium = mutation({
  args: {
    courseId: v.id("academyCourses"),
    includedInPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, { includedInPremium: args.includedInPremium });
  },
});
```

- [ ] **Step 3: Add `getAcademyCoursesWithAccess` query**

Append after `patchIncludedInPremium`:

```typescript
export const getAcademyCoursesWithAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const courses = await ctx.db.query("academyCourses").order("desc").take(500);

    const coursesWithMeta = await Promise.all(
      courses.map(async (course) => {
        const [language, instructor] = await Promise.all([
          ctx.db.get(course.languageId),
          ctx.db.get(course.instructorId),
        ]);
        return {
          ...course,
          languageName: language?.name ?? null,
          instructorName: instructor?.name ?? null,
          slug: toFriendlySlug(course.name),
          hasAccess: false as boolean,
        };
      })
    );

    if (!identity) return coursesWithMeta;

    const [subscription, enrollments] = await Promise.all([
      ctx.db
        .query("subscriptions")
        .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
        .unique(),
      ctx.db
        .query("academyCourseEnrollments")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .take(500),
    ]);

    const isPremium = subscription?.status === "active";
    const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));

    return coursesWithMeta.map((course) => ({
      ...course,
      hasAccess:
        enrolledIds.has(String(course._id)) ||
        (isPremium && (course.includedInPremium ?? false)),
    }));
  },
});
```

- [ ] **Step 4: Update `getPurchasedCoursePlayerBySlug` for premium access**

Find this block inside `getPurchasedCoursePlayerBySlug` (around line 641):

```typescript
const enrollment = await ctx.db
  .query("academyCourseEnrollments")
  .withIndex("by_token_and_course", (q) =>
    q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
  )
  .unique();

if (!enrollment) {
  return { accessDenied: true as const };
}
```

Replace with:

```typescript
const [enrollment, subscription] = await Promise.all([
  ctx.db
    .query("academyCourseEnrollments")
    .withIndex("by_token_and_course", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier).eq("courseId", course._id)
    )
    .unique(),
  ctx.db
    .query("subscriptions")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
    .unique(),
]);

const isPremium = subscription?.status === "active";
if (!enrollment && !(isPremium && (course.includedInPremium ?? false))) {
  return { accessDenied: true as const };
}
```

- [ ] **Step 5: Verify Convex dev server picks up changes**

```bash
# In the project root (not worktree) check convex dev is running, or run:
npx convex dev --once
```

Expected: no TypeScript errors, functions deployed.

- [ ] **Step 6: Commit**

```bash
git add convex/academyCourses.ts
git commit -m "feat(convex): add getAcademyCoursesWithAccess query and premium player access"
```

---

## Task 2: Seed Convex data via MCP

**Files:** Convex database (via MCP tool calls)

This task seeds all course data. Steps are sequential — each depends on IDs from prior steps.

> Use `mcp__convex__run` for each step. The function path format is `moduleName:functionName`.

- [ ] **Step 1: List existing courses and note their IDs**

```
mcp__convex__run
  function: "academyCourses:getCoursesNewest"
  args: {}
```

Note the `_id` values of all existing courses — needed in Step 4.

- [ ] **Step 2: Create instructor**

```
mcp__convex__run
  function: "academyCourses:addInstructor"
  args: { "name": "Martin Mariscal" }
```

Capture the returned ID as `INSTRUCTOR_ID`.

- [ ] **Step 3: Create language**

```
mcp__convex__run
  function: "academyCourses:addLanguage"
  args: { "name": "español" }
```

Capture the returned ID as `LANGUAGE_ID`.

- [ ] **Step 4: Set `includedInPremium: true` on the 2 existing courses**

For each `EXISTING_COURSE_ID` noted in Step 1:

```
mcp__convex__run
  function: "academyCourses:patchIncludedInPremium"
  args: { "courseId": "EXISTING_COURSE_ID", "includedInPremium": true }
```

Run once per existing course.

- [ ] **Step 5: Create Claude Code Masterclass**

```
mcp__convex__run
  function: "academyCourses:createCourse"
  args: {
    "name": "Claude Code Masterclass",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "languageId": "LANGUAGE_ID",
    "instructorId": "INSTRUCTOR_ID",
    "description": "El curso más completo sobre Claude Code. Aprende a usar IA para desarrollar, automatizar y hacer deploy de aplicaciones completas desde cero hasta producción.",
    "price": 19900,
    "currency": "eur",
    "includedInPremium": false
  }
```

Capture returned ID as `MASTERCLASS_ID`.

- [ ] **Step 6: Create masterclass Section 1**

```
mcp__convex__run
  function: "academyCourses:createCourseSectionWithElements"
  args: {
    "courseId": "MASTERCLASS_ID",
    "name": "Introducción a Claude Code",
    "elements": [
      { "type": "video", "title": "Qué es Claude Code y por qué cambia todo", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "5:32", "isPreview": true },
      { "type": "video", "title": "Instalación y configuración desde cero", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "8:14", "isPreview": false },
      { "type": "video", "title": "Tu primer proyecto con Claude Code", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "6:45", "isPreview": false }
    ]
  }
```

- [ ] **Step 7: Create masterclass Section 2**

```
mcp__convex__run
  function: "academyCourses:createCourseSectionWithElements"
  args: {
    "courseId": "MASTERCLASS_ID",
    "name": "Comandos y Flujo de Trabajo",
    "elements": [
      { "type": "video", "title": "Comandos esenciales del CLI", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "12:20", "isPreview": true },
      { "type": "video", "title": "Gestión de contexto y memoria", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "9:55", "isPreview": false },
      { "type": "video", "title": "Slash commands avanzados", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "7:30", "isPreview": false },
      { "type": "video", "title": "Flujo de trabajo profesional", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "11:05", "isPreview": false }
    ]
  }
```

- [ ] **Step 8: Create masterclass Section 3**

```
mcp__convex__run
  function: "academyCourses:createCourseSectionWithElements"
  args: {
    "courseId": "MASTERCLASS_ID",
    "name": "Agentes y Automatización",
    "elements": [
      { "type": "video", "title": "Qué son los agentes en Claude Code", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "14:22", "isPreview": true },
      { "type": "video", "title": "Creando tu primer agente", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "16:40", "isPreview": false },
      { "type": "video", "title": "MCP servers desde Claude Code", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "18:15", "isPreview": false },
      { "type": "video", "title": "Automatización de tareas repetitivas", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "13:50", "isPreview": false }
    ]
  }
```

- [ ] **Step 9: Create masterclass Section 4**

```
mcp__convex__run
  function: "academyCourses:createCourseSectionWithElements"
  args: {
    "courseId": "MASTERCLASS_ID",
    "name": "Casos Avanzados y Deploy",
    "elements": [
      { "type": "video", "title": "Deploy completo con Vercel", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "10:30", "isPreview": false },
      { "type": "video", "title": "GitHub Actions desde Claude Code", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "9:20", "isPreview": false },
      { "type": "video", "title": "Proyecto final: App full-stack con IA", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "25:15", "isPreview": false }
    ]
  }
```

- [ ] **Step 10: Create 10 additional courses**

Run `academyCourses:createCourse` for each. Capture each returned ID to add sections next.

**Course A — Python para Principiantes (free, premium)**
```
args: { "name": "Python para Principiantes", "youtubeUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "youtubeVideoId": "kJQP7kiw5Fk", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Aprende Python desde cero con ejercicios prácticos.", "price": 0, "currency": "eur", "includedInPremium": true }
```

**Course B — Git y GitHub desde Cero (free, premium)**
```
args: { "name": "Git y GitHub desde Cero", "youtubeUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "youtubeVideoId": "fJ9rUzIMcZQ", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Control de versiones profesional con Git y GitHub.", "price": 0, "currency": "eur", "includedInPremium": true }
```

**Course C — JavaScript Moderno ES2024 (€9.99, premium)**
```
args: { "name": "JavaScript Moderno ES2024", "youtubeUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "youtubeVideoId": "9bZkp7q19f0", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Domina las últimas características de JavaScript.", "price": 999, "currency": "eur", "includedInPremium": true }
```

**Course D — React Fundamentos (€9.99, premium)**
```
args: { "name": "React Fundamentos", "youtubeUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "youtubeVideoId": "JGwWNGJdvx8", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Construye interfaces modernas con React y hooks.", "price": 999, "currency": "eur", "includedInPremium": true }
```

**Course E — Node.js y Express (€9.99, premium)**
```
args: { "name": "Node.js y Express", "youtubeUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "youtubeVideoId": "OPf0YbXqDm0", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Backend con Node.js y APIs REST con Express.", "price": 999, "currency": "eur", "includedInPremium": true }
```

**Course F — TypeScript Completo (€14.99, premium)**
```
args: { "name": "TypeScript Completo", "youtubeUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "youtubeVideoId": "CevxZvSJLk8", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Tipado estático para JavaScript moderno y escalable.", "price": 1499, "currency": "eur", "includedInPremium": true }
```

**Course G — Next.js App Router (€14.99, premium)**
```
args: { "name": "Next.js App Router", "youtubeUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "youtubeVideoId": "RgKAFK5djSk", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Desarrollo full-stack con Next.js 15 y App Router.", "price": 1499, "currency": "eur", "includedInPremium": true }
```

**Course H — Bases de Datos con PostgreSQL (€14.99, premium)**
```
args: { "name": "Bases de Datos con PostgreSQL", "youtubeUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "youtubeVideoId": "YR5ApYxkU-U", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "SQL y PostgreSQL desde cero hasta nivel avanzado.", "price": 1499, "currency": "eur", "includedInPremium": true }
```

**Course I — Docker y Contenedores (€29.99, NOT premium)**
```
args: { "name": "Docker y Contenedores", "youtubeUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "youtubeVideoId": "7PCkvCPvDXk", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Containerización profesional con Docker y Docker Compose.", "price": 2999, "currency": "eur", "includedInPremium": false }
```

**Course J — Arquitectura de Microservicios (€29.99, NOT premium)**
```
args: { "name": "Arquitectura de Microservicios", "youtubeUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "youtubeVideoId": "pRpeEdMmmQ0", "languageId": "LANGUAGE_ID", "instructorId": "INSTRUCTOR_ID", "description": "Diseña y escala sistemas distribuidos con microservicios.", "price": 2999, "currency": "eur", "includedInPremium": false }
```

- [ ] **Step 11: Add sections to the 10 additional courses**

For each course, use `academyCourses:createCourseSectionWithElements`. Use the IDs captured in Step 10.

**Course A (Python) — 1 section:**
```
args: { "courseId": "COURSE_A_ID", "name": "Fundamentos de Python", "elements": [
  { "type": "video", "title": "Variables y tipos de datos", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "8:10", "isPreview": true },
  { "type": "video", "title": "Condicionales y bucles", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "9:45", "isPreview": false },
  { "type": "video", "title": "Funciones y módulos", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "11:20", "isPreview": false },
  { "type": "video", "title": "Listas, dicts y sets", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "10:05", "isPreview": false },
  { "type": "video", "title": "Proyecto: calculadora CLI", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "14:30", "isPreview": false }
] }
```

**Course B (Git) — 1 section:**
```
args: { "courseId": "COURSE_B_ID", "name": "Control de Versiones con Git", "elements": [
  { "type": "video", "title": "Init, add y commit", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "7:20", "isPreview": true },
  { "type": "video", "title": "Branches y merges", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "9:15", "isPreview": false },
  { "type": "video", "title": "Pull requests en GitHub", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "8:40", "isPreview": false },
  { "type": "video", "title": "Git Flow profesional", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "12:10", "isPreview": false }
] }
```

**Course C (JavaScript) — 2 sections:**
```
# Section 1
args: { "courseId": "COURSE_C_ID", "name": "JS Fundamentos", "elements": [
  { "type": "video", "title": "Variables, let y const", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "6:30", "isPreview": true },
  { "type": "video", "title": "Arrow functions", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "7:45", "isPreview": false },
  { "type": "video", "title": "Destructuring y spread", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "8:55", "isPreview": false },
  { "type": "video", "title": "Promises y async/await", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "11:20", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_C_ID", "name": "JS Avanzado", "elements": [
  { "type": "video", "title": "Módulos ES2024", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "9:10", "isPreview": false },
  { "type": "video", "title": "Proxy y Reflect", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "10:30", "isPreview": false },
  { "type": "video", "title": "Web Workers y performance", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "12:45", "isPreview": false }
] }
```

**Course D (React) — 2 sections:**
```
# Section 1
args: { "courseId": "COURSE_D_ID", "name": "Componentes y Props", "elements": [
  { "type": "video", "title": "JSX y componentes funcionales", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "8:15", "isPreview": true },
  { "type": "video", "title": "Props y prop types", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "7:40", "isPreview": false },
  { "type": "video", "title": "Children y composition", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "9:20", "isPreview": false },
  { "type": "video", "title": "Listas y keys", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "6:55", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_D_ID", "name": "Hooks y Estado", "elements": [
  { "type": "video", "title": "useState y ciclo de vida", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "11:30", "isPreview": false },
  { "type": "video", "title": "useEffect y efectos secundarios", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "13:15", "isPreview": false },
  { "type": "video", "title": "useContext y estado global", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "10:45", "isPreview": false }
] }
```

**Course E (Node.js) — 2 sections:**
```
# Section 1
args: { "courseId": "COURSE_E_ID", "name": "Node.js Básico", "elements": [
  { "type": "video", "title": "Módulos y require", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "8:30", "isPreview": true },
  { "type": "video", "title": "File system y streams", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "10:20", "isPreview": false },
  { "type": "video", "title": "Events y EventEmitter", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "9:15", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_E_ID", "name": "Express y APIs REST", "elements": [
  { "type": "video", "title": "Rutas y middleware", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "11:40", "isPreview": false },
  { "type": "video", "title": "Manejo de errores", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "8:55", "isPreview": false },
  { "type": "video", "title": "CRUD completo con Express", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "16:10", "isPreview": false },
  { "type": "video", "title": "Autenticación JWT", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "14:25", "isPreview": false }
] }
```

**Course F (TypeScript) — 3 sections:**
```
# Section 1
args: { "courseId": "COURSE_F_ID", "name": "Tipos e Interfaces", "elements": [
  { "type": "video", "title": "Tipos primitivos y unions", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "7:50", "isPreview": true },
  { "type": "video", "title": "Interfaces y type aliases", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "9:30", "isPreview": false },
  { "type": "video", "title": "Generics básicos", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "11:15", "isPreview": false },
  { "type": "video", "title": "Enums y namespaces", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "8:40", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_F_ID", "name": "TypeScript Avanzado", "elements": [
  { "type": "video", "title": "Mapped types y conditional types", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "12:30", "isPreview": false },
  { "type": "video", "title": "Decorators", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "10:20", "isPreview": false },
  { "type": "video", "title": "tsconfig avanzado", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "9:05", "isPreview": false }
] }
# Section 3
args: { "courseId": "COURSE_F_ID", "name": "TypeScript en React", "elements": [
  { "type": "video", "title": "Tipado de componentes", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "8:45", "isPreview": false },
  { "type": "video", "title": "Hooks tipados", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "10:10", "isPreview": false },
  { "type": "video", "title": "Proyecto: app tipada completa", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "18:30", "isPreview": false }
] }
```

**Course G (Next.js) — 3 sections:**
```
# Section 1
args: { "courseId": "COURSE_G_ID", "name": "App Router Fundamentos", "elements": [
  { "type": "video", "title": "Estructura de carpetas", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "7:20", "isPreview": true },
  { "type": "video", "title": "Layouts anidados", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "9:45", "isPreview": false },
  { "type": "video", "title": "Rutas dinámicas", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "8:30", "isPreview": false },
  { "type": "video", "title": "Route handlers y API", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "11:15", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_G_ID", "name": "Server Components", "elements": [
  { "type": "video", "title": "Client vs Server components", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "10:40", "isPreview": false },
  { "type": "video", "title": "Streaming y Suspense", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "9:20", "isPreview": false },
  { "type": "video", "title": "Data fetching patterns", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "12:50", "isPreview": false }
] }
# Section 3
args: { "courseId": "COURSE_G_ID", "name": "Deploy y Optimización", "elements": [
  { "type": "video", "title": "next/image y next/font", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "8:15", "isPreview": false },
  { "type": "video", "title": "Metadata y SEO", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "7:30", "isPreview": false },
  { "type": "video", "title": "Deploy en Vercel", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "10:05", "isPreview": false }
] }
```

**Course H (PostgreSQL) — 2 sections:**
```
# Section 1
args: { "courseId": "COURSE_H_ID", "name": "SQL Fundamental", "elements": [
  { "type": "video", "title": "SELECT, WHERE y JOIN", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "11:20", "isPreview": true },
  { "type": "video", "title": "INSERT, UPDATE y DELETE", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "9:15", "isPreview": false },
  { "type": "video", "title": "Índices y optimización", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "13:40", "isPreview": false },
  { "type": "video", "title": "Transacciones y ACID", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "10:55", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_H_ID", "name": "PostgreSQL Avanzado", "elements": [
  { "type": "video", "title": "JSON y JSONB", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "12:10", "isPreview": false },
  { "type": "video", "title": "Full-text search", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "9:30", "isPreview": false },
  { "type": "video", "title": "Particionado y escalado", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "11:45", "isPreview": false },
  { "type": "video", "title": "Backup y replicación", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "10:20", "isPreview": false }
] }
```

**Course I (Docker) — 3 sections:**
```
# Section 1
args: { "courseId": "COURSE_I_ID", "name": "Docker Básico", "elements": [
  { "type": "video", "title": "Imágenes y contenedores", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "9:30", "isPreview": true },
  { "type": "video", "title": "Dockerfile desde cero", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "11:15", "isPreview": false },
  { "type": "video", "title": "Volumes y redes", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "10:40", "isPreview": false },
  { "type": "video", "title": "Docker Hub y registries", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "8:25", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_I_ID", "name": "Docker Compose", "elements": [
  { "type": "video", "title": "compose.yml básico", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "10:50", "isPreview": false },
  { "type": "video", "title": "Multi-container apps", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "13:20", "isPreview": false },
  { "type": "video", "title": "Healthchecks y dependencias", "contentUrl": "https://www.youtube.com/watch?v=CevxZvSJLk8", "durationLabel": "9:05", "isPreview": false }
] }
# Section 3
args: { "courseId": "COURSE_I_ID", "name": "Docker en Producción", "elements": [
  { "type": "video", "title": "Multi-stage builds", "contentUrl": "https://www.youtube.com/watch?v=RgKAFK5djSk", "durationLabel": "11:30", "isPreview": false },
  { "type": "video", "title": "Seguridad en contenedores", "contentUrl": "https://www.youtube.com/watch?v=YR5ApYxkU-U", "durationLabel": "10:15", "isPreview": false },
  { "type": "video", "title": "Monitoreo con Prometheus", "contentUrl": "https://www.youtube.com/watch?v=7PCkvCPvDXk", "durationLabel": "12:40", "isPreview": false }
] }
```

**Course J (Microservicios) — 3 sections:**
```
# Section 1
args: { "courseId": "COURSE_J_ID", "name": "Principios de Microservicios", "elements": [
  { "type": "video", "title": "Monolito vs microservicios", "contentUrl": "https://www.youtube.com/watch?v=pRpeEdMmmQ0", "durationLabel": "10:20", "isPreview": true },
  { "type": "video", "title": "Domain-driven design", "contentUrl": "https://www.youtube.com/watch?v=AJtDXIazrMo", "durationLabel": "14:30", "isPreview": false },
  { "type": "video", "title": "APIs y contratos", "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "durationLabel": "11:05", "isPreview": false }
] }
# Section 2
args: { "courseId": "COURSE_J_ID", "name": "Implementación Práctica", "elements": [
  { "type": "video", "title": "Service mesh con Istio", "contentUrl": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "durationLabel": "15:40", "isPreview": false },
  { "type": "video", "title": "Message queues con RabbitMQ", "contentUrl": "https://www.youtube.com/watch?v=kJQP7kiw5Fk", "durationLabel": "13:25", "isPreview": false },
  { "type": "video", "title": "API Gateway pattern", "contentUrl": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ", "durationLabel": "11:50", "isPreview": false },
  { "type": "video", "title": "Circuit breaker y resiliencia", "contentUrl": "https://www.youtube.com/watch?v=9bZkp7q19f0", "durationLabel": "12:15", "isPreview": false }
] }
# Section 3
args: { "courseId": "COURSE_J_ID", "name": "Escalado y Monitoreo", "elements": [
  { "type": "video", "title": "Kubernetes básico", "contentUrl": "https://www.youtube.com/watch?v=JGwWNGJdvx8", "durationLabel": "16:30", "isPreview": false },
  { "type": "video", "title": "Observabilidad y trazas", "contentUrl": "https://www.youtube.com/watch?v=OPf0YbXqDm0", "durationLabel": "13:10", "isPreview": false },
  { "type": "video", "title": "CI/CD para microservicios", "contentUrl": "https://www.youtube.com/watch?v=09R8_2nJtjg", "durationLabel": "14:45", "isPreview": false }
] }
```

- [ ] **Step 12: Add 6 Academy shorts**

```
mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "AJtDXIazrMo", "title": "Tips de Claude Code: cómo usar el contexto", "section": "academy", "order": 1 }

mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "dQw4w9WgXcQ", "title": "¿Qué es un agente de IA en 60 segundos?", "section": "academy", "order": 2 }

mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "jfKfPfyJRdk", "title": "3 comandos de Claude Code que debes conocer", "section": "academy", "order": 3 }

mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "9bZkp7q19f0", "title": "JavaScript vs TypeScript en 60 segundos", "section": "academy", "order": 4 }

mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "JGwWNGJdvx8", "title": "React Server Components explicados rápido", "section": "academy", "order": 5 }

mcp__convex__run function="youtubeShorts:create"
  args: { "videoId": "OPf0YbXqDm0", "title": "Docker en 1 minuto: contenedores para todos", "section": "academy", "order": 6 }
```

No commit needed — data is in Convex cloud.

---

## Task 3: `CourseCard` component

**Files:**
- Create: `src/components/elements/academy/course-card.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export type CourseWithAccess = {
  _id: string;
  name: string;
  youtubeVideoId: string;
  price?: number;
  currency?: string;
  includedInPremium?: boolean;
  instructorName: string | null;
  slug: string;
  hasAccess: boolean;
};

const RATINGS = [4.7, 4.8, 4.9] as const;

function formatPrice(price?: number): string {
  if (!price || price === 0) return "Gratis";
  return `€${(price / 100).toFixed(2)}`;
}

export function CourseCard({ course }: { course: CourseWithAccess }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const isStarCourse = course.slug === "claude-code-masterclass";
  const rating = RATINGS[course._id.length % 3];
  const priceDisplay = formatPrice(course.price);

  const badgeLabel = isStarCourse
    ? "Curso Estrella"
    : !course.price || course.price === 0
    ? "Gratis"
    : course.includedInPremium
    ? "Incluido en Premium"
    : "Bestseller";

  const ctaHref = course.hasAccess
    ? `/${locale}/account/courses/${course.slug}`
    : `/${locale}/academy/courses/${course.slug}`;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200",
        isStarCourse && "ring-2 ring-primary"
      )}
    >
      {/* Thumbnail */}
      <Link href={ctaHref} className="relative block aspect-video bg-muted overflow-hidden">
        <Image
          src={`https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`}
          alt={course.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <Badge
          variant={isStarCourse ? "default" : course.includedInPremium ? "secondary" : "outline"}
          className="w-fit text-xs"
        >
          {isStarCourse ? "⭐ " : ""}{badgeLabel}
        </Badge>

        <Link href={ctaHref} className="hover:underline">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{course.name}</h3>
        </Link>

        {course.instructorName && (
          <p className="text-xs text-muted-foreground">{course.instructorName}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold text-amber-500">{rating}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className={cn(
              "text-sm font-bold",
              (!course.price || course.price === 0) && "text-primary"
            )}
          >
            {priceDisplay}
          </span>
          <Button
            asChild
            size="sm"
            variant={course.hasAccess ? "default" : "outline"}
            className="text-xs h-7 px-3"
          >
            <Link href={ctaHref}>
              {course.hasAccess ? "Ver curso" : "Ver detalles"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/elements/academy/course-card.tsx
git commit -m "feat(academy): add CourseCard component"
```

---

## Task 4: `AcademyCoursesGrid` component

**Files:**
- Create: `src/components/elements/academy/academy-courses-grid.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard, type CourseWithAccess } from "./course-card";

interface AcademyCoursesGridProps {
  courses: CourseWithAccess[] | undefined;
}

export function AcademyCoursesGrid({ courses }: AcademyCoursesGridProps) {
  if (courses === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No hay cursos disponibles.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/elements/academy/academy-courses-grid.tsx
git commit -m "feat(academy): add AcademyCoursesGrid component"
```

---

## Task 5: `AcademyMasterclassSidebar` component

**Files:**
- Create: `src/components/elements/academy/academy-masterclass-sidebar.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Infinity as InfinityIcon,
  PlayCircle,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CourseWithAccess } from "./course-card";

interface AcademyMasterclassSidebarProps {
  // undefined = loading, null = not found, CourseWithAccess = loaded
  masterclass: CourseWithAccess | null | undefined;
}

export function AcademyMasterclassSidebar({
  masterclass,
}: AcademyMasterclassSidebarProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  if (masterclass === undefined) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  if (masterclass === null) return null;

  const courseUrl = masterclass.hasAccess
    ? `/${locale}/account/courses/${masterclass.slug}`
    : `/${locale}/academy/courses/${masterclass.slug}`;

  return (
    <Card className="overflow-hidden border-border/70 bg-background/95">
      {/* Thumbnail */}
      <Link
        href={courseUrl}
        className="group relative block aspect-video bg-muted overflow-hidden"
      >
        <Image
          src={`https://i.ytimg.com/vi/${masterclass.youtubeVideoId}/hqdefault.jpg`}
          alt="Claude Code Masterclass"
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="320px"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background/80">
            <PlayCircle className="size-8" />
          </div>
        </div>
      </Link>

      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <Badge variant="destructive" className="text-xs">
            No incluido en Premium
          </Badge>
          <h3 className="font-bold text-base leading-tight">
            Claude Code Masterclass
          </h3>
          <p className="text-xs text-muted-foreground">
            Domina el desarrollo con IA desde cero hasta producción
          </p>
        </div>

        <div className="text-3xl font-extrabold">€199</div>

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <BookOpen className="size-3.5 shrink-0" /> 4 secciones completas
          </li>
          <li className="flex items-center gap-2">
            <Video className="size-3.5 shrink-0" /> 14 videos HD
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" /> +3 horas de contenido
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap className="size-3.5 shrink-0" /> Certificado incluido
          </li>
          <li className="flex items-center gap-2">
            <InfinityIcon className="size-3.5 shrink-0" /> Acceso de por vida
          </li>
        </ul>

        <Button asChild className="w-full">
          <Link href={courseUrl}>
            {masterclass.hasAccess ? "Ver curso" : "Comprar ahora"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/elements/academy/academy-masterclass-sidebar.tsx
git commit -m "feat(academy): add AcademyMasterclassSidebar component"
```

---

## Task 6: `AcademyLayout` component

**Files:**
- Create: `src/components/elements/academy/academy-layout.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { YouTubeShorts } from "@/components/elements/home/youtube-shorts";
import { api } from "#convex/_generated/api";
import { useQuery } from "convex/react";
import { AcademyCoursesGrid } from "./academy-courses-grid";
import { AcademyMasterclassSidebar } from "./academy-masterclass-sidebar";
import type { CourseWithAccess } from "./course-card";

export function AcademyLayout() {
  const courses = useQuery(api.academyCourses.getAcademyCoursesWithAccess);

  // undefined = loading, null = not found, value = loaded
  const masterclass: CourseWithAccess | null | undefined = courses
    ? (courses.find((c) => c.slug === "claude-code-masterclass") ?? null)
    : undefined;

  return (
    <div className="flex min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 py-6 space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-4">Shorts de la Academia</h2>
          <YouTubeShorts page="academy" />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6">Todos los cursos</h2>
          <AcademyCoursesGrid courses={courses} />
        </section>
      </div>

      {/* Sticky right sidebar — desktop only */}
      <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 px-4 py-6">
        <div className="sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Curso Estrella
          </p>
          <AcademyMasterclassSidebar masterclass={masterclass} />
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/elements/academy/academy-layout.tsx
git commit -m "feat(academy): add AcademyLayout component"
```

---

## Task 7: Academy page route

**Files:**
- Create: `src/app/[locale]/(root)/(main)/academy/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import MainLayout from "@/components/elements/layouts/main-layout";
import { AcademyLayout } from "@/components/elements/academy/academy-layout";

export default function AcademyPage() {
  return (
    <MainLayout hideSidebar>
      <AcademyLayout />
    </MainLayout>
  );
}
```

- [ ] **Step 2: Verify page loads at `/[locale]/academy`**

Start dev server if not running:
```bash
pnpm dev
```

Navigate to `http://localhost:3000/en/academy` (or the locale in use).

Expected:
- Page loads without errors
- Shorts section visible (or empty if no shorts seeded yet)
- Course grid shows skeletons then loads courses
- Sticky sidebar shows masterclass card on desktop (`lg+`)
- On mobile, sidebar is hidden

- [ ] **Step 3: Verify access logic**

| Scenario | Expected CourseCard CTA |
|---|---|
| Not logged in, any course | "Ver detalles" |
| Premium user, `includedInPremium: true` course | "Ver curso" |
| Premium user, masterclass (`includedInPremium: false`) | "Ver detalles" |
| User enrolled in any course | "Ver curso" |
| Masterclass sidebar, not purchased | "Comprar ahora" |
| Masterclass sidebar, purchased | "Ver curso" |

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/(root)/(main)/academy/page.tsx
git commit -m "feat(academy): add academy listing page with shorts, courses grid, and masterclass sidebar"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Shorts ✓, 4-col grid ✓, sidebar ✓, `includedInPremium` on existing courses ✓, masterclass at €199 ✓, 10+ courses seeded ✓, "Ver curso" button logic ✓, player premium access ✓
- [x] **Placeholders:** None
- [x] **Type consistency:** `CourseWithAccess` defined once in `course-card.tsx`, imported by grid and layout. `masterclass` typed as `CourseWithAccess | null | undefined` throughout.
- [x] **Access logic:** `hasAccess = enrolled || (isPremium && includedInPremium)` consistent in Convex query and UI
