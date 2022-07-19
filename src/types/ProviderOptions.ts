import { LoggerOptions } from './Logger';
import { WriteOutFiles } from '../process/types/RenderContext';
import { Formats } from '../process/types/SubsetFunc';
import { CssChoice } from '../process/types/CssChoices';

export declare type ProviderOptions = {
  formats?: Formats;
  sort?: boolean;
  addHashInFontUrl?: boolean;
  fontName?: string;
  fontFileName?: string;
  prefix?: string;
  webfontDir?: string;
  generateMinCss?: boolean;
  generateCssMap?: boolean;
  loggerOptions?: LoggerOptions;
  writeOutFiles?: WriteOutFiles;
  cssChoices?: CssChoice[];
};
