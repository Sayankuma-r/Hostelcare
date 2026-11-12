# HostelCare – Hostel Complaint Management System

**Report. Track. Resolve.**

A full-stack web application for reporting, assigning, tracking and resolving hostel complaints.
Built as an Activity Based Learning (ABL) project for Software Engineering and Project Management (SPM)
at Siddaganga Institute of Technology.

> **Status:** Phase 1 complete (project setup). Features are added phase by phase; this README is updated as the project evolves.

## Planned features

- Three roles: Student, Admin/Warden, Maintenance Staff (strict backend RBAC)
- Complaint lifecycle: Submitted → Assigned → In Progress → Resolved → Closed (with reopen + status history)
- Image uploads, in-app notifications, feedback and ratings
- Role-specific dashboards with live analytics from MongoDB
- CI/CD with Jenkins, Docker Compose, deployment on Vercel + Render + MongoDB Atlas

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
│   │   ├── controllers/     # Request handlers (later phases)
│   │   ├── middleware/      # Error handling, auth, RBAC
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # Seed script, helpers
│   │   ├── validators/      # express-validator rules
│   │   ├── app.js           # Express app (importable by tests)
│   │   └── server.js        # Entry point: connects DB, starts server
│   ├── tests/               # Jest + Supertest
│   ├── uploads/             # Complaint images (git-ignored)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  layouts/  pages/{public,student,admin,staff}/
│   │   ├── context/  hooks/  services/  utils/  test/
│   │   ├── App.jsx  main.jsx  index.css
│   └── .env.example
├── docs/  postman/  k8s/
└── README.md
```

## Running locally

Prerequisites: Node.js 18+ and a MongoDB instance (local, Docker, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS setup is needed locally.

### Tests

```bash
cd backend  && npm test
cd frontend && npm test
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. Never commit real `.env` files.

## API documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

More endpoints are documented as they are implemented.

## Screenshots

_Added after the UI phases._

## Deployment

_Added in Phase 12 (Vercel + Render + MongoDB Atlas)._
