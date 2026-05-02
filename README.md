# Startup Investment Analysis & Decision System

This project now includes the full backend "engine" for the existing frontend:

- `Node.js + Express` API layer
- `Vercel` deployment support through a serverless API entrypoint
- `MySQL 8` schema with seed data
- views, triggers, stored procedures, complex joins, and subqueries
- frontend integration that replaces `mockData.js` with live API calls

## Project Structure

- `/backend`: MySQL access layer and API-facing repository logic
- `/database`: schema, seed data, views, triggers, procedures, and demo SQL
- `/docs`: architecture and normalization report
- `/assets/js`: frontend modules, Chart.js helpers, and legacy mock file
- `/pages`: existing HTML pages, now wired to the backend
- `/api/handler.js`: Vercel function entrypoint for `/api/*`

## Setup

1. Create the schema and seed data:

   ```sql
   SOURCE database/mysql_startup_investment_system.sql;
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
- [database/advanced_queries.sql](./database/advanced_queries.sql)

## Documentation

- [docs/backend-integration-report.md](./docs/backend-integration-report.md)
