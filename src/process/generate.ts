import {
  DEFAULT_STYLE,
  DEFAULT_WRITE_OUT_FILES,
  WEBFONTS_DIR_NAME,
} from "../providers/constants";
import { getFontWeight } from "./utils";
import { MetaDataset, Style } from "../types/Metadata";
import { BlobObject, RenderContext } from "./types/RenderContext";
import { MakeFontResult } from "./types/MakeFontResult";
import { MakeFontContext } from "./types/MakeFontContext";
import { Formats, SubsetResult, SubsetTask } from "./types/SubsetFunc";

import subset from "./subset";
import render from "./render";
import { Style2FontFileMap } from "../types/Provider";

type SubsetTasks = (
  subsetMeta: MetaDataset,
  style2FontFileMap: Style2FontFileMap,
  mfContext: MakeFontContext
) => SubsetTask[];

const subsetTasks: SubsetTasks = (
  subsetMetaSet,
  style2FontFileMap,
  mfContext
) => {
  const groupedIcons: Partial<Record<Style, any>> = {};

  Object.entries(subsetMetaSet).map(([iconName, metadata]) => {
    // grouping icons into tasks by fa font style
    metadata.svgDataObjects.map((svgDataObj) => {
      const style = svgDataObj.style;
      (groupedIcons[style] = groupedIcons[style] || []).push({
        metadata: {
          name: iconName,
          unicode: metadata.unicode,
        },
        contents: svgDataObj.svgData,
      });
    });
  });

  return Object.entries(groupedIcons).map(([style, subsetItems]) => {
    const targetFontPath = style2FontFileMap[style as Style];
    if (!targetFontPath) {
      throw new Error(`Font file path to style "${style}" is undefined.`);
    }

    return {
      style: style as Style,
      targetFontPath: targetFontPath,
      subsetItems: subsetItems,
      context: mfContext,
    };
  });
};

type GenerateFont = (
  outputDir: string,
  subsetMeta: MetaDataset,
  mfContext: MakeFontContext
) => Promise<MakeFontResult>;

const generateFont: GenerateFont = async (outputDir, subsetMeta, mfContext) => {
  const options = mfContext.options,
    fontFileName = mfContext.fontFileName,
    logger = mfContext.logger,
    styleTtfMap = mfContext.style2FontFileMap,
    formats = options.formats as Formats;

  const wfTasks = subsetTasks(subsetMeta, styleTtfMap, mfContext);

  return Promise.all(
    wfTasks.map((wfTask: SubsetTask) => {
      return subset(wfTask).then((result: SubsetResult) => {
        return result;
      });
    })
  ).then((results) => {
    const blobObj: BlobObject = {
        webfonts: [],
        scss: [],
        css: [],
        licenses: [],
      },
      fontFaceFileNames: string[] = [];
    results.map((result) => {
      blobObj.webfonts = blobObj.webfonts.concat(result.webfonts);
      blobObj.scss = blobObj.scss.concat(result.scss);
      if (result.fontFace) {
        fontFaceFileNames.push(result.fontFace);
      }
    });

    return new Promise((resolve, reject) => {
      const renderContext: RenderContext = {
        fontName: options.fontName as string,
        formats: formats,
        prefix: options.prefix as string,
        webfontDir: options.webfontDir || WEBFONTS_DIR_NAME,
        icons: subsetMeta,
        fontWeightDefault: getFontWeight(DEFAULT_STYLE),
        fontFileName: fontFileName,
        SCSSTargets: fontFaceFileNames,
        generateMinCss:
          typeof options.generateMinCss === "undefined"
            ? true
            : options.generateMinCss,
        generateSourceMap:
          typeof options.generateCssMap === "undefined"
            ? true
            : options.generateCssMap,
        logger: logger,
        license: mfContext.licenseContent,
        blobObject: blobObj,
        writeOutFiles: options.writeOutFiles || DEFAULT_WRITE_OUT_FILES,
      };

      // render scss/css files
      return render(outputDir, renderContext, logger)
        .then((result: MakeFontResult) => {
          return resolve(result);
        })
        .catch(reject)
        .then(() => {
          logger.info(`finished.`);
        });
    });
  });
};

export default generateFont;
