import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engram - Memory Infrastructure for AI Agents",
  description: "Give your AI agents persistent, semantic, layered memory. Engram helps agents remember what matters.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
