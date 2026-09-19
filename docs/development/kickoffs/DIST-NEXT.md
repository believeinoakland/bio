# DIST — resume here. Rewritten 2026-09-18 by the DIST standing lane, after cutting 0.59.0; amended the same day after 0.60.0.

**LIVE, MEASURED 2026-09-19 — 0.64.0 IS DEPLOYED AND IS `latest`.** On `biosmoke7`: the plane serves 0.64.0 (bytes read back
= signed `e677a6a7…`; selftest and bootstrap ok; IT BOOTED THE STORE 0.58.0 CREATED). agent-worker, pdf-worker and
ocr-worker serve 0.64.0 (bytes unchanged since 0.59.0). The UI worker `civicos` serves build `2eac184ced85` (UI-65; it was
`74cc1646044b` of 2026-08-04). `newgroup` embeds the signed 0.64.0, with bindings `[]`. `main`'s `release/` = 0.64.0
(merged `9d92dd13`, tag `v0.64.0` on the mainline), so `/update` offers it. `op=audit`: 31 checked, 10 C-18.9 = D-200,
record state since 2026-08-04, unchanged.
**Before the NEXT cut:** add `["0.64.0", "a8bc9d91eca9…"]` (the cut commit, whose `release/` holds 0.64.0) to
`migrate-released.test.mjs`'s `RELEASES`. **NEXT CUT OWED: REC-145** (c02d7f91, a §7.9 disclosure closing, IC-162), then
**REC-141 + UI-66 as a PAIR** (a plane with REC-141 refuses the old surface's project create and fork, so `civicos` moves
with it). History: 0.59.0–0.63.0 were signed, bricked existing stores, were withdrawn, and never went live; 0.64.0
supersedes them. The mechanism and the gate are in `kickoffs/DIST.md`.
**Also owed: DIST-5** (SCHEDULER, build order position 17: which record of DS-1/DS-2 is wrong, per D-297).
The 0.59.0 notes below remain true of 0.59.0.

The previous version (BOB #15, same day) stood the lane up; it is in git history. Read `CLAUDE.md`, then
`kickoffs/DIST.md`, then this. **Everything below is a POINTER measured 2026-09-18; re-measure before acting.**

## Self-wake

`CronCreate` job, every 6 h at :17, prompt *"DIST: apply WHEN DIST CUTS in kickoffs/DIST.md"*. **ARMED 2026-09-18.**
It is session-only and expires after 7 days, so re-arm (CronDelete the old one, then CronCreate) once the arm date
is 5 or more days old (BOB #15's rule), and write the new date here.

## Where things stand

- **The latest signed release is 0.59.0**: `release/RELEASE.json` on main at `c53d9d92`, annotated tag `v0.59.0` ON
  THE MAINLINE (unlike `v0.58.0`, which points at `9ed18019` off it). Plane `9efea448…`; agent-worker `a7e5f590…`,
  ocr-worker `0d99f5d0…` (+2 parts), pdf-worker `b26dee19…`. The release commit's message carries the gate evidence
  and the negative controls.
- **It closes five defects that shipped in 0.58.0**, each checked against 0.58.0's bytes: REC-123, REC-125, REC-129,
  REC-130 and **SK-7** (`op=attesttext` took the attestor from the body, `c2760e00`; no earlier list had it).
  REC-103, REC-109, MK-1 and MK-4 fixed surfaces ABSENT from 0.58.0, so they are not closings. REC-126 (the review
  copy) ships as a new read path for non-members. **Method:** grep the prior signed asset for the op/handler.
  A list of row names is only where to start.
- **DEPLOY: REQUESTED of Bob through BOB #15 on 2026-09-18, and not yet answered as of this writing.** The order is
  agent-worker first or together with the plane (IC-130), then the installer. **SUPERSEDED 2026-09-19 by the 0.64.0 deploy: see the LIVE header above.** (It read: the live plane and members are on 0.58.0.)
- REC-131 was cut as 0.60.0 (above).
- **The embed hazard is CLOSED (M-59, `483ac38a`).** `newgroup`'s embed takes only the signed, verified asset from
  `release/` and builds nothing. So in a cut, embed AFTER `release-assemble --sign`. Between the bump and the
  signature, `newgroup`'s `npm test` refuses, and that is correct.

## The cut, as run for 0.59.0 (about 45 minutes, most of it the gate)

Bump all 8 version sites (plane plus 3 members, package.json and wrangler VERSION), then `npm run build` in
`bio-plane/`, then `release-assemble --dry-run`, then `--sign` with `.env` sourced (the seed is never printed),
then the five ssh-keygen negative controls, then `npm run embed` in `newgroup/`, then `node tools/gates.mjs` on the
exact tree with the diff hashed before and after, then `newgroup`'s `npm test`, then commit, rebase, push, tag, and
verify from the remote.

## Carried and NOT re-verified

D-297 (the installer does not install fleet member bundles); five copies of the generated-embed recogniser across
five suites; tags 0.56.0 and 0.57.0 never pushed. **Disk: 6.4 GiB free on Sparky-Air at the cut, 97% used.**
