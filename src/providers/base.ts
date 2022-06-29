import { join as pathJoin } from 'path';
import { existsSync, readFileSync } from 'fs';
import { getLogger } from '../utils/utils';
import { ConfigError, WarningError } from '../utils/errors';
import {
  DEFAULT_LOGGER_LEVEL,
  DEFAULT_OUTPUT_FORMATS,
  DEFAULT_STYLE,
  DEFAULT_WRITE_OUT_FILES,
  WEBFONTS_DIR_NAME,
} from './constants';
import {
  compareVersionNumbers,
  validateSubsetType,
  subsetItemSorter,
} from './utils';

import { LoggerOptions, Logger } from '../types/Logger';
import { ProviderInterface, Style2FontFileMap } from '../types/Provider';
import { AllMetaData, MetaData, MetaDataset, Style } from '../types/Metadata';
import { SubsetItem } from '../types/SubsetItem';
import { MakeFontContext } from '../process/types/MakeFontContext';
import { ProviderOptions } from '../types/ProviderOptions';
import { validateOptions } from '../process/utils';

import generateFont from '../process/generate';

export abstract class ProviderConstructor implements ProviderInterface {
  public abstract packageName: string;
  protected abstract fontName: string;
  protected abstract style2FontFileMap: Style2FontFileMap;
  protected abstract cssPrefix: string;
  protected fontFileName: string | undefined;
  protected minVersion: string | undefined;
  protected maxVersion: string | undefined;
  protected hasMultipleStyles = true;

  /**
   * @name getAllMetaData
   * @description This method should be implemented by subclass, to construct a mata data dictionary
   *     which will be used for query.
   *
   * @return {MetaDataset}
   */
  protected abstract getAllMetaData(): MetaDataset;

  /**
   * @name normalizeIconMeta
   * @description This method should be implemented by subclass, about how to get the normalized metadata
   * of a single icon with name "iconName". It should first get the data from `this.allMetaData`, and then
   * "normalize" the result in the format of `MetaData`.
   * @param {string}iconName
   * @return {MetaData}
   */
  protected abstract normalizeIconMeta(iconName: SubsetItem): MetaData;

  /**
   * This method get the LICENSE file path from the target font package. Subclass should override it if failed.
   */
  protected get fontLicensePath(): string | undefined {
    let licensePath: string | undefined = undefined;
    for (const fileName of ['LICENSE', 'LICENSE.txt', 'LICENSE.md']) {
      try {
        licensePath = this.validateSubPath(fileName);
      } catch (ex) {
        // empty
      }
    }

    if (!licensePath)
      this.logger.warn(
        'the get "fontLicensePath" method failed to get a valid license path.'
      );
    return licensePath;
  }

  private readonly _subset: SubsetItem[];

  protected getUpdatedSubsetFromAllMetadata(
    subset: SubsetItem[]
  ): SubsetItem[] {
    return subset;
  }

  public get subset() {
    if (typeof this._allMetaData !== 'undefined') {
      return this._subset;
    }
    return this.getUpdatedSubsetFromAllMetadata(this._subset);
  }

  // cached value of baseDir getter
  private _baseDir: string | undefined;

  // cached value of icon subset metaData, with name as key
  protected _subsetMeta: MetaDataset | undefined;

  // a lazily cached value of all metaData
  private _allMetaData: MetaDataset | undefined;

  // a lazily cached value of package version
  private _version: string | undefined;

  private _logger: Logger | undefined;

  protected _options: ProviderOptions;

  protected constructor(subset: SubsetItem[], options?: ProviderOptions) {
    if (!validateSubsetType(subset)) {
      throw new ConfigError(
        `Invalid subset ${subset}. A subset should be an array of strings.`
      );
    }

    this._subset = subset;
    this._options = options || {};
    this._options.loggerOptions = this._options.loggerOptions || {};
    this._options.loggerOptions.label =
      this._options.loggerOptions.label || this.constructor.name;
  }

  public get options(): ProviderOptions {
    return this._options;
  }

  public setOptions(
    key: keyof ProviderOptions,
    value: any,
    override = false,
    ignoreUndefined = true
  ): void {
    if (ignoreUndefined && typeof value === 'undefined') return;
    if (typeof this._options[key] === 'undefined' || override) {
      this._options[key] = value;
    }
  }

  public setLoggerOptions(key: keyof LoggerOptions, value: any): void {
    this._options.loggerOptions = this._options.loggerOptions || {};
    if (typeof this._options.loggerOptions[key] === 'undefined') {
      this._options.loggerOptions[key] = value;
    }
    if (typeof this._logger !== 'undefined') {
      this._logger = getLogger(this.options.loggerOptions);
    }
  }

  private validate() {
    this.validateVersion();
    this.moreValidation();
  }

  public get allMetaData(): AllMetaData {
    if (typeof this._allMetaData !== 'undefined') return this._allMetaData;

    this.validate();
    this._allMetaData = this.getAllMetaData();

    this.setOptions(
      'sort',
      'undefined' === typeof this.options.sort ? true : this.options.sort
    );

    return this._allMetaData;
  }

  private get fontLicenseContent(): string | undefined {
    const licensePath = this.fontLicensePath;
    return licensePath ? readFileSync(licensePath).toString() : undefined;
  }

  private get logger(): Logger {
    if (typeof this._logger !== 'undefined') return this._logger;

    this.setLoggerOptions('level', DEFAULT_LOGGER_LEVEL);
    this._logger = getLogger(this.options.loggerOptions);
    return this._logger;
  }

  private validateIconMeta(iconName: SubsetItem): MetaData {
    if (typeof this.allMetaData[iconName] === 'undefined')
      throw new WarningError(
        `"${iconName}" does not exists in metadata available.`
      );

    const metaData: MetaData = this.normalizeIconMeta(iconName);

    if (!metaData.svgDataObjects) {
      throw new WarningError(`icon "${iconName}" does not have svg data.`);
    }

    if (!metaData.unicode) {
      this.logger.warn(
        `${iconName} does not have a unicode value, will be ignored.`
      );
    }
    return metaData;
  }

  /**
   * @name renameIcon
   * @description change icon name. This will also change how the icon is used. The purpose of this
   * method is to avoid identical icon name exists across subset providers in a combining process.
   * @return {string | undefined}
   **/
  public renameIcon(iconName: SubsetItem): string | undefined {
    if (typeof this._subsetMeta == 'undefined') return;
    if (typeof this._subsetMeta[iconName] == 'undefined') return;

    const newName = `${iconName}-${this.cssPrefix}`;

    // Rename the key of the icon
    // ref: https://stackoverflow.com/a/50101979/3437454
    delete Object.assign(this._subsetMeta, {
      [newName]: this._subsetMeta[iconName],
    })[iconName];

    this.logger.warn(
      `icon "${iconName}" is renamed to "${newName}" to avoid duplication.`
    );

    return newName;
  }

  public get subsetMeta(): MetaDataset {
    if (typeof this._subsetMeta !== 'undefined') return this._subsetMeta;

    const metaDataset: MetaDataset = {},
      added: SubsetItem[] = [],
      duplicated: SubsetItem[] = [],
      failed: SubsetItem[] = [];

    let subset = [...this.subset];

    if (subset.indexOf('__all__') > -1) {
      subset = Object.keys(this.allMetaData);
    }

    if (this.options.sort) {
      const sortCallback = (itemA: SubsetItem, itemB: SubsetItem) =>
        subsetItemSorter(itemA, itemB);
      subset = subset.sort(sortCallback);
    }

    for (const iconName of subset) {
      if (failed.indexOf(iconName) > -1) continue;

      if (added.indexOf(iconName) > -1) {
        duplicated.push(iconName);
        continue;
      }

      try {
        const metaDataItem: MetaData = this.validateIconMeta(iconName);

        metaDataItem.styles = metaDataItem.styles || [DEFAULT_STYLE];

        metaDataItem.metaFromPackage = metaDataItem.metaFromPackage || {};

        metaDataItem.metaFromPackage.packageInfo = this.version
          ? `${this.packageName}@${this.version}`
          : this.packageName;

        metaDataItem.originalName = iconName;

        metaDataset[iconName] = metaDataItem;
        added.push(iconName);
      } catch (err: any) {
        if (err instanceof WarningError) {
          this.logger.warn(`"${iconName}" is ignored, reason: ${err.message}`);
          failed.push(iconName);
          continue;
        }
        throw err;
      }
    }

    if (duplicated.length) {
      this.logger.warn(
        'these icon names found to be duplicated in subset provided: ' +
          `${duplicated.join(', ')}. only the first one will be used.`
      );
    }

    if (!added.length) {
      this.logger.warn(
        'there is no valid icon names, no font will be generated.'
      );
    } else {
      this.logger.info(
        `extracted a subset of ${
          Object.keys(metaDataset).length
        } icons: ${added.join(', ')}.`
      );
    }

    this._subsetMeta = metaDataset;
    return metaDataset;
  }

  protected get baseDir(): string {
    if (this._baseDir) return this._baseDir;

    const node_modules_path = 'node_modules',
      baseDir = pathJoin(node_modules_path, this.packageName);

    if (!existsSync(baseDir)) {
      throw new Error(
        `Unable to find in ${baseDir} ` +
          'folder. Double-check that you have the package installed as a dependency.'
      );
    }
    this._baseDir = baseDir;
    return this._baseDir;
  }

  private get version(): string | undefined {
    if (this._version !== undefined) return this._version;
    const pkjPath = pathJoin(this.baseDir, 'package.json');
    if (!existsSync(pkjPath)) return undefined;
    this._version = JSON.parse(readFileSync(pkjPath).toString()).version;
    return this._version;
  }

  private validateVersion(): void {
    const ver = this.version;
    if (!this.maxVersion && !this.minVersion) return;
    if (!ver)
      throw new Error(
        `${this.packageName}: can not determine version. ` +
          'Be default, it looks for version field in the package.json of the package. ' +
          'You can override the _version getter to define how to ' +
          'find the version number.'
      );

    if (this.maxVersion && compareVersionNumbers(this.maxVersion, ver) < 0) {
      throw new Error(
        `${this.packageName}: version above ${this.maxVersion} is not supported: got ${ver}.`
      );
    }
    if (this.minVersion && compareVersionNumbers(this.minVersion, ver) > 0) {
      throw new Error(
        `${this.packageName}: version below ${this.minVersion} is not supported: got ${ver}.`
      );
    }
  }

  /**
   * @name validateSubPath
   * @description Short-cut method to check if subdir/files from the base dir of the package.
   *
   * @param {string}subPath The direct subdir under the base dir of the package.
   * @return {string} The validated sub path
   */
  protected validateSubPath(subPath: string): string {
    const sPath = pathJoin(this.baseDir, subPath);
    if (!existsSync(sPath)) {
      throw new ConfigError(`Unable to find "${sPath}".`);
    }
    return sPath;
  }

  /**
   * @name moreValidation
   * @description This method can be used to do more validation for subclasses.
   * */
  protected moreValidation(): void {
    return;
  }

  private validateOptions(): void {
    validateOptions(this.options);
  }

  public async makeFonts(rootDir: string) {
    this.setOptions('formats', DEFAULT_OUTPUT_FORMATS);
    this.setOptions('prefix', this.options.prefix || this.cssPrefix);
    this.setOptions('webfontDir', WEBFONTS_DIR_NAME);
    this.setOptions('fontName', this.fontName);

    this.setOptions(
      'writeOutFiles',
      typeof this.options.writeOutFiles === 'undefined'
        ? DEFAULT_WRITE_OUT_FILES
        : this.options.writeOutFiles
    );

    this.setOptions('fontFileName', this.fontFileName);

    this.validateOptions();

    for (const [style, _path] of Object.entries(this.style2FontFileMap)) {
      this.style2FontFileMap[style as Style] = pathJoin(this.baseDir, _path);
    }

    const fontFileName = this.options.fontFileName as string;
    const outputDir = pathJoin(rootDir, fontFileName);
    const mfContext: MakeFontContext = {
      style2FontFileMap: this.style2FontFileMap,
      options: this.options,
      fontFileName: fontFileName,
      originalCSSPrefix: this.cssPrefix,
      hasMultipleStyles: this.hasMultipleStyles,
      licenseContent: this.fontLicenseContent,
      logger: this.logger,
    };

    return generateFont(outputDir, this.subsetMeta, mfContext);
  }
}
