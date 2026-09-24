# AttendX — Smart Attendance Management System

AttendX is a role-scoped attendance platform for colleges. It combines a Node/Express/MongoDB API with a Vite + React single-page application for reliable attendance marking, corrections, auditability, and student self-service.

## Product capabilities

- **Admin:** manage departments, sections, students, faculty, and subject assignments; review institutional at-risk students.
- **Faculty:** view assigned subjects, take section attendance in bulk, review records, make reasoned corrections, inspect the immutable correction audit, and identify low attendance.
- **Student:** view a polished read-only dashboard, subject-wise attendance, and personal attendance history.
- JWT authentication and role-aware routing/UI; backend role authorization remains the security boundary.
- Responsive SaaS-style application shell, accessible labelled forms, mobile table layouts, loading/error/empty states, and destructive-action confirmation.

## Stack and architecture

- **Client:** React, Vite, React Router, JavaScript, CSS (`client/`).
- **API:** Express, Mongoose, JWT, bcryptjs, Helmet, CORS (`server/src/`).
- **Data:** MongoDB collections for User, Student, Faculty, Department, Section, Subject, Attendance, and AttendanceAudit.

```
client/src/
  components/  reusable table, modal, UI primitives
  context/     authentication state
  layouts/     role-aware application shell
  pages/       admin, faculty, student, authentication pages
  services/    centralized API client
server/src/
  controllers/ routes/ services/ models/ middleware/ seed/
```

## Local setup

### 1. Backend

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` and a long random `JWT_SECRET`.
3. Install/run: `npm install --prefix server && npm run server`.
4. Seed only a local development database: `npm run seed`.

The API listens on `PORT` (default `5000`) and is mounted at `/api`. Configure `CLIENT_URL` with the frontend origin(s). MongoDB must support transactions for bulk marking and corrections (Atlas replica sets do).

### 2. Frontend

1. Copy `client/.env.example` to `client/.env`.
2. Set `VITE_API_URL` to the API origin, for example `http://localhost:5000` during local development. It is deliberately blank by default so the frontend can also use a same-origin proxy/deployment.
3. Install/run: `npm install --prefix client && npm run dev --prefix client`.
4. Create a production build: `npm run build --prefix client`.

No API URL is hard-coded in client source. The centralized client appends `/api` and sends the bearer token for authenticated calls.

## Seeded demonstration accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@attendx.com` | `AttendXDemo123!` |
| Faculty | `faculty@attendx.com` | `AttendXDemo123!` |
| Student | `student@attendx.com` | `AttendXDemo123!` |

These are generated only by the local seed script and are not production configuration.

## API contract

All successful API responses are `{ success: true, message, data }`; errors are `{ success: false, message, error }`. Protected calls require `Authorization: Bearer <token>`.

- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Resources: CRUD on `/api/students`, `/faculty`, `/departments`, `/sections`, `/subjects`
- Attendance: `POST /api/attendance/bulk`, `GET /api/attendance`, `PUT /api/attendance/:id`, `GET /api/attendance/audit/:attendanceId`, `GET /api/attendance/low`, and student statistics endpoints
- Dashboards: `/api/dashboard/admin`, `/faculty`, `/student`

## Business rules and assumptions

- Attendance is only `PRESENT` or `ABSENT`; a bulk request validates an entire selected section before inserting it transactionally.
- Faculty can act only on assigned subjects. Students can read only their own data and never receive attendance edit controls.
- There is one attendance record per student, subject, and UTC calendar date. Duplicate submissions return HTTP 409.
- Attendance cannot be future-dated or predate enrollment. Corrections need a changed status plus non-empty reason and create an `AttendanceAudit` entry.
- Attendance percentage is present / total conducted classes, rounded to two decimals. A student with no classes has no percentage and is not low-attendance.

## Vercel deployment

Deploy `client` as the Vercel project root/build target; use `npm run build` and publish `dist`. Set `VITE_API_URL` in Vercel environment variables to the deployed API origin and add the Vercel URL to backend `CLIENT_URL`. `vercel.json` rewrites SPA paths to `index.html` so React Router routes work on direct visits. Deploy the API separately to a Node-compatible service and provide MongoDB Atlas credentials there.

## Known limitations

The current API intentionally has no pagination, attendance date-range query parameters, password reset flow, or aggregate admin attendance percentage/department count endpoint. The frontend therefore uses the exact data and filters supported by the API rather than fabricating these capabilities.
