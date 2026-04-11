# Obsidian Vault Integration Design

**Date:** 2026-04-11  
**Status:** Approved  
**Author:** Martin Silva Molina

---

## Overview

Integrate the `obsidian/` folder as the primary documentation and memory store for the project. Claude uses GitNexus MCP tools to generate and maintain structured Markdown notes in the vault. Two explicit commands trigger updates; auto-documentation runs after significant decisions or completed features.

---

## Folder Structure

```
obsidian/
  _index.md              ← master entry point, links to all notes
  architecture/
    overview.md          ← codebase layers, stack, high-level deps
    modules.md           ← all modules with dependency list
    convex.md            ← Convex backend: tables, functions, patterns
    frontend.md          ← Next.js: routes, key components
  flows/
    auth-flow.md
    api-flow.md
    convex-query-flow.md
    [flow-name].md       ← one note per execution flow
  features/
    academy.md
    admin.md
    [feature].md         ← one note per feature/page
  decisions/
    YYYY-MM-DD-[topic].md  ← ADR format
  progress/
    milestones.md
    [feature]-status.md
  notes/                 ← ad-hoc, no fixed structure
```

---

## Note Format

Every note uses YAML frontmatter and `[[wiki-links]]` for Obsidian graph view:

```yaml
---
title: "Note Title"
type: architecture | flow | feature | decision | progress | note
updated: YYYY-MM-DD
tags: [convex, frontend, auth]
---
```

Notes in `architecture/`, `flows/`, and `features/` cross-link with `[[wiki-links]]`.  
Example: `architecture/convex.md` links to `[[flows/convex-query-flow]]`.

---

## Commands

### "update obsidian map" / "actualiza el mapa"

Claude executes this pipeline:
1. Run `npx gitnexus analyze` — refresh the knowledge graph
2. Query GitNexus MCP tools: `gitnexus_query`, `gitnexus_context`, architecture overview, execution flows
3. Regenerate/overwrite notes in `architecture/`, `flows/`, `features/`
4. Update `updated:` field in frontmatter of changed notes
5. Update `_index.md` if new notes were added

**Rules:**
- Never deletes existing notes — only overwrites GitNexus-generated ones
- Notes in `decisions/`, `progress/`, `notes/` are never touched by this command
- Reports list of updated files when done

### "save to obsidian: [content]" / "guarda en obsidian"

Claude determines the correct folder and filename:
- Architectural decision → `decisions/YYYY-MM-DD-[topic].md`
- Feature status/progress → `progress/[feature]-status.md`
- Ad-hoc note → `notes/YYYY-MM-DD-[topic].md`

After writing:
- Adds link to `_index.md`
- Reports the full path: *"Saved to obsidian/decisions/..."*

---

## Auto-Documentation

Claude writes to Obsidian automatically (without being asked) when:
- A significant architectural decision is made during a work session
- A new feature is completed (adds entry to `progress/`)
- Something non-obvious about the codebase is discovered

Always notifies with the saved path.

---

## CLAUDE.md / AGENTS.md Updates

Add an **"Obsidian Vault"** section to both files describing:
- What `obsidian/` is (primary project memory)
- Folder structure reference
- Both commands and their behavior
- Note format (frontmatter + wiki-links)
- Auto-documentation triggers

This ensures all agents (current and future) understand the vault without needing to ask.

---

## Out of Scope

- Obsidian plugin installation (user manages Obsidian app separately)
- Real-time sync or watch mode (on-demand only)
- Obsidian Publish / Sync cloud features
