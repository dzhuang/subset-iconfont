import { SCSS_FOLDER_NAME } from '../providers/constants';
import { getFontFaceFileName } from '../utils/utils';
import { getFontWeight, createHash, renderEnv } from './utils';
import { FontFaceRenderContext } from './types/RenderContext';
import {
  Formats,
  ToSubsetFontsOptions,
  SubsetFunc,
  SubsetResult,
  SubsetTask,
  IconMetaData,
} from './types/SubsetFunc';
import { readFileSync } from 'fs';

const subsetFont = require('subset-font');
const ttf2eot = require('ttf2eot');

type GetToSubsetOptions = (wfTask: SubsetTask) => ToSubsetFontsOptions;

const getSubsetOptions: GetToSubsetOptions = (wfTask: SubsetTask) => {
  return {
    subsetItems: wfTask.subsetItems,
    targetFontPath: wfTask.targetFontPath,
    style: wfTask.style,
  };
};

const convertUnicode = (unicode: string) => {
  return unicode.split(',').map((match) => {
    return match
      .split('u')
      .map((code) => String.fromCodePoint(parseInt(code, 16)))
      .join('');
  });
};

type ToSubsetFonts = (
  toTtfSubsetOptions: ToSubsetFontsOptions,
  targetFormat: string
) => Promise<string>;

const toSubsetFonts: ToSubsetFonts = (toSubsetOptions, targetFormat) => {
  return new Promise((resolve, reject) => {
    const unicodeLiteral: string = toSubsetOptions.subsetItems
        .map((subsetItem: IconMetaData) => {
          return convertUnicode(subsetItem.metadata.unicode);
        })
        .flat(2)
        .join(''),
      targetFontPath = toSubsetOptions.targetFontPath;

    let targetFontBuffer;

    try {
      targetFontBuffer = readFileSync(targetFontPath);
    } catch (err) {
      throw reject(err);
    }

    subsetFont(targetFontBuffer, unicodeLiteral, {
      targetFormat: targetFormat,
    })
      .then((result: any) => {
        return resolve(result);
      })
      .catch((err: any) => {
        throw reject(err);
      });
  });
};

const subset: SubsetFunc = async (subsetTask: SubsetTask) => {
  const toTtfOptions = getSubsetOptions(subsetTask);

  const { context, style } = subsetTask,
    options = context.options;

  if (!options.formats || !options.formats.length) {
    throw new Error('no output formats specified, webfont task will not work.');
  }

  if (!options.fontName) {
    throw new Error('no fontName specified, webfont task will not work.');
  }

  const ttfBuffer: string = await toSubsetFonts(toTtfOptions, 'sfnt');

  const result: SubsetResult = {
    webfonts: [],
    scss: [],
    hash: createHash(ttfBuffer),
  };

  const fontWeight = getFontWeight(style),
    fontFileName = !context.hasMultipleStyles
      ? context.fontFileName
      : `${context.originalCSSPrefix}-${style}-${fontWeight}`,
    formats = options.formats.map((format) => {
      return format.toLowerCase();
    }) as Formats;

  const pushToResult = (format: string, data: any) => {
    result.webfonts.push({
      dir: options.webfontDir as string,
      name: `${fontFileName}.${format}`,
      data: data,
    });
  };

  if (formats.includes('ttf')) {
    pushToResult('ttf', ttfBuffer);
  }

  if (formats.includes('eot')) {
    const eot = Buffer.from(ttf2eot(ttfBuffer).buffer);
    pushToResult('eot', eot);
  }

  if (formats.includes('woff')) {
    const woff = await toSubsetFonts(toTtfOptions, 'woff');
    pushToResult('woff', woff);
  }

  if (formats.includes('woff2')) {
    const woff2 = await toSubsetFonts(toTtfOptions, 'woff2');
    pushToResult('woff2', woff2);
  }

  const addHashInFontUrl =
    'undefined' === typeof options.addHashInFontUrl
      ? true
      : options.addHashInFontUrl;

  const fontFaceCtx: FontFaceRenderContext = {
    prefix: options.prefix as string,
    fontName: options.fontName,
    formats: formats,
    fontFileName: fontFileName,
    style: style,
    fontWeight: fontWeight,
    ...(addHashInFontUrl ? { hash: result.hash } : {}),
    taskSubsetItems: subsetTask.subsetItems,
  };

  // creating font-face scss files
  const fontFaceFileName = !context.hasMultipleStyles
      ? getFontFaceFileName(context.fontFileName)
      : `${context.originalCSSPrefix}-${style}`,
    fontFaceFileFullName = `${fontFaceFileName}.scss`,
    // todo allow template override
    templateName = 'font-face.njk',
    content = renderEnv.render(templateName, fontFaceCtx);

  result.scss.push({
    dir: SCSS_FOLDER_NAME,
    name: fontFaceFileFullName,
    data: content,
  });

  result.fontFace = fontFaceFileName;

  context.logger.info(`Rendered font face file "${fontFaceFileName}.scss"`);
  return result;
};

export default subset;
