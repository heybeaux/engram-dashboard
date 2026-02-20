'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/posthog';
import { getApiBaseUrl } from '@/lib/api-config';

const API_BASE = getApiBaseUrl();
const USER_ID = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || 'default';
const NPS_DISMISS_KEY = 'engram_nps_dismissed';
const NPS_LOGIN_COUNT_KEY = 'engram_login_count';
const NPS_FIRST_SEEN_KEY = 'engram_first_seen';

function shouldShowNPS(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(NPS_DISMISS_KEY)) return false;

  const firstSeen = localStorage.getItem(NPS_FIRST_SEEN_KEY);
  if (!firstSeen) {
    localStorage.setItem(NPS_FIRST_SEEN_KEY, Date.now().toString());
    return false;
  }

  const daysSinceFirst = (Date.now() - parseInt(firstSeen)) / (1000 * 60 * 60 * 24);
  if (daysSinceFirst < 7) return false;

  const loginCount = parseInt(localStorage.getItem(NPS_LOGIN_COUNT_KEY) || '0');
  return loginCount >= 5;
}

export function incrementLoginCount() {
  if (typeof window === 'undefined') return;
  const count = parseInt(localStorage.getItem(NPS_LOGIN_COUNT_KEY) || '0');
  localStorage.setItem(NPS_LOGIN_COUNT_KEY, (count + 1).toString());
}

export function NpsSurvey() {
  const { isAuthenticated, token } = useAuth();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isAuthenticated) {
      setVisible(shouldShowNPS());
    }
  }, [isAuthenticated]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(NPS_DISMISS_KEY, Date.now().toString());
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === null) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AM-User-ID': USER_ID,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: score, text, category: 'nps', page: pathname }),
      });
      if (!res.ok) throw new Error('Failed');
      trackEvent('nps_submitted', { score, page: pathname });
      setStatus('success');
      setTimeout(dismiss, 2000);
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96 rounded-lg border bg-background shadow-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">How likely are you to recommend Engram?</h3>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {status === 'success' ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Check className="h-8 w-8 text-green-500" />
          <p className="text-sm text-muted-foreground">Thank you!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex justify-between gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setScore(i)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  score === i
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted-foreground/20'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the main reason for your score? (optional)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none h-16"
          />

          {status === 'error' && (
            <p className="text-xs text-destructive">Failed to send. Try again.</p>
          )}

          <Button type="submit" size="sm" className="w-full" disabled={score === null || status === 'loading'}>
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
