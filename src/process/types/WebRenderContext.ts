import { MetaDataset } from "../../types/Metadata";

export declare type WebRenderContext = {
  prefix: string;
  icons: MetaDataset;
  brandIcon: string;
  version: string;
  npmPackage: string;
  url: string;
  author: string;
  cacheString?: string;
  fontName: string;
};
