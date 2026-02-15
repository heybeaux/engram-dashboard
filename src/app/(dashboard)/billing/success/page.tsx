'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/posthog';

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    trackEvent('checkout_completed', { sessionId });
  }, [sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your subscription is now active. Your plan will be updated momentarily.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard in {countdown}s...
          </p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
