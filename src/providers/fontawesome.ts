import { ProviderInterface } from '../types/Provider';

const yaml = require('js-yaml');

import { ProviderConstructor } from './base';
import {
  FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME,
  FONT_AWESOME_FREE_DEFAULT_FONT_NAME,
  FONT_AWESOME_FREE_DEFAULT_CSS_PREFIX,
  FONT_AWESOME_FREE_PACKAGE_NAME,
} from './constants';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { MetaData, Style, SVGDataObj } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { ProviderOptions } from '../types/ProviderOptions';

/**
 * ProviderConstructor for Font Awesome Free.
 */
class FaFreeProvider extends ProviderConstructor implements ProviderInterface {
  packageName = FONT_AWESOME_FREE_PACKAGE_NAME;
  minVersion = '5.0';
  cssPrefix = FONT_AWESOME_FREE_DEFAULT_CSS_PREFIX;
  fontName = FONT_AWESOME_FREE_DEFAULT_FONT_NAME;
  fontFileName = FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME;

  style2FontFileMap = {
    brands: 'webfonts/fa-brands-400.ttf',
    regular: 'webfonts/fa-regular-400.ttf',
    solid: 'webfonts/fa-solid-900.ttf',
  };

  constructor(subset: SubsetItem[], options?: ProviderOptions) {
    super(subset, options);
  }

  moreValidation() {
    super.moreValidation();
    this.validateSubPath('metadata');
    this.validateSubPath('metadata/icons.yml');
    this.validateSubPath('svgs');
  }

  getAllMetaData() {
    const _metaYmlPath = resolve(this.baseDir, 'metadata/icons.yml');
    return yaml.load(readFileSync(_metaYmlPath, 'utf-8'));
  }

  normalizeIconMeta(iconName: SubsetItem): MetaData {
    const iconData = this.allMetaData[iconName],
      unicode = iconData.unicode,
      styles = iconData.styles,
      svgDataObjects: SVGDataObj[] = [];

    styles.forEach((style: Style) => {
      const svgFilePath = this.validateSubPath(`svgs/${style}/${iconName}.svg`);
      svgDataObjects.push({
        style: style,
        svgData: readFileSync(svgFilePath).toString(),
      });
    });

    delete iconData.unicode;
    return {
      unicode: unicode,
      styles: iconData.styles,
      svgDataObjects: svgDataObjects,
      metaFromPackage: { ...iconData },
    };
  }
}

export { FaFreeProvider };
