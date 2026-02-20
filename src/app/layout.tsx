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

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const openpanelId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;

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
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {process.env.NODE_ENV === "production" && openpanelId && (
        <Script id="openpanel" strategy="afterInteractive">
          {`!function(){var e="https://openpanel.dev/op.js",t=window.op=window.op||function(){(window.op.q=window.op.q||[]).push(arguments)};t("init",{clientId:"${openpanelId}",trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true}); var a=document.createElement("script");a.async=!0,a.src=e;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)}();`}
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
