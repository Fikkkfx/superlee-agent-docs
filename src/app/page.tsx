"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, BookOpen, HelpCircle, FileText } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      role: "assistant", 
      content: "Hello! I'm SuperLee AI Agent. Ask me anything about Story Protocol! 🚀",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Use SuperLee image
  const hero = useMemo(() => "/superlee.jpeg", []);

  // Auto scroll to bottom
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Auto grow textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(120, el.scrollHeight) + "px";
  }, [input]);

  const canSend = input.trim().length > 0 && !loading;

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

      {/* Main Content - 2 Column Layout with Larger Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        {/* LEFT SIDEBAR - Example Questions - Made Smaller */}
        <aside className="card p-5 h-[calc(100vh-240px)] overflow-y-auto scrollbar-invisible">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Example Questions
          </h3>
          <div className="space-y-2">
            {EXAMPLE_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(question)}
                className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-xs backdrop-blur-sm"
              >
                {question}
              </button>
            ))}
          </div>
          
          <div className="mt-5 pt-5 border-t border-white/10">
            <h4 className="text-xs font-medium mb-3 flex items-center gap-2">
              <FileText className="w-3 h-3 text-purple-400" />
              Quick Links
            </h4>
            <div className="space-y-2 text-xs">
              <a href="https://docs.story.foundation" target="_blank" rel="noopener noreferrer" 
                 className="block text-purple-300 hover:text-purple-200 transition-colors">
                📖 Official Documentation
              </a>
              <a href="https://github.com/storyprotocol" target="_blank" rel="noopener noreferrer"
                 className="block text-purple-300 hover:text-purple-200 transition-colors">
                💻 GitHub Repository
              </a>
              <a href="https://discord.gg/storyprotocol" target="_blank" rel="noopener noreferrer"
                 className="block text-purple-300 hover:text-purple-200 transition-colors">
                💬 Discord Community
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA - Made Much Larger */}
        <div className="card bg-ai h-[calc(100vh-240px)] flex flex-col">
          {/* Chat Header */}
          <header className="flex items-center gap-3 p-6 border-b border-white/10">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border-2 border-purple-400/50">
              <Image src={hero} alt="SuperLee Agent" fill sizes="48px" className="object-cover pixelated" />
            </div>
            <div>
              <div className="font-semibold text-xl">SuperLee AI Agent</div>
              <div className="text-sm opacity-70">Story Protocol Assistant</div>
            </div>
          </header>

          {/* Messages - Much Larger Area */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto scrollbar-invisible space-y-6 p-8">
            {messages.length === 1 ? (
              // Welcome screen when only initial message exists
              <div className="text-center mt-32">
                <div className="relative w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border-4 border-purple-400/50">
                  <Image
                    src={hero}
                    alt="SuperLee"
                    width={160}
                    height={160}
                    className="object-cover pixelated opacity-80"
                  />
                </div>
                <p className="text-3xl mb-6 font-bold">Welcome to SuperLee AI Agent!</p>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-xl">I'm here to help you understand Story Protocol.</p>
                <p className="text-slate-500 dark:text-slate-500 mb-6 text-lg">Try asking one of the example questions from the sidebar, or ask anything about:</p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <span className="badge text-base px-4 py-3">IP Registration</span>
                  <span className="badge text-base px-4 py-3">Licensing</span>
                  <span className="badge text-base px-4 py-3">PIL Terms</span>
                  <span className="badge text-base px-4 py-3">Royalties</span>
                  <span className="badge text-base px-4 py-3">SDK Usage</span>
                </div>
              </div>
            ) : (
              // Chat messages
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} hero={hero} />
              ))
            )}
            {loading && <TypingIndicator hero={hero} />}
          </div>

          {/* Input Area - Enhanced */}
          <div className="p-8 border-t border-white/10">
            <div className="flex items-end gap-4 rounded-2xl border border-white/20 p-4 md:p-5 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
              <label
                className="group relative grid place-items-center size-12 md:size-14 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer transition"
                title="Attach file (coming soon)"
              >
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" disabled />
                <span className="text-2xl select-none opacity-60">📎</span>
              </label>

              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about Story Protocol, IP registration, licensing..."
                className="flex-1 resize-none bg-transparent outline-none leading-7 max-h-[140px] placeholder:opacity-50 text-lg"
                rows={1}
                disabled={loading}
              />

              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="px-6 md:px-8 py-4 rounded-xl text-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 hover:border-white/30 backdrop-blur-sm text-white"
                title="Send (Ctrl/⌘+Enter)"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Message Bubble Component - Enhanced for much larger chat area
function MessageBubble({ message, hero }: { message: Message; hero: string }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-5 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-5 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
          isUser ? "bg-blue-500" : "border-2 border-purple-400/50"
        }`}>
          {isUser ? (
            <User className="w-6 h-6 text-white" />
          ) : (
            <Image
              src={hero}
              alt="SuperLee"
              width={48}
              height={48}
              className="object-cover pixelated"
            />
          )}
        </div>
        <div className={`rounded-2xl px-6 py-5 backdrop-blur-sm ${
          isUser 
            ? "bg-blue-500/20 border border-blue-400/30" 
            : "bg-white/70 dark:bg-white/10 border border-white/20"
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed text-lg">{message.content}</p>
          <p className="text-sm opacity-60 mt-4">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Typing Indicator Component - Enhanced for larger area
function TypingIndicator({ hero }: { hero: string }) {
  return (
    <div className="flex gap-5 justify-start">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400/50">
        <Image
          src={hero}
          alt="SuperLee"
          width={48}
          height={48}
          className="object-cover pixelated"
        />
      </div>
      <div className="bg-white/70 dark:bg-white/10 border border-white/20 rounded-2xl px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-lg opacity-70">
          <span className="inline-block w-3 h-3 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
          <span className="inline-block w-3 h-3 rounded-full bg-current animate-bounce [animation-delay:-0.1s]" />
          <span className="inline-block w-3 h-3 rounded-full bg-current animate-bounce" />
          <span className="ml-3">SuperLee is thinking…</span>
        </div>
      </div>
    </div>
  );
}