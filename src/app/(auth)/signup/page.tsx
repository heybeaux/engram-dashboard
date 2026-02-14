'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createCheckout } from '@/lib/account-api';
import { trackEvent, identifyUser } from '@/lib/posthog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

const PLANS = [
  { id: 'STARTER', name: 'Starter', price: '$9/mo', features: ['10,000 memories', '1,000 API calls/day', '3 agents'] },
  { id: 'PRO', name: 'Pro', price: '$39/mo', features: ['100,000 memories', '10,000 API calls/day', '10 agents'] },
  { id: 'SCALE', name: 'Scale', price: '$99/mo', features: ['1,000,000 memories', '100,000 API calls/day', 'Unlimited agents'] },
] as const;

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('STARTER');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-select plan from URL query param (e.g. ?plan=starter)
  useEffect(() => {
    const planParam = searchParams.get('plan')?.toUpperCase();
    if (planParam && PLANS.some((p) => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
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
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }
    if (!accessCode && !selectedPlan) {
      setError('Please select a plan or enter an access code');
      return;
    }

    setLoading(true);
    const result = await register(
      email,
      password,
      name,
      accessCode ? undefined : selectedPlan,
      accessCode || undefined,
    );
    setLoading(false);

    if (result.success) {
      identifyUser(email, { name });
      trackEvent('user_signed_up', { email, name, plan: result.selectedPlan, accessCode: !!accessCode });
      if (result.apiKey) {
        sessionStorage.setItem('engram_onboarding_apikey', result.apiKey);
      }
      if (result.needsPayment && result.selectedPlan) {
        // Redirect to Stripe Checkout for payment
        try {
          const { url } = await createCheckout(result.selectedPlan);
          window.location.href = url;
          return; // Don't setLoading(false) — we're navigating away
        } catch {
          // If checkout fails, go to onboarding and let them pay from billing page
          setError('Could not start checkout. You can upgrade from the billing page.');
          router.push('/onboarding');
        }
      } else {
        router.push(result.apiKey ? '/onboarding' : '/dashboard');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  }

  return (
    <Card className="border-border/50 max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">Create your account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select a plan</label>
            <div className="grid gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => { setSelectedPlan(plan.id); setAccessCode(''); }}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedPlan === plan.id && !accessCode
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    selectedPlan === plan.id && !accessCode ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    {selectedPlan === plan.id && !accessCode && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">{plan.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.features.join(' · ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Access Code Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAccessCode(!showAccessCode)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAccessCode ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Have an access code?
            </button>
            {showAccessCode && (
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoComplete="off"
                />
                {accessCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Access code will override plan selection
                  </p>
                )}
              </div>
            )}
          </div>

          <hr className="border-border" />

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
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
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= strength.score ? strength.color : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline" target="_blank">
                Terms of Service
              </Link>
            </span>
          </label>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {accessCode ? 'Create account' : `Start with ${PLANS.find(p => p.id === selectedPlan)?.name || 'Starter'}`}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
