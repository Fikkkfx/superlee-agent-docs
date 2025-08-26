"use client";
import { PropsWithChildren } from "react";

// Simple provider wrapper tanpa Web3 functionality
export default function AppProviders({ children }: PropsWithChildren) {
  return <>{children}</>;
}