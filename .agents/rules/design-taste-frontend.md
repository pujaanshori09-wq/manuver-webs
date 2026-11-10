# Manuver Project Guardrails & Design Taste Frontend Rules

> **CRITICAL PRESERVATION DIRECTIVE FOR MANUVER:**
> 1. **Preserve Existing Tech Stack & Architecture:**
>    - Manuver uses Vite + Vanilla ES modules + Express 5 backend with Google OAuth 2.0 and Supabase PostgreSQL.
>    - Never replace the stack, never delete existing functional code, and never overwrite working features.
> 2. **Preserve Established Brand Identity:**
>    - Background: Deep near-black / charcoal (`#0d0e12` / `#1f1f21`).
>    - Accent: Manuver Signature Orange (`--accent: #ff572f`).
>    - Ink / Text: Crisp off-white (`--ink: #f4f3f0`).
>    - Typography: `Geist`, `Geist Mono`, and `Inter`.
>    - Hero Section: Cinematic 3D spatial particles and transparent identity orb.
>    - Authenticated Workspace: Protected `/dashboard` route with minimal Linear/Vercel-inspired ergonomics.
> 3. **Application Scope:**
>    - Apply the taste and design rules below to all new pages, UI components, sections, refactorings, and interactive styling.

---

# tasteskill 2.5 — Anti-Slop Frontend Standard

Build the website a good company would ship: it says plainly what is sold, shows the real thing on
every screen, and looks made for this client, not from a template and not like an art piece.
figma.com and x.ai are the bar.

## House Rules

These nine win over everything else in this skill:

1. **No caption or description under any image, render or visual.** Licence credits go in one
   footer line.
2. **Every visual renders, never an empty ground,** at 1440, 1024, 768 and 390.
3. **One section per screen:** the hero alone on the first screen, every section exactly one or
   two screens tall at 1440x900, no second section heading peeking in. The one exception is a
   live `photo-chapters` section, three or four screens, set by the moment.
4. **Equal left and right content edges.**
5. **Hover micro-animations:** a linked card lifts 2px, a photo zooms 1.02-1.03 inside its frame,
   buttons step on hover and press on click, underlines draw, card loops cycle in 2.5-4 s, repeat
   and restart on hover. The motion layer does it; never strip or override it. No tilt, carousels
   or timed tabs. Every hero enters once on load (`data-enter`), and every page carries one dealt
   moment, two on a long page.
6. **More and better real photographs where they fit;** nicer backgrounds; better heroes, layouts
   and fonts.
7. **Real full-colour icons** (a known product's real icon, never a drawn one); small diagram
   visuals in cards (a hub with branches; one input, a main processor, three parallel lanes;
   pulses running along the lines).
8. **The big award-site scenes and creative moments are part of the skill:** every page deals its
   moments (photo- and type-led off tech), but shader effects and scenes only where the trade has a
   technical subject (tech, AI, developer tools, gaming, fintech, hardware), never on a local cafe,
   bakery, guesthouse or shop: those get photographs.
9. **Addresses:** street and district only (no street given: the district), no house number, postcode or coordinates; no register
   or VAT numbers; no phone in a real format; contacts on `.example`.

## 1. The Kind of Business Decides Everything

Declare the kind on the page (`<html data-type>` and `<meta name="page-type">`, and `<meta name="site-kind">`):

| Brief | page type | site-kind | kind |
|---|---|---|---|
| App, SaaS, AI, developer tool, fintech or banking app, a studio selling its own software (MANUVER) | software | software | software |
| A game, a studio launching its game | software | gaming | gaming |
| Hardware or a tech device (a drone, a robot arm, a keyboard) | product | tech | tech |
| Any other physical product or brand (a chair, a bike, coffee beans sold online) | product | other | product |
| People are hired: clinic, law firm, agency, creative studio, trade | service | other | service |
| People come to it: cafe, bar, bakery, restaurant, guesthouse, small hotel, shop | place | other | place |

Manuver is classified as **software / tech SaaS**. Effects, scenes, code diffs, interactive diagram cards, dark workspace aesthetic, and tech copy rules apply.

## 2. Page Structure & Composition for Tech / Software

- **Subject leads at true size:** Software UI shows what it actually works on (workflow automations, webhook logic, live dashboards, API pipes) in live HTML frames, never generic filler.
- **Card visual components:** Fragments on lit panels, pulsing connection diagrams, real icons.
- **Copy density:** 60 to 80 words per screen outside UI mocks. Punchy, clear, concrete.
- **Dealt moments:** At most one or two creative moments per page; no card moves awkwardly with scroll.
- **One object never carries the whole page:** Combine different viewpoints (system architecture, part close-ups, interactive ROI estimators, customer portals).

## 3. Checklist for Implementation

- **First screen:** Clearly says what is sold, for whom, with one hard fact. The hero fills it alone cleanly at every viewport width.
- **One section per screen:** Every section is 1 or 2 screens tall at standard viewport; section titles top-aligned; generous whitespace.
- **Equal edges:** Left and right content margins are strictly symmetrical across all breakpoints.
- **Every visual draws:** Never an empty box, missing asset, or broken image at 1440, 1024, 768, and 390.
- **No caption below images:** Clean visuals without unnecessary descriptive captions underneath.
- **Motion:** Subtle hover lifts (2px), button step and press states, smooth focus-visible rings with `--accent`.
- **Contrast & Hierarchy:** Strong typography contrast, clear heading weights (700 headings, 500 labels, 400 prose), no violet/lavender tints in brand styling.
- **Speed & Resilience:** Sub-second page rendering, no layout shifts, full keyboard accessibility.

## 4. Prohibitions ("Never")

- Never use fade-ins on every section or generic template animations.
- Never use scroll-jacking or disorienting parallax on text.
- Never use fake generic stock imagery pretending to be real software; use authentic screenshots, diagram cards, or clean interactive UI components.
- Never invent fake customer quotes or fake statistics presented as verified metrics.
- Never introduce violet or lavender colors into Manuver's identity palette.
