import { SCSS_FOLDER_NAME } from "../providers/constants";
import { getFontFaceFileName } from "../utils/utils";
import { getFontWeight, createHash, renderEnv } from "./utils";
import { FontFaceRenderContext } from "./types/RenderContext";
import {
  Formats,
  ToSubsetFontsOptions,
  SubsetFunc,
  SubsetResult,
  SubsetTask,
} from "./types/SubsetFunc";
import { readFileSync } from "fs";

const subsetFont = require("subset-font");
const ttf2eot = require("ttf2eot");

type GetToSubsetOptions = (wfTask: SubsetTask) => ToSubsetFontsOptions;

const getSubsetOptions: GetToSubsetOptions = (wfTask: SubsetTask) => {
  return {
    subsetItems: wfTask.subsetItems,
    targetFontPath: wfTask.targetFontPath,
    style: wfTask.style,
  };
};

type ToSubsetFonts = (
  toTtfSubsetOptions: ToSubsetFontsOptions,
  targetFormat: string
) => Promise<string>;

const toSubsetFonts: ToSubsetFonts = (toSubsetOptions, targetFormat) => {
  return new Promise((resolve, reject) => {
    subsetFont(
      readFileSync(toSubsetOptions.targetFontPath),
      toSubsetOptions.subsetItems,
      { targetFormat: targetFormat }
    )
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
    throw new Error("no output formats specified, webfont task won't work.");
  }

  if (!options.fontName) {
    throw new Error("no fontName specified, webfont task won't work.");
  }

  const ttfBuffer: string = await toSubsetFonts(toTtfOptions, "sfnt");

  const result: SubsetResult = {
    webfonts: [],
    scss: [],
    hash: createHash(ttfBuffer),
  };

  const fontWeight = getFontWeight(style),
    fontFileName = !context.hasMultipleStyles
      ? context.fontFileName
      : `${context.originalCSSPrefix}-${style}-${fontWeight}`,
    fontFaceFileName = !context.hasMultipleStyles
      ? getFontFaceFileName(context.fontFileName)
      : `${context.originalCSSPrefix}-${style}`,
    formats = options.formats.map((format) => {
      return format.toLowerCase();
    });

  const pushToResult = (format: string, data: any) => {
    result.webfonts.push({
      dir: options.webfontDir as string,
      name: `${fontFileName}.${format}`,
      data: data,
    });
  };

  if (formats.includes("ttf")) {
    pushToResult("ttf", ttfBuffer);
  }

  if (formats.includes("eot")) {
    const eot = Buffer.from(ttf2eot(ttfBuffer).buffer);
    pushToResult("eot", eot);
  }

  if (formats.includes("woff")) {
    const woff = await toSubsetFonts(toTtfOptions, "woff");
    pushToResult("woff", woff);
  }

  if (formats.includes("woff2")) {
    const woff2 = await toSubsetFonts(toTtfOptions, "woff2");
    pushToResult("woff2", woff2);
  }

  const addHashInFontUrl =
    "undefined" === typeof options.addHashInFontUrl
      ? true
      : options.addHashInFontUrl;

  const fontFaceCtx: FontFaceRenderContext = {
    prefix: options.prefix as string,
    fontName: options.fontName,
    formats: formats as Formats,
    fontFileName: fontFileName,
    style: style,
    fontWeight: fontWeight,
    ...(addHashInFontUrl ? { hash: result.hash } : {}),
  };

  // creating font-face scss files
  const fontFaceFileFullName = `${fontFaceFileName}.scss`,
    content = renderEnv.render(`font-face.njk`, fontFaceCtx);

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
