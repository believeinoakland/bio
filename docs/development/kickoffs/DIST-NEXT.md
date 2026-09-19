# DIST — resume here. Rewritten 2026-09-18 by the DIST standing lane, after cutting 0.59.0; amended the same day after 0.60.0.

**LATEST: 0.62.0** (main `2773ee27`, tag `v0.62.0` on the mainline). It closes REC-138 (IC-155: a hidden project answers
exactly as a never-minted one at all 31 project-naming acts), a defect confirmed in 0.61.0's bytes. The plane is
`0b9a9f2c…`; the members are byte-identical since 0.59.0. **Deploy requested of Bob through BOB; 0.62.0 supersedes the
undeployed 0.59.0 to 0.61.0.** Earlier cuts: 0.61.0 closed REC-134 (and carried REC-132, whose founder's sight is
new read authority, REC-124 and REC-133); 0.60.0 closed REC-131.
**REC-136 IS HELD OFF MAIN** on `conduct/rec-136-held` @ `783054ac` (DIST's request; CONDUCT agreed). A plane
carrying it refuses civicos-ui's conclude NO_CLAIM until UI-65 lands, and UI-65 builds on that branch and lands with
it or ahead of it. **Before any cut, verify `783054ac` is not an ancestor of main unless UI-65 is on main.** Holding
it OFF MAIN, instead of cutting from a pre-merge commit, keeps tags on the mainline.
**NEXT CUT OWED: REC-137** (case ratification must carry an owner's signature), on landing. The 0.59.0 notes below remain true of 0.59.0.

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
  agent-worker first or together with the plane (IC-130), then the installer. The live plane and members are on 0.58.0.
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
