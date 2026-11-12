# HostelCare – Hostel Complaint Management System

**Report. Track. Resolve.**

HostelCare is a full-stack web application designed to simplify hostel complaint management. It allows students to report complaints, administrators to manage and assign them, and maintenance staff to track and resolve assigned issues.

Developed as an Activity Based Learning (ABL) project for Software Engineering and Project Management (SPM) at **Siddaganga Institute of Technology (SIT), Tumakuru**.

**Project Repository:** [GitHub – HostelCare](https://github.com/Sayankuma-r/Hostelcare)

---

## 1. Features

### Student Module
- Student registration and secure login.
- Submit hostel complaints with optional image uploads.
- Personal dashboard with complaint statistics.
- Track complaint status and history.
- View notifications and updates.
- Submit feedback and ratings after complaint resolution.

### Admin Module
- Administrative dashboard with live MongoDB analytics.
- Search, filter, and manage complaints.
- Assign and reassign complaints to maintenance staff.
- Update complaint priorities.
- Manage student and staff accounts.
- Review student feedback.
- Monitor complaint statistics and staff performance.

### Maintenance Staff Module
- Dedicated staff dashboard.
- View assigned complaints.
- Filter tasks by status.
- Update complaint status.
- Add mandatory resolution notes.
- Track assigned workload.

### Additional Features
- Role-based authentication and authorization.
- JWT-based secure authentication.
- Password hashing using bcryptjs.
- In-app notifications.
- Complaint status history.
- Image upload functionality.
- Input validation and centralized error handling.
- Automated backend and frontend tests.
- Postman API collection.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Routing | React Router |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, bcryptjs |
| File Upload | Multer |
| Validation | express-validator |
| Backend Testing | Jest, Supertest |
| Frontend Testing | Vitest, Testing Library |
| API Testing | Postman |
| Version Control | Git, GitHub |
| DevOps | Jenkins, Docker, Docker Compose (planned/in progress) |

---

## 3. Project Architecture

```text
HostelCare/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── uploads/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── student/
│   │   │   ├── admin/
│   │   │   ├── staff/
│   │   │   └── shared/
│   │   ├── services/
│   │   ├── test/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── .github/
│   └── Issue and Pull Request Templates
│
├── postman/
│   └── HostelCare.postman_collection.json
│
├── CONTRIBUTING.md
├── README.md
└── .gitignore
```

---

## 4. Prerequisites

Install the following before running the project:

- Node.js 18 or later.
- npm.
- MongoDB Community Server or MongoDB Atlas.
- Git.
- Visual Studio Code (recommended).
- Postman (optional, for API testing).

---

## 5. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sayankuma-r/Hostelcare.git
cd Hostelcare
```

### Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can also use:

```powershell
Copy-Item .env.example .env
```

Configure the environment variables in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hostelcare
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

Use your own secure credentials. Never commit the actual `.env` file.

### Step 3: Start MongoDB

Make sure your local MongoDB server is running, or configure your MongoDB Atlas connection string in `MONGO_URI`.

### Step 4: Seed the Admin Account

```bash
npm run seed
```

This creates the initial administrator using the configured environment variables, provided the seed script is available in your backend package configuration.

### Step 5: Start the Backend

```bash
npm run dev
```

Backend server:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

### Step 6: Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

`http://localhost:5173`

---

## 6. API Documentation

Base URL:

`http://localhost:5000/api`

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a student |
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get authenticated profile |

### Complaint APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/complaints` | Submit a complaint |
| GET | `/complaints` | List complaints |
| GET | `/complaints/dashboard` | Student dashboard statistics |
| GET | `/complaints/:id` | Get complaint details |
| PATCH | `/complaints/:id/assign` | Assign complaint |
| PATCH | `/complaints/:id/priority` | Update priority |
| PATCH | `/complaints/:id/status` | Update complaint status |
| PATCH | `/complaints/:id/close` | Close complaint |
| PATCH | `/complaints/:id/reopen` | Request reopening |

### Admin APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Admin dashboard |
| GET | `/admin/users?role=student` | List students |
| GET | `/admin/users?role=staff` | List staff |
| POST | `/admin/staff` | Create staff account |
| PATCH | `/admin/users/:id/role` | Update user role |
| GET | `/admin/reports` | Generate complaint reports |

### Staff APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/staff/dashboard` | Staff dashboard |
| GET | `/staff/complaints` | View assigned complaints |

### Notification APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Get notifications |
| PATCH | `/notifications/:id/read` | Mark notification as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### Feedback APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/feedback` | Submit feedback |
| GET | `/feedback/:complaintId` | Get complaint feedback |
| GET | `/feedback` | Admin feedback listing |

All protected endpoints require appropriate authentication and role permissions.

---

## 7. Postman API Testing

HostelCare includes a Postman collection for testing backend APIs.

Collection location:

`postman/HostelCare.postman_collection.json`

### Instructions

1. Open Postman.
2. Import the collection JSON file.
3. Configure the required environment variables.
4. Set student, admin, and staff credentials.
5. Execute login requests to obtain authentication tokens.
6. Test complaint creation, assignment, status updates, notifications, and feedback.

Do not commit real credentials or authentication tokens.

---

## 8. Testing

HostelCare includes automated backend and frontend tests.

### Backend Tests

```bash
npm --prefix backend test
```

Backend tests cover:
- Authentication.
- Authorization and role-based access.
- Complaint submission and ownership.
- Admin complaint assignment.
- Staff workflows.
- Notifications.
- Feedback.
- Request validation.

### Frontend Tests

```bash
npm --prefix frontend test
```

Frontend tests cover:
- Application rendering.
- Student workflows.
- Admin complaint management.
- Staff complaint details.
- Feedback forms.
- Notifications.

### Production Build

```bash
npm --prefix frontend run build
```

---

## 9. Security

Security measures implemented in the application include:

- JWT-based authentication.
- Password hashing with bcryptjs.
- Role-based access control.
- Protected API routes.
- Request validation.
- Complaint ownership checks.
- Restricted staff assignment workflows.
- Environment-based configuration.
- Exclusion of secrets and environment files through `.gitignore`.

Never publish database credentials, JWT secrets, private tokens, or real user information.

---

## 10. GitHub Collaboration

Repository:

https://github.com/Sayankuma-r/Hostelcare

### Basic Git Workflow

```bash
# Check current status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Describe your changes"

# Push changes
git push origin main
```

For new features, use separate feature branches and create Pull Requests according to the guidelines in `CONTRIBUTING.md`.

---

## 11. Future Enhancements

The following improvements are planned for future development:

- Jenkins-based CI/CD pipeline.
- Docker containerization.
- Docker Compose configuration.
- Cloud deployment.
- Kubernetes deployment (optional).
- Email and real-time notifications.
- Advanced analytics and reporting.
- Improved mobile responsiveness.

---

## 12. Project Status

| Component | Status |
|---|---|
| Student Authentication | Implemented |
| Admin Authentication | Implemented |
| Staff Authentication | Implemented |
| Complaint Management | Implemented |
| Staff Assignment | Implemented |
| Notifications | Implemented |
| Feedback System | Implemented |
| Frontend Integration | Implemented |
| Automated Tests | Implemented |
| Postman Collection | Available |
| Jenkins CI/CD | Planned / In progress |
| Docker | Planned / In progress |
| Cloud Deployment | Planned |

---

## 13. Contributors

Developed as an Activity Based Learning (ABL) project for Software Engineering and Project Management at Siddaganga Institute of Technology.

Contributions, suggestions, bug reports, and feature requests are welcome.

Please read `CONTRIBUTING.md` before submitting contributions.

---

## License

This project is developed for academic and educational purposes.

A formal open-source license can be added when the project maintainers decide on the licensing terms.

---

**HostelCare – Report. Track. Resolve.**