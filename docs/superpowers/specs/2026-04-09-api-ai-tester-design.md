# API AI Tester — Design Spec

**Date:** 2026-04-09  
**Status:** Approved

## Summary

Add a chat-based AI testing page at `/[locale]/testing/api-ai` within the existing tester dashboard. The page lets authenticated testers send messages to a VPS-hosted AI API that requires Clerk authentication, and see the streamed response in real time.

## Context

- Tester dashboard at `/[locale]/testing` is protected by Clerk middleware — requires `org:admin` role/permission.
- VPS API endpoint: `http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io/chat`
- VPS uses `clerk.authenticateRequest(req)` from `@clerk/backend` — validates `Authorization: Bearer <JWT>` header.
- Clerk JWT obtained client-side via `useAuth().getToken()`.
- VPS responds with a streaming (`-N` curl flag) response.

## Architecture

### Data Flow

```
User types message → press Enter/Enviar
  → useAuth().getToken() fetches fresh Clerk JWT
  → fetch POST to VPS with:
      Authorization: Bearer <JWT>
      Content-Type: application/json
      body: { messages: [{ role, content }, ...] }
  → ReadableStream decoded incrementally
  → streamed text appended to UI in real time
```

### Multi-turn

Client maintains a `messages` array (`{ role: "user" | "assistant", content: string }[]`). Each request sends full history so the AI has context.

## Files

| File | Action |
|------|--------|
| `src/app/[locale]/testing/api-ai/page.tsx` | Create — client component, full chat UI |
| `src/components/layout/sidebars/tester-app-sidebar.tsx` | Modify — add "API AI" link to subitems |

## Component State

| State | Type | Purpose |
|-------|------|---------|
| `messages` | `{ role: string, content: string }[]` | Full conversation history |
| `input` | `string` | Current textarea value |
| `isLoading` | `boolean` | Disable input while awaiting response |
| `streamedResponse` | `string` | Accumulated text from active stream |
| `error` | `string \| null` | Display VPS or auth errors |

## UI Layout

- **Header:** "API AI — Test"
- **Messages area:** Scrollable list. User messages right-aligned, AI messages left-aligned. Active stream appended to last AI bubble.
- **Input area:** Textarea (Enter = send, Shift+Enter = newline) + "Enviar" button (disabled while loading).
- **Footer:** "Limpiar chat" button resets `messages` array.
- **Error state:** Inline error banner below messages area.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `getToken()` returns null | Show error: "No se pudo obtener token de sesión" |
| VPS returns 401 | Show error: "No autorizado — verifica tu sesión Clerk" |
| VPS returns 5xx | Show error: "Error del servidor AI" |
| Network failure | Show error: "No se pudo conectar al servidor" |

## Sidebar Change

Add to `tester-app-sidebar.tsx` subitems array:
```ts
{ title: "API AI", url: "/testing/api-ai" }
```

Note: existing subitems use `/tester/` prefix but the actual route is `/testing/` — the new item should use `/testing/api-ai` to match the real route.

## Out of Scope

- Model selection
- Saving/exporting conversations
- Token usage display
- Any backend proxy (direct browser → VPS)
