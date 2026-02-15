"use client";

import { useInstance } from "@/context/instance-context";
import { InstanceFeatures } from "@/types/instance";

export function useFeatureGate(feature: keyof InstanceFeatures): boolean {
  const { features } = useInstance();
  return features[feature] ?? false;
}
