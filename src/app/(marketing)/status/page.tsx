'use client';

import { useEffect, useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.openengram.ai';

interface HealthData {
  status: string;
  uptime: number;
  dependencies: {
    database: { status: string; latencyMs: number | null; memoryCount: number | null };
    engramEmbed: { status: string; latencyMs: number | null; lastUp: string | null };
  };
  dreamCycle: { lastRun: string | null; status: string } | null;
  memory: { heapUsed: string; heapTotal: string };
  monitoring: { alertCount: number; hasCriticalAlerts: boolean };
  checkedIn: string;
}

type ServiceStatus = 'operational' | 'degraded' | 'down' | 'loading';

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = {
    operational: { label: 'Operational', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
    degraded: { label: 'Degraded', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    down: { label: 'Down', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
    loading: { label: 'Checking...', color: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' },
  }[status];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === 'operational' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  );
}

function ServiceRow({ name, status, detail }: { name: string; status: ServiceStatus; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        {detail && <p className="text-sm text-gray-500">{detail}</p>}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/v1/health`, { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
      setError(false);
    } catch {
      setHealth(null);
      setError(true);
    }
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const overallStatus: ServiceStatus = error
    ? 'down'
    : !health
      ? 'loading'
      : health.status === 'healthy'
        ? 'operational'
        : health.status === 'degraded'
          ? 'degraded'
          : 'down';

  const dbStatus: ServiceStatus = !health
    ? 'loading'
    : health.dependencies.database.status === 'up'
      ? 'operational'
      : 'down';

  const embedStatus: ServiceStatus = !health
    ? 'loading'
    : health.dependencies.engramEmbed.status === 'up'
      ? 'operational'
      : health.dependencies.engramEmbed.status === 'degraded'
        ? 'degraded'
        : 'down';

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Engram Status</h1>
          <div className="mt-4">
            <StatusBadge status={overallStatus} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
          <ServiceRow
            name="API"
            status={overallStatus === 'loading' ? 'loading' : error ? 'down' : 'operational'}
            detail={health ? `Response: ${health.checkedIn} · Uptime: ${formatUptime(health.uptime)}` : undefined}
          />
          <ServiceRow
            name="Database"
            status={dbStatus}
            detail={health?.dependencies.database.latencyMs != null
              ? `Latency: ${health.dependencies.database.latencyMs}ms · ${(health.dependencies.database.memoryCount ?? 0).toLocaleString()} memories`
              : undefined}
          />
          <ServiceRow
            name="Embedding Service"
            status={embedStatus}
            detail={health?.dependencies.engramEmbed.latencyMs != null
              ? `Latency: ${health.dependencies.engramEmbed.latencyMs}ms`
              : undefined}
          />
        </div>

        {health && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Memory Usage</p>
                <p className="font-medium">{health.memory.heapUsed} / {health.memory.heapTotal}</p>
              </div>
              <div>
                <p className="text-gray-500">Active Alerts</p>
                <p className="font-medium">{health.monitoring.alertCount}</p>
              </div>
              {health.dreamCycle && (
                <div>
                  <p className="text-gray-500">Last Dream Cycle</p>
                  <p className="font-medium">{health.dreamCycle.status} — {health.dreamCycle.lastRun ? new Date(health.dreamCycle.lastRun).toLocaleString() : 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-400">
          {lastChecked
            ? `Last checked: ${lastChecked.toLocaleTimeString()} · Auto-refreshes every 30s`
            : 'Checking...'}
        </p>
      </div>
    </div>
  );
}
