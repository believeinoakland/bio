# DIST — resume here. Rewritten 2026-09-18 by the DIST standing lane, after cutting 0.59.0; amended the same day after 0.60.0.

**STOP — READ THIS FIRST (2026-09-19 01:45Z).** Releases 0.59.0 to 0.63.0 (tags `v0.59.0`..`v0.63.0`) are
signed and **BRICK AN EXISTING STORE**. #migrate runs the schema's `CREATE INDEX … inquiry_basis(content_id)` before the
additive ALTER that adds the column (REC-90, `eff23189`), so a pre-REC-90 table throws inside blockConcurrencyWhile.
Measured live when 0.62.0 was deployed on Bob's yes (wrangler tail: `no such column: content_id at offset 66`). DIST
rolled `biosmoke7` back to version `057316e4` (0.58.0; it serves, selftest and bootstrap ok) and `newgroup` back to
`f1919416`, and **withdrew `release/` on main to the signed 0.58.0** (`d86b27ea`). agent-worker, pdf-worker and
ocr-worker serve 0.62.0. The version sites read 0.63.0, so `newgroup`'s `npm test` refuses at embed until the fixed
cut, by design. `op=audit`: 10 of 31 fail C-18.9 (old INFO bundles with no provenance_chain); the baseline is UNDETERMINED.
**OWED: REC-143** (the P0 fix, rowed and running at `4b4c2e70`, integrated by CONDUCT #6), **then cut 0.64.0 and bring
a NEW deploy request.** Before cutting, confirm REC-143's suite boots a 0.58.0-shaped store built from git's bytes, and
that its negative control is this bug. 0.64.0's notes must name, since the live 0.58.0: everything 0.59.0 to 0.63.0
closed (REC-123, REC-125, REC-129, REC-130, SK-7, REC-131, REC-134, REC-138, REC-137); REC-139 (`9030b9be`) and
REC-140 when landed; the new sight and read paths (REC-126 review copy, REC-132 founder's sight); and **the conclude
change, REC-136 + UI-65** (landed together at `67c6cc09`, IC-153, I3 37.0.0).
The approval for 0.62.0 is spent.
**RULE UNTIL BOB RULES:** every installer's `/update` reads `main/release/RELEASE.json`, so pushing `release/` to main
DISTRIBUTES to existing groups. It is gated like a deploy. Cut and sign, but do not advance main's `release/` without
Bob's yes. Asked of Bob through BOB, recommending a separate pointer that DIST advances only on approval.
**Also owed: DIST-5** (SCHEDULER, QUEUE.md build order position 17: which record of DS-1/DS-2 is wrong, per D-297),
after the P0.
**0.62.0** (tag `v0.62.0`) closed REC-138. 0.61.0 closed REC-134 and carried REC-132, REC-124 and REC-133. 0.60.0 closed REC-131.
REC-136 is held off main until UI-65. The 0.59.0 notes below remain true of 0.59.0.

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
