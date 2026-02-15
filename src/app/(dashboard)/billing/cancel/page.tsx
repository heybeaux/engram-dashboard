'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { trackEvent } from '@/lib/posthog';
import { useEffect } from 'react';

export default function BillingCancelPage() {
  const router = useRouter();

  useEffect(() => {
    trackEvent('checkout_cancelled');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Checkout Cancelled</h1>
          <p className="text-muted-foreground">
            No worries — you can upgrade anytime from the billing page.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/billing')} variant="default">
              View Plans
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
