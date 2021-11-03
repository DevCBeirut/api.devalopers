const winston = require("winston");
const { format } = require("logform");
require("winston-mongodb");
let path = require("path");
require("dotenv").config();

const options = {
  file: {
    level: "info",
    filename: "./logs/app-info.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  file_error: {
    level: "error",
    filename: "./logs/app-error.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  file_debug: {
    level: "debug",
    filename: "./logs/app-debug.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 1,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  console_error: {
    level: "error",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  MongoDB: {
    level: "error",
    db: process.env.dburl,
    collection: "logs",
    tryReconnect: true,
  },
};
let logger = null;
if (process.env.loglevel && process.env.NODE_ENV === "development") {
  logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      format.align(),
      format.printf(
        (info) =>
          `${info.level}: ${[info.timestamp]}: ${info.message}\n Stack: ${info.stack}`
      )
    ),
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.File(options.file_error),
      new winston.transports.File(options.file_debug),
      new winston.transports.Console(options.console),
      new winston.transports.Console(options.console_error),
      new winston.transports.MongoDB(options.MongoDB),
    ],
    exitOnError: false,
  });
} else {
  logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      format.align(),
      format.printf(
        (info) =>
          `${info.level}: ${[info.timestamp]}: ${info.message}\n Stack: ${info.stack}`
      )
    ),
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.File(options.file_error),
      new winston.transports.Console(options.console_error),
      new winston.transports.MongoDB(options.MongoDB),
    ],
    exitOnError: false,
  });
}

module.exports = logger;
