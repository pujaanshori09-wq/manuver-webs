# Workspace Rules — MANUVER

This workspace contains project-specific guidelines and anti-slop frontend standards for MANUVER.

## Core Directives
1. **Tech Stack Integrity:**
   - Stack: Vite + Vanilla JavaScript (ES modules) + Node Express 5 backend with Google OAuth 2.0 and Supabase PostgreSQL.
   - Do not replace the stack or introduce heavy SPA frameworks (React/Vue/Angular) unless explicitly requested.
   - Preserve existing functional code, backend routes (`/api/*`, `/auth/*`), and protected workspace (`/dashboard`).

2. **Brand & Identity Tokens:**
   - Background: Near-black / charcoal (`#0d0e12`, `#1f1f21`).
   - Accent: Signature Manuver Orange (`#ff572f`).
   - Typography: `Geist`, `Geist Mono`, and `Inter`.
   - Hero identity: Cinematic 3D spatial particles with transparent central orb.

3. **Frontend Quality & Anti-Slop Standards:**
   - Detailed rules are located in [.agents/rules/design-taste-frontend.md](file:///.agents/rules/design-taste-frontend.md).
   - High standards inspired by figma.com and x.ai: one section per screen, equal margins, concrete copy without fluff, real UI components, subtle micro-interactions (2px hover lift, button step/press), and zero generic template aesthetic.

4. **Client Dashboard UI Rules:**
   - Feel: Tenang, mahal, dan buatan manusia.
   - Canvas: Deep dark navy (`--bg-app: #080B12`, `--surface: #111B2B`, `--surface-card: #121C2C`, `--surface-muted: #0D1422`).
   - Accent: Electric Blue (`--accent: #397BFF`, `--accent-cyan: #5BCBFF`, `--accent-soft: rgba(57,123,255,0.12)`).
   - Primary Buttons: Electric Blue `--accent: #397BFF` with white text and soft glow hover.
   - Typography: `Geist`, `Plus Jakarta Sans`, and `Inter` (welcome title 44px bold tracking -0.025em, default text 14px, muted text `--text-secondary: #A1ACBC`, `--text-muted: #687589`).
   - Geometry: Fullscreen AppShell (`260px minmax(0,1fr) 340px`), cards 20px, inputs/buttons 12px or pill, border `rgba(130, 160, 200, 0.14)`.
   - Atmosphere: Lightweight ambient 2D spatial particles + subtle electric blue depth glow.
   - Empty State: Strictly one line muted text + one action button. No motivational filler.
   - Menu: No unfinished badges (e.g. no "Soon" tag).

