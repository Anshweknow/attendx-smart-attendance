# AttendX — Smart Attendance Management System

AttendX is a role-scoped attendance application for colleges. It gives administrators a way to maintain academic data, faculty a fast and accountable attendance workflow, and students a read-only view of their own attendance.

## Features and workflows

- **Admin:** dashboard, department, section, faculty, student, and subject management with validation and delete confirmation.
- **Faculty:** assigned-subject dashboard; section-specific bulk attendance; attendance history; reasoned corrections and audit history; low-attendance report.
- **Student:** personal dashboard, subject-wise statistics, and read-only attendance history.
- Responsive React interface with labelled forms, loading, empty, error, and success states, keyboard focus treatment, and mobile-friendly tables.

## Technology and architecture

| Layer | Technology |
| --- | --- |
| Web client | React, Vite, React Router, CSS |
| API | Node.js, Express, Mongoose |
| Security | JWT bearer tokens, bcryptjs, Helmet, CORS |
| Data | MongoDB / MongoDB Atlas |

The Vite single-page application calls the Express API through one centralized client. The API performs every authorization and attendance validation; route visibility in the client is usability only, not a security boundary.

```
client/src/             React pages, shared UI, layout, auth context, API client
server/src/controllers/ HTTP request orchestration
server/src/services/    attendance validation and statistics
server/src/models/      Mongoose collections and indexes
server/src/middleware/  authentication, authorization, errors
server/src/seed/        deterministic local demonstration data
```

## Data design and business rules

`User` holds credentials and role. `Student` and `Faculty` extend users; `Department`, `Section`, and `Subject` model the academic structure. `Attendance` links a student, subject, faculty, date, and status. `AttendanceAudit` records every correction's old/new status, actor, reason, and time.

- Valid statuses are only `PRESENT` and `ABSENT`.
- A compound database index prevents more than one record for the same student, subject, and UTC date.
- Bulk marking validates the complete request before writing it transactionally: faculty assignment, subject section, student membership, enrollment date, valid statuses, duplicate students, and non-future dates.
- Faculty queries are scoped to their assigned subjects and their students; students can access only their own records. Only admin/faculty roles can change attendance.
- A correction requires a different valid status and a non-empty reason; it updates attendance and writes its audit entry in one transaction.
- Percentages use `present / total * 100`, rounded to two decimals. No conducted classes returns `null`/`—`, never `0%`. The configurable threshold drives every low-attendance calculation.

## API overview

All successful responses are `{ success: true, message, data }`; errors are `{ success: false, message, error }`. Protected requests require `Authorization: Bearer <token>`.

- **Auth:** `POST /api/auth/login`, `GET /api/auth/me`
- **Admin resources:** CRUD on `/api/students`, `/api/faculty`, `/api/departments`, `/api/sections`, and `/api/subjects`
- **Attendance:** `POST /api/attendance/bulk`, `GET /api/attendance`, `GET /api/attendance/:id`, `PUT /api/attendance/:id`, `GET /api/attendance/audit/:attendanceId`, `GET /api/attendance/low`, `GET /api/attendance/student/:studentId`
- **Dashboards:** `GET /api/dashboard/admin`, `/faculty`, and `/student`

## Environment variables

Copy the examples before running locally. Never commit the created `.env` files.

| File | Variable | Purpose |
| --- | --- | --- |
| `.env` | `MONGO_URI` | MongoDB connection string |
| `.env` | `JWT_SECRET` | Long, random signing secret |
| `.env` | `JWT_EXPIRES_IN` | JWT lifetime (default `1d`) |
| `.env` | `PORT` | API port (default `5000`) |
| `.env` | `CLIENT_URL` | Comma-separated permitted browser origins |
| `.env` | `ATTENDANCE_THRESHOLD` | Low-attendance percentage, `0`–`100` |
| `client/.env` | `VITE_API_URL` | Public API origin, without `/api` |

## Local setup

1. Copy `.env.example` to `.env`, then set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
2. Copy `client/.env.example` to `client/.env`; use the API origin (for example `http://localhost:5000`) for `VITE_API_URL`.
3. Install dependencies: `npm install --prefix server` and `npm install --prefix client`.
4. Start the API: `npm run server`.
5. Start the client: `npm run dev --prefix client`.
6. For local sample data only, run `npm run seed`.Use a MongoDB deployment that supports transactions (Atlas replica sets do).

The seed resets the configured database deterministically, then creates one admin, two faculty members, 20 students, two departments, three sections, three assigned subjects, sample attendance, and low-attendance examples. Do **not** run it against a production database.

### Local demonstration credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@attendx.com` | `AttendXDemo123!` |
| Faculty | `faculty@attendx.com` | `AttendXDemo123!` |
| Student | `student@attendx.com` | `AttendXDemo123!` |

These credentials exist only in the local seed data.

## Testing and verification

The backend includes Node test-runner tests for the health/auth boundary and attendance statistics. Run `npm test` after dependencies are installed. Build the production client with `npm run build --prefix client`.

At the final engineering pass, dependency installation was attempted but this environment's npm registry policy returned HTTP 403 for `bcryptjs`; therefore runtime tests and the Vite build were **environment-blocked**, not reported as passing. Static JavaScript syntax checks and repository checks can still be run without installing packages.

## Deployment

### Vercel frontend

Deploy `client` as the Vercel project root. Use `npm run build`, publish `dist`, and set `VITE_API_URL` to the deployed API origin. The root `vercel.json` rewrites all paths to `index.html`, so direct React Router visits such as `/login`, `/admin/dashboard`, `/faculty/dashboard`, and `/student/dashboard` resolve correctly. Add the exact Vercel origin to the API's `CLIENT_URL`.

### Node-compatible API host

Run `npm start` from `server` (or `npm run server` from the repository root). The API uses the host-provided `PORT`, validates `MONGO_URI`, `JWT_SECRET`, and threshold at startup, and connects to MongoDB Atlas using the configured connection string. Configure `CLIENT_URL` with the deployed frontend origin(s); do not use a wildcard origin when credentials are enabled.

## Assumptions, limitations, and future work

- The supplied API intentionally has no pagination, date-range reporting, password reset, or aggregate department attendance report. Pagination and reporting exports are appropriate future additions as data volume grows.
- Attendance dates are UTC calendar dates. Faculty use the subject's assigned section as the attendance roster.
- Future enhancements may include account lifecycle/password-reset flows, paginated/filterable reports, and administrative audit/report exports. They should preserve the existing server-side authorization and attendance invariants.
