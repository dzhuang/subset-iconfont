"use strict";

import { describe, it } from "mocha";

const assert = require("assert");
const { getLogger } = require("../src/utils/utils");
const winston = require("winston");
const tmp = require("tmp");
const path = require("path");

describe("utils/utils/getLogger", () => {
  it("get logger with no options", () => {
    // todo: more meaningful assertions
    const logger = getLogger();
    assert.ok(logger);
  });
  it("get logger with transports in options", () => {
    const tmpDir = tmp.dirSync({ prefix: "ssw-test", unsafeCleanup: true }),
      logFileName = path.join(tmpDir.name, "foo.log"),
      logger = getLogger({
        transports: [new winston.transports.File({ filename: logFileName })],
      });
    assert.equal(logger.transports.length, 1);
    assert.equal(logger.transports[0].name, "file");
    tmpDir.removeCallback();
  });
  it("get logger with format in options", () => {
    const logger = getLogger({ format: winston.format.json() });
    assert.equal(logger.transports.length, 1);
    assert.equal(logger.transports[0].name, "console");
    assert.ok(logger);
  });
});
