# Plan T42

**Status** · OPEN · BOB #151 · session_01TNKsMjSu49MiEhsdjBhpvT · depth 1

**Jobs** · 

**At T42's opening (K2607):** opened 2026-10-10 from `main` @ 65490c5e33 (T41 closed, K2603), with `tranche/T41`'s later build state merged in (K1703); Bob: "keep going until I tell you to pause" (K2605). Development runs through every layer; the 80% pause (K2341) and the account-switch rule stand.

**Sources** · `next.md` N751…N848 (each re-tested today); `archive/T41.md` "Left out" and Outcome (its carried reds); `extraction/capture-split.md` (N826; its nine doubts settled, K2607); `extraction/agent-worker-split.md` and K2513 (agent-worker 2,777 hand-written lines: no split, so N832's stated hard reason is gone); the design lanes' `HANDOFF.md` (investigation to H43, its design placed; actions to H10, twelve decisions open with Bob, nothing handed off); the channel (UX-DESIGN to U147, nothing unread); `rulings-active.md`.

## Legacy census (§5.2 (2))

| legacy module | in T42 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens (N672, N559). N794 (its red) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; a module built by copy merges first in its layer (K624); promotion's stamp merges last in its layer (K425, K1680). Requirement text is written into each module's file before its layer's START (BOB's wording, P5); where a layer's text is owed, it is listed below and written before that START.
2. **The opening's acts (K657, K1043; one act, K2607):** `modules.json` gains, with empty `paths` and `tests`, `doorbell` (layer 3, directly after `capture`; uses from `capture-split.md` §1) and `case-account` (layer 8, directly after `case-authoring`; its `uses` provisional, finalised from its map before L8's START); `layers.md` rows 3 and 8 list them, with a section each; membership R83's `MODULE_ORDER` names both (T42-3).
3. **Capture's split, settled (K2607, the map's readings):** (1) K625's pattern: capture's T42 job retires the twenty moved ids and keeps its doorbell code as a named copy, unused by new code; its delete is T43's, once `sources`, `actions`, `answer-envelope`, `store-door` and `plane` have re-pointed; (2) the two copies run the same SQL on the same rows meanwhile, the litigation-hold reader registered only where `actions` registers it (fail closed elsewhere); (3) C-118.2, .3, .4, .7 move with their raisers, numbers kept; (4) doorbell's migrate treats `TABLE_DECLARED` by `capture` as held, its R25 ownership arm accepted red until capture's delete; (5) `doorbellOf` reads `captureOf(ctx).env`; (6) `doorbell` sits directly after `capture`; (7) R65's actor goes through `capture.recordCaptureActor` inside a nested `transact`; (8) capture R86 states its own fence and `within`; (9) the measure is 4,059.
4. **Accepted reds at the opening** (from T41's Outcome; re-confirmed against `node checks/run.mjs` at the opening: format, architecture, channels 0 failures; coverage red only on rule 4 (1)):
   1. coverage: every id marked `*(not yet met: T42)*` until its module's merge;
   2. row census: rows T41's L3–L11 jobs added stay `awaiting stamp` until T42-5 (promotion); rows T42's L3+ jobs add or change (doorbell's re-pointed `where`s among them), until T43's stamp;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633);
   5. membership R83's `MODULE_ORDER` tests from the opening's insertion of `doorbell` and `case-account` until T42-3, then each new module named "not yet built" until its own merge;
   6. answer-envelope `catalogue-end.test.mjs`'s pins for `PROPOSAL_NO_RUN` and `NO_SUCH_PROPOSAL` (T41 rule 4 (21)) until T42-27 (N843);
   7. `test/system/migrate-released.test.mjs`'s `ai_ceilings` arm (T41 rule 4 (24)) until T42-17 (N848);
   8. `fleetbundles` agent-worker's input count (K2520 (a)) until T42-2 (N836);
   9. from T42-6's merge: doorbell R25's ownership arm until capture's delete (T43; rule 3 (4));
   10. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close.

**Text owed before each layer's START (BOB's wording, P5):**
- L2: credentials' `accountUsesOf` (N831), from `draft-T42-reqs.md`.
- L3: `requirements/doorbell.md` (R1–R25 from `capture-split.md` §4) and capture's retirements and re-wordings (§4).
- L4–L7, L9, L11: from `draft-T42-reqs.md` and `draft-T42-transcribe.md` (being drafted at the opening).
- L8: `requirements/case-account.md` and case-authoring's retirements, from `extraction/case-account-split.md` (being drafted).

## Entries

### L1
- **T42-1 · record-grammar** · (N838, K2540) R54: `PROPOSAL_STATES` gains `case_account` and `account_check`; (N827, K2467) C-33.40's `where` names progressions' raises of `NO_BASIS` beside inquiry's · req: R54, R29's amendment (written).
- **T42-2 · bundler** · (N836, K2520) `fleetbundles.test.mjs`:243 re-pinned from the committed manifest (25 inputs); (N840, K2547) R31: each member's uncompressed size against a budget (warn 32 MiB, fail 48 MiB) and its global-scope start time (warn 500 ms), printed · req: R31 (written). The plane's real start under `wrangler deploy --dry-run` is the next release's (a deployment).

No merge order (independent).

### L2
- **T42-3 · membership** · (N833, K2484) R60's hold acts (`actions` R52, R56, R57) reachable at `EXISTENCE`; (K657) R83's `MODULE_ORDER` names `doorbell` and `case-account` at their places · req: R60 (written), R83 (re-pin from `modules.json`).
- **T42-4 · credentials** · (N831, K2480) `accountUsesOf({owner})`: an in-plane read with no route and no viewer, failing closed · req: the new id, from `draft-T42-reqs.md`.
- **T42-5 · promotion** · stamps T41's L3–L11 rows and T42's L1–L2 rows (record-grammar's C-33.40 `where`; any row L2 adds) · K1680 · req: the rows' behaviour.

**L2 merge order:** membership, credentials, promotion last.

### L3
- **T42-6 · doorbell** (new; by copy, K624) · (N826) R1–R25 as `capture-split.md` §4: the knock, rate, inbox, pull, knocker secret, tallies, C-85 and C-118.2/.3/.4/.7, `doorbellOf` · req: `requirements/doorbell.md` (BOB's, before L3's START) · merges first in L3.
- **T42-7 · capture** · (N826) R30–R32, R47–R54, R56, R65–R67, R70–R72, R80, R85 retired "moved to doorbell R<n>"; R37 and R86 re-worded (§4); the moved tests leave capture (§6), `held.test.mjs`:546–563 rebuilt over `provenance.recordReceipt`; its doorbell code stays as a named copy (rule 3 (1)) · after T42-6.
- **T42-8 · sources** · (N826) re-points to `doorbellOf` (R1, R11, R15's text "capture R31, R65, R66, R71, R72" → doorbell's ids); `uses` `capture` → `doorbell` · after T42-6.

**L3 merge order:** doorbell, capture, sources.

### L4
- **T42-9 · reading-pipeline** · (N835, K2500) the paying owner spelled from the bare member id (ai-use R1) · req: from `draft-T42-reqs.md`.
- **T42-10 · extraction** · (N832, K2484) the re-read takes `transcription` · req: from `draft-T42-transcribe.md`.

### L5
- **T42-11 · retrieval** · (N830, K2480) a row-decoration registration on the search answer, for inquiry R60's `projects` · req: from `draft-T42-reqs.md`.

### L6
- **T42-12 · inquiry** · (N837, K2526) `personFacts` named in Provides with its own id and test; (N834, K2496) its `onMachinePassage` seam; (N830) its registration with retrieval's decoration.
- **T42-13 · hypotheses** · (N843, K2566) re-codes its own conditions; stops decorating action-plans' and intent's refusals.
- **T42-14 · steps** · (N843) its own `NO_SUCH_PROPOSAL` row.
- **T42-15 · citation** · (N834) `onMachinePassage` seam.
- **T42-16 · basis-versions** · (N834) `onMachinePassage` seam.
- **T42-17 · ai-use** · (N848, K2592) `migrate()` drops `ai_ceilings` after the carry (clears rule 4 (7)); (N831) reads `explore` through `credentials.accountUsesOf`.
- **T42-18 · run-productions** · (N834) fills the three seams with `acceptedFor` (R22).
- **T42-19 · question-explorer** · (N845, K2571) its factory migrates at creation.
- **T42-20 · agent-worker** · (N832) `POST /transcribe` · req: from `draft-T42-transcribe.md`.

**L6 merge order:** `modules.json` order; the three seam owners before run-productions.

### L7
- **T42-21 · investigation** · (N843) its own codes for C-146.21 and C-146.26; (N846, K2572) R18 atomic arrival, `watchedProjects()` carries every source.

### L8
- **T42-22 · case-account** (new; by copy, K624) · (N839, K2542) case-authoring R63–R68 moved; its drafts labelled through record-grammar R54 · req: `requirements/case-account.md` (BOB's, before L8's START) · merges first in L8.
- **T42-23 · case-authoring** · (N839) R63–R68 retired "moved to case-account R<n>" and its copy deleted or kept per the map's reading on its later-layer users; (N838) any account label left here reads record-grammar R54 · after T42-22.

### L9
- **T42-24 · conformance** · (N841, K2558) refusals ahead of the measures; `determinationsFor` batched · req: from `draft-T42-reqs.md`.
- **T42-25 · actions** · (N826) the litigation-hold reader registers with `doorbell` (R55's text); edge `capture` → `doorbell`.

### L10
None.

### L11
- **T42-26 · op-declarations** · (N832) declares `transcribe`; (N842) per `draft-T42-transcribe.md`.
- **T42-27 · answer-envelope** · (N843) its two pins return to green (clears rule 4 (6)); (N826) `src/doorbell/checks.mjs` joins its family files after capture's.
- **T42-28 · store-door** · (N826) `inboxpullfile` through `doorbell`.
- **T42-29 · control-plane** · (N832) routes `transcribe`; (N826) wording; (N842) per the draft.
- **T42-30 · plane** · (N826) builds `doorbellOf` after capture, migrates after it, spreads `doorbellOps`, its door uses `doorbellPublicOp`; (N832) composes `read`'s `transcription`.
- L11 shares from the case-account map and the transcribe draft (op-grades, affordances, users of the account's ops) are added here before L11's START.

**L11 merge order:** `modules.json` order; the plane last.

## Left out of T42 (one hard reason each, re-tested today)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N780 | a deployment: the next release cut (K1501) |
| N794 | Bob's: legacy-ui stays frozen until the new screens replace it (K633, K1849, K2425) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; also a deployment (an inbound address per group) |
| N828 | a dependency not yet built: D23's checked-and-held edition has no requirement yet; it comes with the actions lane's design hand-off (K2474), and that lane has twelve decisions open with Bob |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C), put to Bob with the first release that needs a bar held |
| N847 | a dependency not yet built: the pointer's content is the UX design stream's (N821) and no requirement names its provider |
| capture's delete of its doorbell copy (N826) | the order: its users re-point in layers 9 and 11, after capture's layer 3 (K625); T43 |
| T41's carried rows (N821's runner, screens and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747; the stamp of rows added after L2) | unchanged from `archive/T41.md` "Left out", each re-tested: the new screens (N672), Bob's rulings, measurements and deployments still hold |

## Doubts for BOB (best readings)

1. **N842** (the assistant's door to `planPropose`, `claimFindStep`, `accountPropose`): read from the code at the opening (`draft-T42-transcribe.md`); in if the run must reach them, else re-worded in `next.md`.
2. **case-authoring's delete** (N839): if a later-layer module imports the moved code, K625's pattern as capture's (delete in T43).
