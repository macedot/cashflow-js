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
 * Check if two dates are the same day
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

/**
 * Add a time period to a date (in local time)
 * @param {Date} date
 * @param {string} frequency
 * @returns {Date}
 */
function addPeriod(date, frequency) {
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
    case FREQUENCIES.ANNUAL:
      // Handle leap year
      const daysInNextYear = new Date(year + 1, 1, 29).getMonth() === 1 ? 366 : 365;
      const nextDay = day === 29 && daysInNextYear === 365 ? 28 : day;
      return new Date(year + 1, month, nextDay);
    default:
      return new Date(year, month, day + 1);
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

  // For non-daily frequencies, we need to find the first occurrence that aligns
  // with the event's schedule
  if (event.frequency !== FREQUENCIES.DAILY) {
    // For simplicity, the first occurrence is on effectiveStart
    // (the original Go code does the same)
  }

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

  // Collect all cashflow occurrences
  const allCashflows = [];
  for (const event of events) {
    const eventCashflows = generateEventCashflows(event, start, end);
    allCashflows.push(...eventCashflows);
  }

  // Group by date and sum
  const cashflowByDate = new Map();
  for (const cf of allCashflows) {
    // Use local date for key to avoid timezone issues
    const y = cf.date.getFullYear();
    const m = String(cf.date.getMonth() + 1).padStart(2, '0');
    const d = String(cf.date.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;
    if (!cashflowByDate.has(dateKey)) {
      cashflowByDate.set(dateKey, { date: new Date(y, cf.date.getMonth(), d), cashflow: 0, items: [] });
    }
    const entry = cashflowByDate.get(dateKey);
    entry.cashflow += cf.value;
    entry.items.push(cf.name);
  }

  // Sort by date
  const sortedDates = Array.from(cashflowByDate.values()).sort(
    (a, b) => a.date - b.date
  );

  // Calculate running balance
  let balance = initialBalance;
  const results = [];
  for (const entry of sortedDates) {
    balance += entry.cashflow;
    results.push({
      date: entry.date,
      cashflow: entry.cashflow,
      balance: balance,
      items: entry.items,
    });
  }

  return results;
}
