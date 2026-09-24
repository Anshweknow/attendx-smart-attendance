# AttendX — Smart Attendance Management System

AttendX is a production-oriented, modular-monolith backend for colleges that need reliable, role-scoped attendance management. The React frontend is intentionally deferred to the next development phase.

## Features and roles

- **Admin:** manages departments, sections, students, faculty, and subjects; sees institutional dashboards and low-attendance results.
- **Faculty:** sees assigned subjects, marks a whole section in one request, reviews attendance, corrects records with an auditable reason, and sees assigned-subject risk.
- **Student:** reads only their own dashboard, subject breakdown, and history. Students have no attendance write endpoint.
- JWT authentication, bcrypt password hashing, Helmet, configurable CORS, centralized safe errors, schema validation, and database unique indexes are included.

## Architecture

```
server/src/
  config/       environment and Mongo connection
  controllers/  HTTP orchestration
  middleware/   authentication, authorization, errors
  models/       Mongoose collections and indexes
  routes/       API routing
  services/     attendance workflow and calculations
  seed/         deterministic local demo data
  utils/        errors, responses, async wrapper
```

The MongoDB collections are `User`, `Student`, `Faculty`, `Department`, `Section`, `Subject`, `Attendance`, and `AttendanceAudit`. User passwords are stored only as `passwordHash` and are excluded from normal model queries. Attendance has a database compound unique index on `(studentId, subjectId, date)`.

## Setup

1. Install dependencies: `npm install --prefix server`.
2. Copy `.env.example` to `.env` and set a MongoDB Atlas or local connection string and a long, random `JWT_SECRET`.
3. Start the API with `npm run server`.
4. Verify `GET http://localhost:5000/api/health`.
5. Seed a **local development database only** with `npm run seed`. The seed clears AttendX collections first, so it is repeatable and must not target production.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection URL |
| `JWT_SECRET` | long random signing secret |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | comma-separated allowed frontend origins |
| `ATTENDANCE_THRESHOLD` | low-attendance threshold, default `75` |
| `JWT_EXPIRES_IN` | token duration, default `1d` |

## Demo data

The seed creates 1 admin, 2 faculty members, 20 students, 2 departments, 3 sections, 3 subject assignments, and eight days of attendance (including low-attendance students).

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@attendx.com` | `AttendXDemo123!` |
| Faculty | `faculty@attendx.com` | `AttendXDemo123!` |
| Student | `student@attendx.com` | `AttendXDemo123!` |

These credentials are intentionally limited to seed data, not application configuration.

## API overview

- `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/health`
- CRUD: `/api/students`, `/api/faculty`, `/api/departments`, `/api/sections`, `/api/subjects`
- Attendance: `POST /api/attendance/bulk`, `GET /api/attendance`, `GET /api/attendance/:id`, `PUT /api/attendance/:id`, `GET /api/attendance/student/:studentId`, `GET /api/attendance/low`, `GET /api/attendance/audit/:attendanceId`
- Dashboards: `/api/dashboard/admin`, `/api/dashboard/faculty`, `/api/dashboard/student`

Every API response uses `{ success, message, data }`; errors use `{ success: false, message, error }`. Send `Authorization: Bearer <token>` to protected routes.

## Attendance rules and assumptions

- `PRESENT` and `ABSENT` are the only statuses. A faculty member may submit only a subject assigned to their faculty profile and only students from that subject section. Admins have institution access.
- Bulk requests validate every item before transactionally inserting; duplicate submissions return conflict instead of partially creating records.
- The selected attendance date must be an ISO `YYYY-MM-DD` calendar date and cannot be later than today (UTC). This is the allowed-date assumption.
- `Student.enrollmentDate` prevents attendance before enrollment. It defaults to creation time, but admins can provide it at student creation.
- A correction requires a different status and non-empty reason; it updates the attendance record and creates an `AttendanceAudit` record within one MongoDB transaction.
- Percentage is `presentClasses / totalConductedClasses * 100`, rounded to two decimals. With no conducted classes, `percentage` is `null` and `isLowAttendance` is false.

## Deployment and future work

Deploy `server` to a Node-compatible host, use MongoDB Atlas, and configure the deployed frontend URL in `CLIENT_URL`. MongoDB Atlas replica sets support the transactions used for bulk submission and corrections. Future work includes the React client, pagination/filtering, admin password-reset workflow, and operational monitoring.
