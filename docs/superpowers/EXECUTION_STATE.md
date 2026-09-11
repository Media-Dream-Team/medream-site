# Execution State — Resume Here

**Last updated:** 2026-09-12
**Next action:** Write and execute Phase 5 (Works — Notion migration) plan via superpowers:subagent-driven-development

---

## Where We Are

The original 2026-05-22 build (referenced further down this file) is superseded — the site is
mid-way through a full redesign (new CI, new IA, new content) approved 2026-09-11.

- Spec: `docs/superpowers/specs/2026-09-11-website-redesign-ia-v2-design.md` (8 phases, 0–7)
- Plans so far: `docs/superpowers/plans/2026-09-11-phase0-design-system.md`,
  `2026-09-11-phase1-schema-nav-foundation.md`, `2026-09-11-phase2-home-rebuild.md`,
  `2026-09-12-phase3-about-rebuild.md`, `2026-09-12-phase4-services-rebuild.md`

## Phase Status

| # | Phase | Status |
|---|---|---|
| 0 | Design system (tokens, Prompt+Sarabun fonts, UI primitives, tsparticles/ScrollBackground removal) | ✅ Shipped |
| 1 | Schema + nav foundation (Milestone type, nav.json 5-item rewrite, awards/milestones populated, NavBar/MobileDrawer/Footer/LangToggle rebuilt) | ✅ Shipped |
| 2 | Home rebuild (all 9 sections, new `content/home.json`) | ✅ Shipped 2026-09-12 |
| 3 | About rebuild (origin story, vision correction, DNA cards, awards, milestones timeline) | ✅ Shipped 2026-09-12 |
| 4 | Services (4 groups, `/services/[group]` dynamic route) | ✅ Shipped 2026-09-12 |
| 5 | Works (Notion migration, `/portfolio/[slug]`) | ⬜ Not started |
| 6 | เริ่มโปรเจกต์ + FAQ (`/contact` rebuild, expanded form, central FAQ) | ⬜ Not started |
| 7 | Polish (metadata sweep, sitemap, deprecated-token cleanup) | ⬜ Not started |

Each shipped phase was executed via `superpowers:subagent-driven-development` directly on
`main` (no worktree — this repo has no PR workflow, just push-to-deploy via Vercel), with a
written plan, per-task review, and a final whole-branch review + fix wave before push.

## Open Follow-Ups (tracked in project memory too — `project_website-redesign-2026.md`)

- **Team section on `/about` is built but disabled** — `src/components/about/TeamSection.tsx`
  exists (anonymized icon+role cards) but isn't rendered in `about/page.tsx` because
  `content/team.json` still only has a placeholder entry. Once real team data exists, re-add
  `<TeamSection members={getTeamMembers()} locale={locale} />` to `about/page.tsx`.
- **DNA trait list (`Creative`/`Gamer`/`Storyteller`) is duplicated** across
  `content/home.json`'s `dream.dna` and `content/about.json`'s `dna.traits` — worth
  consolidating (e.g. into `site.json`) whenever either file is next touched.
- **Phase 5 must ship the "AI Interactive Booth" and "AR Product Launch" case studies by
  those exact names.** Phase 4's Services group FAQ (`content/services.json`, confirmed
  source copy from `medream-website-content-ia-v2.md`) already references both by name as
  real, linkable Works case studies ("ดูเคส AI Interactive Booth ในหน้า Works" /
  "ดูเคส AR Product Launch ในหน้า Works") — they're real planned cases
  (`medream-ai-brief.md` §7 lists both), not fabricated, but they don't exist on `/portfolio`
  yet. Since this repo deploys on push, treat both names existing and being linkable from
  Works as an explicit Phase 5 acceptance criterion, not just a nice-to-have.
- **Phase 6 must NOT re-author the 4 service groups' FAQ into `content/faq.json`.** The
  design spec is internally inconsistent here — §3.1 defines `ServiceGroup.faq` as an
  embedded array (what Phase 4 built), but §3.2 separately claims `content/faq.json` holds
  "all FAQ content (central 7 + the 4×3 group-specific ones)" with a `category` filter.
  Phase 4's ruling: `ServiceGroup.faq` in `content/services.json` is the single source of
  truth for the 4 groups' FAQ. `content/faq.json`'s `category` field should cover `general`
  (and any central-FAQ categorization Phase 6 needs) but must not duplicate the ~11
  group-specific Q&A pairs a second time — that would create two copies that can drift.
- **Phase 6 also inherits `ContactForm.tsx`'s pre-existing `pnpm lint` error**
  (`react-hooks/set-state-in-effect` on the `?service=` pre-fill `useEffect`, line ~29) —
  confirmed pre-dating Phase 4 (present at commit `81ff543`). Worth fixing as part of
  Phase 6's rebuild of that file rather than carrying it forward again.
- **Phase 7's metadata sweep should add dedicated `metaDescription_th/en` and
  `keywords_th/en` fields to `ServiceGroup`** (`content/services.json`). Today
  `/services/[group]`'s `generateMetadata` reuses `body_th/en` as the meta description
  (171–397 chars, well past Google's ~160-char truncation, and for `crm`/`learning` the
  snippet can lead with "no client has used this yet") and `bullets_th/en` as `keywords`
  (full sentences, not short keyword phrases) — functional today, but not ideal SEO copy.
- **Nice-to-have, not urgent:** the 4 service group ids are hardcoded in three places —
  `ServiceGroup['id']`'s union type (`src/types/content.ts`), `GROUP_IDS` in
  `src/app/[locale]/services/[group]/page.tsx`, and `staticRoutes` in `src/app/sitemap.ts`.
  Only the type is compiler-enforced. Both `generateStaticParams` and the sitemap could
  instead derive from `getServices().groups.map(g => g.id)` (`getServices()` is a sync
  `fs.readFileSync`, usable in both). Phase 5 will face the identical question for
  `/portfolio/[slug]` — worth deciding the pattern once, there or here.

## To Resume

Tell Claude: "ทำ Phase 5 ต่อเลย" (or similar) — it will read the spec's Phase 5 row (Works /
Notion migration), research the current `/portfolio` page and `content/portfolio.json`,
write a plan via `superpowers:writing-plans`, and execute it via
`superpowers:subagent-driven-development`, same as Phases 2-4.

---

## Original Pre-Redesign Build Log (historical, superseded — kept for reference only)

**Session ended:** 2026-05-22

- Spec: `docs/superpowers/specs/2026-05-22-medream-website-design.md`
- Plan: `docs/superpowers/plans/2026-05-22-medream-website.md`

This was the original 18-task scaffold-to-launch plan for the first version of the site
(Midnight/Royal Blue/Dawn Gold theme). All 18 tasks from that plan completed and shipped
before the 2026-09-11 redesign decision superseded its design system and IA sections.

### Key Decisions (from the original spec, now partly superseded)

- **Stack:** Next.js App Router, Tailwind v4, next-intl (th/en), googleapis — still current.
- **Font/Colors:** LINE Seed Sans TH / Midnight-Royal Blue-Dawn Gold — **superseded by Phase 0**
  (Prompt+Sarabun, new navy/blue/first-light palette).
- **Content:** JSON files in `content/` — edit + git push → Vercel auto-redeploys. Still current.
- **Contact form:** Google Sheets via service account — still current.
- **i18n:** Thai default, English alternate, `[locale]` route segment — still current.
- **Hidden pages:** `/team/[slug]` — no nav link, direct URL only — still current, unchanged
  by the redesign (see design spec §5 routing table: "No change").
