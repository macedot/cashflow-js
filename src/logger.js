/**
 * Simple structured logger for the Cashflow Simulator
 * Provides timestamped, categorized log output for debugging
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LOG_LEVELS.DEBUG;

/**
 * Format log entry with timestamp and metadata
 * @param {string} level
 * @param {string} message
 * @param {Object} [meta]
 * @returns {string}
 */
function formatLog(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Log debug message
 * @param {string} message
 * @param {Object} [meta]
 */
export function debug(message, meta) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.debug(formatLog('DEBUG', message, meta));
  }
}

/**
 * Log info message
 * @param {string} message
 * @param {Object} [meta]
 */
export function info(message, meta) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.info(formatLog('INFO', message, meta));
  }
}

/**
 * Log warning message
 * @param {string} message
 * @param {Object} [meta]
 */
export function warn(message, meta) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(formatLog('WARN', message, meta));
  }
}

/**
 * Log error message
 * @param {string} message
 * @param {Object|Error} [meta]
 */
export function error(message, meta) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    if (meta instanceof Error) {
      console.error(
        formatLog('ERROR', message, { name: meta.name, message: meta.message, stack: meta.stack })
      );
    } else {
      console.error(formatLog('ERROR', message, meta));
    }
  }
}

export default { debug, info, warn, error };
