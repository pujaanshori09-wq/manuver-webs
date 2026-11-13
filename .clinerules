# Workspace Rules — MANUVER (Shared Full-Stack Guide: Antigravity & Cline)

This workspace contains the full-stack architecture, locked design tokens, and frontend/backend standards for **MANUVER**. Both **Antigravity** and **Cline** operate in this workspace and MUST follow these exact rules.

---

## 1. Full-Stack Tech Stack & Commands
- **Frontend:** Vite (`port 5173`) + Vanilla JavaScript (ES Modules, no React/Vue/Angular) + CSS Variables (`src/globals.css`, `src/dashboard.css`, `style.css`).
- **Backend:** Node.js + Express 5 (`server/index.js`, `port 5000`) + Google OAuth 2.0 & JWT Cookie Session (`server/auth.js`) + PostgreSQL (`pg` pool in `server/db.js`) with resilient local JSON fallback (`.data/briefs.json`).
- **AI Chatbot:** Serverless/Express handler (`api/chat.js`, `api/knowledge.js`) consumed by `src/ChatWidget.js` and `chatbot.html`.
- **Scripts (`package.json`):**
  - `npm run dev` (`node scripts/dev.js`): Runs both Express backend (`:5000`) and Vite dev server (`:5173`) concurrently. Vite proxies `/api/*` and `/auth/*` to `http://localhost:5000` (`vite.config.js`).
  - `npm run build`: Builds multi-page Vite bundle (`index.html`, `dashboard.html`, `prototype-particles.html`) into `dist/`.

---

## 2. Backend Architecture (`server/` & `api/`)
1. **`server/index.js` (Express 5 Entry Point):**
   - Configures CORS with `credentials: true` for local (`localhost:5173`, `localhost:5000`) and production origins.
   - Calls `initDb()` on startup to ensure PostgreSQL tables exist.
   - Mounts API & Auth routes:
     - `GET /api/me` -> `handleGetMe` (verifies `manuver_session` HTTP-only JWT cookie and returns `{ authenticated, user }`).
     - `GET /api/dashboard/data` -> `requireAuth`, `handleGetDashboardData` (returns `{ user, projects, requests }`).
     - `GET /api/projects` -> `requireAuth`, `handleGetProjects`.
     - `GET /api/requests` -> `requireAuth`, `handleGetRequests`.
     - `POST /api/requests` -> `requireAuth`, `handleCreateRequest` (validates & saves a new client request/brief).
     - `/api/auth/*` and `/auth/*` -> `authRouter` (`/google`, `/google/callback`, `/logout`).
     - `ALL /api/chat` -> `chatHandler` (`api/chat.js` + `api/knowledge.js`).
2. **`server/auth.js` (Google OAuth 2.0 & Session Management):**
   - Handles Google OAuth redirect flow, exchanges `code` for tokens, fetches Google user profile, upserts user via `upsertGoogleUser()`, signs JWT cookie `manuver_session`, and redirects to `/dashboard`.
   - Includes resilient fallback user session if PostgreSQL is temporarily unreachable so OAuth login never crashes with HTTP 500.
3. **`server/db.js` (PostgreSQL Pool & Local Fallback):**
   - Manages 4 tables: `users`, `projects`, `project_briefs`, and `roi_calculations`.
   - Automatically falls back to `.data/briefs.json` when `DATABASE_URL` / PostgreSQL is offline during local development (`PostgreSQL write skipped (database not connected)`).

---

## 3. Frontend Architecture (`index.html`, `dashboard.html`, `src/`)
1. **Landing Page (`index.html`, `main.js`, `src/LandingSections.js`, `src/particles.js`):**
   - 3D spatial particle system (`src/particles.js`) with transparent central orb.
   - Interactive sections, ROI calculator, Google OAuth login trigger, and floating AI ChatWidget (`src/ChatWidget.js`).
2. **Client Workspace Dashboard (`dashboard.html`, `src/dashboard.js`, `src/dashboard.css`):**
   - Protected 3-column AppShell (`Sidebar 232px` | `Middle Viewport max-width 960px` | `Right Activity Panel 320px`).
   - Supports `?preview=1` mode for UI preview/testing and live authenticated session via `/api/me` + `/api/dashboard/data`.
   - Allows submitting new requests (`POST /api/requests`), filtering activity timeline, switching views (`overview`, `requests`, `projects`, `help`), and toggling language (`ID` / `EN`).
3. **Internationalization (`src/i18n.js`):**
   - Full bilingual dictionary (`id` and `en`).
   - `updateDOM()` translates `[data-i18n]`, `[data-i18n-aria]`, and `[data-i18n-placeholder]`.

---

## 4. Locked Dashboard Palette & Design Tokens (Single Source of Truth)
Defined in `src/globals.css`, `src/dashboard.css`, and `tailwind.config.js`. Never write hardcoded hex colors in component styles; always use these CSS variables:
```css
:root {
  --bg-base:        #17181D;                  /* latar utama */
  --sidebar-top:    #2B2E39;                  /* gradien sidebar atas */
  --sidebar-bottom: #1A1C22;                  /* gradien sidebar bawah */
  --panel:          rgba(255,255,255,0.06);   /* daftar dan kotak input */
  --panel-hover:    rgba(255,255,255,0.12);   /* baris hover / menu aktif */
  --border:         rgba(255,255,255,0.08);
  --text:           #F5F2EE;
  --text-muted:     #B4B2AE;
  --accent:         #E8643C;                  /* titik "Puja." saja */
  --glow-warm:      rgba(232,100,60,0.22);    /* pojok kanan bawah, fixed */
}
```

## 5. Dashboard Typography, Layout, & Dark Glass Standards
- **Typography:** `Inter Tight` for headings (`letter-spacing: -0.03em`), `Inter` for body text.
- **Overview H1 (`#welcome-h1`):** `"Selamat datang, {nama}."` (`56px` desktop / `34px` mobile, `line-height: 1.1`, `padding-bottom: 4px`, `overflow: visible`, orange accent period `<span class="accent-dot">.</span>`, no small kicker above it).
- **Sticky Page Header (`.top-header`):** `position: sticky; top: 0; z-index: 20;` with `--bg-base` at `0.8` opacity + `backdrop-filter: blur(12px)`.
- **Middle Column (`.viewport`):** `padding-top: 48px` below the sticky header (`max-width: 960px`, left-aligned).
- **Buttons & Links:** Primary CTA is an off-white pill (`background: var(--text); color: var(--bg-base)`). Secondary buttons use `--panel` + `1px solid var(--border)`. `"Lihat semua"` / `"View all"` links use `var(--text-muted)` (`var(--text)` on hover), never orange.
- **Sidebar (`232px`):** Vertical gradient (`--sidebar-top` to `--sidebar-bottom`). Active nav item uses `background: var(--panel-hover)` and `color: var(--text)`, with no orange left border. The `Products` menu item is removed.

## 6. Multi-Agent Coordination (Antigravity + Cline)
- Always read the latest state of a file from disk before editing, in case the other agent recently modified it.
- Keep `GEMINI.md` and `.clinerules` synchronized whenever workspace rules, API routes, or design tokens change.
