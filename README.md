# TaskFlow

Multi-tenant task management system with RBAC, JWT auth, OAuth, real-time updates, and full Docker support.

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.io |
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form |
| Auth | JWT (access + refresh tokens), Google OAuth, GitHub OAuth |
| Infra | Docker, docker-compose, Nginx |

## Features

- **Multi-tenancy** — strict org isolation; every query is scoped to `org_id`
- **RBAC** — admins manage all tasks; members manage only their own
- **JWT auth** — short-lived access tokens + rotating refresh tokens in httpOnly cookies
- **OAuth** — Google and GitHub sign-in
- **Real-time** — Socket.io broadcasts task changes to all org members live
- **Audit log** — immutable record of every action (create, update, delete, assign, role changes)
- **Kanban + List views** — switch between board and list with filters, search, pagination
- **CSV export** — one-click export of all tasks
- **Member management** — invite by email, promote/demote, remove
- **Dark/light mode** — system-aware, persisted
- **Email notifications** — invite emails + task assignment alerts via Nodemailer

---

## Quick Start (Windows — Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

```bat
REM 1. Clone / extract the project
REM 2. Run the Docker launcher
docker-run.bat
```

App will be at **http://localhost**

---

## Quick Start (Windows — Local Dev)

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- PostgreSQL 15+ running locally (or via Docker)
- Redis running locally (or via Docker)

### Steps

```bat
REM Start just the databases via Docker (easiest)
docker-compose up postgres redis -d

REM Install all dependencies
setup.bat

REM Edit backend\.env with your DATABASE_URL (already set for Docker above)

REM Run DB migrations + seed
setup-db.bat

REM Start both dev servers (opens two windows)
dev.bat
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:4000**

---

## Environment Variables

### `backend/.env`

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://taskflow:taskflow@localhost:5432/taskflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-32-char-minimum-secret
JWT_REFRESH_SECRET=another-32-char-minimum-secret
CLIENT_URL=http://localhost:5173

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# SMTP (optional — use https://ethereal.email for testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## OAuth Setup (Optional)

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
4. Copy Client ID and Secret to `.env`

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New
2. Homepage URL: `http://localhost:5173`
3. Callback URL: `http://localhost:4000/api/auth/github/callback`
4. Copy Client ID and Secret to `.env`

---

## API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register + create org |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user + orgs |
| POST | `/api/auth/switch-org` | Switch active org |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Tasks (all require auth)
| Method | Path | Description | Admin only |
|---|---|---|---|
| GET | `/api/tasks` | List tasks (filterable) | |
| POST | `/api/tasks` | Create task | |
| GET | `/api/tasks/:id` | Get task + audit log | |
| PATCH | `/api/tasks/:id` | Update task | |
| DELETE | `/api/tasks/:id` | Soft delete task | |
| GET | `/api/tasks/export` | Download CSV | |

### Organization (all require auth)
| Method | Path | Description | Admin only |
|---|---|---|---|
| GET | `/api/org` | Org details + members | |
| PATCH | `/api/org` | Update org | ✓ |
| GET | `/api/org/stats` | Dashboard stats | |
| GET | `/api/org/audit-logs` | Audit history | |
| POST | `/api/org/invite` | Send invite | ✓ |
| POST | `/api/org/invite/:token/accept` | Accept invite | |
| DELETE | `/api/org/members/:userId` | Remove member | ✓ |
| PATCH | `/api/org/members/:userId/role` | Change role | ✓ |

---

## Database Schema

```
organizations  ──< organization_members >── users
                                               │
organizations  ──< tasks ──────────────────────┤
                    │                          │
               audit_logs ────────────────────>┘
```

All tables have `organization_id` as a hard isolation boundary.

---

## Seed Accounts

| Email | Password | Role | Org |
|---|---|---|---|
| alice@acme.com | password123 | Admin | Acme Corp |
| bob@acme.com | password123 | Member | Acme Corp |
| carol@globex.com | password123 | Admin | Globex Inc |

Alice and Carol's data is completely isolated from each other.

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/         # env, prisma, redis, passport
│       ├── controllers/    # auth, task, org
│       ├── middleware/     # auth, error, audit
│       ├── routes/         # auth, task, org
│       ├── services/       # auth, task, org, email
│       ├── utils/          # jwt, logger, response
│       └── index.ts        # Express + Socket.io entry
├── frontend/
│   └── src/
│       ├── components/     # layout, tasks, auth, ui
│       ├── hooks/          # useTasks, useSocket, useToast
│       ├── lib/            # api client, utils
│       ├── pages/          # Login, Register, Dashboard, Tasks, Settings
│       └── store/          # auth, theme (Zustand)
├── docker-compose.yml
├── setup.bat
├── setup-db.bat
├── dev.bat
└── docker-run.bat
```
