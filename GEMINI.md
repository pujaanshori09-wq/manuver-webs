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
   - Canvas: Warm light canvas (`--bg-app: #F6F4F1`, `--surface: #FFFFFF`, `--surface-muted: #F1EEEA`).
   - Accent: Signature Manuver Orange (`--accent: #E8643C`, `--accent-text: #C2461F`, `--accent-soft: #FDEBE3`). Max 1 dominant accent per screen.
   - Primary Buttons: Must use `--ink: #111216` (dark), not solid orange.
   - Typography: Single font family `Plus Jakarta Sans` (welcome title 44px semibold tracking -0.02em, default text 14px, muted text `--text-muted: #6B6A68`).
   - Geometry: Outer shell radius 28px, cards 20px, inputs/buttons 12px or pill, shadows subtle (`0 1px 2px rgba(17,18,22,.04), 0 8px 24px rgba(17,18,22,.04)`), section gap 32px.
   - Empty State: Strictly one line muted text + one action button. No motivational filler.
   - Menu: No unfinished badges (e.g. no "Soon" tag).

