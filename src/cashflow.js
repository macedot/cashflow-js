/**
 * Cashflow Simulation Logic
 * Pure functions for generating cashflow events and calculating balances.
 */

export const FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semi-annual',
  ANNUAL: 'annual',
};

const VALID_FREQUENCIES = new Set(Object.values(FREQUENCIES));

/**
 * Get the next month and year when adding months, handling overflow
 * @param {number} currentMonth - 0-indexed month
 * @param {number} currentYear - Full year
 * @param {number} monthsToAdd - Number of months to add
 * @returns {{year: number, month: number}}
 */
function getNextMonthYear(currentMonth, currentYear, monthsToAdd) {
  const nextMonth = currentMonth + monthsToAdd;
  const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
  const monthNormalized = nextMonth % 12;
  return { year: nextYear, month: monthNormalized };
}

/**
 * Check if a year is a leap year
 * @param {number} year
 * @returns {boolean}
 */
function isLeapYear(year) {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1;
}

/**
 * @typedef {Object} Event
 * @property {string} name
 * @property {Date|string} startDate
 * @property {Date|string} endDate
 * @property {string} frequency - daily|weekly|monthly|quarterly|semi-annual|annual
 * @property {number} value - positive for income, negative for expense
 */

/**
 * @typedef {Object} CashflowEntry
 * @property {Date} date
 * @property {number} cashflow - total cashflow for this date
 * @property {number} balance - running balance after this date
 * @property {string[]} items - names of events contributing to this cashflow
 */

/**
 * Check if a date is valid (not Invalid Date)
 * @param {Date} d
 * @returns {boolean}
 */
export function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Parse a date string or return as-is if already a Date
 * Uses UTC to avoid timezone shifts when constructing from YYYY-MM-DD.
 * @param {Date|string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  if (dateStr instanceof Date) {
    return new Date(dateStr);
  }
  // Handle YYYY-MM-DD format: use UTC to avoid local midnight rollover
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split('-').map(Number);
    const y = /** @type {number} */ (parts[0]);
    const m = /** @type {number} */ (parts[1]);
    const d = /** @type {number} */ (parts[2]);
    return new Date(Date.UTC(y, m - 1, d));
  }
  return new Date(dateStr);
}

/**
 * Add a time period to a date (using UTC to avoid timezone shifts)
 * @param {Date} date
 * @param {string} frequency
 * @returns {Date}
 */
function addPeriod(date, frequency) {
  if (!VALID_FREQUENCIES.has(frequency)) {
    throw new Error(
      `Invalid frequency: "${frequency}". Must be one of: ${[...VALID_FREQUENCIES].join(', ')}`
    );
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  switch (frequency) {
    case FREQUENCIES.DAILY: {
      const d = new Date(date);
      d.setUTCDate(day + 1);
      return d;
    }
    case FREQUENCIES.WEEKLY: {
      const d = new Date(date);
      d.setUTCDate(day + 7);
      return d;
    }
    case FREQUENCIES.MONTHLY: {
      const { year: nextYear, month: nextMonth } = getNextMonthYear(month, year, 1);
      const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(Date.UTC(nextYear, nextMonth, nextDay));
    }
    case FREQUENCIES.QUARTERLY: {
      const { year: nextYear, month: nextMonth } = getNextMonthYear(month, year, 3);
      const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(Date.UTC(nextYear, nextMonth, nextDay));
    }
    case FREQUENCIES.SEMI_ANNUAL: {
      const { year: nextYear, month: nextMonth } = getNextMonthYear(month, year, 6);
      const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(Date.UTC(nextYear, nextMonth, nextDay));
    }
    case FREQUENCIES.ANNUAL: {
      const nextYear = year + 1;
      const nextDay = day === 29 && !isLeapYear(nextYear) ? 28 : day;
      return new Date(Date.UTC(nextYear, month, nextDay));
    }
    default:
      throw new Error(`Unhandled frequency: ${frequency}`);
  }
}

/**
 * @typedef {Object} CashflowOccurrence
 * @property {Date} date
 * @property {number} value
 * @property {string} name
 */

/**
 * Get the event end date or null if not set
 * @param {Event['endDate']} endDate
 * @returns {Date | null}
 */
function getEventEnd(endDate) {
  if (typeof endDate === 'string' && endDate.trim() !== '') {
    return parseDate(endDate);
  }
  return null;
}

/**
 * Get the effective end date for the simulation
 * @param {Date | null} eventEnd
 * @param {Date} simulationEnd
 * @returns {Date}
 */
function getEffectiveEnd(eventEnd, simulationEnd) {
  if (eventEnd !== null && eventEnd < simulationEnd) {
    return eventEnd;
  }
  return simulationEnd;
}

/**
 * Find the first occurrence date on or after a given date
 * @param {Date} startDate
 * @param {Date} targetStart
 * @param {string} frequency
 * @returns {Date}
 */
function findFirstOccurrence(startDate, targetStart, frequency) {
  let currentDate = parseDate(startDate);
  while (currentDate < targetStart) {
    currentDate = addPeriod(currentDate, frequency);
  }
  return currentDate;
}

/**
 * Generate all occurrences of a single event within the simulation range.
 * Returns array of {date, value, name} objects.
 *
 * @param {Event} event
 * @param {Date} simStart
 * @param {Date} simEnd
 * @returns {CashflowOccurrence[]}
 */
export function generateEventCashflows(event, simStart, simEnd) {
  const startDate = parseDate(event.startDate);
  const eventEnd = getEventEnd(event.endDate);

  // If event ends before simulation starts, return empty
  if (eventEnd !== null && eventEnd < simStart) {
    return [];
  }

  const effectiveEnd = getEffectiveEnd(eventEnd, simEnd);
  const firstOccurrence = findFirstOccurrence(startDate, simStart, event.frequency);

  // If first occurrence is after effective end, return empty
  if (firstOccurrence > effectiveEnd) {
    return [];
  }

  // Generate all occurrences
  /** @type {CashflowOccurrence[]} */
  const result = [];
  let currentDate = new Date(firstOccurrence);

  while (currentDate <= effectiveEnd) {
    result.push({
      date: new Date(currentDate),
      value: event.value,
      name: event.name,
    });
    currentDate = addPeriod(currentDate, event.frequency);
  }

  return result;
}

/**
 * Run a full cashflow simulation.
 * Returns one entry per calendar day from simStart to simEnd (inclusive).
 * Days with no events have cashflow=0 and balance carried forward.
 *
 * @param {Event[]} events - Array of events to simulate
 * @param {number} initialBalance - Starting balance
 * @param {Date|string} simStart - Simulation start date
 * @param {Date|string} simEnd - Simulation end date
 * @returns {CashflowEntry[]}
 */
export function runSimulation(events, initialBalance, simStart, simEnd) {
  const start = parseDate(simStart);
  const end = parseDate(simEnd);

  // Collect all cashflow occurrences keyed by date
  const cashflowByDate = new Map();

  for (const event of events) {
    const eventCashflows = generateEventCashflows(event, start, end);
    for (const cf of eventCashflows) {
      const dateKey = `${cf.date.getUTCFullYear()}-${cf.date.getUTCMonth()}-${cf.date.getUTCDate()}`;
      if (!cashflowByDate.has(dateKey)) {
        cashflowByDate.set(dateKey, { date: cf.date, cashflow: 0, items: [] });
      }
      const entry = cashflowByDate.get(dateKey);
      entry.cashflow += cf.value;
      entry.items.push(cf.name);
    }
  }

  // Build continuous daily results from simStart to simEnd
  const results = [];
  let balance = initialBalance;
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (current <= endDay) {
    const dateKey = `${current.getUTCFullYear()}-${current.getUTCMonth()}-${current.getUTCDate()}`;
    const entry = cashflowByDate.get(dateKey);

    if (entry) {
      balance += entry.cashflow;
      results.push({
        date: new Date(current),
        cashflow: entry.cashflow,
        balance,
        items: [...entry.items],
      });
    } else {
      results.push({
        date: new Date(current),
        cashflow: 0,
        balance,
        items: [],
      });
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return results;
}
