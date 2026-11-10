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
