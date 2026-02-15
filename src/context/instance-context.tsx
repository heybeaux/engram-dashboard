"use client";

import React, { createContext, useContext } from "react";
import { useInstanceInfo } from "@/hooks/useInstanceInfo";
import { InstanceInfo, InstanceFeatures, InstanceMode, DEFAULT_INSTANCE_INFO } from "@/types/instance";

interface InstanceContextType {
  mode: InstanceMode;
  features: InstanceFeatures;
  cloudLinked: boolean;
  version: string;
  isLoading: boolean;
  error: string | null;
}

const InstanceContext = createContext<InstanceContextType>({
  mode: DEFAULT_INSTANCE_INFO.mode,
  features: DEFAULT_INSTANCE_INFO.features,
  cloudLinked: DEFAULT_INSTANCE_INFO.cloudLinked,
  version: DEFAULT_INSTANCE_INFO.version,
  isLoading: true,
  error: null,
});

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const { info, isLoading, error } = useInstanceInfo();

  return (
    <InstanceContext.Provider
      value={{
        mode: info.mode,
        features: info.features,
        cloudLinked: info.cloudLinked,
        version: info.version,
        isLoading,
        error,
      }}
    >
      {children}
    </InstanceContext.Provider>
  );
}

export function useInstance() {
  return useContext(InstanceContext);
}
