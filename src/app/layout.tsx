import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { PostHogProvider } from "@/components/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Engram - Memory Infrastructure for AI Agents",
  description: "Give your AI agents persistent, semantic, layered memory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </PostHogProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
