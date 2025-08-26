// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Superlee AI Agent",
  description: "Chat-like AI Agent (no wallet)",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
  other: { "color-scheme": "light dark" },
};

// Pasang kelas 'dark' SEBELUM paint (anti kedip)
function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var mode = saved ? saved : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var el = document.documentElement;
    el.classList.remove('light','dark');
    el.classList.add(mode);
    el.style.colorScheme = mode;
  } catch (e) {}
})();`,
      }}
    />
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-[#0b0f1a] dark:text-slate-100">
        <div className="relative min-h-dvh">
          {/* === FULL-SCREEN BACKGROUND dari gambar kamu === */}
          <div
            className="hero-layer pixelated animate-kenburns opacity-30"
            style={{
              backgroundImage: `url("/superlee-bg.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="hero-vignette" />
          <div className="ai-grid absolute inset-0 pointer-events-none" />

          {/* === CONTENT === */}
          <main className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
