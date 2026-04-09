# LeadFlow CRM

A full-stack CRM application for managing customers, leads, and sales pipelines. Built with a REST API backend and a responsive React frontend.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcryptjs |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Axios, Lucide React |
| **Infrastructure** | Docker, Docker Compose, Nginx (production) |
| **Testing** | Vitest, Supertest |

---

## Features

- **Authentication** — JWT-based login and registration with role-based access (ADMIN / AGENT)
- **Customers** — Full CRUD with search and pagination
- **Leads** — Track lead status: New → Contacted → Qualified → Unqualified → Converted
- **Pipeline (Deals)** — Kanban-style board with drag-and-drop, forward/backward stage movement, and Won/Lost actions
- **Interactions** — Log calls, emails, meetings, notes, and WhatsApp messages per customer/lead/deal
- **Dashboard** — KPI cards (customers, leads, open deals, net revenue), recent leads and recent deals list
- **Dark mode** — Full light/dark theme with persistence
- **Responsive layout** — Mobile sidebar with hamburger menu

---

## Project Structure

```
leadflow-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Mock data seed
│   │   └── migrations/
│   └── src/
│       ├── config/env.ts          # Env validation (Zod)
│       ├── lib/prisma.ts          # Prisma singleton
│       ├── middlewares/           # auth, error handler
│       ├── modules/               # auth, users, customers, leads, deals, interactions
│       ├── shared/                # Pagination, filters, API response helpers
│       └── tests/                 # Integration + unit tests
└── frontend/
    └── src/
        ├── components/            # Button, Input, Modal, Table, Form, Layout
        ├── contexts/              # AuthContext, ThemeContext
        ├── pages/                 # Dashboard, Customers, Leads, Pipeline, Login
        ├── services/              # Axios service layer
        └── types/                 # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & Docker Compose

---

### Development

**1. Clone and install dependencies**

```bash
git clone <repo-url>
cd leadflow-crm

# Install all workspace dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

**2. Start the database**

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL** on `localhost:5436`
- **pgAdmin** on `http://localhost:5050` (email: `admin@leadflow.local`, password: `admin`)

**3. Configure backend environment**

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://leadflow:leadflow_pass@localhost:5436/leadflow_dev
JWT_SECRET=change_this_to_a_long_random_string_32chars
JWT_EXPIRES_IN=3d
```

**4. Run database migrations**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

**5. Seed mock data (optional)**

```bash
cd backend
npx ts-node --transpile-only prisma/seed.ts
```

Seeds 10 customers, 12 leads, 15 deals, and 13 interactions with Brazilian company names.

**6. Start backend**

```bash
cd backend
npm run dev
# API running on http://localhost:3333
```

**7. Start frontend**

```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

---

### Production (Docker)

```bash
docker compose up -d --build
```

Services:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:3333`
- pgAdmin (optional, requires `--profile tools`): `http://localhost:5050`

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWTs (min 16 chars) |
| `JWT_EXPIRES_IN` | ❌ | `3d` | JWT expiration time |
| `PORT` | ❌ | `3333` | Backend server port |
| `NODE_ENV` | ❌ | `development` | Environment mode |

---

## API Reference

Base URL: `http://localhost:3333/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create account |
| `POST` | `/auth/login` | ❌ | Login, returns JWT |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | ✅ | Get authenticated user |
| `GET` | `/users` | ✅ ADMIN | List all users |
| `PATCH` | `/users/:id` | ✅ | Update user |
| `DELETE` | `/users/:id` | ✅ ADMIN | Delete user |

### Customers

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/customers` | ✅ | List (pagination, search) |
| `POST` | `/customers` | ✅ | Create |
| `GET` | `/customers/:id` | ✅ | Get by ID |
| `PATCH` | `/customers/:id` | ✅ | Update |
| `DELETE` | `/customers/:id` | ✅ | Delete |

### Leads

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/leads` | ✅ | List (pagination, search, status filter) |
| `POST` | `/leads` | ✅ | Create |
| `GET` | `/leads/:id` | ✅ | Get by ID |
| `PATCH` | `/leads/:id` | ✅ | Update |
| `DELETE` | `/leads/:id` | ✅ | Delete |

### Deals

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/deals` | ✅ | List (pagination, search, stage/customer filter, sortBy) |
| `POST` | `/deals` | ✅ | Create |
| `GET` | `/deals/:id` | ✅ | Get by ID |
| `PATCH` | `/deals/:id` | ✅ | Update |
| `PATCH` | `/deals/:id/stage` | ✅ | Move to a specific stage |
| `DELETE` | `/deals/:id` | ✅ | Delete |

### Interactions

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/interactions` | ✅ | List |
| `POST` | `/interactions` | ✅ | Create |
| `DELETE` | `/interactions/:id` | ✅ | Delete |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns server status and timestamp |

---

## Data Model

```
Customer ─┬──< Lead ──< Interaction
          ├──< Deal ──< Interaction
          └──< Interaction

User (authentication only, not linked to CRM entities)
```

**Deal stages (in order):** `PROSPECTING` → `PROPOSAL` → `NEGOTIATION` → `CLOSED_WON` / `CLOSED_LOST`

**Lead statuses:** `NEW` → `CONTACTED` → `QUALIFIED` → `UNQUALIFIED` / `CONVERTED`

**Interaction types:** `CALL`, `EMAIL`, `MEETING`, `NOTE`, `WHATSAPP`

**User roles:** `ADMIN`, `AGENT`

---

## Testing

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests cover unit (services) and integration (routes via Supertest) for all modules: auth, users, customers, leads, deals, and interactions.

---

## Database Management

```bash
cd backend

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Create a new migration
npm run db:migrate

# Regenerate Prisma client after schema changes
npm run db:generate
```
