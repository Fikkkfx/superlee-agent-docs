// src/components/PromptAgent.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Role = "assistant" | "user";
type Message = { id: string; role: Role; content: string };

export default function PromptAgent() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "hello",
      role: "assistant",
      content:
        "Hello! I'm Superlee Agent. Write me your questions or commands and I'll help you dive into the Story. 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const toBottom = () => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    toBottom();
  }, [messages, loading]);

  // textarea auto-grow
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(120, el.scrollHeight) + "px";
  }, [input]);

  const canSend = input.trim().length > 0 && !loading;

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      // === GANTI endpoint ini ke backend agent-mu ===
      // Contoh payload sederhana:
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) }),
      });

      let reply = "";
      if (res.ok) {
        // backend bebas, di sini asumsi { reply: string }
        const data = await res.json().catch(() => ({}));
        reply = data?.reply ?? "";
      }

      // fallback kalau belum ada backend → echo + hint
      if (!reply) {
        reply =
          "I haven't connected to your /api/agent backend. Please connect to the endpoint and my response will be in real time.\n\nIn the meantime, I quote your message:\n\n> " +
          content;
      }

      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply };
      setMessages((m) => [...m, botMsg]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, an error occurred while contacting the service. Please try again later or check the `/api/agent` endpoint.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // kirim dengan Ctrl/⌘+Enter
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSend) {
      e.preventDefault();
      send();
    }
  }

  // untuk preview avatar/hero pixel art (opsional)
  const hero = useMemo(() => "/public/superlee.jpeg", []);

  return (
    <section className="relative z-10">
      {/* Hero mini */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-6">
        {/* CHAT CARD */}
        <div className="card bg-ai">
          <header className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--ai-border)" }}>
            <div className="relative h-8 w-8 rounded-xl overflow-hidden">
              <Image src="/brand/logo.png" alt="Agent" fill className="object-cover" sizes="32px" />
            </div>
            <div>
              <div className="font-semibold">Superlee Agent</div>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollerRef}
            className="mt-4 h-[52vh] md:h-[56vh] overflow-y-auto scrollbar-invisible space-y-4 pr-1"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} text={m.content} />
            ))}
            {loading && <Typing />}
          </div>

          {/* Prompt bar */}
          <div className="mt-4">
            <div
              className="flex items-end gap-2 rounded-2xl border p-2 md:p-3 bg-white/60 dark:bg-white/5"
              style={{ borderColor: "var(--ai-border)" }}
            >
              {/* Attach icon kiri */}
              <label
                className="group relative grid place-items-center size-9 md:size-10 rounded-xl border hover:opacity-90 cursor-pointer transition"
                style={{ borderColor: "var(--ai-border)" }}
                title="Attach file"
              >
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                <span className="text-lg select-none">📎</span>
              </label>

              {/* Textarea auto-grow */}
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything…"
                className="flex-1 resize-none bg-transparent outline-none leading-6 max-h-[120px] placeholder:opacity-60"
                rows={1}
              />

              {/* Send */}
              <button
                onClick={() => send()}
                disabled={!canSend}
                className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{ borderColor: "var(--ai-border)" }}
                title="Kirim (Ctrl/⌘+Enter)"
              >
                Send
              </button>
            </div>
            <p className="text-[11px] opacity-60 mt-2">
              Tips: press <kbd className="px-1 border rounded">Ctrl</kbd>/<kbd className="px-1 border rounded">⌘</kbd>+
              <kbd className="px-1 border rounded">Enter</kbd> to send.
            </p>
          </div>
        </div>

        {/* HERO / SIDEPANEL */}
        <aside className="hidden md:block">
          <div className="card bg-ai relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none hero-vignette" />
            <div className="relative aspect-[4/5] w-full">
              {/* Letakkan file pixel-art ke /public/brand/agent-hero.png */}
              <Image
                src={hero}
                alt="Agent Pixel Hero"
                fill
                priority
                sizes="320px"
                className="object-contain pixelated animate-float"
              />
            </div>
            <div className="mt-3 text-sm opacity-80">
              “IP-First Super Agent”—ready to assist with drafting, analyzing, and registering IP concepts (simulation).
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MessageBubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] md:max-w-[75%] whitespace-pre-wrap msg-pre ${
          isUser ? "bg-blue-500 text-white" : "bg-white/70 dark:bg-white/10"
        } rounded-2xl px-4 py-3 shadow`}
        style={!isUser ? { border: "1px solid var(--ai-border)" } : {}}
      >
        {text}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2 text-sm opacity-70">
      <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
      <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
      <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce" />
      <span className="ml-1">Agent is thinking…</span>
    </div>
  );
}
