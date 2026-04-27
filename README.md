# Harbor House — Hotel Booking Platform

A full-stack **hotel booking** application built with the **MERN** stack (**MongoDB**, **Express**, **React**, **Node.js**). Guests can search availability by date range, book multiple nights, and manage reservations. Administrators get a separate console for **bookings** and **room inventory**.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [NPM scripts](#npm-scripts)
- [REST API](#rest-api)
- [Admin panel](#admin-panel)
- [Data & seeding](#data--seeding)
- [Production build](#production-build)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [License](#license)

---

## Features

### Guest experience

- **Authentication** — Register and sign in with **JWT**; passwords hashed with **bcrypt**
- **Room search** — Filter by **room type** (single / double) and one or more **nights**; calendar supports **any month/year** (UTC, years **2000–2100**)
- **Availability** — Only rooms **free on every** selected night are shown; conflicts resolved via MongoDB queries
- **Bookings** — Book one or multiple dates; view and **cancel** reservations from the profile
- **Persistence** — Bookings stored in MongoDB; auth persisted in the browser for return visits
- **UI** — Responsive layout, **Tailwind CSS**, **react-hot-toast** notifications, loading states

### Administration

- Dedicated **`/admin`** area with its own JWT storage (can coexist with a guest session)
- **Bookings** — List all guest bookings; remove any booking to free dates
- **Rooms** — Full **CRUD** on rooms; filters by price and type in the admin table
- **Seeded admin** — Default operator account (see [Admin panel](#admin-panel)); runnable via CLI

### Out of scope

- **No payment processing** — Totals are informational only

---

## Tech stack

| Layer        | Technologies |
|-------------|---------------|
| **Client**  | React 18, Vite 5, React Router 6, Axios, Tailwind CSS, react-hot-toast |
| **Server**  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, CORS, dotenv |
| **Database**| MongoDB |

---

## Architecture

```text
Browser (React SPA, port 5173)
    │  HTTP  /api/*  (Vite dev proxy → Express)
    ▼
Express API (port 5000)
    │  Mongoose ODM
    ▼
MongoDB
```

- The **client** uses a relative `/api` base URL in development; **Vite** proxies requests to the Express server.
- **Dates** in the API are **UTC calendar days** (`YYYY-MM-DD` interpreted at noon UTC) for consistent search and booking logic.

---

## Prerequisites

- **Node.js** 18 or newer  
- **MongoDB** — local instance (`mongodb://…`) or [MongoDB Atlas](https://www.mongodb.com/atlas) (recommended for hosted development)

---

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd hotel_booking_app
```

Install **server** and **client** dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit **`server/.env`**: set **`MONGODB_URI`** and a strong **`JWT_SECRET`**. See [Environment variables](#environment-variables).

### 3. Run the application

Use **two terminals**.

**Terminal A — API**

```bash
cd server
npm run dev
```

- API: `http://localhost:5000`  
- Health check: `GET http://localhost:5000/api/health`

**Terminal B — Client**

```bash
cd client
npm run dev
```

- App: `http://localhost:5173`

On first successful API start, **rooms** and (if missing) the **admin user** are **seeded** automatically.

---

## Environment variables

Create **`server/.env`** from **`server/.env.example`**.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs (use a long random value in production) |
| `PORT` | No | HTTP port for Express (default `5000`) |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default `7d`) |
| `CLIENT_URL` | No | Allowed CORS origin (default `http://localhost:5173`) |

---

## NPM scripts

### Server (`server/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API with **Node --watch** (auto-restart on file changes) |
| `npm start` | Start API once (production-style) |
| `npm run seed:admin` | Create default admin user if it does not already exist |
| `npm run test:mongo` | Verify `MONGODB_URI` connectivity and disconnect |

### Client (`client/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Preview the production build locally |

---

## REST API

Base path: **`/api`**. Protected routes expect:

```http
Authorization: Bearer <jwt>
```

### Public & guest

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Liveness probe |
| `POST` | `/api/auth/register` | Register `{ username, email, password }` |
| `POST` | `/api/auth/login` | Login `{ email, password }` |
| `GET` | `/api/rooms` | List all rooms |
| `GET` | `/api/rooms/available?date=YYYY-MM-DD` | Rooms available on a single day |
| `GET` | `/api/rooms/available?dates=YYYY-MM-DD,...` | Rooms available on **all** listed days |
| `GET` | `/api/rooms/available?...&type=single` | Optional filter: `single` or `double` |
| `GET` | `/api/rooms/meta/june-2025` | Legacy helper: June 2025 day strings |
| `POST` | `/api/bookings` | Create booking `{ roomId, dates: [] }` (JWT) |
| `GET` | `/api/bookings/user` | Current user’s bookings (JWT) |
| `DELETE` | `/api/bookings/:id` | Cancel own booking (JWT) |

### Admin (JWT with `role: admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth/login` | `{ username, password }` — admin role only |
| `GET` | `/api/admin/me` | Current admin profile |
| `GET` | `/api/admin/bookings` | All bookings (user + room populated) |
| `DELETE` | `/api/admin/bookings/:id` | Remove any booking |
| `GET` | `/api/admin/rooms` | List rooms |
| `POST` | `/api/admin/rooms` | Create `{ roomId, type, price }` |
| `PUT` | `/api/admin/rooms/:id` | Update room |
| `DELETE` | `/api/admin/rooms/:id` | Delete room (blocked if bookings reference it) |

---

## Admin panel

| URL | Purpose |
|-----|---------|
| `/admin` | Admin sign-in |
| `/admin/bookings` | **Default after login** — manage all guest bookings |
| `/admin/rooms` | Manage room inventory (CRUD + filters) |

**Default seeded credentials** (development only):

| Field | Value |
|-------|--------|
| Username | `admin` |
| Password | `password` |
| Email (in DB) | `admin@harborhouse.local` |

To seed the admin **without** starting the server:

```bash
cd server && npm run seed:admin
```

**Change or disable these credentials before any production deployment.**

---

## Data & seeding

| Data | Behavior |
|------|----------|
| **Rooms** | If the `rooms` collection is empty, **20 single** (`S-01` … `S-20`) and **10 double** (`D-01` … `D-10`) are inserted with default prices |
| **Admin user** | Created on startup (or via `npm run seed:admin`) if no admin with that username/email already exists |
| **Availability** | Derived from **bookings** — the same room cannot be booked twice for the same UTC date |

---

## Production build

```bash
cd client
npm run build
```

Serve **`client/dist`** with any static host. Point the client at your API (update **`baseURL`** / proxy or use the same origin with a reverse proxy). Set **`CLIENT_URL`** on the server to your deployed frontend origin for CORS.

---

## Security notes

- Use a **long, random `JWT_SECRET`** in production  
- **Rotate** JWTs and **HTTPS** everywhere in production  
- Restrict **MongoDB Atlas** IP access; avoid wide-open rules except for short-lived development  
- **Replace** default admin credentials and consider **disabling** the seed path in production  
- Never commit **`.env`** — only **`.env.example`**

---

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| `querySrv ECONNREFUSED` (Atlas) | DNS / VPN / firewall blocking SRV lookups; try a standard `mongodb://` URI with TLS, or change network/DNS |
| `EADDRINUSE` on port 5000 | Stop the other process or change `PORT` in `.env` and align the Vite proxy in `client/vite.config.js` |
| CORS errors | Set `CLIENT_URL` to the exact browser origin (scheme + host + port) |

---

## Project structure

```text
hotel_booking_app/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/           # Axios (guest + admin instances)
│   │   ├── components/    # Layouts, route guards
│   │   ├── context/       # Auth providers
│   │   ├── pages/         # Route-level views
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/           # seedAdmin, testMongo
│   ├── utils/
│   ├── index.js
│   └── .env.example
└── README.md
```

---

## License

This repository is provided as a **demo / portfolio** project. Add a `LICENSE` file (for example **MIT**) if you intend to open-source it under specific terms.

---

**Harbor House** — MERN hotel booking demo with guest and admin flows.
