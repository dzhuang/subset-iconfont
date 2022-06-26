const assert = require("assert");
const fs = require("fs");
const path = require("path");

import {
  PACKAGES_OUTPUT_DIR,
  WEBFONTS_DIR_NAME,
  AVAILABLE_OUTPUT_FORMATS,
  DEFAULT_COMBINE_FILE_NAME,
  MDI_DEFAULT_FONT_FILE_NAME,
  DEFAULT_OUTPUT_FORMATS,
  CSS_FOLDER_NAME,
  FONT_WEB_PAGE_FILE_NAME,
  LICENSE_FILE_NAME,
  METADATA_FILE_NAME,
  COMBINED_CSS_NAME,
  COMBINED_FONT_LICENSE_FOLDER,
  BOOTSTRAP_ICONS_FONT_FILE_NAME,
} from "../src/providers/constants";

import { getFontFaceFileName } from "../src/utils/utils";
import { iconFontSubset } from "../src";

const { sync: mdSync } = require("mkdirp");
const tmp = require("tmp");

import {
  CombineModeFileCheck,
  FilePart,
  FileStatus,
  PartValues,
  PartName,
  StatusName,
  ProviderHelperParams,
  ProviderFileCheck,
  CombineHelperParams,
} from "./types/types";

export const BOOTSTRAP_ICONS_FONT_FACE_FILE_NAME = getFontFaceFileName(
  BOOTSTRAP_ICONS_FONT_FILE_NAME
);

export const MDI_FONT_FACE_FILE_NAME = getFontFaceFileName(
  MDI_DEFAULT_FONT_FILE_NAME
);

export const DEFAULT_CSS_OUTPUT_EXTENSIONS = [
  "css",
  "min.css",
  "css.map",
  "min.css.map",
];

const validateFilesObject = (filePart: FilePart) => {
  // type validation
  ["names" as PartName, "extensions" as PartName].forEach((part: PartName) => {
    if (typeof filePart[part] === "undefined")
      throw new Error(`value of "${part}" is undefined`);

    const fileStatus: FileStatus = filePart[part];

    let validAttrCount = 0;
    ["exist" as StatusName, "nonExist" as StatusName].forEach((status) => {
      if (Object.keys(fileStatus).indexOf(status) < 0) return;

      const valueOfStatus: string[] = fileStatus[status] || [];
      if (valueOfStatus.length) validAttrCount += valueOfStatus.length;
    });

    if (validAttrCount < 1) {
      `filesObjects attribute "${part}" must have at least one of "exist" or/and "nonExist" attribute `;
    }
  });

  // make sure name and extensions are paired. i.e., if name exist length is not zero, extension exist length
  // should not be zero.
  const filePartCopy = { ...filePart };

  filePartCopy.names = filePartCopy.names || {};
  filePartCopy.names.exist = filePartCopy.names.exist || [];
  filePartCopy.names.nonExist = filePartCopy.names.nonExist || [];
  filePartCopy.extensions = filePartCopy.extensions || {};
  filePartCopy.extensions.exist = filePartCopy.extensions.exist || [];
  filePartCopy.extensions.nonExist = filePartCopy.extensions.nonExist || [];

  // if name exist is not zero, extension exist should not be zero.
  const nameExistCount = filePartCopy.names.exist.length,
    extensionExistCount = filePartCopy.extensions.exist.length,
    nameNonExistCount = filePartCopy.names.nonExist.length,
    extensionNonExistCount = filePartCopy.extensions.nonExist.length;

  const fileObjectRepr = `\n${JSON.stringify(filePart, null, 2)}`;

  if (!(nameExistCount || nameNonExistCount)) {
    throw new Error(
      `fileObject names has both "exist" and "nonExist" empty, that is not valid: ${fileObjectRepr}.`
    );
  }

  if (!(extensionExistCount || extensionNonExistCount)) {
    throw new Error(
      `fileObject extensions has both "exist" and "nonExist" empty, that is not valid: ${fileObjectRepr}.`
    );
  }

  if (nameExistCount && !extensionExistCount) {
    throw new Error(
      `fileObject names "exist" is not empty, while extensions "exist" is empty, ` +
        `that doesn't make sense: ${fileObjectRepr}.`
    );
  }
};

const assertErrorListFilesMessage = (
  fileName: string,
  exist: boolean,
  dir: string
) => {
  const msg = `file ${fileName} unexpectedly ${
    !exist ? "EXISTS " : "DOES NOT EXIST "
  }in ${dir}.`;
  try {
    return `${msg} Existing files were: \n         ${fs
      .readdirSync(dir)
      .join("\n         ")}.`;
  } catch (err) {
    return `${msg} Directory "${dir}" does not exist.`;
  }
};

const assertFileWithExtensions = (
  filePart: FilePart,
  rootPath: string,
  subPath: string
) => {
  validateFilesObject(filePart);
  const filesNameObjects = filePart.names || {},
    extensionsObjects = Object.keys(filesNameObjects).length
      ? filePart.extensions || {}
      : {};

  const existFilesNames = filesNameObjects.exist || [],
    nonExistFilesNames = filesNameObjects.nonExist || [],
    existExtensions = extensionsObjects.exist || [],
    nonExistExtensions = extensionsObjects.nonExist || [];

  const getDir = (rootPath: string, subPath: string) => {
    return path.resolve(rootPath, subPath);
  };

  existFilesNames.forEach((fName) => {
    existExtensions.forEach((_extension) => {
      const _dir = getDir(rootPath, subPath);
      assert.equal(
        fs.existsSync(path.resolve(_dir, `${fName}.${_extension}`)),
        true,
        assertErrorListFilesMessage(`${fName}.${_extension}`, true, _dir)
      );
    });
    nonExistExtensions.forEach((_extension) => {
      const _dir = getDir(rootPath, subPath);
      assert.equal(
        fs.existsSync(path.resolve(_dir, `${fName}.${_extension}`)),
        false,
        assertErrorListFilesMessage(`${fName}.${_extension}`, false, _dir)
      );
    });
  });

  nonExistFilesNames.forEach((fName) => {
    existExtensions.forEach((_extension) => {
      const _dir = getDir(rootPath, subPath);
      assert.equal(
        fs.existsSync(path.resolve(_dir, `${fName}.${_extension}`)),
        false,
        assertErrorListFilesMessage(`${fName}.${_extension}`, false, _dir)
      );
    });
    nonExistExtensions.forEach((_extension) => {
      const _dir = getDir(rootPath, subPath);
      assert.equal(
        fs.existsSync(path.resolve(_dir, `${fName}.${_extension}`)),
        false,
        assertErrorListFilesMessage(`${fName}.${_extension}`, false, _dir)
      );
    });
  });
};

const _assertCssFiles = (
  filePart: FilePart,
  rootPath: string,
  subPath: string
) => {
  filePart.extensions = filePart.extensions || {};
  filePart.extensions.exist = filePart.extensions.exist || [];
  filePart.extensions.nonExist = filePart.extensions.nonExist || [];

  if (!filePart.extensions.nonExist.length)
    DEFAULT_CSS_OUTPUT_EXTENSIONS.forEach((ext) => {
      if (
        (filePart.extensions.exist = filePart.extensions.exist || []).indexOf(
          ext
        ) < 0
      ) {
        (filePart.extensions.nonExist =
          filePart.extensions.nonExist || []).push(ext);
      }
    });

  return assertFileWithExtensions(filePart, rootPath, subPath);
};

const assertCssFiles = (filePart: FilePart, rootPath: string) => {
  return _assertCssFiles(filePart, rootPath, CSS_FOLDER_NAME);
};

const assertPackageCssFiles = (
  filePart: FilePart,
  rootPath: string,
  packagePath: string
) => {
  rootPath = path.join(rootPath, PACKAGES_OUTPUT_DIR, packagePath);
  return assertCssFiles(filePart, rootPath);
};

const _assertFontFiles = (
  filePart: FilePart,
  rootPath: string,
  subPath: string
) => {
  filePart.extensions = filePart.extensions || {};
  filePart.extensions.exist = filePart.extensions.exist || [];
  filePart.extensions.nonExist = filePart.extensions.nonExist || [];
  const nonExistExtensions: PartValues = [];

  AVAILABLE_OUTPUT_FORMATS.forEach((ext) => {
    if (
      (filePart.extensions.exist = filePart.extensions.exist || []).indexOf(
        ext
      ) < 0
    ) {
      nonExistExtensions.push(ext);
    }
  });

  filePart.extensions.nonExist = nonExistExtensions;

  return assertFileWithExtensions(filePart, rootPath, subPath);
};

const assertFontFiles = (filePart: FilePart, rootPath: string) => {
  _assertFontFiles(filePart, rootPath, WEBFONTS_DIR_NAME);
};

const assertPackageFontFiles = (
  filePart: FilePart,
  rootPath: string,
  packagePath: string
) => {
  rootPath = path.join(rootPath, PACKAGES_OUTPUT_DIR, packagePath);
  assertFontFiles(filePart, rootPath);
};

const assertProviderCssFiles = (
  filePart: FilePart,
  rootPath: string,
  providerName: string
) => {
  rootPath = path.join(rootPath, providerName);
  return assertCssFiles(filePart, rootPath);
};

const assertProviderFontFiles = (
  filePart: FilePart,
  rootPath: string,
  providerName: string
) => {
  rootPath = path.join(rootPath, providerName);
  assertFontFiles(filePart, rootPath);
};

export const LOCAL_TMP_DIR = path.join(__dirname, "tmp");

export const getTemp = () => {
  mdSync(LOCAL_TMP_DIR);
  return tmp.dirSync({
    tmpdir: LOCAL_TMP_DIR,
    prefix: "ssw-test-",
    unsafeCleanup: true,
  });
};

export const removeTemp = () =>
  fs.rmSync(LOCAL_TMP_DIR, { force: true, recursive: true });

const runCombineModeFilesCheck = (
  outputChecks: CombineModeFileCheck,
  outputDir: string
) => {
  outputChecks = outputChecks || {};

  const cssFileNames = outputChecks.cssFileNames || [];
  cssFileNames.forEach((fObj) => {
    assertCssFiles(fObj, outputDir);
  });

  const packageCssFiles = outputChecks.packageCssFiles || {};
  for (const [packageName, _cssFileNames] of Object.entries(packageCssFiles)) {
    _cssFileNames.forEach((fObj) => {
      assertPackageCssFiles(fObj, outputDir, packageName);
    });
  }

  const FontFiles = outputChecks.fontFiles || [];
  FontFiles.forEach((fObj) => {
    assertFontFiles(fObj, outputDir);
  });

  const FontLicense = outputChecks.fontLicenseFiles || [];
  for (const [_licenseFileName, existOrNot] of Object.entries(FontLicense)) {
    assert.equal(
      fs.existsSync(
        path.join(outputDir, COMBINED_FONT_LICENSE_FOLDER, _licenseFileName)
      ),
      existOrNot,
      assertErrorListFilesMessage(
        _licenseFileName,
        existOrNot,
        path.join(outputDir, COMBINED_FONT_LICENSE_FOLDER)
      )
    );
  }

  const packageFontFiles = outputChecks.packageFontFiles || [];
  for (const [packageName, _fontFileNames] of Object.entries(
    packageFontFiles
  )) {
    _fontFileNames.forEach((fObj) => {
      assertPackageFontFiles(fObj, outputDir, packageName);
    });
  }

  if (typeof outputChecks.metaDataExist !== "undefined") {
    assert.equal(
      fs.existsSync(path.join(outputDir, METADATA_FILE_NAME)),
      outputChecks.metaDataExist,
      assertErrorListFilesMessage(
        METADATA_FILE_NAME,
        outputChecks.metaDataExist,
        outputDir
      )
    );
  }

  const packageMetaDataFiles = outputChecks.packageMetadataFiles || [];
  for (const [packageName, existOrNot] of Object.entries(
    packageMetaDataFiles
  )) {
    assert.equal(
      fs.existsSync(
        path.join(
          outputDir,
          PACKAGES_OUTPUT_DIR,
          packageName,
          METADATA_FILE_NAME
        )
      ),
      existOrNot,
      assertErrorListFilesMessage(
        METADATA_FILE_NAME,
        existOrNot,
        path.join(outputDir, PACKAGES_OUTPUT_DIR, packageName)
      )
    );
  }

  const packageWebPageFiles = outputChecks.packageWebPageFile || [];
  for (const [packageName, existOrNot] of Object.entries(packageWebPageFiles)) {
    assert.equal(
      fs.existsSync(
        path.join(
          outputDir,
          PACKAGES_OUTPUT_DIR,
          packageName,
          FONT_WEB_PAGE_FILE_NAME
        )
      ),
      existOrNot,
      assertErrorListFilesMessage(
        FONT_WEB_PAGE_FILE_NAME,
        existOrNot,
        path.join(outputDir, PACKAGES_OUTPUT_DIR, packageName)
      )
    );
  }

  const packageLicenseFiles = outputChecks.packageLicenseFiles || [];
  for (const [packageName, existOrNot] of Object.entries(packageLicenseFiles)) {
    assert.equal(
      fs.existsSync(
        path.join(
          outputDir,
          PACKAGES_OUTPUT_DIR,
          packageName,
          LICENSE_FILE_NAME
        )
      ),
      existOrNot,
      assertErrorListFilesMessage(
        LICENSE_FILE_NAME,
        existOrNot,
        path.join(outputDir, PACKAGES_OUTPUT_DIR, packageName)
      )
    );
  }

  if (typeof outputChecks.metaDataExist !== "undefined") {
    assert.equal(
      fs.existsSync(path.join(outputDir, METADATA_FILE_NAME)),
      outputChecks.metaDataExist,
      assertErrorListFilesMessage(
        METADATA_FILE_NAME,
        outputChecks.metaDataExist,
        outputDir
      )
    );
  }

  if (typeof outputChecks.webPageFileExist !== "undefined") {
    assert.equal(
      fs.existsSync(path.join(outputDir, FONT_WEB_PAGE_FILE_NAME)),
      outputChecks.webPageFileExist,
      assertErrorListFilesMessage(
        FONT_WEB_PAGE_FILE_NAME,
        outputChecks.webPageFileExist,
        outputDir
      )
    );
  }
};

const runProviderModeFilesCheck = (
  outputChecks: ProviderFileCheck,
  outputDir: string
) => {
  const providerSubPath = outputChecks.providerSubPath;

  (outputChecks.providerCssFiles || []).forEach((fObj) => {
    assertProviderCssFiles(fObj, outputDir, providerSubPath);
  });

  (outputChecks.providerFontFiles || []).forEach((fObj) => {
    assertProviderFontFiles(fObj, outputDir, providerSubPath);
  });

  if (typeof outputChecks.licenseFilesExist !== "undefined") {
    assert.equal(
      fs.existsSync(path.join(outputDir, providerSubPath, LICENSE_FILE_NAME)),
      outputChecks.licenseFilesExist,
      assertErrorListFilesMessage(
        LICENSE_FILE_NAME,
        outputChecks.licenseFilesExist,
        outputDir
      )
    );
  }

  if (typeof outputChecks.metaDataExist !== "undefined") {
    assert.equal(
      fs.existsSync(path.join(outputDir, providerSubPath, METADATA_FILE_NAME)),
      outputChecks.metaDataExist,
      assertErrorListFilesMessage(
        METADATA_FILE_NAME,
        outputChecks.metaDataExist,
        outputDir
      )
    );
  }

  if (typeof outputChecks.webPageFileExist !== "undefined") {
    assert.equal(
      fs.existsSync(
        path.join(outputDir, providerSubPath, FONT_WEB_PAGE_FILE_NAME)
      ),
      outputChecks.webPageFileExist,
      assertErrorListFilesMessage(
        FONT_WEB_PAGE_FILE_NAME,
        outputChecks.webPageFileExist,
        outputDir
      )
    );
  }
};

const getOptions = (
  params: CombineHelperParams | ProviderHelperParams,
  debug: boolean,
  useTempDir: boolean
) => {
  let tempDir = undefined;
  if (useTempDir) tempDir = getTemp();
  const outputDir = tempDir ? tempDir.name : LOCAL_TMP_DIR;

  params.options = params.options || {};
  params.options.loggerOptions = params.options.loggerOptions || {};
  params.options.loggerOptions.silent = !debug;

  if (typeof params.options.loggerOptions.level === "undefined") {
    if (debug) params.options.loggerOptions.level = "debug";
  }

  if (typeof params.options.loggerOptions.level !== "undefined")
    params.options.loggerOptions.silent = false;

  const subset = params.subset,
    options = params.options;
  return [subset, outputDir, options];
};

/**
 * Helper function of combine mode (multiple packages)
 * @param {CombineHelperParams}params
 * @param done
 * @param {CombineModeFileCheck}outputChecks
 * @param {boolean}debug set logger level to "debug" for this single test
 * @param {boolean}useTempDir whether use temp dir for this single test. If false, the output will be in
 *                    ./tests/tmp folder
 * */
export const generateCombinedSubsetFont = (
  params: CombineHelperParams,
  done: any,
  outputChecks: CombineModeFileCheck,
  debug = false,
  useTempDir = true
) => {
  const [subset, outputDir, options] = getOptions(params, debug, useTempDir);
  iconFontSubset(subset, outputDir, options)
    .then(() => {
      runCombineModeFilesCheck(outputChecks, outputDir);
    })
    .then(done)
    .catch(done);
};

/**
 * Helper function of standalone mode (single package)
 * @param providerKlass
 * @param {ProviderHelperParams}params
 * @param done
 * @param {CombineModeFileCheck}outputChecks
 * @param {boolean}debug set logger level to "debug" for this single test
 * @param {boolean}useTempDir whether use temp dir for this single test. If false, the output will be in
 *                    ./tests/tmp folder
 * */
export const generateProviderSubsetFont = (
  providerKlass: any,
  params: ProviderHelperParams,
  done: any,
  outputChecks: ProviderFileCheck,
  debug = false,
  useTempDir = true
) => {
  const [subset, outputDir, options] = getOptions(params, debug, useTempDir);
  const instance = new providerKlass(subset, options);
  return instance
    .makeFonts(outputDir)
    .then(() => {
      runProviderModeFilesCheck(outputChecks, outputDir);
    })
    .then(done)
    .catch(done);
};

export const DEFAULT_MDI_TEST_CHECKS: CombineModeFileCheck = {
  cssFileNames: [
    {
      names: {
        exist: [
          COMBINED_CSS_NAME,
          MDI_FONT_FACE_FILE_NAME,
          MDI_DEFAULT_FONT_FILE_NAME,
        ],
      },
      extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
    },
  ],
  fontFiles: [
    {
      names: {
        exist: [MDI_DEFAULT_FONT_FILE_NAME],
      },
      extensions: { exist: DEFAULT_OUTPUT_FORMATS },
    },
  ],
  fontLicenseFiles: {
    [`${MDI_DEFAULT_FONT_FILE_NAME}-${LICENSE_FILE_NAME}`]: true,
  },
  packageLicenseFiles: {
    [MDI_DEFAULT_FONT_FILE_NAME]: false,
  },
  packageWebPageFile: {
    [MDI_DEFAULT_FONT_FILE_NAME]: false,
  },
  metaDataExist: true,
  webPageFileExist: true,
};

export const MDI_TEST_CHECKS_WITH_PACKAGE_OUTPUT: CombineModeFileCheck = {
  cssFileNames: [
    {
      names: {
        exist: [
          COMBINED_CSS_NAME,
          DEFAULT_COMBINE_FILE_NAME,
          "mdi-normal",
          "mdi-outline",
        ],
      },
      extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
    },
  ],
  fontFiles: [
    {
      names: {
        exist: [MDI_DEFAULT_FONT_FILE_NAME],
      },
      extensions: { exist: DEFAULT_OUTPUT_FORMATS },
    },
  ],
  packageCssFiles: {
    [MDI_DEFAULT_FONT_FILE_NAME]: [
      {
        names: {
          exist: [
            COMBINED_CSS_NAME,
            "mdi-normal",
            "mdi-outline",
            MDI_DEFAULT_FONT_FILE_NAME,
          ],
        },
        extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
      },
    ],
  },
  packageFontFiles: {
    [MDI_DEFAULT_FONT_FILE_NAME]: [
      {
        names: {
          exist: [MDI_DEFAULT_FONT_FILE_NAME],
        },
        extensions: { exist: DEFAULT_OUTPUT_FORMATS },
      },
    ],
  },
  fontLicenseFiles: {
    [`${MDI_DEFAULT_FONT_FILE_NAME}-${LICENSE_FILE_NAME}`]: true,
  },
  packageLicenseFiles: {
    [MDI_DEFAULT_FONT_FILE_NAME]: true,
  },
  packageWebPageFile: {
    [MDI_DEFAULT_FONT_FILE_NAME]: true,
  },
};
