import { ProviderConstructor } from './base';
import {
  DEFAULT_STYLE,
  BOOTSTRAP_ICON_CSS_PREFIX,
  BOOTSTRAP_ICONS_FONT_FILE_NAME,
  BOOTSTRAP_ICON_FONT_NAME,
  BOOTSTRAP_ICON_PACKAGE_NAME,
} from './constants';
import { join } from 'path';
import { readFileSync } from 'fs';
import { WarningError } from '../utils/errors';
import { ProviderInterface } from '../types/Provider';
import { MetaData, MetaDataset } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { ProviderOptions } from '../types/ProviderOptions';

/**
 * ProviderConstructor for Bootstrap icons.
 */
class BiProvider extends ProviderConstructor implements ProviderInterface {
  packageName = BOOTSTRAP_ICON_PACKAGE_NAME;
  cssPrefix = BOOTSTRAP_ICON_CSS_PREFIX;
  fontName = BOOTSTRAP_ICON_FONT_NAME;
  fontFileName = BOOTSTRAP_ICONS_FONT_FILE_NAME;
  hasMultipleStyles = false;

  style2FontFileMap = {
    [DEFAULT_STYLE]: 'font/fonts/bootstrap-icons.woff2',
  };

  constructor(subset: SubsetItem[], options?: ProviderOptions) {
    super(subset, options);
  }

  moreValidation() {
    super.moreValidation();
    this.validateSubPath('font');
    this.validateSubPath('font/bootstrap-icons.json');
    this.validateSubPath('icons');
  }

  getAllMetaData() {
    const _metaPath = join(this.baseDir, 'font', 'bootstrap-icons.json');

    const meta = JSON.parse(readFileSync(_metaPath).toString());

    const ret: { [key: SubsetItem]: any } = {};
    Object.entries(meta).map(([key, value]) => {
      ret[key] = { unicode: (value as any).toString(16) };
    });

    return ret as MetaDataset;
  }

  normalizeIconMeta(iconName: SubsetItem): MetaData {
    const iconData = this.allMetaData[iconName],
      unicode = iconData.unicode;

    try {
      const svgPath = this.validateSubPath(`icons/${iconName}.svg`);
      return {
        unicode: unicode,
        svgDataObjects: [
          {
            style: DEFAULT_STYLE,
            svgData: readFileSync(svgPath).toString(),
          },
        ],
        metaFromPackage: { ...iconData },
      };
    } catch (error: any) {
      throw new WarningError(error.message);
    }
  }
}

export { BiProvider };
