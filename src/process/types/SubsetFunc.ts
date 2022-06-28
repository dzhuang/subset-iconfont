import { Style } from "../../types/Metadata";
import { MakeFontContext } from "./MakeFontContext";
import { MakeFontBlob } from "./RenderContext";

export declare type IconData = {
  name: string;
  unicode: string;
};
export declare type IconMetaData = {
  contents: string;
  metadata: IconData;
};
export declare type SubsetResult = {
  webfonts: MakeFontBlob[];
  scss: MakeFontBlob[];
  fontFace?: string;
  hash?: string;
};

export type SubsetTask = {
  targetFontPath: string;
  subsetItems: any[];
  style: Style;
  context: MakeFontContext;
};

export type Format = "woff" | "woff2" | "ttf" | "eot";
export type Formats = Array<Format>;

export type ToSubsetFontsOptions = {
  subsetItems: any[];
  targetFontPath: string;
  style: Style;
};

export type SubsetFunc = (subsetTask: SubsetTask) => Promise<SubsetResult>;
