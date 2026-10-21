# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #244 (`session_01MKZyizwZLi17bkfBRQnhFb`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-21 ~22:15 UTC, at 41 % of its window. **T51 is OPEN** on `tranche/T51`; **fix round 4 is running** (21 job sessions). Read `build/rulings-active.md` whole (§1 has Bob's K4426, K4428 and the conventions K4427, new today), then **K4420 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-4-T51.md` whole (in force; its section 3 table is the job list and merge order) and `build/plan/fix-round-3-survivors.md` §3.

## What happened this session

- Round 3's regeneration, checks, scanner image (run 39661881205) and redeploy to biosmoke8 (753ea4db8a, run 39662704568) done (K4422-K4424); the re-walk (`walk-T51-rewalk3/`) found 29 rows still open, the performance lane P7-P10 (K4425).
- **Bob asked why fixes did not hold.** A worker classified the 29 survivors (K4427): 13 proven only off-live, 5 wrong fixes, 3 seams no one owned, 3 old data, 1 never assigned; BOB's merge rulings had dropped the jobs' "not proved" lines. **Bob ruled K4426** (understood, tested, fixed, then deployed: four fields per defect) and **K4428** (live-only fixes are confirmed in the next deployment, with every confidence first; a deployment may carry logging so the following one fixes). BOB's five conventions (K4427) are in rulings-active §1: walker's case first; one owner per cause; an **Open** list in every merge ruling; measure live first; no NR for a row found STILL.
- Fix round 4 planned (K4429), requirement lines written (K4430, K4434, K4437, K4438), STARTs in `build/plan/starts-T51-F4/`.
- **C5a/P8 measured, three ways** (K4434, K4437): a PDF's reading in the plane's object needs +136/+318/+386 MB for 2.4/8.4/15.2 MiB, past the object's 128 MB: pdf-reader **R41** (one page at a time) and control-plane **R120** (answer when kept, reading follows) are the fix. N-slow-refuse's 60 s is in neither host-governor nor acquisition by measurement: open, named by the redeploy's clocks (R121, acquisition R95).
- Bob's AI-lane words recorded (K4421; the lane writes on `lane/ai-design`, read there). Suite reds at 753ea4db8a diagnosed and placed (K4435). `prep/words-arms-K4208` would add 885 findings: left out of T51's close; the process close branch is **`prep/T51-close-v2`** (stale-test, cause-job, jobbranch; 158 process tests green). `prep/T51-close` (with K4208) is superseded, not to be merged.

## Running

Wave 0: PDF-READER #8, HOST-GOVERNOR #12, ACQUISITION #24, EXTRACTION #30, PLANE #48, CONTROL-PLANE #45. Wave 1: FILE-SCANNER #11, CAPTURE #45, FILE-SAFETY #15, CAUSE-READING-3 #2, ENTITIES #19, MONEY #7, CITATION #18, JURISDICTIONS #16, FILING-TEMPLATES #15, CASE-AUTHORING #36, REVIEW #22, PUBLIC-READ #28, QUEUE-PRODUCERS #23, QUEUE #32, JOURNEY-CHECK #11 (addresses in the plan's Jobs line). Every question so far is answered. Backstop `trig_01YWkp2KDqXX2fbeu898yEDi` (22:26Z); WATCH #244 `trig_01JGnkMuayFDoEjq9XkcMPaw` (23:06Z). Lanes: PERFORMANCE answered (re-measure after the redeploy), JOURNEYS past W4, INVESTIGATION-DESIGN past H43, AI-DESIGN past A25 on `lane/ai-design`. Channel: UX-DESIGN read through U446; B471 (round 3's word batch) and B472 (three op-grades `unkeyed` strings) unread by it.

## Do next, in order

1. **Take over** (§5.1): archive BOB #244 once idle (row `BOB-final`, T51); delete its backstop and WATCH #244; arm yours. Install `node_modules` (K4113).
2. **Start, as slots free** (K4215: at most 20 job sessions): CASE-GRAMMAR #19 and CASE-DISCLOSURES #16 (STARTs written, numbered; branch with `mail jobbranch`, post START, `create_session` sonnet, `mail addjob`); CAPTURE-SOURCES and CAUSE-SHELL-4 once ACQUISITION #24 and CONTROL-PLANE #45 merge (number their STARTs first). Wave 2 (seven screens jobs plus AFFORDANCES, haiku) once wave 1 is merged.
3. **Merge each job as it completes** (§5.5) in the plan's order; each merge ruling ends with its **Open** list (K4427 (3)); a cause closes only on its four fields (K4426), the step-0 causes only after their report.
4. Send UX-DESIGN one word batch at wave 2's start: B471's rows plus this round's stand-ins named in COMPLETEs (money `refusal.MONEY_BAD_PERIOD`, citation's two repairs, file-safety's run-under-way rows, affordances' `readheld`/`capturecredentiallist`, the federal request's help).
5. After the last merge: regenerate (manifest order), checks, the whole suite, then K4426's check of every cause by BOB; one redeploy (K4428), the scanner image if `container/` changed; targeted re-walk scoring old and new records apart; the performance re-measure; one final pass; T51's close (design MERGE first, `main` merged in, every module's tests, the close PR; the process PR from `prep/T51-close-v2`).

## Accepted reds, by name, until the act named

Promotion `row-census`; acquisition `checks.test.mjs` R29 R31 (the design's `refusal.CAPTURE_NOT_KEPT`); op-declarations t36 R34 (`capturecredentiallist`, `readheld`: AFFORDANCES, wave 2); store-door R17; plane R24 (T52); journey-check R17 (T52 words); the six held coverage ids (K4417); words' three op-grades findings (B472). Everything else red is a running job's.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design stream's MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275).
- Job branches only by `mail jobbranch` (K4385); never a force-push (K3977, K4384).
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296's approval covers the T51 build; not refused at K4423); none until round 4 is merged and checked (K4426, K4428).

## Open with Bob

Nothing. (Told: the 21st job session for a few minutes, K4436; the reading-pipeline furniture change RC-R11 goes in the round's report.)
