# Obsidian Vault Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up `obsidian/` as the primary project memory — structured vault with GitNexus-generated architecture/flows/features notes, plus protocol rules in CLAUDE.md and AGENTS.md so Claude always knows what "save to obsidian" means.

**Architecture:** Claude reads GitNexus MCP resources (context, clusters, processes) and writes structured Markdown notes into folder-based vault. Wiki-links connect notes for Obsidian graph view. Two explicit commands (`update obsidian map`, `save to obsidian`) trigger updates; CLAUDE.md/AGENTS.md define the protocol so any agent session understands it.

**Tech Stack:** GitNexus MCP tools, Obsidian Markdown + YAML frontmatter, wiki-links `[[note]]`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `obsidian/_index.md` | Master entry point, links to all notes |
| Create | `obsidian/architecture/overview.md` | Stack, layers, high-level deps |
| Create | `obsidian/architecture/modules.md` | All modules with dependency list |
| Create | `obsidian/architecture/convex.md` | Convex backend: tables, functions, patterns |
| Create | `obsidian/architecture/frontend.md` | Next.js routes and key components |
| Create | `obsidian/flows/auth-flow.md` | Auth execution flow |
| Create | `obsidian/flows/api-flow.md` | API/VPS proxy flow |
| Create | `obsidian/flows/convex-query-flow.md` | Convex query/mutation flow |
| Create | `obsidian/features/academy.md` | Academy feature |
| Create | `obsidian/features/admin.md` | Admin feature |
| Create | `obsidian/progress/milestones.md` | Project milestones tracker |
| Create | `obsidian/decisions/.gitkeep` | Placeholder for future ADRs |
| Create | `obsidian/notes/.gitkeep` | Placeholder for ad-hoc notes |
| Modify | `AGENTS.md` | Add Obsidian Vault section |
| Modify | `CLAUDE.md` | Add Obsidian Vault section |

---

### Task 1: Create folder structure

**Files:**
- Create: `obsidian/architecture/` (dir)
- Create: `obsidian/flows/` (dir)
- Create: `obsidian/features/` (dir)
- Create: `obsidian/decisions/.gitkeep`
- Create: `obsidian/notes/.gitkeep`
- Create: `obsidian/progress/` (dir)

- [ ] **Step 1: Create all subdirectories and placeholder files**

Run from project root (`/Users/martinmacmini/00-NuevasApps/nextjs-themariscal-website-2026`):

```bash
mkdir -p obsidian/architecture obsidian/flows obsidian/features obsidian/decisions obsidian/notes obsidian/progress
touch obsidian/decisions/.gitkeep obsidian/notes/.gitkeep
```

- [ ] **Step 2: Verify structure**

```bash
find obsidian -not -path 'obsidian/.obsidian*' | sort
```

Expected output:
```
obsidian/
obsidian/architecture
obsidian/decisions
obsidian/decisions/.gitkeep
obsidian/features
obsidian/flows
obsidian/notes
obsidian/notes/.gitkeep
obsidian/progress
```

- [ ] **Step 3: Commit**

```bash
git add obsidian/architecture obsidian/flows obsidian/features obsidian/decisions obsidian/notes obsidian/progress
git commit -m "chore: scaffold obsidian vault folder structure"
```

---

### Task 2: Generate architecture notes from GitNexus

**Files:**
- Create: `obsidian/architecture/overview.md`
- Create: `obsidian/architecture/modules.md`
- Create: `obsidian/architecture/convex.md`
- Create: `obsidian/architecture/frontend.md`

- [ ] **Step 1: Refresh the GitNexus index**

```bash
npx gitnexus analyze
```

Expected: index updated with current symbols/relationships count.

- [ ] **Step 2: Read codebase context from GitNexus**

Use MCP tool:
```
READ gitnexus://repo/claude-obsidian/context
```

This returns codebase overview including: total symbols, relationships, execution flows, freshness date, and cluster summary.

- [ ] **Step 3: Read all clusters (functional areas)**

Use MCP tool:
```
READ gitnexus://repo/claude-obsidian/clusters
```

Returns list of all functional clusters with their symbols.

- [ ] **Step 4: Write `obsidian/architecture/overview.md`**

Using data from Steps 2-3, write the file with this structure:

```markdown
---
title: "Architecture Overview"
type: architecture
updated: YYYY-MM-DD
tags: [architecture, stack, overview]
---

# Architecture Overview

## Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** [from GitNexus context]
- **Hosting:** Vercel

## Layers
[Derived from clusters — describe each functional layer]

## Key Dependencies
[Top-level module dependencies from GitNexus context]

## Related Notes
- [[architecture/modules]]
- [[architecture/convex]]
- [[architecture/frontend]]
```

Replace `[from GitNexus context]` and `[Derived from clusters...]` with actual content from the MCP responses.

- [ ] **Step 5: Query modules and dependencies**

Use MCP tool:
```
gitnexus_query({query: "module imports dependencies"})
```

Also run:
```
gitnexus_query({query: "component structure layout"})
```

- [ ] **Step 6: Write `obsidian/architecture/modules.md`**

```markdown
---
title: "Modules"
type: architecture
updated: YYYY-MM-DD
tags: [architecture, modules, dependencies]
---

# Modules

## [Module Name]
- **Path:** `src/...`
- **Purpose:** [from GitNexus]
- **Depends on:** [[architecture/convex]], ...
- **Used by:** [callers from GitNexus]

[Repeat for each major cluster/module]

## Related Notes
- [[architecture/overview]]
- [[architecture/convex]]
- [[architecture/frontend]]
```

- [ ] **Step 7: Query Convex-specific symbols**

Use MCP tool:
```
gitnexus_query({query: "convex database tables mutations queries"})
```

- [ ] **Step 8: Write `obsidian/architecture/convex.md`**

```markdown
---
title: "Convex Backend"
type: architecture
updated: YYYY-MM-DD
tags: [convex, backend, database]
---

# Convex Backend

## Tables
[List all Convex tables from GitNexus]

## Queries
[List public queries with brief description]

## Mutations
[List public mutations with brief description]

## Actions
[List actions if any]

## Patterns
- Always read `convex/_generated/ai/guidelines.md` before editing Convex code
- [Other patterns from GitNexus context]

## Related Notes
- [[architecture/overview]]
- [[flows/convex-query-flow]]
```

- [ ] **Step 9: Query Next.js frontend symbols**

Use MCP tool:
```
gitnexus_query({query: "Next.js pages routes components layout"})
```

- [ ] **Step 10: Write `obsidian/architecture/frontend.md`**

```markdown
---
title: "Frontend"
type: architecture
updated: YYYY-MM-DD
tags: [frontend, nextjs, components]
---

# Frontend

## Routes
[List all app router routes from GitNexus]

## Key Components
[List major components with their purpose]

## Layouts
[Root layout, admin layout, etc.]

## Related Notes
- [[architecture/overview]]
- [[architecture/modules]]
- [[features/academy]]
- [[features/admin]]
```

- [ ] **Step 11: Commit**

```bash
git add obsidian/architecture/
git commit -m "docs(obsidian): add architecture notes from GitNexus"
```

---

### Task 3: Generate execution flow notes

**Files:**
- Create: `obsidian/flows/auth-flow.md`
- Create: `obsidian/flows/api-flow.md`
- Create: `obsidian/flows/convex-query-flow.md`

- [ ] **Step 1: Read all execution flows**

Use MCP tool:
```
READ gitnexus://repo/claude-obsidian/processes
```

Returns list of all 9 execution flow names.

- [ ] **Step 2: Read auth flow detail**

Use MCP tool (replace `{processName}` with the actual auth process name from Step 1):
```
READ gitnexus://repo/claude-obsidian/process/{auth-process-name}
```

- [ ] **Step 3: Write `obsidian/flows/auth-flow.md`**

```markdown
---
title: "Auth Flow"
type: flow
updated: YYYY-MM-DD
tags: [auth, flow, security]
---

# Auth Flow

## Steps
[Step-by-step execution trace from GitNexus process resource]

## Key Functions
[Functions involved, with file paths]

## Entry Points
[Where auth is triggered]

## Related Notes
- [[architecture/overview]]
- [[architecture/frontend]]
```

- [ ] **Step 4: Read API/VPS proxy flow**

Use MCP tool (replace with actual process name for API/VPS flow):
```
READ gitnexus://repo/claude-obsidian/process/{api-process-name}
```

Also query:
```
gitnexus_query({query: "VPS proxy API route"})
```

- [ ] **Step 5: Write `obsidian/flows/api-flow.md`**

```markdown
---
title: "API Flow"
type: flow
updated: YYYY-MM-DD
tags: [api, proxy, vps, flow]
---

# API Flow

## VPS Proxy
[How /api/vps/[...path] works — from GitNexus]

## Steps
[Step-by-step trace]

## Path Allowlist
[Security validation logic]

## Related Notes
- [[architecture/overview]]
- [[architecture/modules]]
```

- [ ] **Step 6: Read Convex query flow**

Use MCP tool:
```
READ gitnexus://repo/claude-obsidian/process/{convex-query-process-name}
```

Also:
```
gitnexus_query({query: "useQuery useMutation convex client"})
```

- [ ] **Step 7: Write `obsidian/flows/convex-query-flow.md`**

```markdown
---
title: "Convex Query Flow"
type: flow
updated: YYYY-MM-DD
tags: [convex, query, mutation, flow]
---

# Convex Query Flow

## Client → Convex
[How frontend calls Convex from GitNexus]

## Steps
[Step-by-step trace]

## Real-time Subscriptions
[How useQuery subscriptions work]

## Related Notes
- [[architecture/convex]]
- [[architecture/frontend]]
```

- [ ] **Step 8: Commit**

```bash
git add obsidian/flows/
git commit -m "docs(obsidian): add execution flow notes from GitNexus"
```

---

### Task 4: Generate feature notes

**Files:**
- Create: `obsidian/features/academy.md`
- Create: `obsidian/features/admin.md`

- [ ] **Step 1: Query academy feature**

Use MCP tool:
```
gitnexus_query({query: "academy page course pricing rating"})
```

- [ ] **Step 2: Write `obsidian/features/academy.md`**

```markdown
---
title: "Academy"
type: feature
updated: YYYY-MM-DD
tags: [academy, feature, courses]
---

# Academy

## Purpose
[What the academy feature does]

## Routes
- `/academy` — [description]
- `/academy/[slug]` — [description if exists]

## Key Components
[Components from GitNexus]

## Convex Data
[Which tables/queries this feature uses]

## Status
- [x] Initial implementation
- [ ] [Remaining items if any]

## Related Notes
- [[architecture/frontend]]
- [[architecture/convex]]
- [[progress/milestones]]
```

- [ ] **Step 3: Query admin feature**

Use MCP tool:
```
gitnexus_query({query: "admin panel dashboard management"})
```

- [ ] **Step 4: Write `obsidian/features/admin.md`**

```markdown
---
title: "Admin"
type: feature
updated: YYYY-MM-DD
tags: [admin, feature, management]
---

# Admin

## Purpose
[What the admin area does]

## Routes
- `/admin` — [description]
- `/admin/[section]` — [description]

## Layout Rule
Admin pages use centered layout by default. All new admin pages MUST keep content inside a centered, consistent container.

## Key Components
[Components from GitNexus]

## Convex Data
[Which tables/mutations admin uses]

## Status
- [x] Initial implementation

## Related Notes
- [[architecture/frontend]]
- [[architecture/convex]]
```

- [ ] **Step 5: Commit**

```bash
git add obsidian/features/
git commit -m "docs(obsidian): add feature notes from GitNexus"
```

---

### Task 5: Write master index and milestones

**Files:**
- Create: `obsidian/_index.md`
- Create: `obsidian/progress/milestones.md`

- [ ] **Step 1: Write `obsidian/progress/milestones.md`**

```markdown
---
title: "Milestones"
type: progress
updated: 2026-04-11
tags: [progress, milestones, status]
---

# Milestones

## Completed
- [x] Next.js project setup
- [x] Convex backend integration
- [x] Academy page
- [x] Admin area
- [x] VPS proxy API routes
- [x] GitNexus code intelligence
- [x] Obsidian vault integration (2026-04-11)

## In Progress
- [ ] [Add current active features here]

## Backlog
- [ ] [Add backlog items here]

## Related Notes
- [[features/academy]]
- [[features/admin]]
```

- [ ] **Step 2: Write `obsidian/_index.md`**

```markdown
---
title: "Index"
type: note
updated: 2026-04-11
tags: [index, map]
---

# The Mariscal — Project Memory

This vault is the primary documentation and memory for the `nextjs-themariscal-website-2026` project.

## Architecture
- [[architecture/overview]] — Stack, layers, high-level deps
- [[architecture/modules]] — All modules with dependency list
- [[architecture/convex]] — Convex backend: tables, functions, patterns
- [[architecture/frontend]] — Next.js routes and key components

## Execution Flows
- [[flows/auth-flow]] — Authentication flow
- [[flows/api-flow]] — API/VPS proxy flow
- [[flows/convex-query-flow]] — Convex query/mutation flow

## Features
- [[features/academy]] — Academy feature
- [[features/admin]] — Admin area

## Progress
- [[progress/milestones]] — Project milestones and status

## Decisions
ADRs saved here as `decisions/YYYY-MM-DD-[topic].md`

## Notes
Ad-hoc notes saved here as `notes/YYYY-MM-DD-[topic].md`

---
*Last map update: 2026-04-11 — run "update obsidian map" to regenerate architecture/flows/features.*
```

- [ ] **Step 3: Commit**

```bash
git add obsidian/_index.md obsidian/progress/milestones.md
git commit -m "docs(obsidian): add master index and milestones"
```

---

### Task 6: Update AGENTS.md with Obsidian Vault section

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Append Obsidian Vault section to AGENTS.md**

Add this block at the end of `AGENTS.md` (after `<!-- gitnexus:end -->`):

```markdown

<!-- obsidian:start -->
## Obsidian Vault — Project Memory

The `obsidian/` folder is the **primary documentation and memory** for this project. It is an Obsidian vault tracked in git.

### Structure
```
obsidian/
  _index.md          ← master entry point, links to everything
  architecture/      ← stack, modules, Convex backend, frontend
  flows/             ← execution flows (auth, API, Convex queries)
  features/          ← one note per feature/page
  decisions/         ← Architecture Decision Records (ADR format)
  progress/          ← milestones and feature status
  notes/             ← ad-hoc notes
```

### Commands

**"update obsidian map"** / **"actualiza el mapa"**
Claude runs this pipeline:
1. `npx gitnexus analyze` — refresh the knowledge graph
2. Read `gitnexus://repo/claude-obsidian/context`, `clusters`, `processes`
3. Query `gitnexus_query` for architecture, flows, and features detail
4. Regenerate/overwrite notes in `architecture/`, `flows/`, `features/`
5. Update `updated:` frontmatter in changed notes
6. Update `_index.md` if new notes were added
7. Report list of updated files

Never deletes notes. Never touches `decisions/`, `progress/`, `notes/`.

**"save to obsidian: [content]"** / **"guarda en obsidian"** / **"guarda esto en obsidian"**
Claude determines the correct folder:
- Architectural decision → `decisions/YYYY-MM-DD-[topic].md`
- Feature status/progress → `progress/[feature]-status.md`
- Ad-hoc note → `notes/YYYY-MM-DD-[topic].md`

After writing: adds link to `_index.md`, reports the path.

### Note Format

Every generated note uses YAML frontmatter:
```yaml
---
title: "Note Title"
type: architecture | flow | feature | decision | progress | note
updated: YYYY-MM-DD
tags: [relevant, tags]
---
```
Notes use `[[wiki-links]]` to connect related notes for Obsidian graph view.

### Auto-Documentation

Claude writes to Obsidian automatically (without being asked) after:
- A significant architectural decision is made during a work session
- A new feature is completed
- Something non-obvious about the codebase is discovered

Always reports the saved path.
<!-- obsidian:end -->
```

- [ ] **Step 2: Verify the section was added**

```bash
grep -n "obsidian:start" AGENTS.md
```

Expected: line number at end of file.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add Obsidian Vault protocol to AGENTS.md"
```

---

### Task 7: Update CLAUDE.md with Obsidian Vault section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Append Obsidian Vault section to CLAUDE.md**

Add this block at the end of `CLAUDE.md` (after `<!-- gitnexus:end -->`):

```markdown

<!-- obsidian:start -->
## Obsidian Vault — Project Memory

The `obsidian/` folder is the **primary documentation and memory** for this project. It is an Obsidian vault tracked in git.

### Structure
```
obsidian/
  _index.md          ← master entry point, links to everything
  architecture/      ← stack, modules, Convex backend, frontend
  flows/             ← execution flows (auth, API, Convex queries)
  features/          ← one note per feature/page
  decisions/         ← Architecture Decision Records (ADR format)
  progress/          ← milestones and feature status
  notes/             ← ad-hoc notes
```

### Commands

**"update obsidian map"** / **"actualiza el mapa"**
Claude runs this pipeline:
1. `npx gitnexus analyze` — refresh the knowledge graph
2. Read `gitnexus://repo/claude-obsidian/context`, `clusters`, `processes`
3. Query `gitnexus_query` for architecture, flows, and features detail
4. Regenerate/overwrite notes in `architecture/`, `flows/`, `features/`
5. Update `updated:` frontmatter in changed notes
6. Update `_index.md` if new notes were added
7. Report list of updated files

Never deletes notes. Never touches `decisions/`, `progress/`, `notes/`.

**"save to obsidian: [content]"** / **"guarda en obsidian"** / **"guarda esto en obsidian"**
Claude determines the correct folder:
- Architectural decision → `decisions/YYYY-MM-DD-[topic].md`
- Feature status/progress → `progress/[feature]-status.md`
- Ad-hoc note → `notes/YYYY-MM-DD-[topic].md`

After writing: adds link to `_index.md`, reports the path.

### Note Format

Every generated note uses YAML frontmatter:
```yaml
---
title: "Note Title"
type: architecture | flow | feature | decision | progress | note
updated: YYYY-MM-DD
tags: [relevant, tags]
---
```
Notes use `[[wiki-links]]` to connect related notes for Obsidian graph view.

### Auto-Documentation

Claude writes to Obsidian automatically (without being asked) after:
- A significant architectural decision is made during a work session
- A new feature is completed
- Something non-obvious about the codebase is discovered

Always reports the saved path.
<!-- obsidian:end -->
```

- [ ] **Step 2: Verify the section was added**

```bash
grep -n "obsidian:start" CLAUDE.md
```

Expected: line number at end of file.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Obsidian Vault protocol to CLAUDE.md"
```

---

## Self-Review

**Spec coverage check:**
- [x] Folder structure `obsidian/` with all 7 dirs — Tasks 1+5
- [x] Note format with YAML frontmatter + wiki-links — all tasks
- [x] `update obsidian map` command — Tasks 2+3+4 + AGENTS.md/CLAUDE.md protocol
- [x] `save to obsidian` command — AGENTS.md/CLAUDE.md protocol section
- [x] Auto-documentation trigger — AGENTS.md/CLAUDE.md protocol section
- [x] AGENTS.md updated — Task 6
- [x] CLAUDE.md updated — Task 7
- [x] GitNexus pipeline — Tasks 2-4 specify exact MCP calls

**No placeholders:** All steps show exact commands, exact file content templates, exact MCP tool calls. ✓

**Type consistency:** `[[wiki-links]]` format consistent throughout. Frontmatter `type` field values consistent (architecture/flow/feature/decision/progress/note). ✓
