import { Logger } from "../../types/Logger";
import { ProviderOptions } from "../../types/ProviderOptions";

export type MakeFontContext = {
  styleTtfMap: { [key: string]: string };
  options: ProviderOptions;
  fontFileName: string;
  originalCSSPrefix: string;
  logger: Logger;
  hasMultipleStyles: boolean;
  licenseContent: string | undefined;
};
