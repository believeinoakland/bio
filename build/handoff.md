# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #319 (`session_018Bhced5gpDxaidQNabEbp6`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #320, 2026-10-27 ~12:20Z, at 38 % of its window; no step half done, **no job live**. **T52 is OPEN** on `tranche/T52` (the beta, K5257), round R1: **layers 1, 2, 3, 5 closed** (every job merged and archived), **layer 6 next**, then 8, 9, 10, 11 (4 and 7 have no entries), then the **completion round** (T52-100 file-scanner, T52-103 file-safety), then R2. Read whole: K5377, K5394, K5397, K5401 (`build/rulings.md`), then `build/plan/current.md` (R1's plan) and `build/plan/req-ahead-T52.md`.

## Bob's direction now

- T52 is the beta with all of its requirements (K5257). Merges and every repository act are BOB's, never asked of Bob; his one development act is approving a GitHub release (K5346). Releases: K5293. Code and test deploys: K5120.
- Every ruling of BOB's goes through `proc ruling --line-file <f> [--files …]` (K5351). The line file is ONE line: `<module or layer> · <ruling> · <why>`. `--files` commits only tracked files (`git add` a new file first). Write the file change BEFORE the ruling call (K5389 slipped).

## Waiting on Bob (asked earlier; do not ask again)

- The tests' rethink, A or B (K5258, K5313): https://claude.ai/artifact/NxCe76s3zv5gtBJFiCReCd. When he answers A: the sweep is a §5.10 mechanical pass while no job runs (between layers), `proc tests` for its run. The 89 fixtures findings wait on it.
- civicsmith.org listed by search engines (BOB #317's question).
- Through UX-DESIGN, Bob holds A1-A8 (C-K2 a question's subject, C-K6 where a team states its fiscal year, B-K19 the source link, DS9 photographs, DS23 Capture and the publish gate, DS24 signing-key items, DS25 pickers across projects, A8 C-M2). His answers come back as DECs.

## Next, in order

1. **Layer 6** (`situations/layer.md`): BOB's act 1 first, the requirement lines its entries change, written into the requirement files right before `proc layer start` (never earlier: a live id with no test fails the coverage check at the earlier layer's close, K5377; lines ruled ahead wait in `build/plan/req-ahead-T52.md`): inquiry T52-20 (C-2.8's refusal names the ground), citation T52-21 (W11: remove/move one passage, not the document edge), contradiction T52-22 (`candidatesFor` publishes `flagged_by`); agent-worker T52-102 (settle the batch-run red first) needs none. Then `get_session` for `rate_limit_info.status`, `proc layer start --tranche T52 --layer 6 --usage <status>`, each `create_session` exactly as printed (model `claude-sonnet-5-5`; haiku only for test-only, wording-only or mechanical re-points), `proc job started`.
2. **Merge order** is `modules.json` order, upstream first (K1965); promotion's stamp last in its layer. Hold a COMPLETE job whose upstream is still running.
3. **Recurring job fault (process):** jobs set their own record to WAITING after COMPLETE (PDF-PIXELS K5366, membership, entities): `proc merge` and `proc layer close` refuse. Tell the job to run `proc job complete` again and leave it COMPLETE. Also `proc layer start` re-run to add a job re-prints `message` acts for jobs already running with unchanged STARTs: do not re-send them; clear each with `proc job messaged`. Both are process faults for a process lane (P3), not yet raised.
4. **A job that changes a provided service** runs its users' suites scoped to the users the change can reach (never all 21 of money's; K5339), names the new id in its tests, and you carry the change to the users (P5). Fold every requirement wording a job proposes yourself (K3268).
5. **DEC-449 + DEC-450 held** (U493, U494, `2ac5195725`; K5396, K5397): merged alone they turn file-safety R24 red (`words-reads.json`'s file-safety reads lack `refusal.SIGNATURES_RUN_UNDER_WAY`). B549 asked UX-DESIGN for one MERGE at a new tip with the key listed. When it comes: merge it at a layer close (no job running), drop the key from `STAND_INS` in `bio-plane/test/m/file-safety/rows.test.mjs:115` as a mechanical pass (P7: file-safety's suite and the checks before the commit; a ruling naming file-safety), regenerate the artifacts in the manifest's order (the commands in `build/manifest.md`; a design merge is by hand: `proc history --ref <commit>` first; the site build needs `main` deepened, `git fetch --depth=2000 origin main`), verify each, run the checks. Then T52-103 is done; strike it from the completion round.
6. **Completion round** (after layer 11): T52-100 file-scanner R36 (parked in `req-ahead-T52.md`; write it into `file-scanner.md` at the round's START), T52-103 if not done by step 5. Out-of-layer jobs outside a release fix round need Bob's approval (K1548); the completion round is P10's own and needs none.
7. **P18 alongside:** `build/plan/draft-T52-N1260-requirements.md` (a reading worker's draft, 45 KB; not yet reviewed by BOB): review it whole with DEC-447 (merged, K5394) and write N1260's lines for R2; then N1259, N1257, N1266/N1267 (Bob's study first, K4632), N1273, as R1's "Left out" names them.
8. After R1's last layer and the completion round: R2 from what R1 left; T52's redeploy and the measuring walk (R1 header, act 7); then check the live file-scanner image carries `plainPackage` and capture `9dce360a…` renders (T52-100).

## State worth knowing

- UX-DESIGN #42 `session_018BhcedaAqFXn43yDDqk4vj` read through B548 (B549 just sent and rung). Its branch shows a handover commit to UX design #43 (`aa5fa97409`); B549 asked whether to start #43 (K5295: BOB starts each successor from its NEXT-SESSION-PROMPT, never asking Bob). Its own check-in routine `trig_01Pd92gdUA23hNwBCkQTKXAm` is its, not yours.
- Lanes at 12:15Z: JOURNEYS (W4), AI-DESIGN (A41), INVESTIGATION-DESIGN (H43), PERFORMANCE (from P27, none): nothing new.
- U5's bytes: capture `9dce360a…` is in R2 bucket `bio-captures` (key `bio/captures/<sha>`) on our account; committing them was refused by auto mode (data exfiltration; K5379): never retry.
- My backstop `trig_019NGZSc2akqRMkSmUhvtYyy` (12:29Z) stays until your takeover shows; delete every routine into my session at takeover.
- `rulings-active.md` is about 11 KB of its 25 KB; nothing was added to it this session.
