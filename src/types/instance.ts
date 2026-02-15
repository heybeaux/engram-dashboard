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

/** Default instance info when API is unreachable — assume self-hosted with all features */
export const DEFAULT_INSTANCE_INFO: InstanceInfo = {
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
