'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { trackEvent } from '@/lib/posthog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, Key, BookOpen, Code2, LayoutDashboard } from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    const key = sessionStorage.getItem('engram_onboarding_apikey');
    if (key) {
      setApiKey(key);
      sessionStorage.removeItem('engram_onboarding_apikey');
    }
  }, []);

  function copyToClipboard(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  const curlExample = `curl -X POST https://api.openengram.ai/v1/memories \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "User prefers dark mode", "userId": "user-1"}'`;

  return (
    <div className="mx-auto max-w-2xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome{user?.name ? `, ${user.name}` : ''}! 🧠</h1>
        <p className="text-muted-foreground">
          Your account is ready. Here&apos;s everything you need to get started with Engram.
        </p>
      </div>

      {apiKey && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-primary" />
              Your API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-background border p-3 font-mono text-sm break-all flex items-start justify-between gap-2">
              <span className="flex-1">{apiKey}</span>
              <button
                onClick={() => copyToClipboard(apiKey, setCopied)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-destructive font-medium">
              ⚠️ Save this key now — this is the only time you&apos;ll see the full key.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Store your first memory:</p>
          <div className="relative rounded-md bg-muted p-4 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => copyToClipboard(curlExample, setCopiedCurl)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedCurl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre className="whitespace-pre-wrap">{curlExample}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/docs" className="group">
          <Card className="h-full transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">Documentation</span>
              <span className="text-xs text-muted-foreground">Learn the concepts</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/docs/sdk" className="group">
          <Card className="h-full transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <Code2 className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">SDK Reference</span>
              <span className="text-xs text-muted-foreground">TypeScript SDK</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard" className="group">
          <Card className="h-full transition-colors hover:border-primary/30">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <LayoutDashboard className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">Dashboard</span>
              <span className="text-xs text-muted-foreground">Manage memories</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" onClick={() => trackEvent('onboarding_completed')}>
          <Link href="/dashboard">Go to Dashboard →</Link>
        </Button>
      </div>
    </div>
  );
}
