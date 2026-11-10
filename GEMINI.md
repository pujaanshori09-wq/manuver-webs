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

4. **Client Dashboard UI Rules (Bespoke Hand-Designed Standard):**
   - Feel: Buatan manusia, tenang, confident, tanpa AI slop.
   - Canvas: Near-black (`--bg: #07080B`, `--surface-1: #0D0E12`, `--surface-2: #13151A`).
   - Accent: Single signature Manuver orange-red (`--accent: #E8603C`, `--accent-ink: #0B0B0B`).
   - Primary Buttons: Off-white pill (`--text: #F4F1EA` bg, `--accent-ink: #0B0B0B` text) for the primary CTA row only; sticky right button in `--accent`.
   - Typography: `Geist`, `Geist Mono`, and `Inter`. Heavy, tightly-tracked grotesk headlines (tracking -0.03em, line-height 0.95-1.05). H1 at 56px bold with accent period (`Puja<span class="accent-dot">.</span>`). Tabular numbers for dates and counts.
   - Geometry: Sidebar 232px, right panel 320px, middle max-width 960px left-aligned. Radius: 6px inputs/cards, 10px panels, full-pill ONLY for primary CTA and language toggle.
   - Shadows: None. 1px borders only. No glow, no neon, no blur halos, no particle loops in app shell.
   - Empty State: Strictly one line muted text + one quiet text button.
   - Menu: No unfinished badges (e.g. no "Soon" tag). Left 2px accent bar for active nav item.

