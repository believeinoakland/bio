# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #169 (`session_01WHadBcf98Q1dkksrNT5q1m`, secondary account, depth 1), 2026-10-14 ~07:15 UTC, at about 62% context, during T47's close with no step half done. Read `build/rulings-active.md` whole first; K3156–K3187 are this session's rulings (grep them in `build/rulings.md`).

## Where things stand

- **T47: every entry merged; L11 closed** (K3180; sessions archived and rows written, K3181, K3185's JOURNEY-CHECK #2 row too). Artifacts regenerated and verified at L11's close (plane bundle; fleetbundles, newgroup-fresh 0 fail). `run.mjs`: architecture, coverage (5198/5198), channels 0; format 2 = setup-page's emptied `paths`/`tests`, accepted by name until its row is dropped at T48's opening (K3177).
- **§5.7 step 1 done** (K3182): PR #33 merged into `main` (82d0e5b484), `main` merged into tranche/T47.
- **The regression** (K2704 on GitHub, since a container restart kills local runs): run 38522006895 on tranche/T47 @ 23d7bcc6e3, started 06:24, limit 120 min. The previous run hung on journey-check's open handles (K3184): fixed (CI installs journey-check's lock and Chromium; journey-check disposes on every path, K3185). **Next:** read its result (`actions_list` / `get_job_logs`); its module-tests summary is in the job log. Reds accepted by name: membership's 6 (N1014), the setup-page format pair; compare every other red against `build/plan/draft-T47-outcome.md` ("Accepted reds") and route or fix before the PR.
- **Draft outcome:** `build/plan/draft-T47-outcome.md` (all 94 entries merged; parts deferred: N1046, N1015, N1039; usage 3.26 B tokens over 100 rows, recount with the later rows).

## What comes next, in order

1. **Take over** (§5.1), archive BOB #169, write its BOB-final row in `build/metrics/T47.csv`.
2. **T47's close, §5.7 steps 2–6:** archive the plan as `archive/T47.md` with the outcome (from the draft) and usage, Status `CLOSING`; PR `tranche/T47` → `main` merged with the GitHub merge tool, method merge (§5.7 (3); CLAUDE.md standing direction; standing list `mcp__github__merge_pull_request`); delete the backstop and `WATCH`; ask Bob's meter and report T47 to him in plain words (elapsed since T47 opened, work finished, deferred, left, cost).
3. **Then PR #34** (UX-DESIGN's U215 MERGE: DEC-227 and the T48 word file, `docs/development/` only) into `main` at the boundary, before T48 is cut (K3186). Mark it ready first (precedent K3023, K3182).
4. **Release 0.84.0** from T47 (0.83.0 was T46's): Bob wants to install, set up, add a member and investigate (K3183's thread). Before telling Bob it is ready: sign in as administrator and as member and look at every screen (K3052). Each deploy (plane to `biosmoke7`, the installer) is Bob's approval in session (K1715). The installer's OAuth client scopes are registered (K3159). civicsmith.org is not yet live (Bob's DNS and email); point Bob at `newgroup.believeinoakland.workers.dev`.
5. **Open T48 at once** (§5.2) from `build/plan/draft-T48-plan.md` + `draft-T48-fold.md` (N1026–N1047 folded by a worker, unreviewed; job count ~65) + N1048–N1051, N847 (DEC-227), and `draft-T48-reqs-n880-n882-n670.md` (worker draft, unreviewed; re-read in whole the modules it read in part: skills, agent-worker, instance-setup, plane). Settle the fold's open points (N1047's check in scheduler or plane; N1033's owner; N1036's providers; T48-6 vs T47-93). `updatelater`'s spans are BOB's (DEC-226: two weeks; next day for a security fix). The opening act (rule 3) drops setup-page's row.

## Open with Bob

- **How a translation reaches Civicsmith** (N670's offering half): A an address he names (recommended; the stewards review and ship accepted ones in a release), B a receiving service, C not yet. Reading in one's language joins T48 either way.
- **civicsmith.org's DNS and email** (he said "this week", K3060 D14): gives the site (N1011), the stewards' address (K2799) and, with A, the translations address. Offer to walk him through it.
- **The reviewer for the records-request template** (N858, K3081).
- **N933** (a stake per matter): he was given a prompt to paste into ACTIONS-DESIGN (primary account); read its `HANDOFF.md` on `design/actions` for the answer.
- **Timers:** backstop `trig_014CJxp525X6StYKnL8w4yaC` (07:40, into this session) and `WATCH #169` `trig_01PEUygzNQAmrujMMiZRHxrM` (into ROOT #6, 08:20): delete both at takeover and arm your own.
