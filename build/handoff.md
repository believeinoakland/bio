# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #137 (`session_018V5fijKpqARwKVEdf1W9Ce`), 2026-10-08 ~07:25 UTC, for BOB #138. Read `build/rulings-active.md` first; this BOB's rulings are K2150–K2170.

## Open with Bob (each waits on him; none blocks the work)

1. **T36's close, step (3)** (§5.7 (3), §16). Fast-forwarding `main` to `tranche/T36`'s closing commit and merging `dist/cut-0.81.0` into `main` were refused before as "Merge Without Review" (K1454, K1906), approved once (K1909), pre-approved for BOB #136's session only (K2137); not on the standing list. BOB #137 did not take them (no approval in its session). Ask Bob in **your** session for: "Approved: at T36's close, fast-forward main to tranche/T36's closing commit, and merge dist/cut-0.81.0 into main. Standing list: not added." Then record the approval ruling (§16 form), act, and `archive/T36.md`'s Status stays `CLOSING` until `main` is at it. Note: `tranche/T36` will have moved past the CLOSING commit by your T37 opening commits only if you write them there; open T37 on `tranche/T37` (below) so `tranche/T36`'s tip stays the closing commit `9ecf2156bd` plus this handoff's commit.
2. **Key custody, three questions** on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (unanswered; no comments). Re-watch it from your session (`ArtifactComments` watch).
3. **Weekly meter reading** for T36's close and T37's opening (§5.2 (3), §5.7 (5)); asked by BOB #137 in its T36 report.

## Where things stand

- **T36 is closed but for step (3).** All 11 layers merged (L7 had no job); K2168 closed L11; K2169: PR #14 (design stream, U123) marked ready and merged into `main` (`e08cd35ecb`) under the standing list (K1177, K1261, as K2068), `main` merged into `tranche/T36` (no conflict), `current.md` archived as `plan/archive/T36.md` (`CLOSING`, outcome and usage written). Checks: format, architecture, coverage 4,211/4,211, channels 0 failures; `fleetbundles`, `newgroup-bundle-fresh` 1/0. T36 reported to Bob (K2170).
- **Reds still open** (in `archive/T36.md`'s rule 5, each with its owner): 4 (row census → T37-7), 7 (UI DEC-88, Bob's), 15 (release cut only, N750), 16 (progressions → T37-12), 18 (`NO_REASON` → N755), 31 (plane `release.test` R19 → N775: the design library's new version, now on `main` via PR #14, carried by wizard-scripts with Bob's version approval, R22).
- **T37 is ready to open:** `plan/draft-T37.md` (37 jobs; L1 5, L2 2, L3 3, L4 2, L5 4, L6 4, L8 6, L9 2, L10 1, L11 8), `next.md` N748–N778. Added this session: N769–N778 (K2150, K2153, K2155, K2159–K2161), T37-34 (case-carriage), T37-35 (standards R43), T37-36 (conformance), T37-37 (acquisition), T37-38 (capture), and shares in T37-3, T37-5, T37-8, T37-24, T37-26, T37-27, T37-28.
- **Now on `main` from PR #14, to fold at T37's opening:** DEC-180 (N757), DEC-181 and DEC-182 (N776: op-grades R26, affordances' `ACT_HELP` from the new `mock-acts.js`, op-declarations R34), DEC-182's `assistantset` removal from the library (N775, needs Bob's version approval: ask him with the opening, P17 UX/policy), DEC-179's `words.json` (N669, N670).
- **Release notes for the next installer deploy** (K2164): register `connectivity-directory.bind` on the OAuth client (`newgroup/DEPLOY.md` §4); R43's two real public lines wait for Bob's signer sitting. File-scanner's images are on `ghcr.io`, not pullable by Containers (N773, T37-5).
- **Channel:** UX-DESIGN read through B101; my cursor U128; nothing owed either way. INVESTIGATION-DESIGN's `HANDOFF.md` unchanged at `f53cd6ffbe`.
- Timers (delete mine by id at takeover): backstop `trig_01Cx3uL9ahYvk1BRmtPrt3kn` (07:29, re-arm while your start is pending), WATCH #137 `trig_014YUQPJncycWRPyoLy9cWyH` (07:47, into ROOT).

## Next steps, in order

1. Take over (§5.1): archive BOB #137, its `BOB-final` row under T36; arm your backstop and WATCH; re-watch TB55RC….
2. Ask Bob for the T36 close line above (Open with Bob 1); act when given.
3. **Open T37 (§5.2) at once** from `tranche/T36`'s tip (K2072, K2137: not waiting on `main`): create `tranche/T37`; re-read `draft-T37.md` against `archive/T36.md`'s open reds and `next.md`; fold PR #14's DECs (above); legacy census; re-read the terms register entries live (rulings-active §3); measure L1's reading sets (`build/plan/reading-sets.py`); write L1's STARTs; `draft-T37.md` → `current.md`, new `next.md`; tell Bob in one line; start L1.
4. Alongside (§5.9): L2's STARTs before L1 closes.

## Process notes

- Merge a design-stream PR that is a draft by marking it ready first (`update_pull_request` `draft: false`), then `merge_pull_request` with the head pinned (K2068, K2169).
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- `mail.mjs addjob --name` needs a literal space (`"<MODULE> #k"`).
- A layer's start instructions written by a worker need BOB's review for: `modules.json` edges BOB must add at START, requirements' Uses lines not yet folded, and plan text superseded by later rulings (K2152).
