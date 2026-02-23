'use client';

import { useEffect, useState } from 'react';
import { getAccount, type Account } from '@/lib/account-api';
import { getApiBaseUrl } from '@/lib/api-config';

const API_URL = getApiBaseUrl();

interface HealthStatus {
  status: string;
  version?: string;
  uptime?: number;
  metrics?: Record<string, unknown>;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
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
    setAccountError(null);
    try {
      const data = await getAccount();
      setAccount(data);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Failed to load account');
    }
  };

  useEffect(() => {
    checkHealth();
    loadAccount();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usage &amp; Status</h1>
        <button
          onClick={() => { checkHealth(); loadAccount(); }}
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Usage Section */}
      {account && (
        <div className="p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Usage</h2>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
              {account.plan} plan
            </span>
          </div>

          <ProgressBar
            value={account.memoriesUsed}
            max={account.limits.memories}
            label="Memories stored"
          />
          <ProgressBar
            value={account.apiCallsToday}
            max={account.limits.apiCallsPerDay}
            label="API calls today"
          />

          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="text-muted-foreground">Agents</div>
              <div className="font-medium">{account.agents.length} / {account.limits.agents}</div>
            </div>
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="text-muted-foreground">Users per agent</div>
              <div className="font-medium">limit: {account.limits.usersPerAgent}</div>
            </div>
          </div>
        </div>
      )}

      {accountError && (
        <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 text-sm text-yellow-700 dark:text-yellow-300">
          Could not load usage data. {accountError.includes('401') ? 'Please sign in to view usage.' : accountError}
        </div>
      )}

      {/* Health Section */}
      <div className={`p-6 rounded-lg border ${
        loading
          ? 'border-gray-200 dark:border-gray-700'
          : isHealthy
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            loading ? 'bg-gray-400 animate-pulse' : isHealthy ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-lg font-semibold">
            {loading ? 'Checking...' : isHealthy ? 'All Systems Operational' : 'Service Disruption'}
          </span>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {health && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">System Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">{health.status}</div>
            </div>
            {health.version && (
              <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="text-muted-foreground">Version</div>
                <div className="font-medium">{health.version}</div>
              </div>
            )}
            {health.uptime != null && (
              <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="text-muted-foreground">Uptime</div>
                <div className="font-medium">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</div>
              </div>
            )}
          </div>
        </div>
      )}

      {checkedAt && (
        <p className="text-xs text-muted-foreground">
          Last checked: {checkedAt.toLocaleTimeString()}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        API endpoint: <code className="text-xs">{API_URL}</code>
      </p>
    </div>
  );
}
