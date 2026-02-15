"use client";

import { useState, useEffect, useRef } from "react";
import { InstanceInfo, DEFAULT_INSTANCE_INFO } from "@/types/instance";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.openengram.ai";

let cachedInfo: InstanceInfo | null = null;

export function useInstanceInfo() {
  const [info, setInfo] = useState<InstanceInfo>(cachedInfo || DEFAULT_INSTANCE_INFO);
  const [isLoading, setIsLoading] = useState(!cachedInfo);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (cachedInfo || fetched.current) return;
    fetched.current = true;

    fetch(`${API_BASE}/v1/instance/info`)
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

  return { info, isLoading, error };
}
