// src/app/page.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Role = "assistant" | "user";
type Message = { id: string; role: Role; content: string };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "hi", role: "assistant", content: "Hello! I'm Superlee Agent. Ask me anything. 🚀" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, loading]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(120, el.scrollHeight) + "px";
  }, [input]);

  const canSend = input.trim().length > 0 && !loading;

  async function send() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      // Ganti /api/agent bila sudah punya backend LLM
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      let reply = "";
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        reply = data?.reply ?? "";
      }
      if (!reply) {
        reply = "Endpoint /api/agent belum terhubung. Ini jawaban placeholder yang menirukan pertanyaanmu:\n\n> " + content;
      }
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: "Terjadi error saat menghubungi layanan. Coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSend) {
      e.preventDefault();
      send();
    }
  }

  const hero = useMemo(() => "/agent-sprite.png", []);

  return (
    <section className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-6">
        {/* CHAT CARD */}
        <div className="card bg-ai">
          <header className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--ai-border)" }}>
            <div className="relative h-8 w-8 rounded-xl overflow-hidden">
              <Image src={hero} alt="Agent" fill sizes="32px" className="object-contain pixelated" />
            </div>
            <div>
              <div className="font-semibold">Superlee Agent</div>
            </div>
          </header>

          {/* MESSAGES */}
          <div ref={scrollerRef} className="mt-4 h-[52vh] md:h-[56vh] overflow-y-auto scrollbar-invisible space-y-4 pr-1">
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} text={m.content} />
            ))}
            {loading && <Typing />}
          </div>

          {/* PROMPT BAR */}
          <div className="mt-4">
            <div
              className="flex items-end gap-2 rounded-2xl border p-2 md:p-3 bg-white/60 dark:bg-white/5"
              style={{ borderColor: "var(--ai-border)" }}
            >
              <label
                className="group relative grid place-items-center size-9 md:size-10 rounded-xl border hover:opacity-90 cursor-pointer transition"
                style={{ borderColor: "var(--ai-border)" }}
                title="Attach file"
              >
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                <span className="text-lg select-none">📎</span>
              </label>

              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Write your message…"
                className="flex-1 resize-none bg-transparent outline-none leading-6 max-h-[120px] placeholder:opacity-60"
                rows={1}
              />

              <button
                onClick={send}
                disabled={!canSend}
                className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{ borderColor: "var(--ai-border)" }}
                title="Send (Ctrl/⌘+Enter)"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* SIDEPANEL HERO */}
        <aside className="hidden md:block">
          <div className="card bg-ai relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none hero-vignette" />
            <div className="relative aspect-[4/5] w-full">
              <Image src={hero} alt="Agent Pixel Hero" fill priority sizes="320px" className="object-contain pixelated animate-float" />
            </div>
            <div className="mt-3 text-sm opacity-80">
              “IP-First Super Agent”—ready to assist with drafting, analysis, and simulation of IP registration.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Bubble({ role, text }: { role: Role; text: string }) {
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
