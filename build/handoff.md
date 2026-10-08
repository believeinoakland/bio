# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #139 (`session_016oKjUAn88dFdM5zvpXMqy4`), 2026-10-08 ~11:25 UTC, for BOB #140. Read `build/rulings-active.md` first; this BOB's rulings are K2196–K2224 (and K2225, this handoff).

## Open with Bob (each waits on him; none blocks the work)

All on one rendered page, https://claude.ai/artifact/TuYfyFijT6SayH1mBqSM21 ("T37 Questions for Bob", version 2, republished by BOB #139); re-watch it from your session (`ArtifactComments` watch) and point Bob at it.
1. **T36's close, step (3)** (§5.7 (3), §16). Fast-forwarding `main` to `tranche/T36`'s tip (`ceec200633`) and merging `dist/cut-0.81.0` into `main` were refused before as "Merge Without Review" (K1454, K1906), approved once (K1909), pre-approved for BOB #136's session only (K2137); not on the standing list. Asked by BOB #138 (K2171) and BOB #139 in their sessions; no answer. Ask again in **your** session: "Approved: at T36's close, fast-forward main to tranche/T36's tip, and merge dist/cut-0.81.0 into main. Standing list: not added." Then record the approval (§16 form) and act; `archive/T36.md` stays `CLOSING` until `main` is at it. At T37's close the same act recurs for `tranche/T37` (and PR #15, below).
2. **Wizard library version 2** (wizard-scripts R22; plan "For BOB" 1): recommendation approve all four. Needed before L11's START (T37-25's START says version 2 only for the scripts approved by then; else version 1 and red 7 stays).
3. **Photo metadata** (N779; For BOB 2): recommendation B. Not in T37 (N779 in `next.md`).
4. **A member's own Claude sign-in persistence** (new, on the page as question 4; K2200 (8)): Cloudflare Containers' disk is fresh after each sleep, so the stored sign-in lasts only while the instance is awake. Options A accept / B keep awake (money) / C snapshot (a copy, U-7 (c)); recommendation A now, decide at M-Q2.
5. **Key custody**, three questions on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (no comments as of 11:25). Re-watch it.
6. **Weekly meter reading**, asked; the platform shows a 7-day usage *warning* on the account since ~10:00 (K1820's 90% rule applies when Bob reports it).

## Where things stand

- **T37** on `tranche/T37` (`main` @ `e08cd35ecb` untouched). L1–L6 closed (L4 K2198, L5 K2209, L6 K2219), rows in `metrics/T37.csv`. L7 has no entries.
- **L8 running** (K2221, started 11:06), nine jobs; addresses in the plan's Jobs line. State at 11:25:
  - merged: CASE-GRAMMAR #10 (K2224);
  - COMPLETE, waiting to merge in order: RATIFICATION #21 (J2; merges after publication and public-read), CASE-DISCLOSURES #5 (J1; needs case-carriage merged first; it read B2 = merge case-grammar);
  - CASE-CARRIAGE #4: told B3 (11:23) to merge the tranche and complete; **merge it next**, then send CHANGE ("case-carriage merged: merge the tranche") to PUBLICATION #24 (waiting, J2), CASE-DISCLOSURES #5, and RESUME to CASE-AUTHORING #21 (waiting, J1, K2223) once case-disclosures is merged;
  - CASE-CHECKER #8 (B2: merge case-grammar, finish), PUBLIC-READ #15 (B2/B3: the `heldMaterialsOf` fix, K2223; writes `/3`), REVIEW #10 (running its whole `test/m` until ~11:54).
  - L8 merge order: case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review. Reds 18 (case-checker `program.mjs`, cleared at L8's close) and 19 (control-plane `statementack.test.mjs`:31 until T37-33).
  - Case-carriage's REPORTs due at its COMPLETE: the composition root must pass `deps.bucket`/`deps.store` (K2222); answer-envelope must register family C-141. Route each (§7): its owner's job if running (L11's store-door/control-plane/plane have entries; answer-envelope has none in T37 → `next.md`).
- **Prepared and committed:** L9–L11 wording and STARTs (K2212, K2216): conformance, filing-templates, scheduler (L9–L10); wizard-scripts, op-grades, affordances, notice-producers, instance-setup, op-declarations, store-door, control-plane, setup-page, plane (L11). The plan's lines carry each K.
- **Reds:** plan rule 6 items 1–20 (new: 18, 19 at K2206; 20 bundler `fleetbundles.test.mjs`:232, K2218 → N787).
- **Channel:** UX-DESIGN's U129–U132 read (K2220): DEC-183 (Photos gate, `obscuremarkwithdraw`) folds in T38 as N788; **U132 MERGE: PR #15** is merged into `main` at T37's close (§5.7 (1); `mcp__github__merge_pull_request`, standing list, K1177). B105 ACK posted. INVESTIGATION-DESIGN `HANDOFF.md` unchanged at `f53cd6ffbe`.
- **`next.md` (T38) new:** N785 (sign-in's use: credentials, agent-model, agent-worker), N786 (extraction `paras` on migration), N787 (bundler re-pin), N788 (DEC-183).
- **Timers** (delete mine by id at takeover): backstop `trig_01T2CKK9TrW1Z1hNW1XHaGkH` (next 11:28; re-arm while your start is pending), WATCH #139 `trig_01MLGRZCqGtfqVHkuxiiXZSH` (12:08, into ROOT). Artifacts watched by my session: the two pages above.

## Next steps, in order

1. Take over (§5.1): archive BOB #139, its `BOB-final` row under T37; arm your backstop and WATCH; re-watch both pages.
2. Ask Bob for the T36 close line (Open with Bob 1) and point him at the questions page.
3. Watch L8 (§5.4); merge each job in order (§5.5); close L8 (§5.6: regenerate in the manifest's order — `program.mjs` first — `fleetbundles` expects red 20 only; checks; archive; rows); start L9 (conformance; then L10 filing-templates, scheduler — check `modules.json` layers), then L11 from the committed STARTs (T37-25's START reads Bob's wizard answer at that moment).
4. At T37's close (§5.7): merge PR #15 (U132), merge `main` into the tranche, archive, fast-forward `main` (needs Bob's approval in your session, as item 1), then open T38 from `next.md`.

## Process notes

- Layer closes regenerate in place; while a worker edits the main checkout, merge in a `git worktree` (`/home/user/bio-merge` exists; reset it to `origin/tranche/T37` before use) and run `mail.mjs` only in the main checkout (it refuses another branch).
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- The red census read `test/m` only: suites under a module's own `test/` (agent-worker's, reading-pipeline's legacy paths) can hold unnamed reds; a job finding one fixes its own (K2217).
