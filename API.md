# Cashflow Simulator API

Auto-generated API documentation from JSDoc comments in `src/cashflow.js`.

## runSimulation

Run a full cashflow simulation.

**Parameters**

| Name             | Type           | Description                 |
| ---------------- | -------------- | --------------------------- |
| `events`         | `Event[]`      | Array of events to simulate |
| `initialBalance` | `number`       | Starting balance            |
| `simStart`       | `Date\|string` | Simulation start date       |
| `simEnd`         | `Date\|string` | Simulation end date         |

**Returns**: `CashflowEntry[]` - One entry per calendar day from simStart to simEnd (inclusive). Days with no events have cashflow=0 and balance carried forward.

---

## generateEventCashflows

Generate all occurrences of a single event within the simulation range.

**Parameters**

| Name       | Type    | Description                         |
| ---------- | ------- | ----------------------------------- |
| `event`    | `Event` | The event to generate cashflows for |
| `simStart` | `Date`  | Simulation start date               |
| `simEnd`   | `Date`  | Simulation end date                 |

**Returns**: `CashflowOccurrence[]` - Array of {date, value, name} objects.

---

## parseDate

Parse a date string or return as-is if already a Date. Uses local time to avoid timezone shifts.

**Parameters**

| Name      | Type           | Description                             |
| --------- | -------------- | --------------------------------------- |
| `dateStr` | `Date\|string` | Date string (YYYY-MM-DD) or Date object |

**Returns**: `Date`

---

## addPeriod

Add a time period to a date (in local time).

**Parameters**

| Name        | Type     | Description                                                    |
| ----------- | -------- | -------------------------------------------------------------- |
| `date`      | `Date`   | The date to add to                                             |
| `frequency` | `string` | One of: daily, weekly, monthly, quarterly, semi-annual, annual |

**Returns**: `Date`

---

## isValidDate

Check if a date is valid (not Invalid Date).

**Parameters**

| Name | Type   | Description          |
| ---- | ------ | -------------------- |
| `d`  | `Date` | The date to validate |

**Returns**: `boolean`

---

## FREQUENCIES

Object containing all valid frequency values:

```javascript
{
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semi-annual',
  ANNUAL: 'annual'
}
```

---

## Types

### Event

```javascript
{
  name: string,
  startDate: Date|string,
  endDate: Date|string,
  frequency: string,  // daily|weekly|monthly|quarterly|semi-annual|annual
  value: number       // positive for income, negative for expense
}
```

### CashflowEntry

```javascript
{
  date: Date,
  cashflow: number,     // total cashflow for this date
  balance: number,      // running balance after this date
  items: string[]       // names of events contributing to this cashflow
}
```

### CashflowOccurrence

```javascript
{
  date: Date,
  value: number,
  name: string
}
```
