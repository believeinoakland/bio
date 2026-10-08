# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #136 (`session_01TnHJvpiiYsW7EJvVnDvfEn`), 2026-10-08 ~05:05 UTC, for BOB #137. Read `build/rulings-active.md` first; this BOB's rulings are K2124–K2148.

## Open with Bob (each waits on him; none blocks a layer)

1. **Key custody, three questions** on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (who acts if Bob is unavailable; rotation; where he keeps keys). Record his answers in his words. Re-watch the artifact from your session (`ArtifactComments` watch).
2. **The investigation engine** is the INVESTIGATION-DESIGN lane's (K2076): read its `HANDOFF.md` on `design/investigation` at takeover and each backstop (unchanged at `f53cd6ffbe`).

Bob gave this session: the biosmoke7 member-credential approval (K2131; checks pass, M-Q2 not measurable with a machine credential, K2133); "keep going after this tranche is done" (open each tranche at once, K1507); the Claude sign-in waits for the new member screens (K2147); **pre-approval of T36's close acts in BOB #136's session only (K2137)** — see Next steps 4.

## Where things stand

- **T36** on `tranche/T36`; L1–L6 and L8 closed (K2086, K2094, K2104, K2112, K2128, K2141, K2148); L7 has no T36 job.
- **L9 running:** CONFORMANCE #15 `session_017pQAZVD5PcnqYJgECFytfm` (T36-43, test only), started 05:02, START B1 posted. Merge when complete, close L9 (§5.6; no artifact is staled by tests alone, but run `fleetbundles` to confirm), then L10.
- **L10 and L11:** requirements worded (K2129, K2130); START bodies ready for L10 (`plan/starts-T36/following.txt`, `scheduler.txt`; scheduler's `file-safety` edge is in `modules.json`). L11's 16 STARTs are not yet written: write them as `starts-T36/conformance.txt` etc. were (measure with `build/plan/reading-sets.py`; job-session numbers from `grep -rhoE "<MODULE> #[0-9]+" build/plan build/rulings.md`). Shares added to L11 entries in the plan: T36-37 (reds 22–24, 26; strip `secretSha`/`bySecret` from caller bodies, K2146; release order K2126), T36-49 (red 27; explicit `citationOf` at boot, K2141), T36-52 wizard-scripts (new, K2130).
- **Accepted reds** (plan rule 5): open 1, 4, 7, 10–13, 15–20, 22–24, 26, 27; cleared 2, 3, 5, 6, 8, 9, 14, 21, 25.
- **T37** plan drafted and reviewed: `plan/draft-T37.md` (32 jobs, K2140, K2147). It becomes `current.md` at T36's close (§5.2), re-read against what T36 left; T37 opens from `tranche/T36`'s tip whether or not `main` has moved (K2137).
- **Channel:** UX-DESIGN has not read B95–B98 (S17 data share; three L11 wording questions; S17's obscuring method; K2147's sign-in screen). Answers fold into T37.
- Timers (yours to replace at takeover, delete mine by id): backstop `trig_01UK4ufh7ZhR4Ubnp9NVBAC8` (05:24), WATCH #136 `trig_01V82kBzxhH8rqN1wVzrGc7z` (06:05, into ROOT).

## Next steps, in order

1. Take over (§5.1): archive BOB #136, its `BOB-final` row under T36; arm your backstop and WATCH; re-watch TB55RC….
2. Watch L9; merge CONFORMANCE #15; close L9; start L10 (following → scheduler); close L10; start L11 (16 jobs, merge order in the plan, N711's callers before admission).
3. Alongside (§5.9): L11 START bodies before L10 closes.
4. **T36's close (§5.7).** Step 1: PR #14 (UX-DESIGN's MERGE U123) merged into `main` by `mcp__github__merge_pull_request` — on the standing list (K1177, CLAUDE.md). Steps that move `main` otherwise — the fast-forward of `main` to T36's closing commit (§5.7 (3)) and merging `dist/cut-0.81.0` into `main` (the 0.81.0 pointer, K2110) — were refused before as "Merge Without Review" (K1454, K1906), approved once (K1909), and pre-approved by Bob for **BOB #136's session only** (K2137); not on the standing list. In your session, ask Bob for the same line before acting: "Approved: at T36's close, fast-forward main to tranche/T36's closing commit, and merge dist/cut-0.81.0 into main. Standing list: not added." Meanwhile open T37 from `tranche/T36`'s tip (K2072, K2137); nothing waits.
5. Report T36 to Bob (§5.7 (5)) and ask his weekly meter reading.

## Process notes

- This session's network proxy rewrites `Authorization` for `*.believeinoakland.workers.dev`: send a live-check credential in the JSON body (K2133).
- Never `cat > file 2>/dev/null || …` without input: it waits on stdin (it hung K2147's NOTICE once).
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- A job that posts COMPLETE before reading BOB's newest entry stays open (§5.5); it usually applies the entry and posts again.
