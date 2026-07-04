import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { InstanceProvider } from "@/context/instance-context";
import { PostHogProvider } from "@/components/posthog-provider";
import { Toaster } from "sonner";
import { buildGaConfigScript, buildOpenPanelScript, sanitizeAnalyticsId } from "@/lib/analytics-script";

const gaId = sanitizeAnalyticsId(process.env.NEXT_PUBLIC_GA_ID);
const openpanelId = sanitizeAnalyticsId(process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID);

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
      {process.env.NODE_ENV === "production" && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {buildGaConfigScript(gaId)}
          </Script>
        </>
      )}
      {process.env.NODE_ENV === "production" && openpanelId && (
        <Script id="openpanel" strategy="afterInteractive">
          {buildOpenPanelScript(openpanelId)}
        </Script>
      )}
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <InstanceProvider>
            <Suspense fallback={null}>
              <PostHogProvider>
                <TooltipProvider>
                  {children}
                  <Toaster richColors position="bottom-right" />
                </TooltipProvider>
              </PostHogProvider>
            </Suspense>
          </InstanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
