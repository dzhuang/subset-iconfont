/**
 * Author: Dong Zhuang <dzhuang.scut@gmail.com>
 */

import { getLogger, mergeObjectArrayValues } from './utils/utils';
import { join as pathJoin } from 'path';
import {
  DEFAULT_COMBINE_FILE_NAME,
  DEFAULT_COMBINE_FONT_NAME,
  DEFAULT_COMBINE_PREFIX, DEFAULT_CSS_CHOICES,
  DEFAULT_LOGGER_LEVEL,
  DEFAULT_OUTPUT_FORMATS,
  DEFAULT_WRITE_OUT_FILES,
  PACKAGES_OUTPUT_DIR,
  WEBFONTS_DIR_NAME,
} from './providers/constants';
import { ConfigError } from './utils/errors';
import { ProviderConstructor } from './providers/base';
import { SubsetIconfont } from './types';
import { RenderContext } from './process/types/RenderContext';
import { MakeFontResult } from './process/types/MakeFontResult';

import render from './process/render';

/**
 * @name subsetIconfont
 * @description Extract subset(s) of icons from multiple providers (iconfont npm packages)
 * and generate webfonts for each, along with css/scss, with the Font-Awesome styles.
 * See "./demo-combine.js" for use case examples.
 *
 * @param providerInstances an array of ProviderConstructor Objects. Currently, available providers include
 * `MdiProvider`, `FaFreeProvider`, `BiProvider` and `BiProvider`.
 * @param outputDir Output directory of generated webfonts, along with css/scss, metadata and font license,
 * defaults to `./output`.
 * @param options tweaks for further configurations.
 */
const subsetIconfont: SubsetIconfont = (
  providerInstances,
  outputDir = './output',
  options = {}
) => {
  if (!Array.isArray(providerInstances)) {
    throw new ConfigError(
      `subsetObjects must be an array, while got a ${typeof providerInstances}.`
    );
  }
  if (!providerInstances.length)
    return new Promise((resolve) => {
      return resolve({} as MakeFontResult);
    });
  providerInstances.forEach((obj: any) => {
    if (!(obj instanceof ProviderConstructor)) {
      throw new ConfigError(
        `Members in subsetObject must be Provider instance objects, while got a ${typeof obj}: "${obj}".`
      );
    }
  });

  if (
    typeof options !== 'undefined' &&
    !(typeof options === 'object' && options !== null)
  ) {
    throw new ConfigError(
      `iconFontSubset options must be an object (if provided）, while got a ${typeof options}: "${options}".`
    );
  }

  options.loggerOptions =
    typeof options.loggerOptions === 'undefined' ? {} : options.loggerOptions;
  options.loggerOptions.level =
    options.loggerOptions.level || DEFAULT_LOGGER_LEVEL;

  const outputPackages = !!options.outputPackages;

  const logger = getLogger(options.loggerOptions);

  logger.info('Process started');

  const fontFileName = options.fontFileName || DEFAULT_COMBINE_FILE_NAME,
    fontName = options.fontName || DEFAULT_COMBINE_FONT_NAME,
    formats = options.formats || DEFAULT_OUTPUT_FORMATS,
    generateCssMap =
      'undefined' === typeof options.generateCssMap
        ? true
        : options.generateCssMap,
    generateMinCss =
      'undefined' === typeof options.generateMinCss
        ? true
        : options.generateMinCss,
    loggerOptions = options.loggerOptions,
    prefix = options.prefix || DEFAULT_COMBINE_PREFIX,
    sort = 'undefined' === typeof options.sort ? true : options.sort,
    webfontDir = options.webfontDir || WEBFONTS_DIR_NAME,
    cssChoices = options.cssChoices || DEFAULT_CSS_CHOICES;

  const initializedProviderObjects: ProviderConstructor[] = [];

  for (const providerObject of providerInstances) {
    providerObject.setLoggerOptions('level', loggerOptions.level);
    providerObject.setLoggerOptions('silent', loggerOptions.silent);

    providerObject.setOptions('sort', sort);
    providerObject.setOptions('formats', formats);
    providerObject.setOptions('generateCssMap', generateCssMap, true);
    providerObject.setOptions('generateMinCss', generateMinCss, true);

    // all fontName and prefix must be consistent. This is required
    // for using icons from multiple packages
    providerObject.setOptions('fontName', fontName, true);
    providerObject.setOptions('prefix', prefix, true);

    providerObject.setOptions('webfontDir', webfontDir, true);

    // Don't out put any package files if outputPackage is false
    providerObject.setOptions(
      'writeOutFiles',
      outputPackages ? options.writeOutFiles : [],
      !outputPackages
    );
    providerObject.setOptions('addHashInFontUrl', options.addHashInFontUrl);
    providerObject.setOptions('cssChoices', cssChoices);

    initializedProviderObjects.push(providerObject);
  }

  const allIconNames: string[] = initializedProviderObjects
      .map((providerObject) => Object.keys(providerObject.subsetMeta))
      .flat(1),
    duplicateNames = allIconNames.filter(
      (item: string, index: number) => allIconNames.indexOf(item) !== index
    );

  for (let i = 0; i < initializedProviderObjects.length; i++) {
    duplicateNames.map((dName) =>
      initializedProviderObjects[i].renameIcon(dName)
    );
  }

  return new Promise((resolve, reject) => {
    Promise.all(
      initializedProviderObjects.map((providerObject: ProviderConstructor) => {
        return providerObject.makeFonts(
          pathJoin(outputDir, PACKAGES_OUTPUT_DIR)
        );
      })
    )
      .then((results: MakeFontResult[]) => {
        if (!results.length) return resolve({} as MakeFontResult);

        logger.info('Started combining CSS');

        const renderContext: RenderContext = results[0];
        renderContext.writeOutFiles =
          options.writeOutFiles || DEFAULT_WRITE_OUT_FILES;

        renderContext.fontFileName = fontFileName;
        renderContext.cssChoices = cssChoices;

        // merge MetaDataset in results
        renderContext.icons = Object.assign(
          {},
          ...results.map((result) => result.icons)
        );

        renderContext.SCSSTargets = results
          .map((result) => result.SCSSTargets)
          .flat(1);

        renderContext.blobObject = mergeObjectArrayValues(
          results.map((result) => result.blobObject)
        );

        delete renderContext.license;
        const context: RenderContext = {
          ...renderContext,
          logger: logger,
        };

        return render(outputDir, context, logger)
          .then((result) => resolve(result))
          .catch(reject);
      })
      .catch(reject);
  });
};

export { subsetIconfont };
export * from './types';
export * from './providers/providers';
export default subsetIconfont;
