import { ProviderInterface } from '../types/Provider';

import { ProviderConstructor } from './base';
import {
  FONT_AWESOME4_DEFAULT_FONT_FILE_NAME,
  FONT_AWESOME4_DEFAULT_FONT_NAME,
  FONT_AWESOME4_DEFAULT_CSS_PREFIX,
  FONT_AWESOME4_PACKAGE_NAME,
  DEFAULT_STYLE,
} from './constants';
import { resolve } from 'path';
import { readFileSync} from 'fs';
import { MetaData } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { ProviderOptions } from '../types/ProviderOptions';

/**
 * ProviderConstructor for Font Awesome 4.
 */
class Fa4Provider extends ProviderConstructor implements ProviderInterface {
  packageName = FONT_AWESOME4_PACKAGE_NAME;
  cssPrefix = FONT_AWESOME4_DEFAULT_CSS_PREFIX;
  fontName = FONT_AWESOME4_DEFAULT_FONT_NAME;
  fontFileName = FONT_AWESOME4_DEFAULT_FONT_FILE_NAME;
  hasMultipleStyles = false;

  style2FontFileMap = {
    [DEFAULT_STYLE]: 'fonts/fontawesome-webfont.ttf'
  };

  constructor(subset: SubsetItem[], options?: ProviderOptions) {
    super(subset, options);
  }

  moreValidation() {
    super.moreValidation();
    this.validateSubPath('fonts');
    this.validateSubPath('scss/_variables.scss');
  }

  getAllMetaData() {
    const scssFilePath = resolve(this.baseDir, 'scss/_variables.scss');

    const ret: any = {};

    // We were not able a valid meta data file in this package,
    // so we have to read the scss file to get it.
    const pattern = /\$fa-var-([0-9a-z-]+): "\\([a-f0-9]+)"/g,
      scssFileContent = readFileSync(scssFilePath).toString();
    let match;
    do {
      match = pattern.exec(scssFileContent);
      if (match) {
        ret[match[1]] = { unicode: match[2] };
      }
    } while (match);

    return ret;
  }

  normalizeIconMeta(iconName: SubsetItem): MetaData {
    return {
      unicode: this.allMetaData[iconName].unicode,
      svgDataObjects: [
        {
          style: DEFAULT_STYLE,

          // todo: shall we completely remove svgDtaObjects?
          svgData: "",
        },
      ],
      styles: [DEFAULT_STYLE]
    };
  }
}

export { Fa4Provider };
