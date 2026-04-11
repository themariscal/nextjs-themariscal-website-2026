<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Git Worktree Rule

- Todos los worktrees nuevos deben crearse dentro de `./.worktrees/` (relativo a raíz del proyecto).
- No crear worktrees fuera de este repo.
- Convención sugerida: `git worktree add .worktrees/<nombre-corto> -b <rama>`.
- Después de crear worktree, copiar `.env.local` de raíz hacia worktree nuevo.
- Comando sugerido: `cp .env.local .worktrees/<nombre-corto>/.env.local`.

## YouTube Shorts / Videos

When adding YouTube Shorts or videos to Convex, **always fetch the real title** using the YouTube oEmbed API before inserting:

```bash
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/VIDEO_ID&format=json" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])"
```

Never use placeholder titles like "Short" or "Video". Fetch the actual title and use it.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

## Admin UI Memory

- Todo lo que sea del área `admin` debe usar layout centrado por defecto.
- Las nuevas páginas de `admin` deben mantener el contenido dentro de un contenedor centrado y consistente.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **nextjs-themariscal-website-2026** (1879 symbols, 3077 relationships, 9 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/nextjs-themariscal-website-2026/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/nextjs-themariscal-website-2026/context` | Codebase overview, check index freshness |
| `gitnexus://repo/nextjs-themariscal-website-2026/clusters` | All functional areas |
| `gitnexus://repo/nextjs-themariscal-website-2026/processes` | All execution flows |
| `gitnexus://repo/nextjs-themariscal-website-2026/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

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
