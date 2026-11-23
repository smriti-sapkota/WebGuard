# 🛡️ WebGuard

**A beginner-friendly web vulnerability scanner.** Point it at a site you own, and WebGuard crawls it, probes every form and URL parameter for **SQL Injection**, **Cross-Site Scripting (XSS)** and **CSRF** weaknesses, then reports each finding with evidence and a suggested fix.

> ⚠️ **Only scan systems you own or have explicit written permission to test.** WebGuard is an educational project (Tribhuvan University, BSc CSIT, 7th semester). See [Responsible use](#responsible-use).

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database](#1-database)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
  - [Run with Docker](#run-with-docker)
- [Configuration](#configuration)
- [Google sign-in setup](#google-sign-in-setup)
- [Scanning a local test app (DVWA)](#scanning-a-local-test-app-dvwa)
- [API reference](#api-reference)
- [Database schema](#database-schema)
- [Scanner details](#scanner-details)
- [Security measures](#security-measures)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [Responsible use](#responsible-use)

---

## Features

- **Three vulnerability checks** – SQL Injection (error-, boolean- and time-based), reflected/stored XSS, and missing/weak CSRF protection.
- **Authenticated scanning** – log in to the target first (custom login URL, field names, extra fields and DVWA-style security level) so pages behind a login wall get tested too.
- **Background scans with live status** – scans run in a background thread; the UI polls every few seconds and tells you when results are ready.
- **Clear findings** – each result shows severity (High / Medium / Low), affected URL, parameter, payload, evidence, a plain-language description and a fix suggestion.
- **Accounts** – email + password sign-up, or one-click **Sign in with Google**. Every scan and result is private to its owner.
- **Abuse protection** – SSRF guard that blocks private/internal targets, plus a per-user hourly rate limit.
- **Friendly UI** – animated home page, "how it works" and plain-English legal pages, profile menu with log-out, and a "scan complete" banner that points you to the results.

## How it works

```
 Browser (React)                     FastAPI backend                      Target site
 ───────────────                     ───────────────                      ───────────
 Log in  ───────────────────────────▶ /api/auth/*  (JWT issued)
 Start scan  ───────────────────────▶ POST /api/scan
                                        ├─ SSRF check + rate limit
                                        ├─ create Scan row (pending)
                                        └─ background thread ──────────────▶ (optional) log in
                                             1. crawl pages & forms  ◀──────▶ GET/POST requests
                                             2. SQLi / XSS / CSRF scanners ──▶ test payloads
                                             3. save Vulnerability rows
 Poll every ~3s  ───────────────────▶ GET /api/scan/{id}
 "Scan complete" → Results page  ◀──  status: completed + findings
```

1. **Target** – you submit a URL (and optionally login details).
2. **Crawl** – a threaded crawler stays on the same domain (max **50 pages**), collecting links and forms.
3. **Scan** – each page's forms and URL parameters are tested by the SQL injection, XSS and CSRF scanners. A scan is capped at **180 seconds** and returns partial results if it hits the limit.
4. **Report** – findings are stored in PostgreSQL and shown ranked by severity.

Scan status moves through `pending → running → completed` (or `failed`, with an error message explaining why).

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19, Vite 8, plain CSS (no UI framework) |
| Backend   | Python 3.12, FastAPI, SQLModel / SQLAlchemy, Alembic |
| Scanner   | `requests`, BeautifulSoup |
| Database  | PostgreSQL 16 (via `psycopg` 3) |
| Auth      | JWT (signed tokens), bcrypt password hashing, Google Identity Services |
| Packaging | Docker + Docker Compose |

## Project structure

```
WebGuard/
├── backend/
│   ├── main.py            # FastAPI app, CORS, router registration
│   ├── config.py          # Settings loaded from environment / .env
│   ├── database.py        # Engine + session dependency
│   ├── models.py          # User, Scan, Vulnerability tables
│   ├── schemas.py         # Pydantic request/response models
│   ├── security.py        # Password hashing, JWT, SSRF guard
│   ├── routers/
│   │   ├── auth.py        # register, login, Google, /me, /config
│   │   └── scan.py        # start scan, get results, scan runner
│   └── scanner/
│       ├── crawler.py     # Same-domain threaded crawler
│       ├── sql_scanner.py # SQL injection checks
│       ├── xss_scanner.py # XSS checks
│       └── csrf_scanner.py# CSRF checks
├── alembic/               # Database migrations
├── frontend/
│   ├── src/
│   │   ├── pages/         # Home, Login, Scanner, Results
│   │   ├── components/    # Header (profile menu), Footer
│   │   ├── context/       # AuthContext
│   │   ├── hooks/         # useScan (polling logic)
│   │   └── utils/         # api.js, scanApi.js
│   └── public/            # Static legal/info pages (privacy, terms, security, contact…)
├── docker-compose.yml     # Postgres + backend
├── requirements.txt
└── .env                   # Local configuration (not committed)
```

## Getting started

### Prerequisites

- **Python 3.12+**
- **Node.js 20+** and npm
- **PostgreSQL 16** (or Docker)
- Git

```bash
git clone https://github.com/smriti-sapkota/WebGuard.git
cd WebGuard
```

### 1. Database

Create a PostgreSQL database (default name `WebGuard`) and note the credentials. Or start only the database with Docker:

```bash
docker compose up -d db
```

### 2. Backend

Create a `.env` file in the project root (see [Configuration](#configuration)):

```env
DATABASE_NAME=WebGuard
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

JWT_SECRET=replace-with-a-long-random-string
# Needed only to scan local apps such as DVWA:
ALLOW_PRIVATE_TARGETS=true
```

Then install and run:

```bash
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate

pip install -r requirements.txt
pip install alembic requests beautifulsoup4   # also installed by the Docker image

alembic upgrade head                           # create tables
python -m uvicorn backend.main:app --reload --port 8000
```

API docs are served at **http://127.0.0.1:8000/docs**.

> **Tip:** on Windows, `requirements.txt` includes Windows-only packages (`pywin32`, `WMI`). The Docker image filters those out automatically.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local     # then edit if needed
npm install
npm run dev
```

Open **http://localhost:5173**, click **Log in → Sign up**, create an account, and start scanning.

`frontend/.env.local`:

```env
VITE_API_BASE=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=          # optional, see Google sign-in setup
```

> If something else already uses port 8000, run the backend on another port (e.g. `--port 8001`) and set `VITE_API_BASE=http://127.0.0.1:8001/api`. Restart `npm run dev` after changing env files.

### Run with Docker

```bash
docker compose up --build
```

This starts PostgreSQL and the backend on **http://localhost:8000** (migrations run automatically on startup). Provide `DATABASE_NAME`, `DATABASE_USERNAME` and `DATABASE_PASSWORD` in `.env`. Add `JWT_SECRET` and `GOOGLE_CLIENT_ID` to the backend `environment:` block in `docker-compose.yml` if you need them. The frontend is run separately with `npm run dev`.

## Configuration

All backend settings are read from environment variables or the root `.env` file (names are case-insensitive).

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | – | Full connection string (e.g. Neon). Overrides the individual parts below. `postgres://` and `postgresql://` are rewritten for psycopg automatically. |
| `DATABASE_NAME` / `_USERNAME` / `_PASSWORD` / `_HOST` / `_PORT` | – / – / – / – / `5432` | Individual Postgres connection parts (local/Docker). |
| `JWT_SECRET` | `dev-only-change-me` | Secret used to sign login tokens. **Always change in production.** |
| `JWT_EXPIRE_HOURS` | `168` (7 days) | Token lifetime. |
| `GOOGLE_CLIENT_ID` | – | Enables Google sign-in. |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins. Add your deployed frontend URL. |
| `MAX_SCANS_PER_HOUR` | `10` | Per-user scan limit. |
| `ALLOW_PRIVATE_TARGETS` | `false` | Allow scanning localhost/private IPs. **Development only.** |

Frontend (Vite, set at build time):

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend API base URL, e.g. `https://api.example.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Optional fallback; the app normally fetches the client ID from `GET /api/auth/config` at runtime. |

## Google sign-in setup

1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**, create an **OAuth client ID** of type *Web application*.
2. Under **Authorized JavaScript origins**, add every origin the frontend is served from (e.g. `http://localhost:5173` and your production URL).
3. Set `GOOGLE_CLIENT_ID` in the **backend** environment and restart it.

The login page asks the backend for the client ID at runtime (`/api/auth/config`), so the hosted frontend needs no rebuild. The backend verifies the Google ID token, checks the audience and `email_verified`, and creates or links the user by email.

## Scanning a local test app (DVWA)

[DVWA](https://github.com/digininja/DVWA) is a deliberately vulnerable app that's perfect for testing.

1. Run DVWA (e.g. `docker run -p 4280:80 vulnerables/web-dvwa`).
2. Set `ALLOW_PRIVATE_TARGETS=true` in the backend `.env` and restart the backend.
3. In the Scanner, enable **Use Authentication** and fill in:

| Field | Value |
|-------|-------|
| Target URL | `http://127.0.0.1:4280/` |
| Login URL | `http://127.0.0.1:4280/login.php` |
| Login method | `POST` |
| Username / Password | `admin` / `password` |
| Username field / Password field | `username` / `password` |
| Security URL | `http://127.0.0.1:4280/security.php` |
| Security level / field | `low` / `security` |
| Extra fields (JSON) | `{"Login":"Login"}` |

## API reference

Interactive docs: `/docs` (Swagger) and `/redoc`. All routes are prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | – | Create an account `{email, password (8–72 chars), name?}` → `{token, user}` |
| `POST` | `/auth/login` | – | `{email, password}` → `{token, user}` |
| `POST` | `/auth/google` | – | `{credential}` (Google ID token) → `{token, user}` |
| `GET`  | `/auth/config` | – | `{google_client_id}` so the frontend can render Google sign-in |
| `GET`  | `/auth/me` | ✅ | Current user |
| `POST` | `/scan` | ✅ | Start a scan |
| `GET`  | `/scan/{id}` | ✅ | Status and findings (owner only) |

**Start a scan**

```http
POST /api/scan
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/",
  "auth": {                      // optional
    "login_url": "https://example.com/login",
    "username": "admin",
    "password": "secret",
    "username_field": "username",
    "password_field": "password",
    "method": "post",
    "extra_fields": {"Login": "Login"},
    "security_url": null,
    "security_level": null,
    "security_field": "security"
  }
}
```

Response: `{ "scan_id": 12, "status": "pending", "message": "Scan started. Poll GET /api/scan/12 for results." }`

**Get results** – `GET /api/scan/12` returns `status` (`pending | running | completed | failed`), `target_url`, timestamps, an `error_message` for failed scans, and a `vulnerabilities` list (`vuln_type`, `severity`, `affected_url`, `parameter`, `payload`, `evidence`, `description`, `fix`).

## Database schema

| Table | Key columns |
|-------|-------------|
| `user` | `id`, `email` (unique), `name`, `password_hash` (null for Google-only accounts), `google_sub`, `created_at` |
| `scan` | `id`, `target_url`, `status`, `created_at`, `completed_at`, `error_message`, `user_id` → user |
| `vulnerability` | `id`, `scan_id` → scan, `vuln_type`, `severity`, `affected_url`, `parameter`, `payload`, `evidence`, `description`, `fix` |

Migrations live in `alembic/versions`. Run `alembic upgrade head` after pulling new changes.

## Scanner details

- **Crawler** – breadth-first, multi-threaded, same-domain only, skips static assets, capped at 50 pages. Extracts links and forms (including hidden fields).
- **SQL Injection** – tests form fields and URL parameters using:
  - *error-based* payloads matched against known database error patterns,
  - *boolean-based blind* true/false payload pairs compared against a baseline response,
  - *time-based* checks comparing response timing against a baseline.
- **XSS** – injects payloads carrying a unique marker (`WGXSS_MARKER`) and checks whether they come back unescaped in the response (reflected), and revisits pages to catch stored payloads.
- **CSRF** – flags state-changing forms that lack a recognized anti-CSRF token (`csrf_token`, `csrfmiddlewaretoken`, `_token`, `authenticity_token`, `__RequestVerificationToken`, …).
- **Safety** – payloads are test strings only; the scanner does not attempt destructive exploitation.

## Security measures

- **SSRF protection** – target, login and security URLs must resolve to **public** IP addresses; private, loopback, link-local and multicast ranges are rejected (disable only with `ALLOW_PRIVATE_TARGETS=true` for local development).
- **Rate limiting** – `MAX_SCANS_PER_HOUR` scans per user (HTTP 429 beyond that).
- **Authentication** – bcrypt-hashed passwords, signed JWTs, Google token audience + `email_verified` checks.
- **Ownership checks** – users can only read their own scans (others get a 404).
- **CORS allow-list** – only origins in `CORS_ORIGINS` can call the API from a browser.
- **Credentials** – target-site credentials are used for the scan session and not stored.

## Deployment

WebGuard runs as two parts:

- **Backend** – build `backend/Dockerfile` (context = repo root). The container runs `alembic upgrade head` and then `uvicorn` on `$PORT` (default 8000). Set `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID` and `CORS_ORIGINS` (include your frontend URL). Keep `ALLOW_PRIVATE_TARGETS` unset/false.
- **Frontend** – `cd frontend && npm run build`, then host the `dist/` folder on any static host. Set `VITE_API_BASE` to your backend URL (ending in `/api`) at build time.
- Add the frontend URL to Google's **Authorized JavaScript origins** to enable Google sign-in.

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| Login says "Bearer token required…" or behaves oddly | Another app is using port 8000. Run WebGuard on a different port and update `VITE_API_BASE`. |
| Google button missing | `GOOGLE_CLIENT_ID` isn't set on the backend, or the site's origin isn't in Google's authorized origins. |
| CORS error in the browser console | Add the frontend origin to `CORS_ORIGINS` and restart the backend. |
| "Scanning private, local or internal addresses is not allowed" | Expected for public deployments. For local testing set `ALLOW_PRIVATE_TARGETS=true`. |
| `psycopg … no pq wrapper available` | Reinstall with `pip install --force-reinstall "psycopg[binary]"`; on Windows, check that security software isn't blocking the DLL. |
| Tables/columns missing | Run `alembic upgrade head`. |
| HTTP 429 when scanning | You hit `MAX_SCANS_PER_HOUR`; wait or raise the limit. |
| Scan `failed` with a connection message | The target is unreachable from the backend (DNS, firewall, wrong URL) – check the error message shown. |

## Limitations

- Covers only SQL injection, XSS and CSRF; a clean report is **not** proof an app is secure.
- Crawls at most 50 pages per scan and stops after 180 seconds, so large sites yield partial results.
- JavaScript-rendered content isn't executed; single-page apps may expose fewer forms.
- Scans run in an in-process background thread (not a job queue), so they're lost if the backend restarts mid-scan.
- Possible false positives/negatives – always verify findings manually.

## Responsible use

Scan **only** systems you own or have explicit written permission to test. Unauthorized scanning can be illegal. You are responsible for how you use WebGuard and its results. The project is provided "as is", without warranty. See the in-app pages: Terms of Service, Privacy Policy, and Security (including how to report a vulnerability in WebGuard itself).

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/smriti-sapkota/WebGuard). Please open an issue first for larger changes.

---

Built with ☕ by students at Tribhuvan University.
