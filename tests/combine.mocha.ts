"use strict";

const REMOVE_TEMP_AFTER_EACH_TEST = true;

const assert = require("assert");
const fs = require("fs");
const path = require("path");
import {
  iconFontSubset,
  MdiProvider,
  FaFreeProvider,
  MiProvider,
} from "../src";
import {
  MDI_DEFAULT_FONT_FILE_NAME,
  DEFAULT_OUTPUT_FORMATS,
  FONT_AWESOME_DEFAULT_FONT_FILE_NAME,
  DEFAULT_COMBINE_FILE_NAME,
  COMBINED_CSS_NAME,
  LICENSE_FILE_NAME,
  SCSS_FOLDER_NAME,
} from "../src/providers/constants";

import {
  getTemp,
  generateCombinedSubsetFont,
  DEFAULT_CSS_OUTPUT_EXTENSIONS,
  DEFAULT_MDI_TEST_CHECKS,
  removeTemp,
  MDI_FONT_FACE_FILE_NAME,
} from "./helpers";

import { ConfigError } from "../src/utils/errors";
import { createHash } from "../src/process/utils";

before(function () {
  removeTemp();
});

after(function () {
  if (REMOVE_TEMP_AFTER_EACH_TEST) removeTemp();
});

describe("General tests", () => {
  it("should work for empty subset input", (done) => {
    generateCombinedSubsetFont(
      {
        subset: [],
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              nonExist: [COMBINED_CSS_NAME, DEFAULT_COMBINE_FILE_NAME],
            },
            extensions: { exist: [] },
          },
        ],
        packageCssFiles: {
          [MDI_DEFAULT_FONT_FILE_NAME]: [
            {
              names: {
                nonExist: [DEFAULT_COMBINE_FILE_NAME],
              },
              extensions: { exist: [] },
            },
          ],
        },
      }
    );
  });

  it("should not work for invalid subset (not an array)", () => {
    assert.throws(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      iconFontSubset("foo");
    }, ConfigError);
  });

  it("should not work for invalid subset item", () => {
    assert.throws(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      iconFontSubset(["foo", "bar"]);
    }, ConfigError);
  });

  it("should not work for invalid options (not an object)", () => {
    const mdi = new MdiProvider(["plus"]);
    assert.throws(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      iconFontSubset([mdi], "./tmp", "foo");
    }, ConfigError);
  });

  it("should work for mdi", (done) => {
    const mdi = new MdiProvider(["account-circle"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work for not sorting", (done) => {
    const mdi = new MdiProvider(["account-circle"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { sort: false },
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work for when an icon is added multiple times", (done) => {
    const mdi = new MdiProvider(["account-circle", "account-circle"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should not work for mdi with icon does not exist", (done) => {
    const mdi = new MdiProvider(["icon-does-not-exists"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,

      // this should generate nothing, we simply check if the css is generated.
      {
        cssFileNames: [
          {
            names: {
              nonExist: [COMBINED_CSS_NAME, DEFAULT_COMBINE_FILE_NAME],
            },
            extensions: { exist: [] },
          },
        ],
      }
    );
  });

  it("should not work for mdi when icons not exist were input multiple times", (done) => {
    const mdi = new MdiProvider([
      "icon-does-not-exists",
      "icon-does-not-exists",
    ]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,

      // this should generate nothing, we simply check if the css is generated.
      {
        cssFileNames: [
          {
            names: {
              nonExist: [COMBINED_CSS_NAME, DEFAULT_COMBINE_FILE_NAME],
            },
            extensions: { exist: [] },
          },
        ],
      }
    );
  });

  it("should work for fa-free", (done) => {
    const fa = new FaFreeProvider(["plus"]);
    generateCombinedSubsetFont(
      {
        subset: [fa],
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [COMBINED_CSS_NAME, DEFAULT_COMBINE_FILE_NAME, "fa-solid"],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],
        fontFiles: [
          {
            names: { exist: ["fa-solid-900"] },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });

  it("should work for fa-free with multiple styles", (done) => {
    const fa = new FaFreeProvider(["clock", "plus"]);
    generateCombinedSubsetFont(
      {
        subset: [fa],
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                DEFAULT_COMBINE_FILE_NAME,
                "fa-regular",
                "fa-solid",
              ],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],
        fontFiles: [
          {
            names: {
              exist: ["fa-regular-400", "fa-solid-900"],
              nonExist: [FONT_AWESOME_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });

  it("should work for fa with unicode 4 characters", (done) => {
    const fa = new FaFreeProvider(["500px"]);

    generateCombinedSubsetFont(
      {
        subset: [fa],
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                DEFAULT_COMBINE_FILE_NAME,
                "fa-brands",
              ],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],
        fontFiles: [
          {
            names: { exist: ["fa-brands-400"] },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });

  it("should work for when rendering icons with the same name in multiple packages", (done) => {
    const fa = new FaFreeProvider(["plus"]),
      mdi = new MdiProvider(["plus"]),
      mi = new MiProvider(["add-circle"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi, fa, mi],
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                MDI_FONT_FACE_FILE_NAME,
                MDI_DEFAULT_FONT_FILE_NAME,
                "fa-solid",
              ],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],
        fontFiles: [
          {
            names: {
              exist: [MDI_DEFAULT_FONT_FILE_NAME, "fa-solid-900"],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });
});

describe("SubsetProvider level options from combination mode", () => {
  it("should work when addHashInFontUrl is true", (done) => {
    const mdi = new MdiProvider(["account-circle"], {
      addHashInFontUrl: true,
    });

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work when addHashInFontUrl is false", (done) => {
    const mdi = new MdiProvider(["account-circle"], {
      addHashInFontUrl: false,
    });

    generateCombinedSubsetFont(
      {
        subset: [mdi],
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });
});

describe("scss render tests", () => {
  it("should have source path relative to the source css file in generated map file", (done) => {
    const tempDir = getTemp();
    const outputDir = tempDir.name;

    const mdi = new MdiProvider(["plus"]);
    iconFontSubset([mdi], outputDir)
      .then(() => {
        const rootMapObject = JSON.parse(
          fs
            .readFileSync(
              path.resolve(outputDir, "css", `${COMBINED_CSS_NAME}.css.map`)
            )
            .toString()
        );
        assert.ok(
          rootMapObject.sources.indexOf(
            `../${SCSS_FOLDER_NAME}/${COMBINED_CSS_NAME}.scss`
          ) > -1
        );
        assert.ok(
          rootMapObject.sources.indexOf(
            `../${SCSS_FOLDER_NAME}/${MDI_FONT_FACE_FILE_NAME}.scss`
          ) > -1
        );
      })
      .then(done)
      .catch(done);
  });

  it("should work when generating min", (done) => {
    const mdi = new MdiProvider(["plus"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { generateCssMap: true },
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work when not generating min", (done) => {
    const mdi = new MdiProvider(["plus"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { generateCssMap: false },
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                DEFAULT_COMBINE_FILE_NAME,
                MDI_FONT_FACE_FILE_NAME,
                MDI_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { exist: ["css", "min.css"] },
          },
        ],
        fontFiles: [
          {
            names: { exist: [MDI_DEFAULT_FONT_FILE_NAME] },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });

  it("should work when generating min css", (done) => {
    const mdi = new MdiProvider(["plus"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { generateMinCss: true },
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work when not generating min css", (done) => {
    const mdi = new MdiProvider(["plus"]);

    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { generateMinCss: false },
      },
      done,
      {
        cssFileNames: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                DEFAULT_COMBINE_FILE_NAME,
                MDI_FONT_FACE_FILE_NAME,
                MDI_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { exist: ["css", "css.map"] },
          },
        ],
        fontFiles: [
          {
            names: { exist: [MDI_DEFAULT_FONT_FILE_NAME] },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
    );
  });
});

describe("result tests", () => {
  it("should have font hash by default", (done) => {
    const mdi = new MdiProvider(["plus"]),
      tempDir = getTemp();

    iconFontSubset([mdi], tempDir.name, { formats: ["ttf"] })
      .then((result) => {
        const namePrefixes = [MDI_DEFAULT_FONT_FILE_NAME];
        namePrefixes.forEach((namePrefix) => {
          const fontFaceData = result.blobObject.scss.filter((blobObj) => {
              return blobObj.name.startsWith(namePrefix);
            })[0].data,
            hash = createHash(
              result.blobObject.webfonts.filter((blobObj) => {
                return (
                  blobObj.name.startsWith(namePrefix) &&
                  blobObj.name.endsWith(".ttf")
                );
              })[0].data
            );

          assert.ok(fontFaceData.includes(hash));
        });
      })
      .then(done)
      .catch(done);
  });

  it("should have not font hash if disabled", (done) => {
    const mdi = new MdiProvider(["plus"]),
      tempDir = getTemp();

    iconFontSubset([mdi], tempDir.name, {
      formats: ["ttf", "woff2"],
      addHashInFontUrl: false,
    })
      .then((result) => {
        const namePrefixes = [MDI_DEFAULT_FONT_FILE_NAME];
        namePrefixes.forEach((namePrefix) => {
          const fontFaceData = result.blobObject.scss.filter((blobObj) => {
              return blobObj.name.startsWith(namePrefix);
            })[0].data,
            hash = createHash(
              result.blobObject.webfonts.filter((blobObj) => {
                return (
                  blobObj.name.startsWith(namePrefix) &&
                  blobObj.name.endsWith(".ttf")
                );
              })[0].data
            );

          assert.ok(!fontFaceData.includes(hash));
        });
      })
      .then(done)
      .catch(done);
  });
});

describe("Options validation", () => {
  it("should not work for emtpy formats", async () => {
    const mdi = new MdiProvider(["plus"]);
    let thrown = false;
    try {
      await iconFontSubset([mdi], "./tmp", { formats: [] });
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for wrong type formats (not array)", async () => {
    const mdi = new MdiProvider(["plus"]);
    let thrown = false;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await iconFontSubset([mdi], "./tmp", { formats: "ttf" });
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for unknown formats", async () => {
    const mdi = new MdiProvider(["plus"]);
    let thrown = false;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await iconFontSubset([mdi], "./tmp", { formats: ["unknown", "ttf"] });
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should work with uppercase format", (done) => {
    const mdi = new MdiProvider(["account-circle"]);
    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          formats: DEFAULT_OUTPUT_FORMATS.map((format) => {
            return format.toUpperCase();
          }),
        },
      },
      done,
      DEFAULT_MDI_TEST_CHECKS
    );
  });

  it("should work for oet and woff", (done) => {
    const mdi = new MdiProvider(["account-circle"]);
    generateCombinedSubsetFont(
      {
        subset: [mdi],
        options: { formats: ["eot", "woff"] },
      },
      done,
      {
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
            extensions: {
              exist: ["eot", "woff"],
              nonExist: ["ttf", "woff2"],
            },
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
      }
    );
  });

  it("should not work for non-string prefix", async () => {
    const mdi = new MdiProvider(["plus"]);
    let thrown = false;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await iconFontSubset([mdi], "./tmp", { prefix: 1234 });
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for emtpy prefix", async () => {
    const mdi = new MdiProvider(["plus"], { prefix: "" });
    let thrown = false;
    try {
      await mdi.makeFonts("./tmp");
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for emtpy prefix (trim)", async () => {
    const mdi = new MdiProvider(["plus"], { prefix: "    " });
    let thrown = false;
    try {
      await mdi.makeFonts("./tmp");
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for emtpy webfontDir", async () => {
    const mdi = new MdiProvider(["plus"], { webfontDir: "   " });
    let thrown = false;
    try {
      await iconFontSubset([mdi], "./tmp");
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for emtpy fontName", async () => {
    const mdi = new MdiProvider(["plus"], { fontName: "   " });
    let thrown = false;
    try {
      await mdi.makeFonts("./tmp");
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });

  it("should not work for emtpy fontFileName", async () => {
    const mdi = new MdiProvider(["plus"], { fontFileName: "   " });
    let thrown = false;
    try {
      await mdi.makeFonts("./tmp");
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, ConfigError);
      thrown = true;
    }
    if (!thrown) throw new Error("Expected error not raise");
  });
});
