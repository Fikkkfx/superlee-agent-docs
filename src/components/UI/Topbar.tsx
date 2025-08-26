"use client";

import { Bot, Github, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* SuperLee Avatar */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-400/50">
            <Image
              src="/superlee.jpeg"
              alt="SuperLee"
              width={48}
              height={48}
              className="object-cover pixelated"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SuperLee AI Agent
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Story Protocol Documentation Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://docs.story.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 transition-colors text-sm backdrop-blur-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Docs
        </a>
        <a
          href="https://github.com/storyprotocol"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 border border-white/20 transition-colors text-sm backdrop-blur-sm"
        >
          <Github className="w-4 h-4" />
          GitHub
        </a>
      </div>
    </header>
  );
}