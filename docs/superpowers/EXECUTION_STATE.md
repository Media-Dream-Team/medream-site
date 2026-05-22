# Execution State — Resume Here

**Session ended:** 2026-05-22  
**Next action:** Execute implementation plan via Subagent-Driven Development

---

## Where We Are

Brainstorming + design + plan are **complete and committed**.

- Spec: `docs/superpowers/specs/2026-05-22-medream-website-design.md`
- Plan: `docs/superpowers/plans/2026-05-22-medream-website.md`

**Task 1 (Scaffold Next.js 15) has NOT been started yet.**

---

## To Resume

Tell Claude:

> "Resume building the MeDream website. Repo is at /Users/bank/Documents/works/medream-site. The plan is at docs/superpowers/plans/2026-05-22-medream-website.md. Use subagent-driven development starting at Task 1."

---

## Plan Summary (18 Tasks)

| # | Task | Status |
|---|---|---|
| 1 | Scaffold Next.js 15 (create-next-app + install next-intl, tsparticles, googleapis) | ⬜ Not started |
| 2 | Brand foundation (globals.css, @font-face LINE Seed Sans TH, Tailwind @theme brand tokens, logo assets) | ⬜ |
| 3 | TypeScript content types (src/types/content.ts) | ⬜ |
| 4 | Placeholder content JSON files (content/*.json) | ⬜ |
| 5 | Content loader library (src/lib/content.ts) | ⬜ |
| 6 | i18n setup — next-intl (routing, middleware, messages/th.json, messages/en.json) | ⬜ |
| 7 | NavBar + MobileDrawer + LangToggle | ⬜ |
| 8 | Footer | ⬜ |
| 9 | Root layout ([locale]/layout.tsx) | ⬜ |
| 10 | Hero Section (tsparticles, dawn glow, CTA buttons) | ⬜ |
| 11 | WhoWeAre + Services + PortfolioHighlight sections | ⬜ |
| 12 | Awards + WayOfWork + FaqPreview sections | ⬜ |
| 13 | ContactForm + Google Sheets API route | ⬜ |
| 14 | Homepage assembly ([locale]/page.tsx) | ⬜ |
| 15 | About, Services, Portfolio pages | ⬜ |
| 16 | Team, Blog, FAQ, Careers, Contact pages | ⬜ |
| 17 | SEO + next-sitemap + robots.txt | ⬜ |
| 18 | Vercel deployment config + README | ⬜ |

---

## Key Decisions (from spec)

- **Stack:** Next.js 15 App Router, Tailwind v4, next-intl (th/en), tsparticles slim, googleapis
- **Font:** LINE Seed Sans TH — WOFF2 already in `public/fonts/`
- **Colors:** Midnight #060A14, Royal Blue #1740B0, Electric #3D6EE8, Dawn Gold #ECC842, Dream Cream #FBF4E0
- **Content:** JSON files in `content/` — edit + git push → Vercel auto-redeploys
- **Contact form:** Google Sheets via service account (env vars: GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_SHEET_ID)
- **i18n:** Thai default, English alternate, `[locale]` route segment
- **Hidden pages:** `/team/[slug]` — no nav link, direct URL only
- **Breakpoints:** mobile (<768), tablet (768-1024), tablet-lg (1024-1280), desktop (>1280)

---

## Assets Already in Repo

- `public/fonts/` — LINE Seed Sans TH WOFF2 (5 weights)
- Logo source: `~/Downloads/MeDream Website/images/image3.png` (color), `image4.png` (black), `image2.png` (white)
  → copy to `public/images/logo/logo-color.png`, `logo-black.png`, `logo-white.png` (done in Task 2)
