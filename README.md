# TaskFlow 🚀

A **production-ready, multi-tenant task management system** with RBAC, JWT authentication, OAuth2 integration, real-time updates via WebSockets, and comprehensive audit logging. Built with modern tech stack and fully containerized with Docker.

<div align="center">

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node](https://img.shields.io/badge/Node-20+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [OAuth Setup](#oauth-setup)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### Core Functionality
- ✅ **Multi-tenancy** — Strict organization isolation; all queries scoped to `org_id`
- ✅ **Role-Based Access Control (RBAC)** — Admin (full control) & Member (own tasks only) roles
- ✅ **JWT Authentication** — Short-lived access tokens + secure refresh tokens in httpOnly cookies
- ✅ **OAuth2 Integration** — Google & GitHub single sign-on
- ✅ **Real-time Updates** — Socket.io broadcasts live task changes to all org members
- ✅ **Audit Logging** — Immutable records of every action (create, update, delete, assign, role changes)

### User Interface
- ✅ **Kanban + List Views** — Toggle between board and list layouts
- ✅ **Advanced Filtering** — Filter by status, priority, assignee, due date, tags
- ✅ **Search & Pagination** — Full-text search with limit controls
- ✅ **CSV Export** — One-click bulk export of all tasks
- ✅ **Dark/Light Mode** — System-aware theme with persistent preference
- ✅ **Responsive Design** — Works perfectly on desktop, tablet, mobile

### Team Management
- ✅ **Member Invitations** — Invite by email with expiring tokens
- ✅ **Role Management** — Promote/demote members to admin
- ✅ **Member Removal** — Soft delete with audit trail
- ✅ **Email Notifications** — Invite emails + task assignment alerts (via Nodemailer)

### Developer Experience
- ✅ **TypeScript Strict Mode** — Full type safety across backend & frontend
- ✅ **Zod Validation** — Schema validation for all API requests
- ✅ **Docker Support** — Single command deployment with docker-compose
- ✅ **Hot Reload** — Development servers with auto-restart
- ✅ **Comprehensive Logging** — Winston logger with levels (debug, info, warn, error)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20+, Express, TypeScript, Prisma ORM, PostgreSQL 15+, Redis 7+, Socket.io |
| **Frontend** | React 18, Vite, Tailwind CSS, TanStack Query (React Query), Zustand, React Hook Form |
| **Authentication** | JWT (access + refresh), Passport.js, Google OAuth 2.0, GitHub OAuth 2.0 |
| **Database** | PostgreSQL (SQL), Prisma (ORM & migrations), Redis (session caching) |
| **Infrastructure** | Docker, docker-compose, Nginx (reverse proxy), Winston (logging) |
| **Validation** | Zod (schema validation), TypeScript (compile-time types) |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended — Fastest)

**Prerequisites:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes docker-compose)

**Steps:**
```bash
# Clone or extract the project
cd taskflow

# Start everything
docker-compose up -d

# Done! Access the app
# Frontend: http://localhost
# API: http://localhost:4000
```

**Test Accounts:**
| Email | Password | Role | Org |
|---|---|---|---|
| alice@acme.com | password123 | Admin | Acme Corp |
| bob@acme.com | password123 | Member | Acme Corp |
| carol@globex.com | password123 | Admin | Globex Inc |

---

### Option 2: Local Development

**Prerequisites:**
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- [Redis 7+](https://redis.io/download)

**Steps:**

```bash
# 1. Install all dependencies
npm install --workspaces

# 2. Setup backend environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# 3. Run database migrations & seed
npx prisma migrate dev --name init
npm run seed

# 4. Start backend dev server
npm run dev

# 5. In a new terminal, start frontend dev server
cd ../frontend
npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- API Health Check: http://localhost:4000/api/health

---

## 📝 Setup Instructions

### Using Docker Compose (Recommended)

The `docker-compose.yml` file defines 4 services:

```yaml
postgres    → PostgreSQL database (port 5432)
redis       → Redis cache (port 6379)
api         → Backend API (port 4000)
frontend    → React app via Nginx (port 80)
```

**Start all services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f api        # Backend logs
docker-compose logs -f frontend   # Frontend logs
```

**Stop all services:**
```bash
docker-compose down
```

**Rebuild images after code changes:**
```bash
docker-compose build && docker-compose up -d
```

---

### Backend Setup (Detailed)

**1. Install dependencies:**
```bash
cd backend
npm install
```

**2. Create `.env` file:**
```bash
cp .env.example .env
```

**3. Configure environment variables** (see [Environment Variables](#environment-variables) section)

**4. Setup database:**
```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with test data
npm run seed
```

**5. Start development server:**
```bash
npm run dev
```

The backend will be available at `http://localhost:4000`

---

### Frontend Setup (Detailed)

**1. Install dependencies:**
```bash
cd frontend
npm install
```

**2. Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

**3. Build for production:**
```bash
npm run build
# Output: dist/
```

---

## 🔐 Environment Variables

### Backend (`.env`)

**Required Variables:**
```env
# Server
NODE_ENV=development              # development | production | test
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow

# Redis (for session caching)
REDIS_URL=redis://localhost:6379

# JWT Secrets (MUST be minimum 32 characters)
JWT_SECRET=your-super-secret-key-minimum-32-chars-long
JWT_REFRESH_SECRET=another-super-secret-key-minimum-32-chars-long

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Token expiry
JWT_EXPIRES_IN=15m               # Access token lifetime
JWT_REFRESH_EXPIRES_IN=7d        # Refresh token lifetime
```

**Optional OAuth Variables:**
```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=Ov23lix...
GITHUB_CLIENT_SECRET=xxxxxxx
```

**Optional Email Variables:**
```env
# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.ethereal.email    # Or your email provider
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@taskflow.com
```

**Generating JWT Secrets:**
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔑 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Choose **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback` (local dev)
   - `https://yourdomain.com/api/auth/google/callback` (production)
8. Copy **Client ID** and **Client Secret** to `.env`

### GitHub OAuth

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the form:
   - **Application Name:** TaskFlow
   - **Homepage URL:** `http://localhost:5173` (or your domain)
   - **Authorization Callback URL:** `http://localhost:4000/api/auth/github/callback`
4. Copy **Client ID** and **Client Secret** to `.env`

### Testing OAuth

After adding credentials and restarting containers:

```bash
# Google OAuth endpoint
curl -I http://localhost:4000/api/auth/google
# Should return 302 (redirect to Google)

# GitHub OAuth endpoint
curl -I http://localhost:4000/api/auth/github
# Should return 302 (redirect to GitHub)
```

---

---

## 📚 API Reference

### Authentication Endpoints

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password, orgName}` | Register + create organization |
| POST | `/api/auth/login` | `{email, password}` | Login (sets refresh token cookie) |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | — | Logout (clears refresh token) |
| GET | `/api/auth/me` | — | Get current user + all organizations |
| POST | `/api/auth/switch-org` | `{orgId}` | Switch active organization |
| GET | `/api/auth/google` | — | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | `?code=xxx` | Google OAuth callback |
| GET | `/api/auth/github` | — | Redirect to GitHub OAuth |
| GET | `/api/auth/github/callback` | `?code=xxx` | GitHub OAuth callback |

### Task Endpoints (All require authentication)

| Method | Path | Description | Admin Only |
|---|---|---|---|
| GET | `/api/tasks` | List tasks with filtering, search, pagination | — |
| POST | `/api/tasks` | Create new task | — |
| GET | `/api/tasks/:id` | Get task details + audit history | — |
| PATCH | `/api/tasks/:id` | Update task (title, description, status, etc.) | — |
| DELETE | `/api/tasks/:id` | Soft delete task | — |
| GET | `/api/tasks/export` | Download all tasks as CSV | — |

**Query Parameters for GET `/api/tasks`:**
- `status` - Filter by status (TODO, IN_PROGRESS, DONE)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assignedToId` - Filter by assignee
- `search` - Full-text search in title + description
- `tags` - Filter by tags (comma-separated)
- `dueBefore` - Filter tasks due before date (ISO 8601)
- `dueAfter` - Filter tasks due after date (ISO 8601)
- `page` - Pagination (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Organization Endpoints (All require authentication)

| Method | Path | Description | Admin Only |
|---|---|---|---|
| GET | `/api/org` | Get organization details + members list | — |
| PATCH | `/api/org` | Update organization name/description | ✓ |
| GET | `/api/org/stats` | Get dashboard statistics (task counts, member count, etc.) | — |
| GET | `/api/org/audit-logs` | Get immutable audit log of all actions | — |
| POST | `/api/org/invite` | Send email invitation to join organization | ✓ |
| GET | `/api/org/invite/:token` | Get invitation details (before accepting) | — |
| POST | `/api/org/invite/:token/accept` | Accept organization invitation | — |
| DELETE | `/api/org/members/:userId` | Remove member from organization | ✓ |
| PATCH | `/api/org/members/:userId/role` | Change member role (ADMIN/MEMBER) | ✓ |

### Example Requests

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'
```

**Create Task:**
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement dark mode",
    "description": "Add theme toggle to UI",
    "priority": "HIGH",
    "status": "TODO",
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

**List Tasks with Filters:**
```bash
curl "http://localhost:4000/api/tasks?status=IN_PROGRESS&priority=HIGH&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏗 Architecture

### Multi-Tenancy Design

Every query is **automatically scoped to `organization_id`**:

```typescript
// Backend enforces org isolation
const tasks = await prisma.task.findMany({
  where: {
    organization_id: req.user.orgId,  // ← Always scoped
  }
});
```

**Isolation Boundaries:**
- JWT token includes `orgId` for server-side validation
- All API queries filtered by organization
- Socket.io rooms scoped by `org:{orgId}`
- Database foreign keys prevent accidental cross-org leaks

### Authentication Flow

```
User Login
    ↓
Generate JWT (access + refresh)
    ↓
Return access token + refresh token (httpOnly cookie)
    ↓
Each request includes access token in Authorization header
    ↓
Token verified + user attached to req.user
    ↓
Request proceeds scoped to req.user.orgId
```

### Real-time Architecture

```
User A creates task
    ↓
Express handler processes request
    ↓
Prisma saves to database
    ↓
Socket.io emits to org room
    ↓
User B receives update via WebSocket
    ↓
Frontend refetches tasks (TanStack Query)
    ↓
UI updates in real-time
```

### Database Schema

```sql
users
  ├── id (PK)
  ├── email
  ├── password_hash
  └── created_at

organizations
  ├── id (PK)
  ├── name
  ├── description
  └── created_at

organization_members
  ├── organization_id (FK)
  ├── user_id (FK)
  ├── role (ADMIN | MEMBER)
  └── created_at

tasks
  ├── id (PK)
  ├── organization_id (FK) ← Isolation boundary
  ├── title
  ├── description
  ├── status (TODO | IN_PROGRESS | DONE)
  ├── priority (LOW | MEDIUM | HIGH | URGENT)
  ├── assigned_to_id (FK → users)
  ├── due_date
  ├── tags (array)
  ├── deleted_at (soft delete)
  └── created_at, updated_at

audit_logs
  ├── id (PK)
  ├── organization_id (FK)
  ├── action (CREATE | UPDATE | DELETE | ASSIGN | ROLE_CHANGE)
  ├── entity_type (TASK | ORG | MEMBER)
  ├── entity_id
  ├── user_id (who did it)
  ├── changes (JSON)
  └── created_at (immutable)

organization_invites
  ├── id (PK)
  ├── organization_id (FK)
  ├── email
  ├── token (unique, secure)
  ├── role (ADMIN | MEMBER)
  ├── expires_at (7 days)
  └── created_at
```

---

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (Prisma ORM)
│   │   └── seed.ts                # Seed data (test accounts)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Environment validation (Zod)
│   │   │   ├── prisma.ts          # Prisma client singleton
│   │   │   ├── redis.ts           # Redis client
│   │   │   └── passport.ts        # OAuth strategies
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Auth endpoints
│   │   │   ├── task.controller.ts # Task endpoints
│   │   │   └── org.controller.ts  # Organization endpoints
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts # JWT verification + org membership
│   │   │   ├── error.middleware.ts# Global error handler
│   │   │   └── audit.middleware.ts# Audit logging
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   └── org.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Auth logic (JWT, OAuth)
│   │   │   ├── task.service.ts    # Task business logic
│   │   │   ├── org.service.ts     # Org & member logic
│   │   │   └── email.service.ts   # Email notifications
│   │   ├── utils/
│   │   │   ├── jwt.ts             # Token generation/verification
│   │   │   ├── logger.ts          # Winston logger
│   │   │   ├── response.ts        # Standardized responses
│   │   │   ├── errors.ts          # Custom error classes
│   │   │   └── socket.ts          # Socket.io utilities
│   │   ├── types/
│   │   │   ├── enums.ts           # TaskStatus, TaskPriority, Role
│   │   │   └── express.d.ts       # Express augmentation (req.user)
│   │   └── index.ts               # Express + Socket.io setup
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg            # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── AppLayout.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskKanban.tsx
│   │   │   │   ├── TaskDrawer.tsx
│   │   │   │   └── TaskForm.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Input.tsx
│   │   │       └── ToastProvider.tsx
│   │   ├── hooks/
│   │   │   ├── useTasks.ts        # Task queries + mutations
│   │   │   ├── useSocket.ts       # Socket.io connection
│   │   │   └── useToast.ts        # Toast notifications
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios instance + API calls
│   │   │   └── utils.ts           # Helper functions
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tasks.tsx
│   │   │   └── Settings.tsx
│   │   ├── store/
│   │   │   ├── auth.store.ts      # Auth state (Zustand)
│   │   │   └── theme.store.ts     # Theme state
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml             # Multi-container orchestration
├── .env.example                   # Environment template
├── .env                           # Your local secrets (git-ignored)
├── .gitignore
└── README.md                      # This file
```

---

## 🐛 Troubleshooting

### Docker Issues

**Problem: "Permission denied" when running docker-compose**

**Solution:** Ensure Docker Desktop is running and you have proper permissions.

```bash
# Verify Docker is accessible
docker ps

# On Linux, you may need to add user to docker group
sudo usermod -aG docker $USER
```

---

**Problem: Database connection refused**

**Solution:** Wait for PostgreSQL to be healthy before API starts.

```bash
# Check container status
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart services
docker-compose down && docker-compose up -d
```

---

**Problem: "Port 80 already in use"**

**Solution:** Another service is using port 80.

```bash
# Find what's using port 80
netstat -ano | findstr :80  # Windows
lsof -i :80                 # Mac/Linux

# Change port in docker-compose.yml
# Change "80:80" to "8080:80" for frontend
```

---

### OAuth Issues

**Problem: "Internal Server Error" when clicking Google/GitHub login**

**Solution:** OAuth credentials not loaded in environment.

```bash
# 1. Verify .env has credentials
cat .env | grep GOOGLE_CLIENT_ID

# 2. Restart API container to pick up .env
docker-compose down
docker-compose up -d

# 3. Check logs for errors
docker-compose logs api | grep -i oauth
```

---

**Problem: OAuth redirect shows "Invalid redirect URI"**

**Solution:** Callback URL mismatch in OAuth app settings.

**For Google:**
- Go to Google Cloud Console → Your App → Authorized redirect URIs
- Ensure `http://localhost:4000/api/auth/google/callback` is listed

**For GitHub:**
- Go to GitHub Settings → Developer Settings → Your OAuth App
- Ensure `Authorization callback URL` is `http://localhost:4000/api/auth/github/callback`

---

### Backend Issues

**Problem: "Invalid JWT Secret"**

**Solution:** JWT_SECRET must be at least 32 characters.

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env with the output
JWT_SECRET=abc123...
```

---

**Problem: Database migrations failed**

**Solution:** Manually run migrations inside the container.

```bash
# Connect to API container
docker-compose exec api sh

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run seed
```

---

### Frontend Issues

**Problem: White blank page, nothing loads**

**Solution:** Check browser console for errors.

```bash
# 1. Open browser DevTools (F12)
# 2. Check Console tab for errors
# 3. Check Network tab for failed requests

# 4. If API requests fail, check CORS headers
docker-compose logs api | grep -i cors

# 5. Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

**Problem: "Cannot find module" errors**

**Solution:** Dependencies not installed.

```bash
# Inside frontend container
docker-compose exec frontend sh
npm install

# Or rebuild
docker-compose build --no-cache frontend
```

---

### Performance Issues

**Problem: App is very slow, database queries taking forever**

**Solution:** Check database indexes and Redis cache.

```bash
# Check if Redis is working
docker-compose exec redis redis-cli ping
# Should return: PONG

# View API logs for slow queries
docker-compose logs api --tail 100

# Check database size
docker-compose exec postgres psql -U taskflow -d taskflow -c "SELECT * FROM pg_tables WHERE tablename NOT LIKE 'pg_%';"
```

---

## 🚢 Deployment

### Production Deployment

**Prerequisites:**
- PostgreSQL 15+ (managed service recommended)
- Redis 7+ (managed service recommended)
- Docker registry (Docker Hub, ECR, etc.)
- Server to deploy on (AWS, DigitalOcean, etc.)

**Steps:**

1. **Update environment variables:**
   ```env
   NODE_ENV=production
   CLIENT_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```

2. **Build and push Docker images:**
   ```bash
   docker-compose build
   docker tag taskflow-api your-registry/taskflow-api:1.0.0
   docker tag taskflow-frontend your-registry/taskflow-frontend:1.0.0
   docker push your-registry/taskflow-api:1.0.0
   docker push your-registry/taskflow-frontend:1.0.0
   ```

3. **Update docker-compose for production:**
   - Remove `build` sections
   - Use image tags from registry
   - Set database URLs to managed services

4. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 📖 Additional Resources

- **Prisma Documentation:** https://www.prisma.io/docs/
- **Express Guide:** https://expressjs.com/
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Socket.io Guide:** https://socket.io/docs/
- **JWT.io:** https://jwt.io/

---

## 📄 License

MIT © 2024

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing troubleshooting guides
- Review API documentation

---

**Happy task managing! 🎉**
