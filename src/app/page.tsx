"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Role = "assistant" | "user";
type Message = { id: string; role: Role; content: string };

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "hi", role: "assistant", content: "Hello! I'm SuperLee AI Agent. Ask me anything about Story Protocol! 🚀" },
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
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Fix: Send single message, not messages array
        body: JSON.stringify({ message: content }),
      });
      
      let reply = "";
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Fix: Use 'response' field, not 'reply'
        reply = data?.response ?? "";
      } else {
        const errorData = await res.json().catch(() => ({}));
        reply = `Error: ${errorData.error || 'Failed to get response'}`;
      }
      
      if (!reply) {
        reply = "I apologize, but I couldn't generate a response. Please try asking again.";
      }
      
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, there was an error connecting to the AI agent. Please try again." },
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

  // Use SuperLee image instead of agent-sprite.png
  const hero = useMemo(() => "/superlee.jpeg", []);

  return (
    <section className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-6">
        {/* CHAT CARD */}
        <div className="card bg-ai">
          <header className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--ai-border)" }}>
            <div className="relative h-8 w-8 rounded-xl overflow-hidden border-2 border-purple-400/50">
              <Image src={hero} alt="SuperLee Agent" fill sizes="32px" className="object-cover pixelated" />
            </div>
            <div>
              <div className="font-semibold">SuperLee AI Agent</div>
              <div className="text-xs opacity-70">Story Protocol Assistant</div>
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
              className="flex items-end gap-2 rounded-2xl border p-2 md:p-3 bg-white/60 dark:bg-white/5 backdrop-blur-sm"
              style={{ borderColor: "var(--ai-border)" }}
            >
              <label
                className="group relative grid place-items-center size-9 md:size-10 rounded-xl border hover:opacity-90 cursor-pointer transition"
                style={{ borderColor: "var(--ai-border)" }}
                title="Attach file (coming soon)"
              >
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" disabled />
                <span className="text-lg select-none">📎</span>
              </label>

              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about Story Protocol, IP registration, licensing..."
                className="flex-1 resize-none bg-transparent outline-none leading-6 max-h-[120px] placeholder:opacity-60"
                rows={1}
              />

              <button
                onClick={send}
                disabled={!canSend}
                className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed border bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
              <Image 
                src={hero} 
                alt="SuperLee AI Agent" 
                fill 
                priority 
                sizes="320px" 
                className="object-cover pixelated animate-float" 
              />
            </div>
            <div className="mt-3 text-sm opacity-80">
              "Story Protocol Expert"—ready to help with IP registration, licensing, royalties, and everything about Story Protocol.
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
        } rounded-2xl px-4 py-3 shadow backdrop-blur-sm`}
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
      <span className="ml-1">SuperLee is thinking…</span>
    </div>
  );
}