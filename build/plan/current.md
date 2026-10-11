# Plan T42

**Status** · OPEN · BOB #151 · session_01TNKsMjSu49MiEhsdjBhpvT · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #13 session_01TfvYox4Sw4X6dSjqk6M1oK; bundler: BUNDLER #14 session_01X5bkceFD2GHGbfimdSRiKL; record-core: RECORD-CORE #20 session_013PmyJwtkkmXmvfs4xFhWb6; membership: MEMBERSHIP #33 session_01RzYrca5P3xs9xcgtmKsFnL; credentials: CREDENTIALS #12 session_01SmVin6JuSDfPb4PyoweFzP; promotion: PROMOTION #40 session_0152YS47KdFKKexnY73o2BzS

**At T42's opening (K2607):** opened 2026-10-10 from `main` @ 65490c5e33 (T41 closed, K2603), with `tranche/T41`'s later build state merged in (K1703); Bob: "keep going until I tell you to pause" (K2605). Bob's meter at the opening: 18% weekly (primary; K2615). Development runs through every layer; the 80% pause (K2341) and the account-switch rule stand.

**Sources** · `next.md` N751…N848 (each re-tested today); `archive/T41.md` "Left out" and Outcome (its carried reds); `extraction/capture-split.md` (N826; its nine doubts settled, K2607); `extraction/agent-worker-split.md` and K2513 (agent-worker 2,777 hand-written lines: no split, so N832's stated hard reason is gone); the design lanes' `HANDOFF.md` (investigation to H43, its design placed; actions to H10, twelve decisions open with Bob, nothing handed off); the channel (UX-DESIGN to U147, nothing unread); `rulings-active.md`.

## Legacy census (§5.2 (2))

| legacy module | in T42 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens (N672, N559). N794 (its red) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; a module built by copy merges first in its layer (K624); promotion's stamp merges last in its layer (K425, K1680). Requirement text is written into each module's file before its layer's START (BOB's wording, P5); where a layer's text is owed, it is listed below and written before that START.
2. **The opening's acts (K657, K1043; one act, K2607):** `modules.json` gains, with empty `paths` and `tests`, `doorbell` (layer 3, directly after `capture`; uses from `capture-split.md` §1) and `case-account` (layer 8, directly before `case-authoring`, K2608; `uses` from `case-account-split.md` §1); `layers.md` rows 3 and 8 list them, with a section each; membership R83's `MODULE_ORDER` names both (T42-3).
3. **Capture's split, settled (K2607, the map's readings):** (1) K625's pattern: capture's T42 job retires the twenty moved ids and keeps its doorbell code as a named copy, unused by new code; its delete is T43's, once `sources`, `actions`, `answer-envelope`, `store-door` and `plane` have re-pointed; (2) the two copies run the same SQL on the same rows meanwhile, the litigation-hold reader registered only where `actions` registers it (fail closed elsewhere); (3) C-118.2, .3, .4, .7 and C-85 move with their raisers, numbers kept; until capture's delete (T43) they stay defined once, in capture's `checks.mjs`, and doorbell's `checks.mjs` re-exports them (one row, one site, K231; K2609), so `answer-envelope` gains doorbell's file in T43 with the delete; (4) doorbell's migrate treats `TABLE_DECLARED` by `capture` as held, its R25 ownership arm accepted red until capture's delete; (5) `doorbellOf` reads `captureOf(ctx).env`; (6) `doorbell` sits directly after `capture`; (7) R65's actor goes through `capture.recordCaptureActor` inside a nested `transact`; (8) capture R86 states its own fence and `within`; (9) the measure is 4,059.
4. **Accepted reds at the opening** (from T41's Outcome; re-confirmed against `node checks/run.mjs` at the opening: format, architecture, channels 0 failures; coverage red only on rule 4 (1)):
   1. coverage: every id marked `*(not yet met: T42)*` until its module's merge;
   2. row census: rows T41's L3–L11 jobs added stay `awaiting stamp` until T42-5 (promotion); rows T42's L3+ jobs add or change (doorbell's re-pointed `where`s among them), until T43's stamp;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633);
   5. (cleared at T42-3's merge, K2623) membership R83's `MODULE_ORDER` tests; since then each new module named "not yet built" until its own merge;
   6. answer-envelope `catalogue-end.test.mjs`'s pins for `PROPOSAL_NO_RUN` and `NO_SUCH_PROPOSAL` (T41 rule 4 (21)) until T42-27 (N843);
   7. `test/system/migrate-released.test.mjs`'s `ai_ceilings` arm (T41 rule 4 (24)) until T42-17 (N848);
   8. (cleared at T42-2's merge, K2612) `fleetbundles` agent-worker's input count (K2520 (a));
   9. from T42-6's merge: doorbell R25's ownership arm until capture's delete (T43; rule 3 (4));
   11. (cleared at T42-2a's merge, K2622) record-core `t33.test.mjs`:69 (R76) and :162 (R62), which lack `ACD`, from T42-1's merge until T42-2a.
   12. (K2621) format: `modules.json` names promotion's `row-census-1.69.0.jsonl` (K2620) before T42-5 merges it; until that merge.
   10. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close.

**Text owed before each layer's START (BOB's wording, P5):**
- L2: credentials' `accountUsesOf` (N831), from `draft-T42-reqs.md`.
- L3: `requirements/doorbell.md` (R1–R25 from `capture-split.md` §4) and capture's retirements and re-wordings (§4).
- L4–L7, L9, L11: from `draft-T42-reqs.md` and `draft-T42-transcribe.md` (being drafted at the opening).
- L8: `requirements/case-account.md` and case-authoring's retirements, from `extraction/case-account-split.md` (being drafted).

## Entries

### L1
- **T42-1 · record-grammar** · (N838, K2540) R54: `PROPOSAL_STATES` gains `case_account` and `account_check`; (N827, K2467) C-33.40's `where` names progressions' raises of `NO_BASIS` beside inquiry's; (N839, K2608) R55: `ID_TABLE` gains `ACD` (owner `case-account`), `ACCEPT_MUST_REAUTHOR`'s `where` names `case-account` R4 · req: R54, R55, R29's amendment (written).
- **T42-2 · bundler** · (N836, K2520) `fleetbundles.test.mjs`:243 re-pinned from the committed manifest (25 inputs); (N840, K2547) R31: each member's uncompressed size against a budget (warn 32 MiB, fail 48 MiB) and its global-scope start time (warn 500 ms), printed · req: R31 (written). The plane's real start under `wrangler deploy --dry-run` is the next release's (a deployment).

No merge order (independent).

### L2
- **T42-2a · record-core** · (RECORD-GRAMMAR #13 J3, K2617) R62's `mintExhausted` gains its sentence for `ACD`, R76's opaque prefixes gain `ACD` (record-grammar R55); `t33.test.mjs`:69 (R76) and :162 (R62) re-pinned · red accepted by name until this merge (rule 4 (11)).
- **T42-3 · membership** · (N833, K2484) R60's hold acts (`actions` R52, R56, R57) reachable at `EXISTENCE`; (K657) R83's `MODULE_ORDER` names `doorbell` and `case-account` at their places · req: R60 (written), R83 (re-pin from `modules.json`).
- **T42-4 · credentials** · (N831, K2480) `accountUsesOf({owner})`: an in-plane read with no route and no viewer, failing closed · req: the new id, from `draft-T42-reqs.md`.
- **T42-5 · promotion** · stamps T41's L3–L11 rows and T42's L1–L2 rows (record-grammar's C-33.40 `where`; any row L2 adds) · K1680 · req: the rows' behaviour.

**L2 merge order:** record-core, membership, credentials, promotion last.

**L1 closed (K2619).**

### L3
- **T42-6 · doorbell** (new; by copy, K624) · (N826) R1–R25 as `capture-split.md` §4: the knock, rate, inbox, pull, knocker secret, tallies, C-85 and C-118.2/.3/.4/.7, `doorbellOf` · req: `requirements/doorbell.md` (BOB's, before L3's START) · merges first in L3.
- **T42-7 · capture** · (N826) R30–R32, R47–R54, R56, R65–R67, R70–R72, R80, R85 retired "moved to doorbell R<n>"; R37 and R86 re-worded (§4); the moved tests leave capture (§6), `held.test.mjs`:546–563 rebuilt over `provenance.recordReceipt`; its doorbell code stays as a named copy (rule 3 (1)) · after T42-6.
- **T42-8 · sources** · (N826) re-points to `doorbellOf` (R1, R11, R15's text "capture R31, R65, R66, R71, R72" → doorbell's ids); `uses` `capture` → `doorbell` · after T42-6.

**L3 merge order:** doorbell, capture, sources.

### L4
- **T42-9 · reading-pipeline** · (N835, K2500) the paying owner spelled from the bare member id (ai-use R1; tests only, R29 stands); (N832, K2611) R30: the act's entry into R29's tier, and a re-read keeps AI-transcribed pages (`tier3SeedFrom` keeps only OCR pages today) · req: `draft-T42-transcribe.md` §2.
- **T42-10 · extraction** · (N832, K2484, K2611) R71, R72; R47 gains C-51.7 `TRANSCRIBE_NOT_DEPLOYED` (501, before any account or content is read, while run-rules R19's bar cannot be held; the test set handed in as a dependency so a module test drives the chain); the capture's own project's "no AI" limit checked (`credentials.aiKeptAway`) · req: `draft-T42-transcribe.md` §3; (N839, K2608) R58's read contract names `capture_text`, which `case-account` reads.

### L5
- **T42-11 · retrieval** · (N830, K2480) a row-decoration registration on the search answer, for inquiry R60's `projects` · req: from `draft-T42-reqs.md`.

- **T42-11a · lines** · (K2610; RECORD-GRAMMAR #13 J1) its seven `NO_BASIS` refusals (`index.mjs`:420–470) answer with record-grammar's shared row C-33.40 (`SHARED_ACT_CHECKS`, R29), its translation included, not a bare code (K231).
- **T42-11b · money** · (K2610) the same for `index.mjs`:1162.

### L6
- **T42-12 · inquiry** · (N837, K2526) `personFacts` named in Provides with its own id and test; (N834, K2496) its `onMachinePassage` seam; (N830) its registration with retrieval's decoration.
- **T42-13 · hypotheses** · (N843, K2566) re-codes its own conditions; stops decorating action-plans' and intent's refusals.
- **T42-14 · steps** · (N843) its own `NO_SUCH_PROPOSAL` row.
- **T42-15 · citation** · (N834, K2608) no seam of its own: `cite` writes legs through inquiry's check, so R1's relayed refusals gain inquiry R62's `MACHINE_PASSAGE_UNCHECKED`.
- **T42-16 · basis-versions** · (N834) `onMachinePassage` seam.
- **T42-17 · ai-use** · (N848, K2592) `migrate()` drops `ai_ceilings` after the carry (clears rule 4 (7)); (N831) reads `explore` through `credentials.accountUsesOf`, reading `held` (a `group` answer of `held: false` still carries `uses`, so `held` is read, never `uses` alone; CREDENTIALS #12 J1).
- **T42-18 · run-productions** · (N834) fills the three seams with `acceptedFor` (R22).
- **T42-19 · question-explorer** · (N845, K2571) its factory migrates at creation.
- **T42-19a · agent-model** · (N832, K2611) R1 amended, R14: a model entry for `transcribe` and page images inside tool results · req: `draft-T42-transcribe.md` §4 · before T42-20.
- **T42-20 · agent-worker** · (N832, K2611) `POST /transcribe`, R72–R75; R31, R34, R58, R63 amended (R63: a page image the plane renders and re-encodes as PNG, never the file's own bytes, may reach the model for transcription only); API-key accounts only in T42 (N852); 8 pages per act, 2 turns per page · req: `draft-T42-transcribe.md` §5.

**L6 merge order:** `modules.json` order; inquiry and basis-versions (the seam owners) before run-productions. Text: `draft-T42-reqs.md`, its readings adopted (K2608): rows re-coded in place, numbers kept (K238).

### L7
- **T42-21 · investigation** · (N843) its own codes for C-146.21 and C-146.26; (N846, K2572) R18 atomic arrival, `watchedProjects()` carries every source.

### L8
- **T42-22 · case-account** (new; by copy, K624) · (N839, K2542, K2608) case-authoring R64, R66 and R63's account share moved (`case-account-split.md`); its drafts labelled through record-grammar R54; mints `ACD` opaque through record-core's `allocId` (record-grammar R55's legacy form keeps T41's ids valid; `mintExhausted`'s `MINTED_OBJECT` gains `ACD` if record-core's table needs it, reported at its START, K2616) · req: `requirements/case-account.md` (BOB's, before L8's START) · merges first in L8.
- **T42-23 · case-authoring** · (N839, K2608) R64, R66 retired "moved to case-account R<n>"; R63, R65, R67, R68 stay, re-pointed; new R69 (the order `publishCase` asks case-account in); bodies and tables deleted, three one-line pass-throughs kept (`accountPropose`, `accountDrafts`, `registerReviewComments`; K1333) until T43 (N850); `uses` gains `case-account`, loses `ai-runs` · after T42-22 Its START requires an explicit R69 test (the string is in `fixture.mjs`:161 already, K874).
- **T42-23a · review** · (N839, K2608) `reviewOf` registers its comments with `case-account` · after T42-22.

### L9
- **T42-24 · conformance** · (N841, K2558) refusals ahead of the measures; `determinationsFor` batched · req: from `draft-T42-reqs.md`.
- **T42-25 · actions** · (N826) the litigation-hold reader registers with `doorbell` (R55's text); edge `capture` → `doorbell`.

### L10
None.

### L11
- **T42-25a · op-grades** · (N832) R31 grades `pagetranscribe` · req: `draft-T42-transcribe.md` §6.
- **T42-25b · affordances** · (N832) its ladder-count tests re-pinned for op-grades' `pagetranscribe` · after T42-25a.
- **T42-26 · op-declarations** · (N832) R47 declares `pagetranscribe` · req: §7.
- **T42-27 · answer-envelope** · (N843) its two pins return to green (clears rule 4 (6)); the `changed.note` sentence in `rows-before-r43.json` and three `HELD_EARLIER` rows in `families.test.mjs` follow N843's re-codings. (Doorbell's family file joins in T43, N849; K2609.)
- **T42-28 · store-door** · (N826) `inboxpullfile` through `doorbell`.
- **T42-29 · control-plane** · (N832) R74 routes `pagetranscribe`; (N826) wording; (N839) `owner-ops.mjs` reaches `accountPropose`/`accountDrafts` through `of.caseAccount()`.
- **T42-30 · plane** · (N826) builds `doorbellOf` after capture, migrates after it, spreads `doorbellOps`, its door uses `doorbellPublicOp`; (N832) R36 composes `read`'s `transcription` (renders pages with `pdf-pixels`: edge `plane` → `pdf-pixels`, and `run-rules` if new); (N839) builds `caseAccountOf` before `caseAuthoringOf`.
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
| N842 | a dependency not yet built: the interactive AI paths (`enquire`, the account draft task) and N829's test set; re-worded (K2611) |
| N852 (transcription by a sign-in account) | a dependency not yet built: the runner passes text only; images published where Containers pull (N780) |
| N847 | a dependency not yet built: the pointer's content is the UX design stream's (N821) and no requirement names its provider |
| capture's delete of its doorbell copy (N826) | the order: its users re-point in layers 9 and 11, after capture's layer 3 (K625); T43 |
| T41's carried rows (N821's runner, screens and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747; the stamp of rows added after L2) | unchanged from `archive/T41.md` "Left out", each re-tested: the new screens (N672), Bob's rulings, measurements and deployments still hold |

## Doubts for BOB (best readings)

1. **N842**: settled (K2611): no run reaches them; re-worded in `next.md`, a dependency not yet built (the interactive AI paths) and N829.
2. **case-authoring's delete** (N839): settled (K2608): review, control-plane and plane call the moved code, so pass-throughs stay until T43 (N850).
