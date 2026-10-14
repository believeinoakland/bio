# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #180 (`session_013HsjLAT8oD9YQsRaLxRHNQ`, depth 1, parent ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1`), 2026-10-14 ~23:25 UTC, at ~29% context, **T49 L11 running**. Read `build/rulings-active.md` whole first; K3368–K3378 are this session's rulings (read them in `build/rulings.md`).

## Where things stand

- **T49 L11 is running** on `tranche/T49`: all 20 jobs started 22:57Z (addresses in `build/plan/current.md`'s Jobs line). The words move is in: PR #39's branch merged into the tranche at `fa3c8b7e8e` (K3368) and again at `dc267da296` (K3374; DEC-259–DEC-261, 11,823 words; every module's `reads` in `docs/development/ux-substrate/screens/words-reads.json`). setup-words provides `word(key, vars)` and `hasWord` and generates `rows.mjs` from `words.json` (R10–R13; regenerate with `node bio-plane/src/setup-words/build.mjs`, a manifest artifact). Each reading L11 module has one words id (plan rule 6).
- **Merged:** op-capabilities (K3370), setup-words and interface-assets (K3371), op-grades and affordances (K3375).
- **Complete, waiting to merge** (in plan rule 1's order): **control-plane** (waits on op-declarations), **screens-intake** and **screens-investigate** (wait on interface-shell, plan rule 1; screens-investigate must re-run against real setup-words first).
- **Sent back:** plane (K3372, its B4: build R56 against the real setup-words, then COMPLETE again; merges after control-plane).
- **Running/waiting:** op-declarations (re-pinning `ACT_HELP_ABSENT` after affordances' merge, B5), admission, **interface-shell (R71, R72: push early; four screen jobs wait on R72's interim `RE_POINTS` for the stale registry, K3373)**, screens-entry (waits on op-declarations and interface-shell, then CHANGE it), screens-settings, -daily, -inquiry, -publish, -action, site (generating its pages with DEC-261's keys), journey-check (last).
- **Merge order:** setup-words ✓, op-capabilities ✓, op-grades ✓, affordances ✓, op-declarations, admission, interface-assets ✓, interface-shell, then the screens (screens-inquiry after screens-settings), control-plane after op-declarations, plane after control-plane, site, journey-check last. After each merge, CHANGE every job that waits on it (they build against stand-ins until then).
- **Accepted reds** (plan rule 5, now with (10)): membership R83 `MODULE_ORDER` until N1115; setup-words R13 on `refusal.TEMPLATE_BLANK_UNKNOWN`'s literal `{{name}}` until the design rewords it (K3374); op-declarations R34 partition until its merge; screens-action's R7 on two "subject" words until the design corrects them (K3373); the plane bundle until the close.
- **Channel:** UX-DESIGN read through U262. Open questions of mine there: B220 (unfillable placeholders, N1120), B222 (more L11 words), B223 (the `{{name}}` word), B224 (setup's `admin` word; affordances N1125). None blocks L11. Lanes: investigation H43, actions H31, unchanged.
- **T50 entries added this session:** N1116 (every module by key; DEC-260 delivered), N1117–N1127 (providers closed in T49; registry re-take N1122).
- **Timers:** WATCH #180 `trig_01NoWw9WD9mJ7YkdUJ2Nv8aA` (into ROOT, 23:45Z); backstop re-armed at handoff. Delete both at takeover; arm your own.

## What comes next, in order

1. **Take over** (§5.1); archive BOB #180, write its BOB-final row under T49.
2. **Run L11** (§5.4, §5.5): read every job's mailbox; merge each complete job in the order above (ownership check; strike its marks; a ruling); CHANGE its waiters; drop `SCREEN_WORDS` Provides lines at each screen's merge (BOB's wording, K3373). Fill `paths`/`tests` for any new module from its COMPLETE (site's done).
3. **Close L11** (§5.6): regenerate the manifest's artifacts (setup-words' `rows.mjs` and site's `pages.mjs` first with `program.mjs` and `court-data.mjs`, then bundles, then newgroup), `checks/run.mjs`, archive the 20 sessions with their rows.
4. **Close T49** (§5.7, `current.md` "BOB's acts"): merge `main` if it moved; the tranche PR carries PR #39 (its later commits after `dc267da296`, if any, ride PR #39 itself); release cut, N780 images, biosmoke8 installed, biosmoke7 removed, journey-check R12 live by subscription, BOB's own live walk as administrator and member, then "ready" to Bob; the site to `workers.dev`.

## Acts on main or sessions (reviewed acts, §5.8)

- T49's close: PR `tranche/T49` → `main` with the GitHub merge tool, method merge (§5.7 (3), K2273); no refusal recorded.
- Design-branch merges into `tranche/T49` (K3366 (5), K3368, K3374), never `main` mid-tranche; no refusal recorded.
- Deploys and Cloudflare removals (biosmoke8, biosmoke7, the site's Worker): Bob's approval in session each time (K1715). The live subscription sign-in needs Bob to enter its code once.

## Open with Bob

- The stewards' published rule text (Publication §5E, DEC-255): Bob approves it through the design lane.
- The stewards' contact address (N923); translations (N670's R88); civicsmith.org's DNS and email (after the site is proven); the records-request template's reviewer (N858).
