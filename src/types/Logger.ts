export import winston = require("winston");

export type Logger = winston.Logger;

export type LoggerOptions = winston.LoggerOptions & {
  label?: string;
};
