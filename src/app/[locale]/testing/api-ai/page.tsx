"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, Lightbulb } from "lucide-react";

const VPS_BASE = "http://kact3j9asa5t056a6tawpsuw.187.77.87.209.sslip.io";

type Message = {
  role: "user" | "assistant";
  content: string;
  service?: string;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
      title="Copiar"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

/** Splits content into {thinking, response} parts based on <think>...</think> tags */
function parseThinking(content: string): { thinking: string | null; response: string } {
  const match = content.match(/^<think>([\s\S]*?)<\/think>\s*/);
  if (match) {
    return { thinking: match[1].trim(), response: content.slice(match[0].length).trim() };
  }
  // Still streaming the think block — no closing tag yet
  const openOnly = content.match(/^<think>([\s\S]*)$/);
  if (openOnly) {
    return { thinking: openOnly[1].trim(), response: "" };
  }
  return { thinking: null, response: content };
}

function ThinkBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors"
      >
        <Lightbulb size={13} className="shrink-0" />
        <span className="font-medium">Razonamiento interno</span>
        <span className="ml-auto text-yellow-500/60">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-3 pb-2 text-xs text-yellow-300/80 whitespace-pre-wrap leading-relaxed border-t border-yellow-500/20 pt-2">
          {content}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      {!isUser && msg.service && (
        <span className="text-xs text-muted-foreground mb-1 px-1">{msg.service}</span>
      )}
      <div className={`group relative max-w-[85%] ${isUser ? "flex flex-row-reverse gap-1.5" : "flex flex-row gap-1.5"}`}>
        <div
          className={`rounded-lg px-4 py-2.5 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : msg.content ? (() => {
            const { thinking, response } = parseThinking(msg.content);
            return (
              <>
                {thinking !== null && <ThinkBlock content={thinking} />}
                {response && <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <code className={`${className} block rounded text-xs`} {...props}>{children}</code>
                  ) : (
                    <code className="bg-black/20 rounded px-1 py-0.5 text-xs font-mono" {...props}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="rounded-lg overflow-x-auto my-2 p-3 bg-black/30 text-xs">{children}</pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="border-collapse text-xs w-full">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="border border-muted-foreground/30 px-2 py-1 font-semibold bg-black/20">{children}</th>,
                td: ({ children }) => <td className="border border-muted-foreground/30 px-2 py-1">{children}</td>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-muted-foreground/40 pl-3 italic my-2 text-muted-foreground">{children}</blockquote>,
                hr: () => <hr className="border-muted-foreground/20 my-2" />,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
                  {response}
                </ReactMarkdown>}
              </>
            );
          })() : (
            <span className="animate-pulse text-muted-foreground">▋</span>
          )}
        </div>
        <div className="self-start pt-1.5">
          {msg.content && (
            <CopyButton text={isUser ? msg.content : parseThinking(msg.content).response || msg.content} />
          )}
        </div>
      </div>
    </div>
  );
}

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
        // Non-critical
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

      const body: { messages: { role: string; content: string }[]; service?: string } = {
        messages: updatedMessages.map(({ role, content }) => ({ role, content })),
      };
      if (selectedService !== "auto") body.service = selectedService;

      const res = await fetch(`${VPS_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

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
          updated[updated.length - 1] = { role: "assistant", content: accumulated, service: serviceUsed };
          return updated;
        });
      }
    } catch (e) {
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

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Escribe un mensaje para probar la conexión con la AI.
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {error && (
          <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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
