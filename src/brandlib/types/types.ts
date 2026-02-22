export type AssetEntry = {
  TYPE: string;
  NAME: string;
  ASSETTYPE?: string;
  file?: [number, number];
  TEXTURES?: number[];
};

export type AssetBundle = {
  name: string;
  assets: AssetEntry[];
};
