"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const VPS_BASE = "http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io";

type Message = {
  role: "user" | "assistant";
  content: string;
  service?: string;
};

export default function ApiAiPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("auto");
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load available services on mount
  useEffect(() => {
    async function loadServices() {
      try {
        const token = await getToken();
        const res = await fetch(`${VPS_BASE}/services`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json() as { services: string[] };
          setAvailableServices(data.services);
        }
      } catch {
        // Non-critical, silently ignore
      }
    }
    loadServices();
  }, [getToken]);

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

      const body: { messages: Message[]; service?: string } = {
        messages: updatedMessages.map(({ role, content }) => ({ role, content })),
      };
      if (selectedService !== "auto") body.service = selectedService;

      console.log("[API AI] Enviando a:", `${VPS_BASE}/chat`, "| servicio:", selectedService);

      const res = await fetch(`${VPS_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log("[API AI] Status:", res.status, "| CORS:", res.headers.get("access-control-allow-origin"));

      if (res.status === 401) {
        setError("No autorizado — verifica tu sesión Clerk.");
        setIsLoading(false);
        return;
      }
      if (!res.ok) {
        const errBody = await res.text();
        setError(`Error del servidor (${res.status}): ${errBody}`);
        setIsLoading(false);
        return;
      }
      if (!res.body) {
        setError("La respuesta no tiene cuerpo.");
        setIsLoading(false);
        return;
      }

      const serviceUsed = res.headers.get("x-service-used") ?? undefined;

      // Add empty assistant message to fill via streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "", service: serviceUsed }]);

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
            service: serviceUsed,
          };
          return updated;
        });
      }
    } catch (e) {
      console.error("[API AI] Error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setError("Error de red — CORS o servidor caído. Detalle: " + msg);
      } else {
        setError("Error: " + msg);
      }
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
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">API AI — Test</h1>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          disabled={isLoading}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="auto">Auto (round-robin)</option>
          {availableServices.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

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
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role === "assistant" && msg.service && (
              <span className="text-xs text-muted-foreground mb-1 px-1">{msg.service}</span>
            )}
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

      {messages.length > 0 && (
        <button
          onClick={() => { setMessages([]); setError(null); }}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          Limpiar chat
        </button>
      )}
    </div>
  );
}
