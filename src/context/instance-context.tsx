"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useInstanceInfo } from "@/hooks/useInstanceInfo";
import { InstanceInfo, InstanceFeatures, InstanceMode, DEFAULT_INSTANCE_INFO } from "@/types/instance";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.openengram.ai";

interface InstanceContextType {
  mode: InstanceMode;
  features: InstanceFeatures;
  cloudLinked: boolean;
  version: string;
  isLoading: boolean;
  error: string | null;
  refreshInstance: () => Promise<void>;
}

const InstanceContext = createContext<InstanceContextType>({
  mode: DEFAULT_INSTANCE_INFO.mode,
  features: DEFAULT_INSTANCE_INFO.features,
  cloudLinked: DEFAULT_INSTANCE_INFO.cloudLinked,
  version: DEFAULT_INSTANCE_INFO.version,
  isLoading: true,
  error: null,
  refreshInstance: async () => {},
});

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const { info, isLoading, error, refresh } = useInstanceInfo();
  const router = useRouter();
  const pathname = usePathname();
  const [setupChecked, setSetupChecked] = useState(false);

  // Check if setup is needed and redirect
  useEffect(() => {
    if (setupChecked || pathname === "/setup") return;

    fetch(`${API_BASE}/v1/auth/setup-status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.needsSetup) {
          router.replace("/setup");
        }
      })
      .catch(() => {
        // API unreachable — don't redirect
      })
      .finally(() => setSetupChecked(true));
  }, [pathname, router, setupChecked]);

  const refreshInstance = React.useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <InstanceContext.Provider
      value={{
        mode: info.mode,
        features: info.features,
        cloudLinked: info.cloudLinked,
        version: info.version,
        isLoading,
        error,
        refreshInstance,
      }}
    >
      {children}
    </InstanceContext.Provider>
  );
}

export function useInstance() {
  return useContext(InstanceContext);
}
