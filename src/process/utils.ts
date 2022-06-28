import {
  AVAILABLE_OUTPUT_FORMATS,
  STYLE_FONT_WEIGHT_MAP,
} from "../providers/constants";
import crypto from "crypto";
import { Style } from "../types/Metadata";
import { SubsetOptions } from "../types/SubsetOptions";
import { ProviderOptions } from "../types/ProviderOptions";
import { ConfigError } from "../utils/errors";
import { join as pathJoin } from "path";
const nunjucks = require("nunjucks");

const createRenderEnv = (path: string, opts: any = {}) => {
  const autoescape = false,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false;
  return new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path, {
      noCache: noCache,
      watch: watch,
    }),
    {
      autoescape: autoescape,
      throwOnUndefined: throwOnUndefined,
    }
  );
};

export const renderEnv = createRenderEnv(pathJoin(__dirname, "../templates"));

export const getFontWeight = (style: Style): number | string => {
  return STYLE_FONT_WEIGHT_MAP[style];
};

export const createHash = (blob: string | Buffer) => {
  return crypto.createHash("md5").update(blob).digest("hex");
};

const validateOptionString = (
  options: any,
  option: string,
  allowUndefined = false,
  allowEmpty = false
) => {
  const optionValue = (options as { [key: string]: any })[option];
  if ("undefined" === typeof optionValue && allowUndefined) {
    return;
  }
  if ("string" !== typeof optionValue)
    throw new ConfigError(`option "${option}" should be a string.`);

  if (!allowEmpty && !optionValue.trim().length) {
    throw new ConfigError(`option "${option}" should be a non-emtpy string.`);
  }
};

const validateFormats = (formats: any) => {
  if (!Array.isArray(formats)) {
    throw new ConfigError(
      `"format" in options should be an array, while got a ${typeof formats}`
    );
  }
  const _formats = formats.map((format) => {
    if (AVAILABLE_OUTPUT_FORMATS.indexOf(format.toLowerCase()) < 0) {
      throw new ConfigError(
        `unknown format "${format}" in options, allowed formats include: ${AVAILABLE_OUTPUT_FORMATS.join(
          ", "
        )}`
      );
    }
    return format.toLowerCase();
  });

  if (!_formats.length) {
    throw new ConfigError(`empty "formats" option is not allowed`);
  }
};

type ValidateOptions = (options: SubsetOptions | ProviderOptions) => void;

export const validateOptions: ValidateOptions = (options) => {
  validateFormats(options.formats);
  validateOptionString(options, "prefix");
  validateOptionString(options, "webfontDir");
  validateOptionString(options, "fontName");
  validateOptionString(options, "fontFileName");
};
