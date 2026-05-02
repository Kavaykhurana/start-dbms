# Startup Investment Analysis and Decision System

A full-stack DBMS project for analyzing startup investment opportunities using normalized SQL data, backend APIs, analytics dashboards, and investor recommendation logic.

Live site: https://startup-investment-system-bice.vercel.app

GitHub repo: https://github.com/Kavaykhurana/start-dbms

## Overview

This project helps investors evaluate startups using funding, valuation, CAC, LTV, burn rate, runway, churn, market trend, partnerships, and risk score.

It is built as a college DBMS project, so it includes both the working application and the database concepts needed for viva:

- ER diagram
- 1NF to BCNF normalization
- MySQL schema
- Oracle PL/SQL script
- Complex joins
- Correlated subqueries
- Views
- Triggers
- Stored procedures
- API integration
- Chart-based analytics
- Vercel deployment

## Problem Statement

Startup investment decisions require many connected data points. If investor, startup, funding, financial, market, and risk data are stored without structure, it becomes difficult to compare companies fairly.

This project solves that problem by creating a normalized database-backed decision system that converts startup data into investor-friendly dashboards and recommendations.

## What the Site Does

The website provides a multi-page investment analytics system:

| Page | Purpose |
| --- | --- |
| Dashboard | Portfolio KPIs, funding trends, sector growth, and top investment signals |
| Startups | 50-startup portfolio table with search, filters, risk, runway, and Add Startup |
| Startup Details | Company profile, CAC, LTV, burn, runway, funding rounds, partnerships, and charts |
| Recommendations | Ranked investment suggestions with Explain Score logic |
| Investors | Investor portfolio exposure, deployed capital, risk, and startup coverage |
| Compare | Side-by-side startup comparison with charts |
| Analytics | CAC vs LTV, burn vs runway, funding stage, churn, risk, and valuation charts |
| SQL Demo | Safe query demos and `sp_CalculateROI` stored procedure demo |
| DBMS Docs | ER diagram, tables, normalization, triggers, procedures, PL/SQL, and viva notes |

## Key Features

- 50 realistic Indian startup records across Fintech, Edtech, SaaS, Healthtech, Energy, AI/ML, Cybersecurity, Agritech, Logistics, and more.
- Startup search and filtering.
- Add Startup form for browser-session demo entries.
- Recommendation engine using LTV/CAC, CAC efficiency, risk score, and runway.
- Explain Score button for viva-friendly scoring explanation.
- Investor portfolio analytics.
- Startup comparison charts.
- Funding round ledger and partnership ledger on details pages.
- DBMS documentation page inside the app.
- Teacher Demo Mode for a guided presentation flow.
- Light mode and dark mode.
- Sidebar full-view icon toggle for expanding the content area.
- Vercel deployment with fallback data support.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript ES Modules |
| Charts | Chart.js |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Oracle script | Oracle PL/SQL |
| DB driver | mysql2 |
| Deployment | Vercel |
| Version control | Git and GitHub |
| Browser state | localStorage |

## Project Structure

```text
startup-investment-system/
  api/
    handler.js
  assets/
    css/
      style.css
    js/
      api.js
      charts.js
      main.js
      dashboardPage.js
      startupsPage.js
      detailsPage.js
      recommendationsPage.js
      investorsPage.js
      comparePage.js
      analyticsPage.js
      sqlDemoPage.js
      dbmsPage.js
  backend/
    db.js
    fallbackData.js
    repository.js
  database/
    mysql_startup_investment_system.sql
    seed_50_startups.sql
    advanced_queries.sql
    oracle_plsql_queries.sql
  docs/
    backend-integration-report.md
    er-diagram-and-viva-guide.md
    er-diagram.svg
    er-diagram.mmd
  pages/
    index.html
    startups.html
    details.html
    recommendations.html
    investors.html
    compare.html
    sql-demo.html
    analytics.html
    dbms.html
  server.js
  vercel.json
  package.json
```

## Database Schema

The database has 8 main tables:

| Table | Purpose |
| --- | --- |
| `sectors` | Master table for startup sectors |
| `investors` | Investor profile, type, city, capital, and risk preference |
| `startups` | Startup master data |
| `investments` | Funding transaction table connecting investors and startups |
| `financial_metrics` | Monthly revenue, profit, CAC, LTV, burn, runway, and churn |
| `market_data` | Market trend and competitor score snapshots |
| `partnerships` | LOI and Pilot validation signals |
| `risk_analysis` | Risk score snapshots for investments |

## ER Relationships

```text
sectors 1:N startups
investors 1:N investments
startups 1:N investments
startups 1:N financial_metrics
startups 1:N market_data
startups 1:N partnerships
investments 1:N risk_analysis
```

## Normalization

The schema is designed up to BCNF.

| Normal form | How the project satisfies it |
| --- | --- |
| 1NF | Columns are atomic. There are no repeating groups or comma-separated lists. |
| 2NF | Non-key attributes depend on the full row identity. |
| 3NF | Transitive dependencies are removed. Sectors and investors are separate master tables. |
| BCNF | Important determinants like `sector_name`, `startup_name`, and `(startup_id, metric_month)` are candidate or alternate keys. |

## Advanced SQL Coverage

| SQL feature | Implemented item |
| --- | --- |
| Complex joins | Investor, startup, investment, financial, market, partnership, and risk joins |
| Correlated subqueries | Sector-average burn rate and peer comparison logic |
| Views | `vw_TopStartups`, `vw_HighRiskAlerts` |
| Trigger 1 | `trig_EquityCheck` prevents startup equity from exceeding 100 percent |
| Trigger 2 | `trig_RiskUpdate` updates risk when burn, churn, or runway changes |
| Stored procedure 1 | `sp_CalculateROI` calculates ROI for an investment |
| Stored procedure 2 | `sp_GetRecommendation` returns top startup recommendations |
| Oracle PL/SQL | Oracle-compatible script for viva demonstration |

## Recommendation Logic

The recommendation engine ranks startups using investment decision factors:

| Factor | Why it matters |
| --- | --- |
| LTV/CAC | Measures unit economics and customer value |
| CAC efficiency | Penalizes expensive customer acquisition |
| Risk score | Prevents risky startups from ranking too high |
| Runway | Shows survival time before next funding need |
| Partnerships | Shows external validation |

Signals returned by the system:

- `INVEST`
- `WATCH`
- `AVOID`

## API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `/api/dashboard` | Dashboard summary and chart data |
| `/api/startups` | Startup portfolio list |
| `/api/startups/:id` | Detailed startup profile |
| `/api/recommendations` | Ranked investment recommendations |
| `/api/investors` | Investor portfolio analytics |
| `/api/compare` | Startup comparison data |
| `/api/analytics` | Advanced chart datasets |
| `/api/sql-demo` | Safe SQL demo results |
| `/api/investments/:id/roi` | ROI stored procedure style output |

## Local Setup

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Open:

```text
http://127.0.0.1:3000
```

## MySQL Setup

Create and seed the database:

```sql
SOURCE database/mysql_startup_investment_system.sql;
SOURCE database/seed_50_startups.sql;
```

Add database environment variables:

```text
DB_HOST=your-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=startup_investment_system
DB_SSL=true
```

Or use:

```text
DATABASE_URL=mysql://user:password@host:3306/startup_investment_system?ssl=true
```

## Deployment Notes

The deployed Vercel app works in two modes:

| Mode | Description |
| --- | --- |
| MySQL mode | Uses hosted MySQL when database environment variables are configured |
| Fallback mode | Uses bundled realistic data when MySQL is not configured |

This makes the public demo reliable even without a hosted database.

## Important SQL Files

- [`database/mysql_startup_investment_system.sql`](./database/mysql_startup_investment_system.sql)
- [`database/seed_50_startups.sql`](./database/seed_50_startups.sql)
- [`database/advanced_queries.sql`](./database/advanced_queries.sql)
- [`database/oracle_plsql_queries.sql`](./database/oracle_plsql_queries.sql)

## Documentation Files

- [`docs/backend-integration-report.md`](./docs/backend-integration-report.md)
- [`docs/er-diagram-and-viva-guide.md`](./docs/er-diagram-and-viva-guide.md)
- [`docs/er-diagram.svg`](./docs/er-diagram.svg)
- [`docs/er-diagram.mmd`](./docs/er-diagram.mmd)

## College Demo Flow

1. Open Dashboard and explain portfolio KPIs.
2. Open Startups and show search, filters, and Add Startup.
3. Open Startup Details and explain CAC, LTV, burn, runway, churn, funding rounds, and partnerships.
4. Open Recommendations and click Explain Score.
5. Open Investors and explain investor to investment to startup joins.
6. Open Compare and compare startups side by side.
7. Open Analytics and explain charts.
8. Open SQL Demo and run SQL demos plus `sp_CalculateROI`.
9. Open DBMS Docs and show ER diagram, normalization, triggers, procedures, and PL/SQL.

## Best Viva Explanation

This project separates master data, transaction data, and time-series analytics data. `sectors`, `investors`, and `startups` are master tables. `investments` is the transaction table. `financial_metrics`, `market_data`, and `risk_analysis` store changing data over time. The database uses constraints, triggers, stored procedures, views, joins, and subqueries to support a real investment decision system.

## Current Status

- Frontend: complete
- Backend API: complete
- MySQL schema: complete
- Oracle PL/SQL script: complete
- 50-startup seed data: complete
- Vercel deployment: complete
- GitHub repository: complete
- DBMS docs and viva support: complete
