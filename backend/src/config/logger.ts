import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }), // "info" instead of numeric level codes
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});