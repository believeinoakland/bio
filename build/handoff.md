# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #135 (`session_018Kd6VZEgGZNbFHvGKz9e5d`), 2026-10-08 ~03:05 UTC, for BOB #136. Read `build/rulings-active.md` first; this BOB's rulings are K2090–K2122.

## Open with Bob (each waits on him; none blocks a layer)

1. **M-Q2 and the signed-in live checks on biosmoke7** (K2110, K2111). 0.81.0 is deployed (K2110). Looking for a member credential in BOB #135's environment was refused ("Credential Exploration", §16), not worked around. Asked of Bob in BOB #135's session: "Approved: use the biosmoke7 test member credential held in this session's environment to run the signed-in live checks and M-Q2 on biosmoke7. Standing list: not added." An approval typed there does not reach yours: ask once more in yours (§16), saying what it unlocks (rule 7 (a): T36-50 and T36-24's relay share join if M-Q2 is measured before L6's START; otherwise they stay left out, no harm). Never on the standing list.
2. **Key custody, three questions** on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (who acts if Bob is unavailable; rotation; where he keeps keys). Record his answers in his words. The artifact watch is BOB #135's: re-watch it from yours.
3. **The investigation engine** is the INVESTIGATION-DESIGN lane's (K2076): page https://claude.ai/artifact/EZoYvGdvkX2F6jNogG9vNP; read its `HANDOFF.md` on `design/investigation` at takeover and each backstop (H1 asks nothing; unchanged at `f53cd6ffbe`).

Bob gave this session: meter 34% (K2107, against 28% at the opening); S17 agreed (K2108; NOTICE B95 to UX-DESIGN, data share N757); both 0.81.0 approvals (K2109 controls 7/7; K2110 deploy).

## Where things stand

- **T36** on `tranche/T36`; L1–L4 closed (K2086, K2094, K2104, K2112). Plan `build/plan/current.md`; Status line names BOB #135 until you take over (`mail bob`).
- **L5 running** (K2112): EVENTS #4, STANDARDS #10, MONEY #3, PEOPLE #5 **merged** (K2122). Left:
  - EXPLORE #3 `session_013jCD29K2Ak5HWZGMPQjE64`: ANSWER B2 (K2122) sent: run its real-owner M-X1a arm against merged events, then COMPLETE.
  - RETRIEVAL #14 `session_013mwNsG3YAtaUow5u9nrCBL`: COMPLETE (J3) before the four merged; CHANGE B4 sent to test through the real reads, then COMPLETE again.
  - CALCULATIONS #4 `session_01JLKQ4KM6RQvEVRSy8fPJcz`: COMPLETE (J3, K2120); merges last.
  - Merge order left: explore → retrieval → calculations. Then close L5 (§5.6: the plane bundle is stale; regenerate per the manifest; archive the seven, rows from `archive_session` with each record's `Size` line).
- **L6 next** (§5.3): T36-20–T36-25 (and T36-50 only if M-Q2 is measured, rule 7 (a)). Requirements for L6 onward are NOT yet worded by BOB for T36-20+; prepare them (§5.9) as K2092 did for L4–L5 (workers draft, BOB reviews, one ruling). Rule 7 (b) is met (K2111): F1's tail joined T36-26, T36-36, T36-37.
- **Accepted reds** (plan rule 5): 1, 4, 7, 10–13, 15–21 open; 2, 3, 5, 6, 8, 9, 14 cleared. New this session: 16 (K2090), 17 (K2093), 18 (K2101, credentials' `NO_REASON` shared with progressions → N755), 19 (K2120) and 20 (K2121) to T36-31/T36-30/T36-35, 21 (K2122) to T36-23.
- **Shares added to later STARTs** (K279): T36-11's notes done; T36-34 (null keep-away read, N756 `setup.mjs`), T36-35 (securitycount route; K2092's five ops), T36-30/T36-37 (K2092's ops), T36-31 (re-pin reds 19, 20), T36-45 and T36-49 (capture's `after`, K2097), T36-23 (red 21), T36-26/T36-36/T36-37 (F1's tail). `next.md` gained N752–N759.
- **Release 0.81.0** deployed to biosmoke7 (K2110; rollback targets there). The pointer's merge of `dist/cut-0.81.0` to `main` and PR #14 (UX-DESIGN's MERGE U123, K2100) both wait for **T36's close** (§5.7 (1); `main` never moves mid-tranche). Before either act on `main`: search `build/rulings.md` (§16): pushing/fast-forwarding `main` was refused as "Merge Without Review" (K1454, K1906), approved once (K1909), not on the standing list; the design PR merge is on the standing list (K1177).
- Timers (yours to replace at takeover, delete mine by id): backstop `trig_01YUme5ow1ZqNce3LV69VRsx` (03:07), WATCH #135 `trig_01VZy3FJiGUmuiunGbWtf2eg` (into ROOT). Doorbells I armed into jobs fire once and need nothing.

## Next steps, in order

1. Take over (§5.1): archive BOB #135, its `BOB-final` row under T36; arm your backstop and WATCH; re-watch TB55RC….
2. Ask Bob for item 1 above in your session.
3. Watch L5; merge explore, retrieval, calculations (§5.5); close L5 (§5.6); start L6 (§5.3) with measured STARTs (`build/plan/reading-sets.py`, the §17 fallback as `plan/starts-T36/*.txt` word it).
4. Alongside (§5.9): L6 and L8 requirement wordings (T36-20 onward, F1's tail in publication R73, admission R20, control-plane R59) by workers, reviewed, one ruling; START bodies ready before each layer.

## Process notes

- Doorbells: batches of six or fewer; `run_once_at` the next minute or two. A job often rings BOB itself; a doorbell for an entry already handled needs nothing.
- Scripted requirement edits: assert the target text exists before writing (K2115's first edit missed silently).
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner (and the other workers) before `fleetbundles`.
- New refusal codes: no module adds a code another module's row holds (K231; K2103, K2116); check a job's new codes against the catalogue at its COMPLETE.
