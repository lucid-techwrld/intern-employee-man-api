# Employee Management API

Node/Express + TypeScript + PostgreSQL (Redis optional) backend for Auspify internship Task 4.

## Setup
```bash
cp .env.example .env
npm install
npm run migrate
npm run dev
npm test
```

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/api/employees?q=&department_id=&status=&sort=name\|department\|salary\|hire_date&dir=&page=&limit=` | `{data, meta}` |
| GET | `/api/employees/export` | CSV download, same filters, no pagination |
| GET / POST / PUT / DELETE | `/api/employees[/:id]` | 422 on bad input, duplicate email or unknown department |
| GET / POST / PUT / DELETE | `/api/departments[/:id]` | list includes `headcount`; DELETE returns 409 while employees remain |
| GET | `/api/dashboard` | headcount, payroll, by department, hires per month, recent hires |

Statuses are Active, On leave and Terminated. Terminated staff are excluded from headcount and payroll. Lookups are indexed, lists are paginated, and the department list and dashboard are cached for 30 seconds when Redis is on.

## Deploy
```bash
npm install && npm run build   # build command
npm start                       # start command
npm run migrate:prod            # run once against the production database
```
Set `DATABASE_URL`, `CORS_ORIGIN` (your UI's URL) and optionally `REDIS_URL`. If the database is outside your host's private network, append `?sslmode=require` to `DATABASE_URL`.

## Authentication
Everything under `/api` except `/api/auth/*` requires an admin session. `POST /api/auth/login` with `{email, password}` sets an httpOnly cookie (8 hours); `POST /api/auth/logout` clears it and `GET /api/auth/me` returns the signed-in admin. Credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, tokens are signed with `JWT_SECRET` (required in production), failed logins are rate limited, and state-changing requests must send `X-Requested-With: fetch`. Browsers must send credentials, and `CORS_ORIGIN` must be the UI's exact origin.
