import { Logger } from '../../types/Logger';
import { ProviderOptions } from '../../types/ProviderOptions';
import { Style2FontFileMap } from '../../types/Provider';

export type MakeFontContext = {
  style2FontFileMap: Style2FontFileMap;
  options: ProviderOptions;
  fontFileName: string;
  originalCSSPrefix: string;
  logger: Logger;
  hasMultipleStyles: boolean;
  licenseContent: string | undefined;
};
