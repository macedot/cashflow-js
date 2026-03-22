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
 * Uses local time to avoid timezone shifts.
 * @param {Date|string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  if (dateStr instanceof Date) return new Date(dateStr);
  // Handle YYYY-MM-DD format specially to avoid UTC timezone issues
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d); // Local time
  }
  return new Date(dateStr);
}

/**
 * Add a time period to a date (in local time)
 * @param {Date} date
 * @param {string} frequency
 * @returns {Date}
 */
function addPeriod(date, frequency) {
  if (!VALID_FREQUENCIES.has(frequency)) {
    throw new Error(`Invalid frequency: "${frequency}". Must be one of: ${[...VALID_FREQUENCIES].join(', ')}`);
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  switch (frequency) {
    case FREQUENCIES.DAILY:
      return new Date(year, month, day + 1);
    case FREQUENCIES.WEEKLY:
      return new Date(year, month, day + 7);
    case FREQUENCIES.MONTHLY: {
      // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28/29)
      const nextMonth = month + 1;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const nextMonthNormalized = nextMonth % 12;
      const daysInNextMonth = new Date(nextYear, nextMonthNormalized + 1, 0).getDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(nextYear, nextMonthNormalized, nextDay);
    }
    case FREQUENCIES.QUARTERLY: {
      const nextMonth = month + 3;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const nextMonthNormalized = nextMonth % 12;
      const daysInNextMonth = new Date(nextYear, nextMonthNormalized + 1, 0).getDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(nextYear, nextMonthNormalized, nextDay);
    }
    case FREQUENCIES.SEMI_ANNUAL: {
      const nextMonth = month + 6;
      const nextYear = nextMonth > 11 ? year + 1 : year;
      const nextMonthNormalized = nextMonth % 12;
      const daysInNextMonth = new Date(nextYear, nextMonthNormalized + 1, 0).getDate();
      const nextDay = Math.min(day, daysInNextMonth);
      return new Date(nextYear, nextMonthNormalized, nextDay);
    }
    case FREQUENCIES.ANNUAL: {
      // If starting on Feb 29 and next year is not a leap year, roll back to Feb 28
      const isLeapYear = (y) => new Date(y, 1, 29).getMonth() === 1;
      const nextYear = year + 1;
      const nextDay = (day === 29 && !isLeapYear(nextYear)) ? 28 : day;
      return new Date(nextYear, month, nextDay);
    }
    default:
      throw new Error(`Unhandled frequency: ${frequency}`);
  }
}

/**
 * Generate all occurrences of a single event within the simulation range.
 * Returns array of {date, value, name} objects.
 *
 * @param {Event} event
 * @param {Date} simStart
 * @param {Date} simEnd
 * @returns {{date: Date, value: number, name: string}[]}
 */
export function generateEventCashflows(event, simStart, simEnd) {
  const result = [];
  const startDate = parseDate(event.startDate);
  const endDate = parseDate(event.endDate);

  // Determine effective start: max(event.startDate, simStart)
  const effectiveStart = startDate > simStart ? startDate : simStart;
  // Determine effective end: min(event.endDate, simEnd)
  const effectiveEnd = endDate < simEnd ? endDate : simEnd;

  // If the effective range is invalid, return empty
  if (effectiveStart > effectiveEnd) {
    return result;
  }

  // Find the first occurrence
  let currentDate = new Date(effectiveStart);

  // Generate all occurrences
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
      const dateKey = `${cf.date.getFullYear()}-${cf.date.getMonth()}-${cf.date.getDate()}`;
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
  let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDay) {
    const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
    const entry = cashflowByDate.get(dateKey);

    if (entry) {
      balance += entry.cashflow;
      results.push({
        date: new Date(current),
        cashflow: entry.cashflow,
        balance: balance,
        items: [...entry.items],
      });
    } else {
      results.push({
        date: new Date(current),
        cashflow: 0,
        balance: balance,
        items: [],
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return results;
}
