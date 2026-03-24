/**
 * Simple structured logger for the Cashflow Simulator
 * Provides timestamped, categorized log output for debugging
 * with built-in sensitive data redaction.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LOG_LEVELS.DEBUG;

/**
 * Patterns for sensitive data that should be redacted in logs.
 * Order matters - more specific patterns should come first.
 */
const REDACT_PATTERNS = [
  // API keys and tokens
  {
    pattern: /([A-Za-z0-9_-]*api[_-]?key[A-Za-z0-9_-]*)[=:\s]*([A-Za-z0-9_-]{8,})/gi,
    replacement: '$1=[REDACTED]',
  },
  { pattern: /(token)[=:\s]*([A-Za-z0-9_-]{8,})/gi, replacement: '$1=[REDACTED]' },
  { pattern: /(bearer|auth)[=:\s]*([A-Za-z0-9_-]{8,})/gi, replacement: '$1=[REDACTED]' },
  // Secret keys
  { pattern: /(secret)[=:\s]*([A-Za-z0-9_-]{8,})/gi, replacement: '$1=[REDACTED]' },
  { pattern: /(password|passwd|pwd)[=:\s]*([^\s,}]+)/gi, replacement: '$1=[REDACTED]' },
  // Private keys
  {
    pattern: /(-----BEGIN [A-Z]+ PRIVATE KEY-----)[^-]*-----END [A-Z]+ PRIVATE KEY-----/gi,
    replacement: '$1=[REDACTED]-----END PRIVATE KEY-----',
  },
  // Generic sensitive field patterns in JSON
  {
    pattern: /(")(token|apiKey|api_key|secret|password|auth|credential)(")[\s:]+("[^"]*")/gi,
    replacement: '$1$2$3: "[REDACTED]"',
  },
  // Credit card patterns
  { pattern: /\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b/g, replacement: '[REDACTED_CC]' },
  // Email addresses (PII)
  {
    pattern: /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
    replacement: '[REDACTED_EMAIL]',
  },
];

/**
 * Recursively redact sensitive data from an object.
 * @param {*} obj - Object to redact
 * @returns {*} Redacted object
 */
function redactObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    let redacted = obj;
    for (const { pattern, replacement } of REDACT_PATTERNS) {
      redacted = redacted.replace(pattern, replacement);
    }
    return redacted;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item));
  }

  if (typeof obj === 'object') {
    /** @type {Record<string, *>} */
    const redacted = {};
    for (const [key, value] of Object.entries(obj)) {
      redacted[key] = redactObject(value);
    }
    return redacted;
  }

  return obj;
}

/**
 * Format log entry with timestamp and metadata
 * @param {string} level
 * @param {string} message
 * @param {Object} [meta]
 * @returns {string}
 */
function formatLog(level, message, meta) {
  const timestamp = new Date().toISOString();
  const redactedMeta = meta ? redactObject(meta) : null;
  const metaStr = redactedMeta ? ` ${JSON.stringify(redactedMeta)}` : '';
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
