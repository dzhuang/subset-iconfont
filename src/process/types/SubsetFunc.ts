import { Style } from "../../types/Metadata";
import { MakeFontContext } from "./MakeFontContext";
import { MakeFontBlob } from "./RenderContext";

export declare type GlyphMetadata = {
  name: string;
  unicode?: string[];
};
export declare type GlyphData = {
  contents: string;
  metadata: GlyphMetadata;
};
export declare type SubsetResult = {
  webfonts: MakeFontBlob[];
  scss: MakeFontBlob[];
  fontFace?: string;
  hash?: string;
};

export type SubsetTask = {
  ttfTargetPath: string;
  subsetItems: string;
  style: Style;
  context: MakeFontContext;
};

export type Format = "woff" | "woff2" | "ttf" | "eot";
export type Formats = Array<Format>;

export type ToSubsetFontsOptions = {
  formats: Formats;
  subsetItems: string;
  ttfTargetPath: string;
  style: Style;
};

export type SubsetFunc = (subsetTask: SubsetTask) => Promise<SubsetResult>;
