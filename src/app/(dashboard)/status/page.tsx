'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  KeyRound,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getAccount, type Account } from '@/lib/account-api';
import { getApiBaseUrl } from '@/lib/api-config';
import { cn } from '@/lib/utils';

const API_URL = getApiBaseUrl();

interface HealthStatus {
  status: string;
  version?: string;
  uptime?: number;
  metrics?: Record<string, unknown>;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number, max: number) {
  if (max <= 0) return '0%';
  return `${Math.min(100, Math.round((value / max) * 100))}%`;
}

function formatUptime(seconds?: number) {
  if (seconds == null) return 'Not reported';
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function usageTone(value: number, max: number): 'healthy' | 'warning' | 'critical' {
  if (max <= 0) return 'healthy';
  const pct = value / max;
  if (pct >= 0.9) return 'critical';
  if (pct >= 0.7) return 'warning';
  return 'healthy';
}

function toneClasses(tone: 'healthy' | 'warning' | 'critical') {
  switch (tone) {
    case 'critical':
      return {
        fill: 'bg-red-400',
        text: 'text-red-200',
        ring: 'border-red-400/30 bg-red-500/10 text-red-100',
      };
    case 'warning':
      return {
        fill: 'bg-amber-300',
        text: 'text-amber-200',
        ring: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
      };
    default:
      return {
        fill: 'bg-emerald-400',
        text: 'text-emerald-200',
        ring: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
      };
  }
}

function ProgressMeter({
  value,
  max,
  label,
  helper,
}: {
  value: number;
  max: number;
  label: string;
  helper?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const tone = usageTone(value, max);
  const classes = toneClasses(tone);

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {helper && <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>}
        </div>
        <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', classes.ring)}>
          {formatPercent(value, max)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full transition-all duration-500', classes.fill)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>{formatNumber(value)} used</span>
        <span>{formatNumber(max)} limit</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm shadow-black/10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

function StatusPill({ loading, healthy }: { loading: boolean; healthy: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
        Checking
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium',
        healthy
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
          : 'border-red-400/30 bg-red-400/10 text-red-100',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', healthy ? 'bg-emerald-300' : 'bg-red-300')} />
      {healthy ? 'Operational' : 'Needs attention'}
    </span>
  );
}

function LoadingUsageCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/70 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading account usage…</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setHealth(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach API');
      setHealth(null);
    } finally {
      setLoading(false);
      setCheckedAt(new Date());
    }
  };

  const loadAccount = async () => {
    setAccountLoading(true);
    setAccountError(null);
    try {
      const data = await getAccount();
      setAccount(data);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to load account');
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadAccount();
    const interval = setInterval(checkHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok';
  const checkedAtLabel = checkedAt ? checkedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : 'Not checked yet';

  const usageSummary = useMemo(() => {
    if (!account) return null;
    return [
      {
        icon: Database,
        label: 'Memories',
        value: `${formatNumber(account.memoriesUsed)} / ${formatNumber(account.limits.memories)}`,
        detail: `${formatPercent(account.memoriesUsed, account.limits.memories)} of storage allowance used.`,
      },
      {
        icon: Activity,
        label: 'API calls',
        value: `${formatNumber(account.apiCallsToday)} / ${formatNumber(account.limits.apiCallsPerDay)}`,
        detail: `${formatPercent(account.apiCallsToday, account.limits.apiCallsPerDay)} of today’s request allowance used.`,
      },
      {
        icon: Users,
        label: 'Agents',
        value: `${formatNumber(account.agents.length)} / ${formatNumber(account.limits.agents)}`,
        detail: `Current account agent allocation on the ${account.plan} plan.`,
      },
      {
        icon: KeyRound,
        label: 'Users / agent',
        value: formatNumber(account.limits.usersPerAgent),
        detail: 'Maximum users that can be attached to each agent.',
      },
    ];
  }, [account]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/30 md:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Usage & Status
              </span>
              <StatusPill loading={loading} healthy={isHealthy} />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Account limits and API health, without the wall of gauges.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                A quick operational read on the current Engram account, daily API usage, and the backing API endpoint. This page refreshes health every 30 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              checkHealth();
              loadAccount();
            }}
            disabled={loading || accountLoading}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading || accountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh now
          </button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">API status</p>
            <p className="mt-2 text-2xl font-semibold text-white">{loading ? 'Checking…' : isHealthy ? 'Operational' : 'Disrupted'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Last checked</p>
            <p className="mt-2 text-2xl font-semibold text-white">{checkedAtLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Endpoint</p>
            <p className="mt-2 truncate font-mono text-sm text-slate-200" title={API_URL}>{API_URL}</p>
          </div>
        </div>
      </section>

      {accountLoading && !account && <LoadingUsageCard />}

      {account && usageSummary && (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-card/75 p-6 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current plan</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight capitalize text-foreground">{account.plan} usage</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  High-signal limits first. Color only changes when usage is getting close to a threshold.
                </p>
              </div>
              <span className="w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                {account.plan} plan
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <ProgressMeter
                value={account.memoriesUsed}
                max={account.limits.memories}
                label="Memories stored"
                helper="Persistent memories currently stored against this account."
              />
              <ProgressMeter
                value={account.apiCallsToday}
                max={account.limits.apiCallsPerDay}
                label="API calls today"
                helper="Requests counted against the daily account allowance."
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {usageSummary.map((item) => (
              <MetricCard key={item.label} {...item} />
            ))}
          </div>
        </section>
      )}

      {accountError && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-semibold">Could not load usage data.</span>{' '}
              {accountError.includes('401') ? 'Please sign in to view account usage.' : accountError}
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className={cn(
            'rounded-3xl border p-6 shadow-xl shadow-black/20',
            loading
              ? 'border-white/10 bg-card/75'
              : isHealthy
                ? 'border-emerald-400/20 bg-emerald-500/[0.07]'
                : 'border-red-400/25 bg-red-500/[0.08]',
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl border',
                loading
                  ? 'border-white/10 bg-white/5 text-muted-foreground'
                  : isHealthy
                    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                    : 'border-red-400/25 bg-red-400/10 text-red-200',
              )}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isHealthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Service health</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {loading ? 'Checking the API…' : isHealthy ? 'All systems operational' : 'Service disruption'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Live health check against the configured Engram API endpoint.
              </p>
              {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card/75 p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">System details</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">API response</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Status</p>
              <p className="mt-2 truncate text-lg font-semibold">{health?.status ?? 'Unknown'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground"><Gauge className="h-3.5 w-3.5" /> Version</p>
              <p className="mt-2 truncate text-lg font-semibold">{health?.version ?? 'Not reported'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Uptime</p>
              <p className="mt-2 truncate text-lg font-semibold">{formatUptime(health?.uptime)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Configured endpoint</p>
            <code className="mt-2 block overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground/90">{API_URL}</code>
          </div>
        </div>
      </section>
    </div>
  );
}
