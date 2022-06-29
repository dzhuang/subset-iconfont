import { ProviderConstructor } from './base';
import {
  MI_DEFAULT_CSS_PREFIX,
  MI_DEFAULT_FONT_FILE_NAME,
  MI_DEFAULT_FONT_NAME,
  MI_FONT_PACKAGE_NAME,
  MI_SVG_PACKAGE_NAME,
  MI_STYLES,
} from './constants';
import { join as pathJoin, basename } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { ProviderInterface } from '../types/Provider';
import { MetaData, Style } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { ProviderOptions } from '../types/ProviderOptions';

/**
 * ProviderConstructor for Google Material icons.
 */
class MiProvider extends ProviderConstructor implements ProviderInterface {
  packageName = MI_FONT_PACKAGE_NAME;
  cssPrefix = MI_DEFAULT_CSS_PREFIX;
  fontName = MI_DEFAULT_FONT_NAME;
  fontFileName = MI_DEFAULT_FONT_FILE_NAME;

  constructor(subset: SubsetItem[], options?: ProviderOptions) {
    super(subset, options);
  }

  style2FontFileMap = {
    filled: 'iconfont/material-icons.woff2',
    outlined: 'iconfont/material-icons-outlined.woff2',
    round: 'iconfont/material-icons-round.woff2',
    sharp: 'iconfont/material-icons-sharp.woff2',
    'two-tone': 'iconfont/material-icons-two-tone.woff2',
  };

  getAllMetaData() {
    const node_modules_path = 'node_modules';
    const svgDir = pathJoin(node_modules_path, MI_SVG_PACKAGE_NAME);

    const cssFile = pathJoin(this.baseDir, 'css', 'material-icons.min.css');

    const ret: any = {};

    let allNames: string[] = [];

    MI_STYLES.forEach((style) => {
      const fileNames = readdirSync(pathJoin(svgDir, style)).map((fName) => {
        return basename(fName, '.svg').replace(/_/g, '-');
      });
      allNames = Array.from(new Set(allNames.concat(fileNames)));
    });

    // We were not able a valid meta data file in this package,
    // so we have to read the css file to get it.
    const pattern = /mi-([a-z-]+)::before{content:"\\([a-e0-9]+)"/g,
      cssFileContent = readFileSync(cssFile).toString();
    let match;
    do {
      match = pattern.exec(cssFileContent);
      if (match && allNames.indexOf(match[1]) > -1) {
        ret[match[1]] = { unicode: match[2] };
      }
    } while (match);

    return ret;
  }

  normalizeIconMeta(iconName: SubsetItem): MetaData {
    const node_modules_path = 'node_modules';
    const svgDir = pathJoin(node_modules_path, MI_SVG_PACKAGE_NAME);

    const iconData = this.allMetaData[iconName],
      styles: Style[] = [];

    const _svgDataObjects: any = [],
      existSvgData: string[] = [];

    // Because many style are using the same svg data,
    // we only preserve styles which first use the svg
    MI_STYLES.forEach((style) => {
      const svgData = readFileSync(
        pathJoin(svgDir, style, `${iconName}.svg`.replace(/-/g, '_'))
      ).toString();
      if (existSvgData.indexOf(svgData) > -1) {
        return;
      }

      existSvgData.push(svgData);

      const svgDataObj = {
        style: style,
        svgData: svgData,
      };
      _svgDataObjects.push(svgDataObj);
      styles.push(style);
    });

    return {
      unicode: iconData.unicode,
      styles: styles,
      svgDataObjects: _svgDataObjects,
      metaFromPackage: { ...iconData },
    };
  }
}

export { MiProvider };
