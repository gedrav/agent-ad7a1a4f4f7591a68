export type AssetEntry = {
  TYPE: string;
  NAME: string;
  ASSETTYPE?: string;
  file?: [number, number];
  TEXTURES?: number[];
  spineImageType?: string;
};

export type AssetBundle = {
  name: string;
  assets: AssetEntry[];
};

export type UIElementConfig = {
  name: string;
  type: string;
  Elements?: UIElementConfig[];
  layoutData?: Record<string, unknown>;
  [key: string]: unknown;
};
