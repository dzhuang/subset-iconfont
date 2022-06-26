import { join as pathJoin } from "path";
import { readFileSync } from "fs";
import {
  COMBINED_CSS_NAME,
  COMBINED_FONT_LICENSE_FOLDER,
  CSS_FOLDER_NAME,
  FONT_WEB_PAGE_FILE_NAME,
  LICENSE_FILE_NAME,
  METADATA_FILE_NAME,
  SCSS_FILE_NAMES,
  SCSS_FOLDER_NAME,
} from "../providers/constants";
import { writeFileSync } from "../utils/utils";
import { Logger } from "../types/Logger";
import tmp from "tmp";
import { createHash, renderEnv } from "./utils";
import { MetaDataset } from "../types/Metadata";
import {
  MakeFontBlob,
  RenderContext,
  WriteOutFile,
} from "./types/RenderContext";
import { WebRenderContext } from "./types/WebRenderContext";
import { MakeFontResult } from "./types/MakeFontResult";

const sass = require("node-sass");
const pkjJson = require("../../package.json");

const brandIcon = (() => {
  return readFileSync(pathJoin(__dirname, "../assets/brand.svg")).toString();
})();

const getUsedStyle = (metadataSet: MetaDataset) => {
  return Object.values(metadataSet)
    .map((icon) => icon.styles)
    .flat(2)
    .filter((value, index, self) => self.indexOf(value) === index);
};

const createScssFiles = (
  context: RenderContext,
  logger: Logger,
  mainFileName = "main"
) => {
  logger.debug(`Started rendering scss from templates.`);

  const tempDir = tmp.dirSync({
    prefix: `ssw-scss`,
    unsafeCleanup: true,
  });
  logger.debug(`Created tempDir ${tempDir.name} for SCSS files.`);

  const usedStyles = getUsedStyle(context.icons),
    outputPath = pathJoin(tempDir.name, SCSS_FOLDER_NAME);

  const updatedRenderContext = {
    ...context,
    styles: usedStyles,
    scssTargets: [context.fontFileName, ...context.SCSSTargets],
  };

  SCSS_FILE_NAMES.forEach((templateBasename) => {
    const outputFileName =
        templateBasename === mainFileName
          ? `${context.fontFileName}.scss`
          : `${templateBasename}.scss`,
      outputPath = pathJoin(tempDir.name, SCSS_FOLDER_NAME),
      outputFile = pathJoin(outputPath, outputFileName),
      content = renderEnv.render(
        `${templateBasename}.scss.njk`,
        updatedRenderContext
      );

    logger.debug(`Rendered "${outputFile}"`);

    context.blobObject.scss.push({
      dir: SCSS_FOLDER_NAME,
      name: outputFileName,
      data: content,
    });
  });

  // Write all scss file (including font-face scss) to current tempDir
  // preparing for rendering css
  context.blobObject.scss.forEach((blob) => {
    writeFileSync(pathJoin(outputPath, blob.name), blob.data);
  });
  logger.debug(`Ended rendering scss from templates.`);
  return tempDir;
};

const renderCSS = (context: RenderContext, logger: Logger) => {
  const scssTempDir = createScssFiles(context, logger),
    scssPath = pathJoin(scssTempDir.name, SCSS_FOLDER_NAME),
    cssPath = pathJoin(scssTempDir.name, CSS_FOLDER_NAME),
    cssFileNames = [
      COMBINED_CSS_NAME,
      context.fontFileName,
      ...context.SCSSTargets,
    ];

  type CSSObj = {
    fName: string;
    fileStyle: string;
    extension: string;
  };

  const _renderScss = (cssObj: CSSObj) => {
    return new Promise((resolve, reject) => {
      sass.render(
        {
          file: pathJoin(scssPath, `${cssObj.fName}.scss`),
          outputStyle: cssObj.fileStyle,
          sourceMap: context.generateSourceMap,
          sourceRoot: `../${SCSS_FOLDER_NAME}`,
          outFile: pathJoin(cssPath, `${cssObj.fName}.${cssObj.extension}`),
        },
        (err: any, result: any) => {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            const baseName = `${cssObj.fName}.${cssObj.extension}`;

            for (const [key, blob] of Object.entries(result)) {
              if (key === "stats") continue;
              const _name = key === "css" ? baseName : `${baseName}.map`,
                hash = key === "css" ? createHash(blob as string) : undefined;
              context.blobObject.css.push({
                name: _name,
                dir: CSS_FOLDER_NAME,
                data: blob as string | Buffer,
                ...(hash ? { hash: hash } : {}),
              });
            }

            logger.debug(
              `Rendered "${pathJoin(
                cssPath,
                `${cssObj.fName}.${cssObj.extension}: details: ${JSON.stringify(
                  result.stats,
                  null,
                  2
                )}`
              )}"`
            );

            resolve(void 0);
          }
        }
      );
    });
  };

  // Collecting expected CSS file and format
  const cssTargetObjects: CSSObj[] = cssFileNames
    .map((fName) => {
      return [
        ["css", "expanded"],
        ...(context.generateMinCss ? [["min.css", "compressed"]] : []),
      ].map(([extension, fileStyle]) => {
        return {
          fName: fName,
          fileStyle: fileStyle,
          extension: extension,
        };
      });
    })
    .flat(1);

  logger.debug(`Started rendering css from scss.`);
  return Promise.all(cssTargetObjects.map(_renderScss))
    .then(() => {
      return context;
    })
    .finally(() => {
      logger.info(`finished rendering css/scss.`);
      if (!logger.isDebugEnabled()) scssTempDir.removeCallback();
      logger.debug(`Removed tempDir ${scssTempDir.name}.`);
    });
};

const writeBlobs = (
  outputDir: string,
  context: RenderContext,
  logger: Logger
) => {
  if (!context.writeOutFiles.length) return;

  type WriteOutBlob = Record<WriteOutFile, MakeFontBlob[]>;
  const blobObj = {
    ...context.blobObject,
    web: [],
    metadata: [],
  } as WriteOutBlob;
  if (context.writeOutFiles.indexOf("metadata") > -1) {
    blobObj.metadata.push({
      name: METADATA_FILE_NAME,
      dir: "",
      data: JSON.stringify(context.icons, null, 2),
    });
  }

  if (context.writeOutFiles.indexOf("web") > -1) {
    let cssHash;
    for (const cssBlobObj of context.blobObject.css) {
      if (cssBlobObj.name === `${COMBINED_CSS_NAME}.css`) {
        cssHash = cssBlobObj.hash;
        break;
      }
    }

    const webRenderContext: WebRenderContext = {
        prefix: context.prefix as string,
        icons: context.icons,
        brandIcon: brandIcon,
        npmPackage: pkjJson.name,
        version: pkjJson.version,
        url: pkjJson.repository.url.replace("git+", ""),
        author: pkjJson.author,
        fontName: context.fontName as string,
        cacheString: cssHash,
      },
      indexHtml = renderEnv.render("web.njk", webRenderContext);

    blobObj.web.push({
      name: FONT_WEB_PAGE_FILE_NAME,
      dir: "",
      data: indexHtml,
    });
  }

  if (context.license && context.writeOutFiles.indexOf("licenses") > -1) {
    blobObj.licenses.push({
      name: LICENSE_FILE_NAME,
      dir: "",
      data: context.license,
    });
  }

  logger.debug(`Started writing generated files.`);

  Object.entries(blobObj).map(([writeOutCat, blobs]) => {
    if (context.writeOutFiles.indexOf(writeOutCat as WriteOutFile) < 0) return;
    blobs.map((blob) => {
      const filePath = pathJoin(outputDir, blob.dir);
      writeFileSync(pathJoin(filePath, blob.name), blob.data);
      logger.debug(
        `[${writeOutCat.toUpperCase()}] file "${
          blob.name
        }" written to ${filePath}.`
      );
    });
  });
  logger.debug(`Ended writing generated files.`);
};

type Render = (
  outputDir: string,
  context: RenderContext,
  logger: Logger
) => Promise<MakeFontResult>;

const render: Render = (outputDir, context, logger) => {
  if (!Object.keys(context.icons).length)
    return new Promise((resolve) =>
      resolve(context)
    ) as Promise<MakeFontResult>;

  return renderCSS(context, logger).then(() => {
    writeBlobs(outputDir, context, logger);

    // This is used to generate multiple license files in combine mode.
    if (context.license) {
      context.blobObject.licenses.push({
        name: `${context.fontFileName}-${LICENSE_FILE_NAME}`,
        dir: COMBINED_FONT_LICENSE_FOLDER,
        data: context.license,
      });
    }
    return context;
  });
};

export default render;
