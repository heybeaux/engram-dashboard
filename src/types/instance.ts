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

/** Default instance info while loading — safe defaults that hide all optional features
 *  until the API confirms the actual mode. Prevents self-hosted features leaking on cloud. */
export const DEFAULT_INSTANCE_INFO: InstanceInfo = {
  mode: "cloud",
  features: {
    localEmbeddings: false,
    cloudEnsemble: false,
    codeSearch: false,
    cloudBackup: false,
    crossDeviceSync: false,
    billing: false,
  },
  version: "unknown",
  cloudLinked: false,
};
