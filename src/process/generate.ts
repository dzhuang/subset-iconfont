import { DEFAULT_STYLE } from "../providers/constants";
import { getFontWeight } from "./utils";
import { MetaDataset, Style } from "../types/Metadata";
import {
  BlobObject,
  RenderContext,
  WriteOutFiles,
} from "./types/RenderContext";
import { MakeFontResult } from "./types/MakeFontResult";
import { MakeFontContext } from "./types/MakeFontContext";
import {
  Formats,
  GlyphData,
  SubsetResult,
  SubsetTask,
} from "./types/SubsetFunc";

import subset from "./subset";
import render from "./render";

type SubsetTasks = (
  subsetMeta: MetaDataset,
  styleTtfMap: { [key: string]: string },
  mfContext: MakeFontContext
) => SubsetTask[];

const subsetTasks: SubsetTasks = (subsetMeta, styleTtfMap, mfContext) => {
  const groupedIcons: Partial<Record<Style, any>> = {};

  // todo: find duplicate unicode
  const convertUnicode = (unicode: string) => {
    return unicode.split(",").map((match) => {
      return match
        .split("u")
        .map((code) => String.fromCodePoint(parseInt(code, 16)))
        .join("");
    });
  };

  Object.entries(subsetMeta).map(([iconName, attributes]) => {
    // grouping icons into tasks by fa font style
    attributes.svgDataObjects.map((svgDataObj) => {
      const style = svgDataObj.style;
      (groupedIcons[style] = groupedIcons[style] || []).push({
        metadata: {
          name: iconName,
          unicode: convertUnicode(attributes.unicode as string),
        },
        contents: svgDataObj.svgData,
      });
    });
  });

  return Object.entries(groupedIcons).map(([style, glyphsData]) => {
    const subsetItems = glyphsData
      .map((glyphData: GlyphData) => {
        return glyphData.metadata.unicode;
      })
      .flat(2)
      .join("");

    return {
      style: style as Style,
      targetFontPath: styleTtfMap[style],
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
    styleTtfMap = mfContext.styleTtfMap,
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
        webfontDir: options.webfontDir as string,
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
        writeOutFiles: options.writeOutFiles as WriteOutFiles,
        endUnicode: options.startUnicode as number,
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
