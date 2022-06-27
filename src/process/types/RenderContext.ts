import { MetaDataset, Style } from "../../types/Metadata";
import { Logger } from "../../types/Logger";
import { Formats } from "./SubsetFunc";

export declare type BlobCategory = "webfonts" | "scss" | "css" | "licenses";
export declare type BlobObject = Record<BlobCategory, MakeFontBlob[]>;
export declare type MakeFontBlob = {
  dir: string;
  name: string;
  data: Buffer | string;
  hash?: string;
};
export declare type WriteOutFile = BlobCategory | "web" | "metadata";
export declare type WriteOutFiles = Array<WriteOutFile>;
declare type RenderContextBase = {
  prefix: string;
  fontName: string;
  formats: Formats;
  fontFileName: string;
};
export declare type FontFaceRenderContext = RenderContextBase & {
  hash?: string | undefined;
  style: Style;
  fontWeight: number | string;
};
export declare type RenderContext = RenderContextBase & {
  icons: MetaDataset;
  fontWeightDefault: number | string;
  fontFileName: string;
  SCSSTargets: string[];
  webfontDir: string;
  generateMinCss?: boolean;
  generateSourceMap?: boolean;
  license?: string;
  logger: Logger;
  blobObject: BlobObject;
  writeOutFiles: WriteOutFiles;
  endUnicode: number;
};
