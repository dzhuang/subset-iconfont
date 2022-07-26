'use strict';

import { CssChoice } from '../src/process/types/CssChoices';

const REMOVE_TEMP_AFTER_EACH_TEST = true;
const fs = require('fs');
const winston = require('winston');
const assert = require('assert');

import { MdiProvider, FaFreeProvider, BiProvider, MiProvider, Fa4Provider } from '../src';
import {
  MDI_DEFAULT_FONT_FILE_NAME,
  DEFAULT_OUTPUT_FORMATS,
  FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME,
  DEFAULT_COMBINE_FILE_NAME,
  COMBINED_CSS_NAME,
  BOOTSTRAP_ICONS_FONT_FILE_NAME,
  MI_DEFAULT_FONT_FILE_NAME,
  FONT_AWESOME4_DEFAULT_FONT_FILE_NAME
} from '../src/providers/constants';

import {
  getTemp,
  generateProviderSubsetFont,
  DEFAULT_CSS_OUTPUT_EXTENSIONS,
  BOOTSTRAP_ICONS_FONT_FACE_FILE_NAME,
  removeTemp,
  MDI_FONT_FACE_FILE_NAME,
} from './helpers';

import { ConfigError } from '../src/utils/errors';
import { MakeFontResult } from '../src/process/types/MakeFontResult';

const sinon = require('sinon');

before(function () {
  removeTemp();
});

after(function () {
  if (REMOVE_TEMP_AFTER_EACH_TEST) removeTemp();
});

describe('Providers should be able to work alone', () => {
  it('mdi (Material Design Icons) should be able to work alone', (done) => {
    generateProviderSubsetFont(
      MdiProvider,
      {
        subset: ['plus'],
      },
      done,
      {
        providerSubPath: MDI_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
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

        providerFontFiles: [
          {
            names: {
              exist: [MDI_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: true,
        licenseFilesExist: true,
        webPageFileExist: true,
      }
      // true,
      // false
    );
  });
  it('fa (FontAwesome Free) should be able to work alone', (done) => {
    generateProviderSubsetFont(
      FaFreeProvider,
      {
        subset: ['clock', 'plus'],
      },
      done,
      {
        providerSubPath: FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                'fa-regular',
                'fa-solid',
                FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME,
              ],
              nonExist: [DEFAULT_COMBINE_FILE_NAME],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],
        providerFontFiles: [
          {
            names: {
              exist: ['fa-regular-400', 'fa-solid-900'],
              nonExist: [FONT_AWESOME_FREE_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],
      }
      // true,
      // false
    );
  });

  it('bi (Bootstrap Icons) should be able to work alone', (done) => {
    generateProviderSubsetFont(
      BiProvider,
      {
        subset: ['xbox', 'cloud-haze-1'], // cloud-haze-1 doesn't exist as a file
      },
      done,
      {
        providerSubPath: BOOTSTRAP_ICONS_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                BOOTSTRAP_ICONS_FONT_FACE_FILE_NAME,
                BOOTSTRAP_ICONS_FONT_FILE_NAME,
              ],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],

        providerFontFiles: [
          {
            names: { exist: [BOOTSTRAP_ICONS_FONT_FILE_NAME] },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: true,
        licenseFilesExist: true,
        webPageFileExist: true,
      }
    );
  });

  it('mi (Google Material Icons) should be able to work alone', (done) => {
    generateProviderSubsetFont(
      MiProvider,
      {
        subset: ['non-exist-icon', 'alarm-on'], // cloud-haze-1 doesn't exist as a file
      },
      done,
      {
        providerSubPath: MI_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                'mi-filled',
                'mi-outlined',
                'mi-round',
                'mi-two-tone',
                MI_DEFAULT_FONT_FILE_NAME,
              ],
              nonExist: ['mi-sharp'],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],

        providerFontFiles: [
          {
            names: {
              exist: [
                'mi-filled-400',
                'mi-outlined-400',
                'mi-round-400',
                'mi-two-tone-400',
              ],
              nonExist: ['mi-sharp-400'],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: true,
        licenseFilesExist: true,
        webPageFileExist: true,
      }
    );
  });

  it('fa4 (Font Awesome 4) should be able to work alone', (done) => {
    generateProviderSubsetFont(
      Fa4Provider,
      {
        subset: ['non-exist-icon', 'check'], // cloud-haze-1 doesn't exist as a file
      },
      done,
      {
        providerSubPath: FONT_AWESOME4_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              exist: [
                COMBINED_CSS_NAME,
                FONT_AWESOME4_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { exist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],

        providerFontFiles: [
          {
            names: {
              exist: [
                FONT_AWESOME4_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { exist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: true,
        licenseFilesExist: false,
        webPageFileExist: true,
      }
    );
  });

  it('should be ok to output nothing', (done) => {
    generateProviderSubsetFont(
      MdiProvider,
      {
        subset: ['plus'],
        options: {
          writeOutFiles: [],
        },
      },
      done,
      {
        providerSubPath: MDI_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              nonExist: [
                COMBINED_CSS_NAME,
                MDI_FONT_FACE_FILE_NAME,
                MDI_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { nonExist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],

        providerFontFiles: [
          {
            names: {
              nonExist: [MDI_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { nonExist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: false,
        licenseFilesExist: false,
        webPageFileExist: false,
      }
      // true,
      // false
    );
  });
  it('should be ok to output only metadata', (done) => {
    generateProviderSubsetFont(
      MdiProvider,
      {
        subset: ['plus'],
        options: {
          writeOutFiles: ['web'],
        },
      },
      done,
      {
        providerSubPath: MDI_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
          {
            names: {
              nonExist: [
                COMBINED_CSS_NAME,
                MDI_FONT_FACE_FILE_NAME,
                MDI_DEFAULT_FONT_FILE_NAME,
              ],
            },
            extensions: { nonExist: DEFAULT_CSS_OUTPUT_EXTENSIONS },
          },
        ],

        providerFontFiles: [
          {
            names: {
              nonExist: [MDI_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { nonExist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: false,
        licenseFilesExist: false,
        webPageFileExist: true,
      }
      // true,
      // false
    );
  });
  it('should be ok to output only css', (done) => {
    generateProviderSubsetFont(
      MdiProvider,
      {
        subset: ['plus'],
        options: {
          writeOutFiles: ['css'],
        },
      },
      done,
      {
        providerSubPath: MDI_DEFAULT_FONT_FILE_NAME,
        providerCssFiles: [
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
        providerFontFiles: [
          {
            names: {
              nonExist: [MDI_DEFAULT_FONT_FILE_NAME],
            },
            extensions: { nonExist: DEFAULT_OUTPUT_FORMATS },
          },
        ],

        metaDataExist: false,
        licenseFilesExist: false,
        webPageFileExist: false,
      }
      // true,
      // false
    );
  });
});

describe('misc test to increase coverage', () => {
  it('rename icon will not work for non exist icons', () => {
    const mdi = new MdiProvider(['plus']),
      renamedResult = mdi.renameIcon('non-exist-icon');
    assert.equal(typeof renamedResult, 'undefined');
  });
});

describe('providerBase subclass test', () => {
  afterEach(function () {
    sinon.restore();
  });

  it('validate subset fail, invalid subset', () => {
    assert.throws(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new MdiProvider(1);
    }, ConfigError);
  });

  it('ensure logger is cached', (done) => {
    const tempDir = getTemp();
    const mdiObj = new MdiProvider(['foo'], {
      loggerOptions: { silent: true },
    });

    let stub: any;

    mdiObj
      .makeFonts(tempDir.name)
      .then(() => {
        stub = sinon.stub(winston, 'createLogger');
        mdiObj.makeFonts(tempDir.name);
      })
      .then(() => {
        sinon.assert.notCalled(stub);

        // this will trigger createLogger
        mdiObj.setLoggerOptions('silent', true);
        sinon.assert.calledOnce(stub);
        done();
      })
      .catch(done);
  });

  it('ensure when logger is not initialized, setLoggerOptions will not trigger createLogger', () => {
    const mdiObj = new MdiProvider(['foo']),
      stub = sinon.stub(winston, 'createLogger');

    mdiObj.setLoggerOptions('silent', true);
    sinon.assert.notCalled(stub);
  });

  it('should work without license file', (done) => {
    const originalValidateSubPath = fs.existsSync;
    sinon.stub(fs, 'existsSync').callsFake((path: string) => {
      if (path.includes('LICENSE')) return false;
      return originalValidateSubPath(path);
    });

    const mdi = new MdiProvider(['plus'], { loggerOptions: { silent: true } });

    const tmpDir = getTemp();
    mdi
      .makeFonts(tmpDir.name)
      .then(() => {
        done();
      })
      .catch(() => {
        done();
      })
      .finally(tmpDir.removeCallback);
  });

  it('should work without version file', (done) => {
    const originalValidateSubPath = fs.existsSync;
    sinon.stub(fs, 'existsSync').callsFake((path: string) => {
      if (path.includes('package.json')) return false;
      return originalValidateSubPath(path);
    });

    const mdi = new MdiProvider(['plus'], { loggerOptions: { silent: true } });

    const tmpDir = getTemp();
    mdi
      .makeFonts(tmpDir.name)
      .then(() => {
        done();
      })
      .catch(() => {
        done();
      })
      .finally(tmpDir.removeCallback);
  });

  it('should throw when min version number is restricted while no package version', async () => {
    const fa = new FaFreeProvider(['plus']);

    const originalValidateSubPath = fs.existsSync;
    sinon.stub(fs, 'existsSync').callsFake((path: string) => {
      if (path.includes('package.json')) return false;
      return originalValidateSubPath(path);
    });

    const tmpDir = getTemp();
    let thrown = false;
    try {
      await fa.makeFonts(tmpDir.name);
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, Error);
      thrown = true;
    }
    if (!thrown) throw new Error('Expected error not raise');
    tmpDir.removeCallback();
  });

  it('should throw when version number is lower than min version number', async () => {
    const fa = new FaFreeProvider(['plus']);

    sinon.stub(fa, 'version').get(function getterFn() {
      return '1.1';
    });

    const tmpDir = getTemp();
    let thrown = false;
    try {
      await fa.makeFonts(tmpDir.name);
    } catch (e) {
      assert.throws(() => {
        throw e;
      }, Error);
      thrown = true;
    }
    if (!thrown) throw new Error('Expected error not raise');
    tmpDir.removeCallback();
  });
});

describe(`cssChoices subset test`, function () {
  const getAllCssFileContentFromResult = (result: MakeFontResult) => {
    for (const css of result.blobObject.css) {
      if (css.name === 'all.css') {
        return css.data.toString();
      }
    }
    throw new Error('all.css does not exist in result.');
  };

  const assertCssContains = function (
    result: MakeFontResult,
    containedStrings: string[]
  ) {
    const cssContent = getAllCssFileContentFromResult(result);
    containedStrings.forEach((sub) => {
      assert.equal(
        cssContent.includes(sub),
        true,
        `The content of all.css unexpectedly DOES NOT CONTAIN "${sub}":\n${cssContent}`
      );
    });
  };

  const assertCssDoesNotContain = function (
    result: MakeFontResult,
    containedStrings: string[]
  ) {
    const cssContent = getAllCssFileContentFromResult(result);
    containedStrings.forEach((sub) => {
      assert.equal(
        cssContent.includes(sub),
        false,
        `The content of all.css unexpectedly CONTAINS "${sub}":\n${cssContent}`
      );
    });
  };

  async function runSubset(cssChoices: CssChoice[], cb: any) {
    const fa = new FaFreeProvider(['plus'], { cssChoices: cssChoices }),
      tmpDir = getTemp();
    await fa
      .makeFonts(tmpDir.name)
      .then((result) => {
        if (cb) cb(result);
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => tmpDir.removeCallback());
  }

  it('should work with empty cssChoice', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus']);
      assertCssDoesNotContain(result, [
        '.fa-1x', // sizing
        '.fa-fw', // fixed-width
        '.fa-ul',
        '.fa-li', // list
        '.fa-border', // bordered
        '.fa-pull-left',
        '.fa-pull-right', // pulled
        '.fa-fade',
        '.fa-beat',
        '.fa-bounce',
        '.fa-flip', // animated
        '.fa-rotate-by', // rotated
        '.fa-flip-both', // flipped
        '.fa-stack-2x', // stacked
        '.fa-inverse', // inverse
        '.fa-sr-only', // screen-reader
      ]);
    };
    await runSubset([], cb);
  });
  it('should work with ["sizing"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-1x']);
    };
    await runSubset(['sizing'], cb);
  });
  it('should work with ["fixed-width"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-fw']);
    };
    await runSubset(['fixed-width'], cb);
  });
  it('should work with ["list"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-ul', '.fa-li']);
    };
    await runSubset(['list'], cb);
  });
  it('should work with ["bordered"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-border']);
    };
    await runSubset(['bordered'], cb);
  });
  it('should work with ["pulled"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, [
        '.fa-plus',
        '.fa-pull-left',
        '.fa-pull-right',
      ]);
    };
    await runSubset(['pulled'], cb);
  });
  it('should work with ["animated"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, [
        '.fa-plus',
        '.fa-fade',
        '.fa-beat',
        '.fa-bounce',
        '.fa-flip',
      ]);
    };
    await runSubset(['animated'], cb);
  });
  it('should work with ["rotated"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-rotate-by']);
    };
    await runSubset(['rotated'], cb);
  });
  it('should work with ["flipped"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-flip-both']);
    };
    await runSubset(['flipped'], cb);
  });
  it('should work with ["stacked"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-stack-2x']);
    };
    await runSubset(['stacked'], cb);
  });
  it('should work with ["inverse"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-inverse']);
    };
    await runSubset(['inverse'], cb);
  });
  it('should work with ["screen-reader"]', async () => {
    const cb = (result: MakeFontResult) => {
      assertCssContains(result, ['.fa-plus', '.fa-sr-only']);
    };
    await runSubset(['screen-reader'], cb);
  });
});
