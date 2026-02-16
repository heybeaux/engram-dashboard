export type Edition = "local" | "cloud";

export interface InstanceFeatures {
  localEmbeddings: boolean;
  cloudEnsemble: boolean;
  codeSearch: boolean;
  cloudBackup: boolean;
  crossDeviceSync: boolean;
  billing: boolean;
}

export type InstanceMode = "cloud" | "self-hosted";

export interface InstanceInfo {
  mode: InstanceMode;
  edition: Edition;
  features: InstanceFeatures;
  version: string;
  cloudLinked: boolean;
}

/**
 * Build-time edition flag.
 * Set NEXT_PUBLIC_EDITION=cloud for managed SaaS; defaults to "local".
 */
export const EDITION: Edition =
  (process.env.NEXT_PUBLIC_EDITION as Edition) || "local";

export const isCloud = EDITION === "cloud";
export const isLocal = EDITION === "local";

/**
 * Default instance info based on build-time edition.
 * The /v1/instance/info API call can override at runtime.
 */
export const DEFAULT_INSTANCE_INFO: InstanceInfo = isCloud
  ? {
      mode: "cloud",
      edition: "cloud",
      features: {
        localEmbeddings: false,
        cloudEnsemble: true,
        codeSearch: false,
        cloudBackup: true,
        crossDeviceSync: true,
        billing: true,
      },
      version: "unknown",
      cloudLinked: false,
    }
  : {
      mode: "self-hosted",
      edition: "local",
      features: {
        localEmbeddings: true,
        cloudEnsemble: false,
        codeSearch: true,
        cloudBackup: false,
        crossDeviceSync: false,
        billing: false,
      },
      version: "unknown",
      cloudLinked: false,
    };
