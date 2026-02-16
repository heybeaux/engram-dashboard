"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useInstanceInfo } from "@/hooks/useInstanceInfo";
import { InstanceFeatures, InstanceMode, Edition, DEFAULT_INSTANCE_INFO, EDITION, isCloud, isLocal } from "@/types/instance";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.openengram.ai";

interface InstanceContextType {
  mode: InstanceMode;
  edition: Edition;
  isCloud: boolean;
  isLocal: boolean;
  features: InstanceFeatures;
  cloudLinked: boolean;
  version: string;
  isLoading: boolean;
  error: string | null;
  refreshInstance: () => Promise<void>;
}

const InstanceContext = createContext<InstanceContextType>({
  mode: DEFAULT_INSTANCE_INFO.mode,
  edition: EDITION,
  isCloud,
  isLocal,
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

  // Check if setup is needed and redirect (self-hosted only)
  useEffect(() => {
    if (setupChecked || isLoading || pathname === "/setup") return;
    // Cloud deployments never need the setup wizard
    if (info.mode === "cloud") {
      setSetupChecked(true);
      return;
    }

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
  }, [pathname, router, setupChecked, isLoading, info.mode]);

  const refreshInstance = React.useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <InstanceContext.Provider
      value={{
        mode: info.mode,
        edition: EDITION,
        isCloud,
        isLocal,
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
