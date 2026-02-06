# FinTrack

A personal finance dashboard for tracking monthly budgets, shared expenses, and net worth — built with React and designed with a vibrant, gradient-rich UI that supports both light and dark modes.

---

## Features

### Budget Planning
Set monthly budget amounts across 11 categories including Housing, Car, Subscriptions, Groceries, and more. Categories with sub-items (like House → Rent, Electricity, Gas, Water, Insurance) let you budget at a granular level. Everything uses an accordion layout — collapsed rows show the category total, and expanding reveals the input fields.

### Expense Tracking
Track spending against your budget in real time. Each category shows a progress bar and balance indicator so you can see at a glance where you stand. The accordion view keeps things compact — simple categories like "Internet" stay as a single row, while complex ones like "Travelling" expand to show grouped sub-items.

### Shared Expenses
If you share expenses with a partner or roommate, give them a name and track their spending alongside yours. Both amounts contribute to category totals and the overall budget balance.

### Notes
Add free-text notes to specific categories (Personal expenses, Going out, Common shopping, Subscriptions) to record what you spent on — useful for itemizing things like subscriptions or dining out.

### Wealth Overview
A separate page for tracking your net worth: enter your assets (savings, investments, property) and liabilities (credit cards, loans, mortgage) to see your total wealth calculated in real time.

### Light & Dark Mode
Toggle between light and dark themes with a single click. Your preference is saved and persists across sessions. The design adapts seamlessly — vibrant purple-to-blue gradient accents in both modes.

### Data Persistence
All entered data (budget amounts, expenses, notes, partner name, theme preference) is saved to `localStorage` and survives page refreshes and browser restarts. No account or backend required.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router 6 |
| Styling | CSS Modules + CSS Custom Properties |
| State | React Context API |
| Persistence | localStorage |
| Fonts | Inter, JetBrains Mono (Google Fonts) |

**Zero external UI libraries.** All components, animations, and the theme system are built from scratch.

---

## Project Structure

```
src/
├── components/
│   └── DecimalInput.jsx       # Reusable decimal number input (supports typing "5.49")
├── context/
│   ├── AppData.jsx            # Global state provider (budget, expenses, notes)
│   └── ThemeContext.jsx        # Light/dark theme toggle with localStorage
├── data/
│   └── budgetCategories.js    # Category definitions and helper functions
├── layouts/
│   ├── DashboardLayout.jsx    # Sidebar + main content shell
│   └── DashboardLayout.module.css
├── pages/
│   ├── Budget.jsx             # Monthly budget editor (accordion)
│   ├── Expenses.jsx           # Expense tracker with shared spending
│   └── Wealth.jsx             # Net worth calculator
├── App.jsx                    # Route configuration
├── ErrorBoundary.jsx          # Catches rendering errors gracefully
├── index.css                  # Design system (CSS variables, themes, animations)
└── main.jsx                   # Entry point
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/rameshraman86/fintrack.git
cd fintrack

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Design System

The UI is built on CSS custom properties that swap between light and dark palettes:

- **Light mode** — Clean white cards on a soft blue-gray background (`#f0f4f8`), deep navy text, purple accent gradients
- **Dark mode** — Deep navy cards (`#1a2236`) on near-black background (`#0c111b`), light text, brighter purple/cyan accents

Key design decisions:
- **Accordion over cards** — Categories expand and collapse instead of taking uniform space, so simple items stay compact
- **Gradient accents** — The total budget card and net worth hero use a purple-to-blue gradient with decorative shapes
- **Responsive** — Sidebar collapses to a horizontal nav on mobile; all layouts adapt to small screens
- **Smooth transitions** — Theme changes, accordion open/close, hover effects, and page loads all animate smoothly

---

## Category Structure

| # | Category | Type |
|---|----------|------|
| 1 | House | Sub-items: Rent, Electricity, Gas, Water, Insurance |
| 2 | Car | Sub-items: Loan, Insurance, Fuel, Maintenance |
| 3 | Subscriptions | Simple (with notes) |
| 4 | Groceries and essentials | Simple |
| 5 | Internet | Simple |
| 6 | Going out | Simple (with notes) |
| 7 | Personal expenses | Simple (with notes) |
| 8 | My phone bill | Simple |
| 9 | Common shopping | Simple (with notes) |
| 10 | Travelling | Grouped: Transport (flight, car, hotel, parking, gas, cab, visa) + Shopping & eating out |
| 11 | Miscellaneous | Simple |

---

## License

This project is for personal use. Feel free to fork and adapt it for your own finances.
