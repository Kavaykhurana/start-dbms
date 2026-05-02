# Startup Investment Analysis & Decision System

This project now includes the full backend "engine" for the existing frontend:

- Live site: https://startup-investment-system-bice.vercel.app
- GitHub repo: https://github.com/Kavaykhurana/start-dbms
- `Node.js + Express` API layer
- `Vercel` deployment support through a serverless API entrypoint
- `MySQL 8` schema with seed data
- extra 50-startup seed script for a stronger college demo dataset
- Oracle PL/SQL viva script
- views, triggers, stored procedures, complex joins, and subqueries
- frontend integration that replaces `mockData.js` with live API calls
- DBMS docs page with ER diagram, normalization, and teacher-facing explanation notes

## Project Structure

- `/backend`: MySQL access layer and API-facing repository logic
- `/database`: schema, seed data, views, triggers, procedures, and demo SQL
- `/docs`: architecture, ER diagram, normalization, and viva guide
- `/assets/js`: frontend modules, Chart.js helpers, and legacy mock file
- `/pages`: existing HTML pages, now wired to the backend
- `/api/handler.js`: Vercel function entrypoint for `/api/*`

## Setup

1. Create the schema and seed data:

   ```sql
   SOURCE database/mysql_startup_investment_system.sql;
   SOURCE database/seed_50_startups.sql;
   ```

2. Copy `.env.example` to `.env` and set the MySQL credentials.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm start
   ```

5. Open:

   ```text
   http://127.0.0.1:3000/pages/index.html
   ```

## Vercel Note

The deployed project can run in two modes:

- primary mode: live MySQL-backed API when the Vercel project has valid `DB_*` environment variables pointing to an accessible database
- fallback mode: bundled realistic startup data if the database is not configured yet

## SQL Assets

- [database/mysql_startup_investment_system.sql](./database/mysql_startup_investment_system.sql)
- [database/seed_50_startups.sql](./database/seed_50_startups.sql)
- [database/advanced_queries.sql](./database/advanced_queries.sql)
- [database/oracle_plsql_queries.sql](./database/oracle_plsql_queries.sql)

## Documentation

- [docs/backend-integration-report.md](./docs/backend-integration-report.md)
- [docs/er-diagram-and-viva-guide.md](./docs/er-diagram-and-viva-guide.md)
- [docs/er-diagram.svg](./docs/er-diagram.svg)
- [docs/er-diagram.mmd](./docs/er-diagram.mmd)

## College Demo Order

1. Open `/pages/index.html` and explain the investor dashboard.
2. Open `/pages/startups.html`, use filters, and click `+ Add Startup`.
3. Open one startup detail page and explain CAC, LTV, burn rate, runway, churn, valuation, and risk.
4. Open `/pages/recommendations.html` and explain the recommendation score.
5. Open `/pages/analytics.html` and explain the graphs.
6. Open `/pages/dbms.html` and show ER diagram, normalization, PL/SQL trigger, procedure, and complex join.
