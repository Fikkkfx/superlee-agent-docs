// src/app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const qc = new QueryClient();

function ThemeWatcher() {
  // Menjaga konsistensi kelas 'dark' saat user toggle di client
  const [, force] = useState(0);
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => force((n) => n + 1));
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <ThemeWatcher />
      {children}
    </QueryClientProvider>
  );
}
