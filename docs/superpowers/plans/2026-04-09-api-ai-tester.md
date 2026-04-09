# API AI Tester Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a streaming AI chat page at `/[locale]/testing/api-ai` that sends Clerk-authenticated requests to a VPS AI API.

**Architecture:** Client component uses `useAuth().getToken()` from Clerk to obtain a JWT, sends it as `Authorization: Bearer <token>` on every POST to the VPS `/chat` endpoint, and renders the streaming response incrementally. Full conversation history is maintained client-side for multi-turn context.

**Tech Stack:** Next.js 15 App Router, TypeScript, Clerk (`@clerk/nextjs` `useAuth`), Tailwind CSS, native `fetch` + `ReadableStream`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/[locale]/testing/api-ai/page.tsx` | Create | Chat UI + streaming fetch logic |
| `src/components/layout/sidebars/tester-app-sidebar.tsx` | Modify | Add "API AI" nav link |

---

### Task 1: Add "API AI" link to sidebar

**Files:**
- Modify: `src/components/layout/sidebars/tester-app-sidebar.tsx`

- [ ] **Step 1: Open the file and locate the subitems array**

The `items` array is at the top of the file. The `subitems` for "Pruebas" currently has 4 entries.

- [ ] **Step 2: Add the new subitem**

In `src/components/layout/sidebars/tester-app-sidebar.tsx`, change the `subitems` array inside `items` to:

```ts
subitems: [
  { title: "Reveneu Cat", url: "/tester/reveneucat" },
  { title: "Hook Purchase", url: "/tester/hookpurchase" },
  { title: "Feature Flags", url: "/tester/feature-flags" },
  { title: "Stripe", url: "/tester/stripe" },
  { title: "API AI", url: "/testing/api-ai" },
],
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/en/testing`. The sidebar "Pruebas" section should show "API AI" as the last item. Clicking it should navigate to `/en/testing/api-ai` (404 is expected — page doesn't exist yet).

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/sidebars/tester-app-sidebar.tsx
git commit -m "feat: add API AI link to tester sidebar"
```

---

### Task 2: Create the API AI chat page

**Files:**
- Create: `src/app/[locale]/testing/api-ai/page.tsx`

- [ ] **Step 1: Create the file with base structure**

Create `src/app/[locale]/testing/api-ai/page.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const VPS_URL = "http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io/chat";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ApiAiPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isLoading) return;

    setError(null);
    setInput("");

    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        setError("No se pudo obtener token de sesión. Recarga la página.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(VPS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (res.status === 401) {
        setError("No autorizado — verifica tu sesión Clerk.");
        setIsLoading(false);
        return;
      }
      if (!res.ok) {
        setError(`Error del servidor AI (${res.status}).`);
        setIsLoading(false);
        return;
      }
      if (!res.body) {
        setError("La respuesta no tiene cuerpo.");
        setIsLoading(false);
        return;
      }

      // Add empty assistant message to fill via streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
          };
          return updated;
        });
      }
    } catch {
      setError("No se pudo conectar al servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API AI — Test</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Escribe un mensaje para probar la conexión con la AI.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content || (
                <span className="animate-pulse text-muted-foreground">▋</span>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] max-h-[160px]"
          placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors h-[44px]"
        >
          {isLoading ? "..." : "Enviar"}
        </button>
      </div>

      {/* Clear */}
      {messages.length > 0 && (
        <button
          onClick={() => {
            setMessages([]);
            setError(null);
          }}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          Limpiar chat
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server compiles**

```bash
# En la raíz del worktree
npm run dev
```

Expected: No TypeScript/compilation errors in terminal. Page loads at `http://localhost:3000/en/testing/api-ai`.

- [ ] **Step 3: Test happy path — send a message**

1. Log in at `http://localhost:3000/en/login` with a user that has `org:admin` role.
2. Navigate to `http://localhost:3000/en/testing/api-ai`.
3. Type: `Resuelve Fibonacci en JavaScript`
4. Press Enter.
5. Expected: Message appears on the right, AI response streams in on the left.

- [ ] **Step 4: Test auth error path**

1. In browser DevTools → Application → Cookies, delete the Clerk session cookie.
2. Manually call `sendMessage` (or temporarily patch `getToken` to return null).
3. Expected: Error banner "No se pudo obtener token de sesión."

- [ ] **Step 5: Test multi-turn**

1. After first response, send a follow-up: `¿Puedes explicar la solución paso a paso?`
2. Expected: AI responds with context from prior message (since full history is sent).

- [ ] **Step 6: Commit**

```bash
git add src/app/\[locale\]/testing/api-ai/page.tsx
git commit -m "feat: add API AI chat page with Clerk auth and streaming"
```

---

### Task 3: Final integration check

- [ ] **Step 1: Verify sidebar active state**

Navigate to `http://localhost:3000/en/testing/api-ai`. The "API AI" sidebar link should be highlighted (white + semibold) matching behavior of other active links.

- [ ] **Step 2: Verify streaming renders incrementally**

Send a long-form request like `Explica el algoritmo de Dijkstra en detalle`. Confirm text appears word-by-word rather than all at once after full load.

- [ ] **Step 3: Verify error display for network failure**

Temporarily change `VPS_URL` to an invalid address, send a message, confirm "No se pudo conectar al servidor." appears, then revert.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: API AI tester page complete"
```
