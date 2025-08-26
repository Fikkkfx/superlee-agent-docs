"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, BookOpen, HelpCircle, FileText, Paperclip, X } from "lucide-react";
import Image from "next/image";
import Topbar from "@/components/UI/Topbar";

type Role = "assistant" | "user";
interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "What is Story Protocol?",
  "How do I register an IP Asset?",
  "What are PIL Terms?",
  "How does licensing work?",
  "What is the difference between commercial and non-commercial licenses?",
  "How do I use the TypeScript SDK?",
  "What are the deployed smart contracts?",
  "How do royalties work in Story Protocol?",
];

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Use SuperLee image for avatars, agent-sprite for floating sprite
  const hero = useMemo(() => "/superlee.jpeg", []);
  const sprite = useMemo(() => "/agent-sprite.png", []);

  // Auto scroll to bottom
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Auto grow textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(120, el.scrollHeight) + "px";
  }, [input]);

  // Toast effect
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Cleanup preview URL
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const canSend = input.trim().length > 0 && !loading;

  // File handling functions
  function onPickFile(f?: File) {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function removeFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  function handleAutoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setFile(null);
    setPreviewUrl(null);
    setToast(null);
    if (taRef.current) taRef.current.style.height = "auto";
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;
    
    setInput("");
    const userMsg: Message = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content,
      timestamp: new Date()
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    
    // Reset textarea height
    if (taRef.current) taRef.current.style.height = "auto";
    
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      
      let reply = "";
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        reply = data?.response ?? "";
      } else {
        const errorData = await res.json().catch(() => ({}));
        reply = `Error: ${errorData.error || 'Failed to get response'}`;
      }
      
      if (!reply) {
        reply = "I apologize, but I couldn't generate a response. Please try asking again.";
      }
      
      setMessages((m) => [...m, { 
        id: crypto.randomUUID(), 
        role: "assistant", 
        content: reply,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((m) => [
        ...m,
        { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: "Sorry, there was an error connecting to the AI agent. Please try again.",
          timestamp: new Date()
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSend) {
      e.preventDefault();
      sendMessage();
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <section className="relative z-10">
      {/* Topbar Component */}
      <div className="mb-6">
        <Topbar />
      </div>

      {/* Main Content - PromptAgent Style Layout */}
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* LEFT SIDEBAR - History & Example Questions */}
          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 h-[calc(100vh-240px)] overflow-y-auto scrollbar-invisible">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm opacity-80">History</div>
              <button
                onClick={newChat}
                className="text-[11px] px-2 py-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
                title="Start a new chat"
              >
                New
              </button>
            </div>

            {messages.filter((m) => m.role === "user").length === 0 ? (
              <div>
                <p className="text-xs opacity-60 mb-4">
                  No chat history yet. Try one of these questions:
                </p>
                <div className="space-y-2">
                  {EXAMPLE_QUESTIONS.slice(0, 5).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(question)}
                      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-xs"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-2 pr-1">
                {messages
                  .filter((m) => m.role === "user")
                  .map((m, i) => (
                    <li key={i} className="text-sm line-clamp-2 opacity-80 hover:opacity-100 cursor-pointer">
                      {m.content}
                    </li>
                  ))}
              </ul>
            )}

            {/* Quick Links */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-xs font-medium mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3 text-purple-400" />
                Quick Links
              </h4>
              <div className="space-y-2 text-xs">
                <a href="https://docs.story.foundation" target="_blank" rel="noopener noreferrer" 
                   className="block text-purple-300 hover:text-purple-200 transition-colors">
                  📖 Documentation
                </a>
                <a href="https://github.com/storyprotocol" target="_blank" rel="noopener noreferrer"
                   className="block text-purple-300 hover:text-purple-200 transition-colors">
                  💻 GitHub
                </a>
                <a href="https://discord.gg/storyprotocol" target="_blank" rel="noopener noreferrer"
                   className="block text-purple-300 hover:text-purple-200 transition-colors">
                  💬 Discord
                </a>
              </div>
            </div>
          </aside>

          {/* MAIN CHAT AREA - PromptAgent Style */}
          <section className="rounded-2xl border border-white/10 bg-white/5 h-[calc(100vh-240px)] overflow-hidden flex flex-col">
            {/* Messages Area */}
            <div ref={scrollerRef} className="flex-1 overflow-y-auto scrollbar-invisible">
              <div className="mx-auto w-full max-w-[820px] px-3 py-4">
                {messages.length === 0 ? (
                  <div className="text-center mt-20">
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400/50">
                      <Image
                        src={hero}
                        alt="SuperLee"
                        width={96}
                        height={96}
                        className="object-cover pixelated opacity-80"
                      />
                    </div>
                    <p className="text-lg mb-2">Welcome to SuperLee AI Agent!</p>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Ask me anything about Story Protocol.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <span className="badge text-xs px-2 py-1">IP Registration</span>
                      <span className="badge text-xs px-2 py-1">Licensing</span>
                      <span className="badge text-xs px-2 py-1">PIL Terms</span>
                      <span className="badge text-xs px-2 py-1">Royalties</span>
                      <span className="badge text-xs px-2 py-1">SDK Usage</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, i) => (
                      <div
                        key={i}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 border ${
                            message.role === "user" 
                              ? "bg-sky-500/15 border-sky-400/30" 
                              : "bg-white/6 border-white/10"
                          }`}
                        >
                          <pre className="whitespace-pre-wrap text-sm break-words">{message.content}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start mt-3">
                    <div className="bg-white/6 border border-white/10 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
                        <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
                        <span className="inline-block w-2 h-2 rounded-full bg-current animate-bounce" />
                        <span className="ml-1">SuperLee is thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mx-auto w-full max-w-[820px] px-3">
                <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <img src={previewUrl} alt="preview" className="h-10 w-10 rounded-md object-cover" />
                  <div className="flex-1 text-xs opacity-80">Image attached</div>
                  <button
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs"
                    onClick={removeFile}
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Composer - PromptAgent Style */}
            <div className="shrink-0 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent relative overflow-visible">
              <div className="mx-auto w-full max-w-[820px] px-3 py-3">
                <div className="relative flex items-end gap-2 rounded-2xl ring-1 ring-white/15 bg-white/5/30 backdrop-blur-md px-3 py-2 overflow-visible">
                  {/* Attach button */}
                  <button
                    aria-label="Attach image"
                    title="Attach Image"
                    className="p-2 rounded-xl text-white/80 hover:text-white bg-transparent hover:bg-white/10 focus:bg-white/10 active:bg-white/20 transition"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] || undefined)}
                  />

                  {/* Textarea */}
                  <textarea
                    ref={taRef}
                    rows={1}
                    className="flex-1 resize-none rounded-md bg-transparent px-2 py-2 text-base sm:text-lg placeholder:opacity-50 focus:outline-none scrollbar-invisible"
                    placeholder="Ask about Story Protocol, IP registration, licensing..."
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      handleAutoGrow(e.currentTarget);
                    }}
                    onKeyDown={onKeyDown}
                    disabled={loading}
                  />

                  {/* Send button */}
                  <button
                    className="relative z-10 p-2 rounded-xl bg-sky-500/90 hover:bg-sky-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                    onClick={sendMessage}
                    disabled={!canSend}
                    title="Send (Ctrl/⌘+Enter)"
                  >
                    <Send className="h-5 w-5" />
                  </button>

                  {/* Agent Sprite - Changed to agent-sprite.png */}
                  <Image
                    src={sprite}
                    alt="Agent Sprite"
                    width={48}
                    height={48}
                    priority
                    className="pointer-events-none select-none pixelated animate-float absolute -top-3 -right-3 w-12 h-12 z-20 drop-shadow-[0_10px_28px_rgba(34,211,238,.35)]"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-black/70 border border-white/10 px-4 py-3 text-sm shadow-glow">
          {toast}
        </div>
      )}
    </section>
  );
}