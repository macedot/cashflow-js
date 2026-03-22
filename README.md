# CashflowSim

A client-side cashflow simulation tool. Visualize income and expenses over time — no backend, no signup, runs entirely in your browser.

## 🚀 Quick Start

```bash
# Serve the app (required for ES modules)
python3 -m http.server 8080
# Open http://localhost:8080/cf-sim.html
```

Or open `cf-sim.html` directly in a modern browser.

## ✨ Features

- 📅 **Recurring events** — daily, weekly, monthly, quarterly, semi-annual, annual
- 📊 **Bar chart** — cashflows over time
- 📈 **Step line chart** — running balance over time
- 📋 **Results table** — daily breakdown with event details
- 📥 **CSV import** — bulk import events
- 📤 **CSV export** — download results
- 💾 **localStorage** — events persist across sessions
- 🌍 **Multi-currency** — USD, EUR, GBP, BRL support
- 📱 **Responsive** — works on mobile and desktop

## 📁 Project Structure

```
index.html          # Vue 3 SPA (CDN, no build step)
src/
  cashflow.js      # Pure simulation logic — zero dependencies, ES module
  cashflow.test.js # Vitest unit tests
  style.css        # Custom CSS (dark mode, theme overrides)
vitest.config.js   # Test runner config
package.json       # npm scripts
```

## 🧪 Running Tests

```bash
npm install
npm test        # run once
npm run test:watch  # watch mode
```

## 🧮 How It Works

1. Add events (e.g., "Salary" monthly, "Rent" monthly) — simulation runs automatically
2. Set simulation date range and portfolio currency
3. View charts and results table

Results show **every calendar day** from start to end. Days without events carry the balance forward.

## 🌙 Dark Mode

Toggle between light and dark theme. Dark mode follows your OS preference on first load.

## 📝 CSV Format

Import CSV with columns: `name,startDate,endDate,frequency,value,currency`

```csv
name,startDate,endDate,frequency,value,currency
Salary,2025-01-01,2025-12-31,monthly,5000,USD
Rent,2025-01-01,2025-12-31,monthly,-1500,USD
```

## 🔒 Privacy

All data stays in your browser. Nothing is sent to any server.

## 📄 License

GPLv3
