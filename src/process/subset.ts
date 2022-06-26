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
const ttf2woff = require("ttf2woff");
const ttf2woff2 = require("ttf2woff2");

type GetToSubsetOptions = (wfTask: SubsetTask) => ToSubsetFontsOptions;

const getSubsetOptions: GetToSubsetOptions = (wfTask: SubsetTask) => {
  return {
    subsetItems: wfTask.subsetItems,
    ttfTargetPath: wfTask.ttfTargetPath,
    style: wfTask.style,
    formats: wfTask.context.options.formats as Formats,
  };
};

type ToSubsetFonts = (
  toTtfSubsetOptions: ToSubsetFontsOptions
) => Promise<string>;

const toSubsetFonts: ToSubsetFonts = (toSubsetOptions) => {
  return new Promise((resolve, reject) => {
    subsetFont(
      readFileSync(toSubsetOptions.ttfTargetPath),
      toSubsetOptions.subsetItems,
      { targetFormat: "sfnt" }
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

  const ttfBuffer: string = await toSubsetFonts(toTtfOptions);

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
    const woff = Buffer.from(ttf2woff(ttfBuffer, options).buffer);
    pushToResult("woff", woff);
  }

  if (formats.includes("woff2")) {
    const woff2 = await ttf2woff2(ttfBuffer);
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
