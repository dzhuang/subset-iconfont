import { MetaDataset, Style } from '../../types/Metadata';
import { Logger } from '../../types/Logger';
import { Formats } from './SubsetFunc';
import { CssChoice } from './CssChoices';

export declare type BlobCategory = 'webfonts' | 'scss' | 'css' | 'licenses';
export declare type BlobObject = Record<BlobCategory, MakeFontBlob[]>;
export declare type MakeFontBlob = {
  dir: string;
  name: string;
  data: Buffer | string;
};
export declare type WriteOutFile = BlobCategory | 'web' | 'metadata';
export declare type WriteOutFiles = Array<WriteOutFile>;
declare type RenderContextBase = {
  prefix: string;
  fontName: string;
  formats: Formats;
  fontFileName: string;
  cssChoices?: CssChoice[];
};
export declare type FontFaceRenderContext = RenderContextBase & {
  hash?: string | undefined;
  style: Style;
  fontWeight: number | string;
  taskSubsetItems: any;
};
export declare type RenderContext = RenderContextBase & {
  icons: MetaDataset;
  fontWeightDefault: number | string;
  SCSSTargets: string[];
  webfontDir: string;
  generateMinCss?: boolean;
  generateSourceMap?: boolean;
  license?: string;
  logger: Logger;
  blobObject: BlobObject;
  writeOutFiles: WriteOutFiles;
};
