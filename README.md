# DWEIMS — Defence Weapons Equipment Inventory Management System

A full-stack, real-time military asset tracking platform built for managing the lifecycle of defence equipment — from procurement and storage through issuance to field units, and return.

---

## 📸 Overview

DWEIMS provides a secure, role-based dashboard that gives defence administrators a live tactical view of all equipment assets. It tracks:

- **Remaining assets** currently in storage
- **Deployed assets** issued to field units
- **Equipment under maintenance**
- **Red flags** (overdue returns + low stock)

Data updates in real-time via WebSockets whenever any inventory action is performed.

---

## 🏗️ Architecture

```
DWEIMS/
├── backend/          # Node.js + Express REST API + Socket.io
│   ├── config/       # MySQL connection pool
│   ├── middleware/   # JWT auth & request logger
│   ├── routes/       # API route handlers
│   └── server.js     # Entry point
├── frontend/         # React + Vite + TailwindCSS
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context (JWT management)
│       ├── layouts/      # Dashboard shell / sidebar
│       ├── pages/        # Application pages
│       └── services/     # api.js — all fetch calls
└── database.sql      # Full MySQL schema + seed data
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite 8, TailwindCSS 4, Recharts       |
| Backend    | Node.js, Express 5, Socket.io 4                 |
| Database   | MySQL 8 (via `mysql2/promise` connection pool)  |
| Auth       | JWT (12 h expiry) + bcryptjs password hashing   |
| Validation | Zod (request body schemas)                      |
| Real-time  | WebSocket (`inventoryUpdate` event)             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MySQL 8 running locally
- A database named `DefenceInventoryDB`

### 1. Database Setup

```sql
-- In MySQL Workbench or CLI:
CREATE DATABASE DefenceInventoryDB;
USE DefenceInventoryDB;
SOURCE database.sql;   -- runs schema + seed data
```

### 2. Backend

```bash
cd backend
npm install
```

Create / edit `backend/.env`:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=DefenceInventoryDB
JWT_SECRET=your_secret_key
```

Start the server:

```bash
node server.js
# or: npm start
```

The API will be available at `http://localhost:5001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## 🔐 Authentication

All API routes (except `POST /api/auth/login`) require a `Bearer` token in the `Authorization` header.

Tokens are issued on login, stored in `localStorage`, and expire after **12 hours**.  
On a 401 response the frontend automatically clears the token and redirects to `/login`.

### Roles

| Role    | Permissions                                         |
|---------|-----------------------------------------------------|
| Admin   | Full access — issue, return, view all data          |
| Officer | Can issue and return assets                         |
| Viewer  | Read-only access to inventory and reports           |

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | `/api/auth/login`   | Login — returns JWT token |

### Inventory
| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/inventory/metrics`      | Dashboard KPIs (available, issued…)  |
| GET    | `/api/inventory`              | Full inventory list                  |
| GET    | `/api/inventory/available`    | Items with qty > 0 (for issue form)  |
| GET    | `/api/inventory/alerts`       | Overdue + low-stock + maintenance    |
| POST   | `/api/inventory/issue`        | Issue asset to a unit (Admin/Officer)|
| GET    | `/api/inventory/issued`       | Currently deployed assets            |
| GET    | `/api/inventory/returns`      | Return history                       |
| POST   | `/api/inventory/return`       | Return an asset (Admin/Officer)      |

### Other
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | `/api/personnel`     | Defence units list     |
| GET    | `/api/procurement`   | Procurement records    |
| GET    | `/api/suppliers`     | Supplier list          |
| GET    | `/api/audit`         | Audit log              |
| GET    | `/api/issues`        | Outstanding issues     |
| GET    | `/api/health`        | Health check           |

---

## 🖥️ Application Pages

| Page              | Route          | Description                                          |
|-------------------|----------------|------------------------------------------------------|
| Login             | `/login`       | Credential entry, JWT issued on success              |
| Command Center    | `/`            | Live tactical overview: KPI cards + real-time chart  |
| Inventory Matrix  | `/inventory`   | Full equipment table with status & quantities        |
| Authorize Asset   | `/issue`       | Form to issue equipment to a defence unit            |
| Weapons Taken     | `/taken`       | All currently deployed assets                        |
| Return Records    | `/returns`     | History of all asset returns                         |
| Procurement       | `/procurement` | Procurement history per supplier                     |
| Suppliers         | `/suppliers`   | Registered supplier details                          |
| Audit Logs        | `/audit`       | Action log for accountability                        |

---

## 🔄 Real-Time Updates

The backend emits an `inventoryUpdate` WebSocket event whenever an asset is issued or returned. The frontend dashboard subscribes to this event and silently re-fetches metrics — no page reload required.

```
Browser  ──(WebSocket)──►  Socket.io Server
                               │
                    POST /issue or /return
                               │
                    io.emit('inventoryUpdate')
                               │
Browser  ◄──────────────  dashboard re-fetches metrics
```

---

## 🛡️ Security

- Passwords hashed with **bcryptjs** before storage.
- All sensitive routes protected by `requireAuth` middleware (JWT verification).
- Issue / Return routes additionally protected by `requireRole(['Admin', 'Officer'])`.
- CORS enabled for development; restrict `origin` in production.

---

## 📊 Database Schema (Key Tables)

| Table                | Purpose                                         |
|----------------------|-------------------------------------------------|
| `AuthorizedPersonnel`| System users with hashed passwords and roles   |
| `Equipment`          | Master list of all equipment items             |
| `EquipmentCategory`  | Category / classification of equipment         |
| `Inventory`          | Current stock levels per storage location      |
| `StorageLocation`    | Physical storage locations                     |
| `DefenceUnit`        | Military units that receive assets             |
| `IssueRecord`        | Record of every asset issuance                 |
| `ReturnRecord`       | Record of every asset return                   |
| `Maintenance`        | Maintenance history and status                 |
| `Procurement`        | Purchase records per supplier                  |
| `Supplier`           | Supplier master data                           |
| `AuditLog`           | Immutable log of all system actions            |

---

## 🐛 Known Issues / Notes

- **Double-trigger protection**: MySQL has an `update_inventory` trigger on `IssueRecord` AND the issue route manually deducts stock. The route detects and corrects any double-deduction automatically.
- **Metrics clamping**: The "Assets Taken" metric uses `GREATEST(0, ...)` per row to prevent corrupt return data from producing negative counts.

---

## 📄 License

Internal use only — Defence Systems Project.
