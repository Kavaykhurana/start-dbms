# Startup Investment Analysis & Decision System

This project now includes the full backend "engine" for the existing frontend:

- Live site: https://startup-investment-system-bice.vercel.app
- GitHub repo: https://github.com/Kavaykhurana/start-dbms
- `Node.js + Express` API layer
- `Vercel` deployment support through a serverless API entrypoint
- `MySQL 8` schema with seed data
- extra 50-startup seed script for a stronger college demo dataset
- investor portfolio, startup comparison, and safe SQL runner demo pages
- Teacher Demo Mode overlay for a quick viva walkthrough
- visual normalization walkthrough, transaction flow diagram, and viva scripts
- stored procedure demo for `sp_CalculateROI`
- Oracle PL/SQL viva script
- views, triggers, stored procedures, complex joins, and subqueries
- frontend integration that replaces `mockData.js` with live API calls
- DBMS docs page with ER diagram, normalization, and teacher-facing explanation notes

## Project Structure

- `/backend`: MySQL access layer and API-facing repository logic
- `/database`: schema, seed data, views, triggers, procedures, and demo SQL
- `/docs`: architecture, ER diagram, normalization, and viva guide
- `/assets/js`: frontend modules, Chart.js helpers, SQL demo UI, comparison UI, and legacy mock file
- `/pages`: existing HTML pages, now wired to the backend
- `/api/handler.js`: Vercel function entrypoint for `/api/*`

## Setup

1. Create the schema and seed data:

   ```sql
   SOURCE database/mysql_startup_investment_system.sql;
   SOURCE database/seed_50_startups.sql;
   ```

2. Copy `.env.example` to `.env` and set the MySQL credentials. You can use either individual `DB_*` variables or one hosted `DATABASE_URL`.

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

- primary mode: live MySQL-backed API when the Vercel project has valid `DATABASE_URL` or `DB_*` environment variables pointing to an accessible database
- fallback mode: bundled realistic startup data if the database is not configured yet

For hosted MySQL on Vercel, add either:

```text
DATABASE_URL=mysql://user:password@host:3306/startup_investment_system?ssl=true
```

or:

```text
DB_HOST=your-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=startup_investment_system
DB_SSL=true
```

Then import `database/mysql_startup_investment_system.sql` and `database/seed_50_startups.sql` into that hosted MySQL database and redeploy.

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
4. Open `/pages/recommendations.html`, click `Explain Score`, and explain the recommendation score.
5. Open `/pages/investors.html` and explain Investor -> Investments -> Startups joins.
6. Open `/pages/compare.html` and compare three startups using the same normalized metrics.
7. Open `/pages/sql-demo.html`, run the preset SQL demos, and run `sp_CalculateROI`.
8. Open `/pages/analytics.html` and explain the graphs.
9. Open `/pages/dbms.html` and show ER diagram, normalization, transaction flow, viva scripts, PL/SQL trigger, procedure, and complex join.

Use the `Teacher Demo Mode` button in the sidebar when you want the guided sequence inside the UI itself.
