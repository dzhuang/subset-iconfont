import fs from "fs";
import path from "path";
import { sync as mdSync } from "mkdirp";
import * as Buffer from "buffer";
import { createLogger, format, transports } from "winston";
import { DEFAULT_COMBINE_FILE_NAME } from "../providers/constants";
import { LoggerOptions, Logger } from "../types/Logger";

export const getFontFaceFileName = (filename: string) => {
  return `${filename}-font-face`;
};

export const writeFileSync = (filePath: string, content: string | Buffer) => {
  mdSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
};

type GetLogger = (loggerOptions?: LoggerOptions) => Logger;

export const getLogger: GetLogger = (loggerOptions) => {
  loggerOptions = loggerOptions || {};
  loggerOptions.transports =
    typeof loggerOptions.transports === "undefined"
      ? [new transports.Console({ level: loggerOptions.level })]
      : loggerOptions.transports;

  const { combine, label, printf } = format;
  const logFormat = printf(({ level, message, label }) => {
    return `[${label}] ${level}: ${message}`;
  });

  loggerOptions.format =
    typeof loggerOptions.format === "undefined"
      ? combine(
          label({ label: loggerOptions.label || DEFAULT_COMBINE_FILE_NAME }),
          logFormat
        )
      : loggerOptions.format;

  delete loggerOptions.label;

  return createLogger(loggerOptions);
};

export const mergeObjectArrayValues = (ObjectArrays: any[]) => {
  function keyValueListCumulate(
    accumulator: any,
    entryKeyValue: [string, any]
  ) {
    const [key, value] = entryKeyValue;
    accumulator[key] = accumulator[key] || [];
    accumulator[key] = [...accumulator[key], ...value];
    return accumulator;
  }

  const ObjectCumulate = (accumulator: any, currentObject: any) => {
    return Object.entries(currentObject).reduce(
      keyValueListCumulate,
      accumulator
    );
  };

  return ObjectArrays.reduce(ObjectCumulate, {});
};
