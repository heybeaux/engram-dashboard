'use client';

import { EditionGuard } from '@/components/edition-guard';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Check, ChevronRight, Cloud, HardDrive, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.openengram.ai';

type DeploymentChoice = 'local' | 'cloud' | null;

function StepIndicator({ current }: { current: number }) {
  const steps = ['Create Account', 'Choose Mode', 'Complete'];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 ${isDone ? 'bg-primary' : 'bg-border'}`} />}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border text-muted-foreground'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step}
              </div>
              <span className={`text-xs hidden sm:inline ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SetupPage() {
  return (
    <EditionGuard edition="local">
      <SetupPageContent />
    </EditionGuard>
  );
}

function SetupPageContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Step 2 state
  const [deploymentChoice, setDeploymentChoice] = useState<DeploymentChoice>(null);
  const [cloudApiKey, setCloudApiKey] = useState('');

  // Check if setup is actually needed
  useEffect(() => {
    // If this dashboard is configured for cloud mode, never show setup
    const instanceMode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (instanceMode === 'cloud') {
      router.replace('/login');
      return;
    }

    fetch(`${API_BASE}/v1/auth/setup-status`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.needsSetup) {
          router.replace('/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login: store token
      localStorage.setItem('engram_token', data.token);
      localStorage.setItem('engram_user', JSON.stringify(data.account));
      document.cookie = `engram_token=${data.token};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;

      if (data.apiKey) setApiKey(data.apiKey);
      setStep(2);
    } catch {
      setError('Network error. Is the API running?');
    } finally {
      setLoading(false);
    }
  }

  const [cloudLinking, setCloudLinking] = useState(false);
  const [cloudError, setCloudError] = useState('');

  async function handleChooseMode() {
    if (!deploymentChoice) return;
    localStorage.setItem('engram_deployment_mode', deploymentChoice);

    if (deploymentChoice === 'cloud' && cloudApiKey.trim()) {
      setCloudLinking(true);
      setCloudError('');
      try {
        const token = localStorage.getItem('engram_token');
        const res = await fetch(`${API_BASE}/v1/cloud/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ apiKey: cloudApiKey.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setCloudError(data.message || data.error || 'Failed to link cloud — check your API key');
          setCloudLinking(false);
          return;
        }
      } catch {
        setCloudError('Network error connecting to cloud');
        setCloudLinking(false);
        return;
      } finally {
        setCloudLinking(false);
      }
    }

    setStep(3);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Engram</span>
          </div>
          <p className="text-sm text-muted-foreground">First-time setup</p>
        </div>

        <StepIndicator current={step} />

        {/* Step 1: Create Account */}
        {step === 1 && (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-1">Create Admin Account</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This will be the owner account for your Engram instance.
              </p>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Display Name</label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Mode */}
        {step === 2 && (
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-1">Choose Your Setup</h2>
              <p className="text-sm text-muted-foreground mb-6">
                How do you want to run Engram? You can change this later in Settings.
              </p>
              {apiKey && (
                <div className="mb-6 rounded-md bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm font-medium mb-1">Your API Key</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">{apiKey}</code>
                  <p className="text-xs text-muted-foreground mt-2">Save this — it won&apos;t be shown again.</p>
                </div>
              )}
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setDeploymentChoice('local')}
                  className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50 ${
                    deploymentChoice === 'local' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <HardDrive className={`h-6 w-6 mt-0.5 shrink-0 ${deploymentChoice === 'local' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">Local Only</p>
                    <p className="text-sm text-muted-foreground">
                      Everything runs on your machine. Zero cloud dependencies. All features unlocked.
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeploymentChoice('cloud')}
                  className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50 ${
                    deploymentChoice === 'cloud' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Cloud className={`h-6 w-6 mt-0.5 shrink-0 ${deploymentChoice === 'cloud' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">Connect to OpenEngram Cloud</p>
                    <p className="text-sm text-muted-foreground">
                      Link to cloud for backup, cross-device sync, and cloud ensemble models.
                    </p>
                  </div>
                </button>
              </div>

              {deploymentChoice === 'cloud' && (
                <div className="mt-4 rounded-md bg-muted/50 border border-border p-4">
                  <p className="text-sm font-medium mb-2">Cloud Connection</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter your OpenEngram Cloud API key to enable backup, sync, and ensemble models.
                    You can also set this up later in Settings → Cloud.
                  </p>
                  {cloudError && (
                    <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive mb-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {cloudError}
                    </div>
                  )}
                  <Input
                    placeholder="eng_cloud_..."
                    type="password"
                    value={cloudApiKey}
                    onChange={(e) => setCloudApiKey(e.target.value)}
                  />
                </div>
              )}

              <Button
                className="w-full mt-6"
                disabled={!deploymentChoice || cloudLinking}
                onClick={handleChooseMode}
              >
                {cloudLinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">You&apos;re All Set!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your Engram instance is ready. Start building AI agents with persistent memory.
              </p>
              <Button className="w-full" onClick={() => router.push('/dashboard')}>
                Go to Dashboard <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
