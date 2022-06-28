import { SubsetProvider } from './base';
import {
  DEFAULT_STYLE,
  MDI_DEFAULT_CSS_PREFIX,
  MDI_DEFAULT_FONT_FILE_NAME,
  MDI_DEFAULT_FONT_NAME,
  MDI_FONT_PACKAGE_NAME,
  MDI_SVG_PACKAGE_NAME,
} from './constants';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { join as pathJoin } from 'path';
import { ProviderInterface } from '../types/Provider';
import { MetaData, MetaDataset } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { ProviderOptions } from '../types/ProviderOptions';

/**
 * SubsetProvider for Material design icons.
 */
class MdiProvider extends SubsetProvider implements ProviderInterface {
  packageName = MDI_FONT_PACKAGE_NAME;
  cssPrefix = MDI_DEFAULT_CSS_PREFIX;
  fontName = MDI_DEFAULT_FONT_NAME;
  fontFileName = MDI_DEFAULT_FONT_FILE_NAME;
  hasMultipleStyles = false;

  style2FontFileMap = {
    [DEFAULT_STYLE]: 'fonts/materialdesignicons-webfont.ttf',
  };

  constructor(subset: SubsetItem[], options?: ProviderOptions) {
    super(subset, options);
  }

  moreValidation() {
    super.moreValidation();

    const node_modules_path = 'node_modules';
    const svgPackageDir = pathJoin(node_modules_path, MDI_SVG_PACKAGE_NAME);

    if (!existsSync(svgPackageDir)) {
      throw new Error(
        `Unable to find in ${svgPackageDir} ` +
          'folder. Double-check that you have the package installed as a dependency.'
      );
    }

    const metaJsonPath = pathJoin(svgPackageDir, 'meta.json');

    if (!existsSync(metaJsonPath)) {
      throw new Error(
        `Unable to find in ${metaJsonPath} ` +
          'folder. Double-check that you have the package installed as a dependency.'
      );
    }
  }

  getAllMetaData() {
    const node_modules_path = 'node_modules';
    const svgPackageDir = pathJoin(node_modules_path, MDI_SVG_PACKAGE_NAME);
    const _metaPath = join(svgPackageDir, 'meta.json');

    const metaJSON = JSON.parse(readFileSync(_metaPath).toString());

    const ret: MetaDataset = {};

    metaJSON.forEach((data: any) => {
      const _name = data.name;
      delete data.name;
      ret[_name] = data;
    });
    return ret;
  }

  protected getUpdatedSubsetFromAllMetadata(
    subset: SubsetItem[]
  ): SubsetItem[] {
    const allIconNames = Object.keys(this.allMetaData);

    // update subset
    return Array.from(
      new Set(
        subset
          .map((subsetItem) => {
            const _ret = [subsetItem];
            const nonOutlined = subsetItem.endsWith('-outline')
                ? subsetItem.slice(0, '-outline'.length)
                : subsetItem,
              outlined = `${nonOutlined}-outline`;
            [nonOutlined, outlined].forEach((item) => {
              if (_ret.indexOf(item) < 0 && allIconNames.indexOf(item) > 0)
                _ret.push(item);
            });
            return _ret;
          })
          .flat(2)
      )
    );
  }

  // styles were using different unicode
  normalizeIconMeta(iconName: SubsetItem): MetaData {
    const node_modules_path = 'node_modules';
    const svgPackageDir = pathJoin(node_modules_path, MDI_SVG_PACKAGE_NAME);

    const iconData = this.allMetaData[iconName],
      unicode = iconData.codepoint,
      svgPath = pathJoin(svgPackageDir, `svg/${iconName}.svg`);

    let svgData = undefined;

    try {
      svgData = readFileSync(svgPath).toString();
    } catch (err) {
      // emtpy
    }

    return {
      unicode: unicode,
      styles: [DEFAULT_STYLE],
      svgDataObjects: [
        {
          style: DEFAULT_STYLE,
          svgData: svgData,
        },
      ],
      metaFromPackage: { ...iconData },
    };
  }
}

export { MdiProvider };
