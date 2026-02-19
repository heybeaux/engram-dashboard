"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { InstanceInfo, DEFAULT_INSTANCE_INFO } from "@/types/instance";

const API_BASE = process.env.NEXT_PUBLIC_ENGRAM_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.openengram.ai';
const USER_ID = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || "default";
const defaultHeaders: Record<string, string> = { "X-AM-User-ID": USER_ID };

let cachedInfo: InstanceInfo | null = null;

export function invalidateInstanceCache() {
  cachedInfo = null;
}

export function useInstanceInfo() {
  const [info, setInfo] = useState<InstanceInfo>(cachedInfo || DEFAULT_INSTANCE_INFO);
  const [isLoading, setIsLoading] = useState(!cachedInfo);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/instance/info`, { headers: defaultHeaders });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: InstanceInfo = await res.json();
      cachedInfo = data;
      setInfo(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
      return info;
    }
  }, [info]);

  useEffect(() => {
    if (cachedInfo || fetched.current) return;
    fetched.current = true;

    fetch(`${API_BASE}/v1/instance/info`, { headers: defaultHeaders })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: InstanceInfo) => {
        cachedInfo = data;
        setInfo(data);
      })
      .catch((err) => {
        // Graceful fallback: assume self-hosted with all features
        setError(err.message);
        setInfo(DEFAULT_INSTANCE_INFO);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { info, isLoading, error, refresh };
}
