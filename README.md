# HostelCare – Hostel Complaint Management System

**Report. Track. Resolve.**

A full-stack web application for reporting, assigning, tracking and resolving hostel complaints.
Built as an Activity Based Learning (ABL) project for Software Engineering and Project Management (SPM)
at Siddaganga Institute of Technology.

> **Status:** Student, admin, and maintenance staff workflows, notifications, feedback, frontend/API integration, tests, and contributor documentation are implemented. Jenkins, Docker, and cloud deployment remain.

## Features

- Student registration and login, complaint submission with optional image upload, personal dashboard, history, and feedback after resolution
- Admin dashboard with live MongoDB analytics, complaint search/filter, staff assignment, priority changes, student/staff management, and feedback review
- Maintenance staff dashboard with assigned-task filters, status updates, and required resolution notes
- Role-protected APIs and pages, in-app notifications, and complaint status history
- CI/CD, containerization, and cloud deployment are planned for later phases

## Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite, JavaScript), React Router, Tailwind CSS v4, Axios, Lucide React, Recharts |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Multer, express-validator |
| Database | MongoDB (local / Docker / Atlas) |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |
| DevOps | Git/GitHub, Jenkins, Docker, Docker Compose |

## Folder structure

```
hostelcare/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Error handling, auth, RBAC
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # Seed script, helpers
│   │   ├── validators/      # express-validator rules
│   │   ├── app.js           # Express app (importable by tests)
│   │   └── server.js        # Entry point: connects DB, starts server
│   ├── tests/               # Jest + Supertest workflow tests
│   ├── uploads/             # Complaint images (git-ignored)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  layouts/  pages/{public,student,admin,staff}/
│   │   ├── context/  hooks/  services/  utils/  test/
│   │   ├── App.jsx  main.jsx  index.css
│   └── .env.example
├── .github/                 # Issue and pull request templates
├── docs/                    # Project documentation and screenshots
├── postman/                 # API collection
├── k8s/                     # Optional Kubernetes manifests (future phase)
└── README.md
```

## Running locally

Prerequisites: Node.js 18+ and a MongoDB instance (local, Docker, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
cp .env.example .env        # set MONGO_URI, JWT_SECRET (32+ random chars), ADMIN_EMAIL and ADMIN_PASSWORD
npm install
npm run seed                # create the first administrator from backend/.env
npm run dev                 # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS setup is needed locally. Public registration creates student accounts only. Administrators can create staff accounts through the admin API.

### Tests and production build

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

The Jest/Supertest suite covers authentication, role checks, complaint submission and ownership, admin assignment, staff status transitions, notifications, feedback, and invalid input. Vitest/Testing Library covers the main student and role-specific UI workflows.

### Postman API collection

Import [`postman/HostelCare.postman_collection.json`](./postman/HostelCare.postman_collection.json) into Postman. Set the student, administrator, and staff email/password collection variables to credentials from your local environment. Run the login requests to save their tokens automatically. The complaint submission request saves its MongoDB ID for later requests; set `staffId` and `notificationId` when testing those dependent requests. Do not commit credentials or tokens.

## GitHub collaboration

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the `main`/`develop` branch workflow, feature branch naming, commit conventions, and pull request checklist. GitHub issue and pull request templates are provided under `.github/`.

This checkout currently has no GitHub remote configured. After creating the project repository on GitHub, add its URL as `origin` and push only after confirming the destination with the repository owner:

```bash
git remote add origin https://github.com/<OWNER>/hostelcare.git
git push -u origin main
```

## Environment variables

Copy each `.env.example` to `.env` locally and fill in the values for your machine. `.env` files and secrets are excluded by `.gitignore`; never commit credentials or tokens.

| Variable | Service | Purpose |
|----------|---------|---------|
| `MONGO_URI` | Backend | Local, Docker, or Atlas MongoDB connection string |
| `JWT_SECRET` | Backend | Random secret of at least 32 characters |
| `JWT_EXPIRES_IN` | Backend | JWT lifetime (default: `7d`) |
| `PORT` | Backend | API port (default: `5000`) |
| `CLIENT_URL` | Backend | Comma-separated allowed browser origins |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Backend | Initial administrator created by `npm run seed` |
| `VITE_API_URL` | Frontend | Backend API base URL in production; leave empty for local Vite proxy |

## API documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a student account |
| POST | `/api/auth/login` | Log in as a student, admin, or staff member |
| GET | `/api/auth/me` | Get the authenticated user's profile |
| POST | `/api/complaints` | Submit a complaint with an optional image |
| GET | `/api/complaints` | List the authenticated user's complaints (paginated/filterable) |
| GET | `/api/complaints/dashboard` | Student complaint totals and recent reports |
| GET | `/api/complaints/:id` | View a complaint and status history |
| PATCH | `/api/complaints/:id/assign` | Assign or reassign a complaint to staff (admin only) |
| PATCH | `/api/complaints/:id/priority` | Change complaint priority (admin only) |
| PATCH | `/api/complaints/:id/status` | Staff start/resolution updates or student resolution confirmation |
| PATCH | `/api/complaints/:id/close` | Close a resolved complaint (admin only) |
| PATCH | `/api/complaints/:id/reopen` | Request reopening a resolved or closed complaint |
| GET | `/api/notifications` | List the signed-in user's notifications and unread count |
| PATCH | `/api/notifications/:id/read` | Mark one owned notification as read |
| PATCH | `/api/notifications/read-all` | Mark all of the signed-in user's notifications as read |
| POST | `/api/feedback` | Submit a rating and comment for a resolved complaint (student only) |
| GET | `/api/feedback/:complaintId` | Read feedback for a complaint (student owner or admin) |
| GET | `/api/feedback` | List all feedback (admin only) |
| GET | `/api/admin/dashboard` | Live administrative counts, trends, and staff performance |
| GET | `/api/admin/users?role=student` | Search and list student accounts (admin only) |
| GET | `/api/admin/users?role=staff` | Search and list staff accounts (admin only) |
| POST | `/api/admin/staff` | Create a maintenance staff account (admin only) |
| PATCH | `/api/admin/users/:id/role` | Change a user's role (admin only) |
| GET | `/api/admin/reports` | Complaint report summary (admin only) |
| GET | `/api/staff/dashboard` | Staff workload counts and recent assigned tasks |
| GET | `/api/staff/complaints` | Paginated, filtered list of the current staff member's assignments |

Staff status updates require assignment ownership and resolution notes. Students can rate and comment once a complaint is resolved or closed; administrators can review submitted feedback. Notification reads and updates are scoped to the signed-in user.

## Screenshots

No screenshots are committed yet. For a presentation, capture the student dashboard, admin overview, complaint detail, and staff task view from a local run and save sanitized images under `docs/screenshots/`. Use demo accounts/data and remove names, email addresses, and other personal information before sharing screenshots.

## Deployment

Cloud deployment is not configured yet (Phase 12). Before deployment:

1. Provision MongoDB Atlas and create a database user with only the permissions the app needs.
2. Set backend production variables, including `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
3. Set `VITE_API_URL` to the deployed backend API URL ending in `/api`, then run `npm run build` in `frontend`.
4. Configure the backend health probe to use `/api/health`.
5. Deploy the frontend and backend to the selected providers; do not commit provider credentials or `.env` files.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch, commit, and pull request conventions.
