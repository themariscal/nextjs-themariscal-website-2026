<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MANDATORY: Worktree + Branch for Every Task

**EVERY task, without exception, MUST be done in a git worktree on a dedicated branch.**

## Rules

1. **Always branch from `develop`** — never from main, never from the current branch.
2. **Create the worktree BEFORE doing any work** — not after.
3. **Branch naming**: use `feature/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`.
4. **Worktree location**: `.worktrees/<branch-name>` (inside the project root, gitignored).

## Required Steps (in order)

```bash
# 1. Ensure develop is up to date
git fetch origin develop

# 2. Create branch from develop + worktree in one command
git worktree add .worktrees/<branch-name> -b <branch-name> origin/develop

# 3. Work exclusively inside the worktree directory
cd .worktrees/<branch-name>
```

## What NOT to do

- Do NOT edit files in the main working directory.
- Do NOT skip the worktree "because the task is small".
- Do NOT branch from anything other than `develop`.

This rule has NO exceptions.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
