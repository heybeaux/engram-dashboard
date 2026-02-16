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
  features: InstanceFeatures;
  version: string;
  cloudLinked: boolean;
}

/**
 * Default instance info when API is unreachable.
 * If NEXT_PUBLIC_DEPLOYMENT_MODE=cloud, default to cloud (hide self-hosted features).
 * Otherwise assume self-hosted with all local features.
 */
const IS_CLOUD_BUILD = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "cloud";

export const DEFAULT_INSTANCE_INFO: InstanceInfo = IS_CLOUD_BUILD
  ? {
      mode: "cloud",
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
