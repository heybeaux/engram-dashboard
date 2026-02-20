'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, Star, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/posthog';
import { getApiBaseUrl } from '@/lib/api-config';

const API_BASE = getApiBaseUrl();

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
];

export function FeedbackWidget() {
  const { isAuthenticated, token, user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AM-User-ID': user?.id || 'default',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, text, category, page: pathname }),
      });
      if (!res.ok) throw new Error('Failed');
      trackEvent('feedback_submitted', { rating, category, page: pathname });
      setStatus('success');
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
        setRating(0);
        setText('');
        setCategory('general');
      }, 1500);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-80 rounded-lg border bg-background shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Send Feedback</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Check className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Star rating */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Text */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us more (optional)..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none h-20"
              />

              {status === 'error' && (
                <p className="text-xs text-destructive">Failed to send. Try again.</p>
              )}

              <Button type="submit" size="sm" className="w-full" disabled={rating === 0 || status === 'loading'}>
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit
              </Button>
            </form>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </button>
      )}
    </div>
  );
}
