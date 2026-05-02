# Team Hub — Collaborative Team Management Platform

A full-stack collaborative workspace application where teams can manage shared goals, post announcements, and track action items in real time.

---

## Live Demo
- Web App: https://kind-caring-production-4205.up.railway.app
- API: https://teamhub-production-3267.up.railway.app
- API Docs: https://teamhub-production-3267.up.railway.app/api/docs
- Demo: demo@teamhub.com / demo1234

## 🛠 Tech Stack

| Area | Technology |
|------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js 15, App Router, JavaScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT — access + refresh tokens |
| Real-time | Socket.io |
| File Storage | Cloudinary |
| Deployment | Railway |

---

## ✅ Advanced Features Implemented

### 1. Optimistic UI
Actions (Kanban drag-and-drop, goal status updates) reflect instantly in the UI before the server confirms. On error, the state rolls back gracefully with a toast notification.

### 2. Advanced RBAC
A permission matrix controls what each role can do:

| Action | Admin | Member |
|--------|-------|--------|
| Create goals | ✅ | ✅ |
| Delete goals | ✅ | ❌ |
| Post announcements | ✅ | ❌ |
| Pin announcements | ✅ | ❌ |
| Invite members | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Update member roles | ✅ | ❌ |
| View workspace | ✅ | ✅ |
| React & comment | ✅ | ✅ |

---

## 📦 Features

### Authentication
- Email/password register & login
- JWT access token (15min) + refresh token (7 days)
- Protected routes — dashboard accessible only after login
- User profile with avatar upload via Cloudinary
- Logout and token refresh

### Workspaces
- Create and switch between multiple workspaces
- Invite members by email with role assignment (Admin/Member)
- Each workspace has a name, description, and accent colour

### Goals & Milestones
- Create goals with title, owner, due date, and status
- Nest milestones under goals with a progress percentage slider
- Filter goals by status (all, active, completed, paused)

### Announcements
- Admins publish announcements workspace-wide
- Team members can react with emoji (👍 ❤️ 🎉 🔥 👏)
- Comment on announcements
- Pin important announcements to top of feed

### Action Items
- Create action items with assignee, priority, due date, and status
- Link action items to a parent goal
- Kanban board view with drag-and-drop (optimistic UI)
- List view toggle

### Real-time & Activity
- Socket.io pushes new goals, actions, and announcements live
- Online member presence indicator in sidebar
- Audit log of all workspace changes

### Analytics
- Dashboard stats: total goals, active goals, completed this week, overdue count
- Goal completion chart (Recharts) — last 6 months
- Export workspace data as CSV

---

## 🏗 Project Structure

```
team-hub/
├── apps/
│   ├── api/                    # Node.js + Express backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── socket/
│   │       ├── lib/
│   │       └── index.js
│   └── web/                    # Next.js 15 frontend
│       ├── app/
│       │   ├── login/
│       │   ├── register/
│       │   └── dashboard/
│       ├── components/
│       ├── lib/
│       └── store/
└── packages/
    └── shared/                 # Shared constants and utilities
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v20+
- npm v9+
- PostgreSQL database (or free Neon account at https://neon.tech)
- Cloudinary account (free at https://cloudinary.com)

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/team-hub.git
cd team-hub
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

Create `apps/api/.env`:

```env
DATABASE_URL="p"
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLIENT_URL="http://localhost:3000"
PORT=4000
NODE_ENV=development
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### Step 4 — Set up database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5 — Seed demo data

```bash
node prisma/seed.js
```

This creates:
- Demo account: `demo@teamhub.com` / `demo1234`
- Sample workspace with goals, action items, and announcement

### Step 6 — Run the apps

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd apps/api
node src/index.js
```

**Terminal 2 — Frontend:**
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 and login with the demo account.

---

## 🌐 Deployment (Railway)

Both services are deployed on Railway as separate services inside one project.

### Backend service
- Root directory: `apps/api`
- Start command: `npx prisma generate && npx prisma migrate deploy && node src/index.js`

### Frontend service
- Root directory: `apps/web`
- Build command: `npm run build`
- Start command: `npm start`

### Environment variables

**Backend:**
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://your-frontend.up.railway.app
PORT=4000
NODE_ENV=production
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-api.up.railway.app
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh tokens |
| GET | /api/auth/me | Get current user |

### Workspaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces | Create workspace |
| GET | /api/workspaces | Get my workspaces |
| GET | /api/workspaces/:id | Get workspace |
| PUT | /api/workspaces/:id | Update workspace |
| DELETE | /api/workspaces/:id | Delete workspace |
| POST | /api/workspaces/:id/invite | Invite member |
| GET | /api/workspaces/:id/members | Get members |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces/:id/goals | Create goal |
| GET | /api/workspaces/:id/goals | Get goals |
| PUT | /api/workspaces/:id/goals/:goalId | Update goal |
| DELETE | /api/workspaces/:id/goals/:goalId | Delete goal |
| POST | /api/workspaces/:id/goals/:goalId/milestones | Add milestone |
| PUT | /api/workspaces/:id/goals/:goalId/milestones/:mId | Update milestone |

### Action Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces/:id/actions | Create action |
| GET | /api/workspaces/:id/actions | Get actions |
| PUT | /api/workspaces/:id/actions/:actionId | Update action |
| DELETE | /api/workspaces/:id/actions/:actionId | Delete action |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces/:id/announcements | Post announcement |
| GET | /api/workspaces/:id/announcements | Get announcements |
| PATCH | /api/workspaces/:id/announcements/:aId/pin | Pin/unpin |
| POST | /api/workspaces/:id/announcements/:aId/reactions | Add reaction |
| POST | /api/workspaces/:id/announcements/:aId/comments | Add comment |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/workspaces/:id/analytics/stats | Dashboard stats |
| GET | /api/workspaces/:id/analytics/export | Export CSV |

---

## ⚠️ Known Limitations

- Cross-domain cookies require `sameSite=none` in production — auth token is stored in localStorage as fallback
- Socket.io presence tracking resets on page refresh
- Cloudinary free tier has 25GB bandwidth limit per month
- Railway free tier sleeps after inactivity — first load may take 10-15 seconds

---

## 👨‍💻 Author

Built as a technical assessment for FredoCloud.
Saimon Islam
fahimislam204@gmail.com
