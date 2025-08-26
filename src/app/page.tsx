"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BookOpen, HelpCircle, FileText } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "agent";
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAutoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.response || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
      {/* Sidebar */}
      <aside className="card p-6 h-[calc(100vh-200px)] overflow-y-auto scrollbar-invisible">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          Example Questions
        </h3>
        <div className="space-y-2">
          {EXAMPLE_QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(question)}
              className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm backdrop-blur-sm"
            >
              {question}
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
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

      {/* Main Chat */}
      <div className="card h-[calc(100vh-200px)] flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400/50">
              <Image
                src="/superlee.jpeg"
                alt="SuperLee"
                width={40}
                height={40}
                className="object-cover pixelated"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">SuperLee AI Assistant</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ask me anything about Story Protocol!</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-invisible">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-400/50">
                <Image
                  src="/superlee.jpeg"
                  alt="SuperLee"
                  width={96}
                  height={96}
                  className="object-cover pixelated opacity-80"
                />
              </div>
              <p className="text-lg mb-2">Welcome to SuperLee AI Agent!</p>
              <p className="text-slate-600 dark:text-slate-400 mb-4">I'm here to help you understand Story Protocol.</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Try asking one of the example questions from the sidebar, or ask anything about:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="badge">IP Registration</span>
                <span className="badge">Licensing</span>
                <span className="badge">PIL Terms</span>
                <span className="badge">Royalties</span>
                <span className="badge">SDK Usage</span>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      message.role === "user"
                        ? "bg-blue-500"
                        : "border-2 border-purple-400/50"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Image
                        src="/superlee.jpeg"
                        alt="SuperLee"
                        width={32}
                        height={32}
                        className="object-cover pixelated"
                      />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-blue-500/20 border border-blue-400/30"
                        : "bg-white/10 border border-white/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400/50">
                <Image
                  src="/superlee.jpeg"
                  alt="SuperLee"
                  width={32}
                  height={32}
                  className="object-cover pixelated"
                />
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleAutoGrow(e.currentTarget);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Story Protocol, IP registration, licensing, or anything else..."
                className="input-primary w-full resize-none backdrop-blur-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="btn-primary flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}