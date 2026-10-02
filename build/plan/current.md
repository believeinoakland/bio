# Plan: tranche T23

**Status** · OPEN · BOB #96 · session_01Scvr1oyKoCrhpU7f3cMwJx · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #5 session_01PA1sW8VidctbEdHbBtynvg; signatures: SIGNATURES #5 session_01DPXkTEEtaiwXbkr5PTZn6f; subresources: SUBRESOURCES #4 session_01KN7hP9aoKoxenKuTv1wa7b; bundler: BUNDLER #6 session_01NUc9jtCVoKc7BZNT8zXv6u; record-core: RECORD-CORE #14 session_01SBgoW9ZuHi7sweUzgkmrmk; membership: MEMBERSHIP #17 session_01UieGEn5zodaDfjfxn2t4E5; promotion: PROMOTION #24 session_01HB6f4fF8NP2uzL8Dazjrop; provenance: PROVENANCE #12 session_01WHtvgo4BtJdCWMLR7cpZLQ; acquisition: ACQUISITION #5 session_01SPMymkWQC6QTzG6vcgjWn3; capture: CAPTURE #15 session_01HagLZhkXbK2oz2jacVWoU7; sources: SOURCES #10 session_01U2EDRt7UjAm5Dgn5EKqRuZ; calibration: CALIBRATION #7 session_01Mjvo5XojdSxchMV4AYk7Ss; content: CONTENT #10 session_01Pa6H2YV96PALUCEqQzSe7x; connections: CONNECTIONS #11 session_01XC6LHKxY5EmbSqZAdGkAzP; observation-log: OBSERVATION-LOG #9 session_01XV5fXbMnwUeFk6PKBGSdeH; retrieval: RETRIEVAL #9 session_01FjDUYaSx2mcGgMrfcNFUWL; basis-versions: BASIS-VERSIONS #9 session_01PQnpH2DD633o3ucuWJ5BzY; contradiction: CONTRADICTION #7 session_01B9EsuEN7XGFwL42svpWMSi; capture-requests: CAPTURE-REQUESTS #7 session_01KVQEDZowazz9Z9r2dVJ8To; skills: SKILLS #10 session_015eX5NoPCBpnBZAoA4ASL2u; inquiry: INQUIRY #12 session_01V24GWeyLsefZzy4edFhfnt; reevaluation: REEVALUATION #13 session_01PEPeHZZNBH4is5sf9GQyeP; corpus-export: CORPUS-EXPORT #2 session_018tg1ECR7JsNZhPSSSfBouG; publication: PUBLICATION #13 session_01EJtfbXAWN7gNHrgDKbH1Hf; case-grammar: CASE-GRAMMAR #4 session_01ALjX3iyGmC2tQA7HTPNhjM; public-read: PUBLIC-READ #6 session_013j3rKMqpomA79mCkzoNc9j; network-notices: NETWORK-NOTICES #1 session_01XftQvd4G9DgVwWXFazJx1b; ratification: RATIFICATION #15 session_01XpAMPH8pBju7ehx6R7uD1T; case-authoring: CASE-AUTHORING #11 session_0115DsBvkWjRDrABc4Ccc2CR

## Legacy census (§5.2 (2), K1007 (a))

| legacy module (`modules.json`) | in T23 | entry or hard reason |
|---|---|---|
| **legacy-ui** (index 84, `civicos-ui/`; 85 once network-notices lands) | stays | Bob's: UX (K633; `layers.md` ruling 4; manifest "Parallel work"). Its shares wait on the UX stream: N68, N70, N241, N371, N437, N467, N475, N477, N389, N-A13, N487, the UI fixtures (D2). |

No other module is marked `legacy`; no module names a `from`, so no extraction is open.

## Folds before the opening (BOB, on the tranche branch, P18)

1a. **monitoring-r29** (K1094: Bob answered K1044 (1) and (2)): re-check the free ids, paste `draft-monitoring-r29.md` into `requirements/`, and add `monitoring` uses `project-stage` (N486). Unconditional.
1b. **network-notices** (K1100: Bob answered K1044 (3) as recommended, folded into `draft-network-notices.md`): re-check the free ids, paste it into `requirements/`, add `network-notices` to `modules.json` after `project-stage` (index 59) with its `uses` and the later modules' new edges. Unconditional.
2. **N482** (K1020): state the guarded properties as requirements: subresources' cap (`SUBRESOURCE_CAP`) and the deploy binding's comment property; the binding's owner is plane (`wrangler.jsonc` is plane's path) or bundler.
3. **N484** (K1024): state the export's read contracts in the owners' Provides: record-core (`bundles` title and sha columns, beyond R37), provenance (`register.bytes`, beyond R48), and the owners of `files`/`history`/`manifest` (owners to be named by BOB); corpus-export's Uses cites them.
4. **N492** (K1032): acquisition's requirement states the archive fallback's call of capture-sources R37's Memento services.
5. **N485's ops** (K1025, K1035, K1051; `op-declarations.md`:41): op-declarations and control-plane requirements name `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts` (declared and routed); affordances' NON_ACTS by R7's rule (?: whether affordances needs a job or R7 already covers them).
6. **N493** (DEC-110 (3), K1038; done at the opening, K1114: no code or requirement reads the word; its rename handed to the UX stream): BOB picks the new internal name for the "noticed" disposition and lists every module that reads it (queue, queue-producers at least); the requirements re-worded.
7. **Wording** (BOB's, no change of meaning): acquisition's Status still says "Carried not yet met: R7 …", struck at T22's opening (`t22-check.md` A1); admission's Status "R13: its last sentence not yet met (D-586)" has no inline mark (?: re-check whether met or a lost mark).
8. **CONDITION kinds** (by BOB #93, K1099): observation-log's condition vocabulary gains the five `sweep-*` kinds (`draft-monitoring-r29.md`, queue-producers R26) and, with fold 1b, the three `notice-*` kinds (`draft-network-notices.md`, queue-producers R27); queue R1 (`classOfKind`) and R5 (`QUEUE_CONDITION_KINDS`) give each a class, so R26/R27's items have one.

## Rules at the opening

T22's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted).

**Accepted reds, by name, at the opening:**
1. `row-census.test.mjs`: every row T22's L3–L11 left `awaiting stamp` (C-52.10, C-54.11, C-54.12, C-91.8, C-26.21, C-107.3, C-110.29, C-92.13, C-82.8, C-112.20, C-115.44, capture's nine, C-58.4, C-58.5, C-41.16 (K1079), C-112.17 (K1089), C-116.46 (K1084), C-116.5–.7 (K1089), the rest from T22 L10/L11's COMPLETEs, monitoring's new R52 codes), until promotion's L2 merge (T22 accepted red 3, "until T23's L2 stamp").
2. membership's `MODULE_ORDER` tests (R83, R79, K936's set): membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58 (`starts-T22/conformance.txt`, K1075), until membership's L2 merge (T22 accepted red 4, K1058).
3. coverage: record-grammar R43/R44 (L1), skills R31 (L6), case-authoring R39 (L8), escalation R29 (L9), until each merge (K1025); each new N486 id until its module's merge. The list (10 at K1092) is re-taken at T22's close, each item carried or named.
4. the UI's DEC-88 tests (N487, K1030): stay red, Bob's.
5. the totality of affordances and op-declarations over a new op (N485's three; `sweeps`; N486's notice ops), from its provider's merge until L11's (K902's precedent); network-notices' ops are `noticeprepare`, `noticepost`, `notices`, `directorysubmission` (K1150). Also control-plane `families.test.mjs`'s totality over `CHECK_FAMILIES` (network-notices' `NETWORK_NOTICE_CHECKS`, C-127.1–.16), from network-notices' merge until control-plane's L11 merge (K1150).
6. N483's publication share is carried (P19; K902's precedent; by BOB #93, K1099): conformance `record.test.mjs`:165 from publication's L8 merge until conformance's L9 merge, and plane and queue-producers until L11.
7. Rows a T23 job in L3–L11 changes or adds (N486's catalogue rows; acquisition's `SWEEP_*`) are `awaiting stamp` until T24's L2 (P8: promotion's one job is L2).
8. provenance's miniflare `mk6-bundle-names-no-author.test.mjs`:203, red since publication's T22 L8 merge, until provenance's L3 merge (N496, K1076).
9. control-plane `inbox-door.test.mjs`'s test that a reasoned `pulled` resolve records the reason on the knock's row (115/116), until capture's L3 merge (N499, K1105, K1111) if that clears it; the door calls capture's `pullKnock`, not `inboxResolve` (control-plane `pull.mjs`:110–123), so if it stays red, until control-plane's L11 merge (K1117). control-plane R36's mark is struck when it clears.
14. `op=export` and `op=exportlog` route nowhere through the plane from publication's L8 merge (its arms retired, N483) until plane's L11 merge spreads `corpusExportOps` (K1122); the tranche branch is never deployed before its close.
13. queue's `catalogue.test.mjs` R1 (:34) and R5 (:116), from observation-log's L5 merge (the eight new CONDITION kinds) until queue's L11 merge (K1119; K902's precedent).
12. `fleetbundles.test.mjs` names the plane bundle STALE between a layer's merges and its close's regeneration (K1118).
11. `fleetbundles.test.mjs` (the plane bundle carries `MODULE_ORDER`), from membership's L2 merge until L2's close regenerates the bundle (K1117; T22 red 2's precedent).
10. coverage, re-taken at T22's close (K1111): escalation R29 (L9), record-grammar R43 R44 (L1), publication R56 (L8, N500), skills R31 (L6); each new N486 id until its module's merge. Replaces item 3's list.

## Roster by layer (39 jobs, 11 layers: 4, 3, 4, 2, 3, 5, 1, 6, 2, 2, 7; all unconditional, K1100)

*Italic*: network-notices' shares (fold 1b; unconditional since K1100). N497 (K1087) rides on each job that names it; actions, standards and action-plans took it in T22 L9, monitoring and scheduler in T22 L10 (K1098), so not here (by BOB #93, K1099).

**L1**
- **record-grammar** · N485: R43, R44 (`edition_statement`, `escalation_reason` subjects; `proposalLabel` throws on an unknown subject) (K1025). N495: `labels.mjs`:198 names the removed `mintContent` (K1046). Merge first.
- *signatures* · N486: R37 `NS_NOTICE`, R38 `noticeStatement`, R1 amended "Four" (`draft-network-notices.md` folds).
- **subresources** · N482: a test of the cap at its interface (fold 2). Merge before bundler.
- **bundler** · N482: retire `deploybindings.test.mjs`'s D-54 source-text arms once the requirement and its test exist (K1020).

**L2** (merge order: membership early, promotion last)
- **record-core** · N484: test the stated read contract of `bundles`' title and sha (fold 3). N497.
- **membership** · `MODULE_ORDER` gains `corpus-export` (K1043, K1058) and *`network-notices`*; accepted red 2 cleared.
- **promotion** · the stamp: `CATALOG_VERSION` 1.52.0 → 1.53.0 over T22's L3–L11 rows, `ROW_CENSUS` re-pinned (R50), census fixture `row-census-1.53.0.jsonl`, the 1.52.0 fixture dropped, `AWAITING_STAMP` declarations retired (T22 rule 3; K1027's form). R45 amended (monitoring-r29's sweep arm).

**L3**
- **provenance** · N496: `mk6-bundle-names-no-author.test.mjs`:203 sends `reason` with `op=attribute` (K1058). N484: test `register.bytes`'s read contract. N497 (`fixture.mjs`:100–102). *R56 `instanceStatement`, `instanceSign`, `instanceKeys`* (network-notices).
- **acquisition** · N492: the archive fallback calls R37's Memento services (TimeGate/TimeMap, `mementoRow`, `selectCapture`, `mementoHop`) (K1032). R31: a sweep-origin acquire carries `scope`; out-of-scope redirect refused (monitoring-r29).
- **capture** · R82 `heldCount({sweep})` (monitoring-r29). N499: the `pulled` resolve passes `at`, `within` to its pull (K1105); clears control-plane's accepted red.
- **sources** · N494: `secret.test.mjs`'s two R11 rate tests re-worded to what they assert, no capture constants pinned (K1040).

**L4**
- **calibration** · N497.
- **content** · N497.

**L5**
- **connections** · N497.
- **observation-log** · fold 8: the five `sweep-*` condition kinds; *the three `notice-*` kinds*.
- **retrieval** · N497.

**L6**
- **inquiry** · N497.
- **basis-versions** · N497.
- **contradiction** · N497 (`fixture.mjs`:65–67).
- **capture-requests** · R45, the AI's "relevant nearby" sweep arm (monitoring-r29), carried here (by BOB #93, K1099: monitoring registers the scope check at start, K31's pattern; capture-requests 49 precedes monitoring 73). N497.
- **skills** · N485: R1, R5's `edition_statement` arm, R31 (the layer) (K1025, K1035). N498: `skilldoctrine.mjs`:854 says standards R10, not R9 (K1089).

**L7**
- **reevaluation** · N497 (`wpretraction.test.mjs`:51).

**L8** (merge order: corpus-export, publication, case-grammar, public-read, network-notices, ratification, case-authoring)
- **corpus-export** · N483 (K1122): R6 `corpusExportOps`, publication's `export`/`exportlog` arms moved; merges first in L8, before publication retires its arms. N484's Uses re-worded at the opening (fold 3).
- **publication** · N483: retire the `export`/`exportlog` delegates and constant re-exports (K1024), carried with accepted red 6 (by BOB #93, K1099). N500: R56's test (K1105).
- *case-grammar* · R10 `working_on` (a document version change is BOB's at the opening).
- *public-read* · R18, registered credential-free public reads.
- *network-notices* (new, DEC-111, K1019, K1031) · R1–R29 of `draft-network-notices.md`, created at `bio-plane/src/network-notices/`; its paths added to its `modules.json` entry by its job (K1043's form).
- **ratification** · N497. *R37: the ceremony calls `openSeals` after the commit; the "What becomes permanent" step states it.*
- **case-authoring** · N485: R39 (`whatChangedPropose`/`whatChangedDrafts`) and R38's `draft` arm (K1025, K1058). N497. *R41: `publishCase` writes `working_on`.*

**L9**
- **conformance** · N483: `record.test.mjs`:165 calls corpus-export directly (K1024).
- **escalation** · N485: R29 (the pre-assembled opening reason, DEC-89 with Bob's addition) and R25's `escalationreasondraft` arm (K1025, K1051). N497 (`fixture.mjs`:86).

**L10** (merge order: monitoring before scheduler)
- **monitoring** · R29 (amended), R31, R36, R53–R63: the link sweep (K1019, K1036, K1044, K1094; replaces T22 row A31).
- **scheduler** · R5's `gathering-sweep` arm and R9 (a sweep ratification leaves the alarm armed) (monitoring-r29). *R5's `working-on-seal`, `working-on-attest` arms* (network-notices).

**L11** (merge order: affordances and op-declarations early, control-plane after; tasks; queue-producers before queue; plane last)
- **affordances** · N485's three ops' NON_ACTS or grade (R7, R27); `sweeps` (R7, read); *the notice ops*.
- **op-declarations** · N485: specs for `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts` (`op-declarations.md`:41); `sweeps` (member session, read; `draft-monitoring-r29.md`:159). *`noticeprepare`, `noticepost`, `notices`.*
- **control-plane** · R36 (K1117): if capture's N499 leaves `inbox-door.test.mjs`'s reason-on-row test red, the door resolves a `pulled` knock through capture's `inboxResolve` (which records the reason on the row inside the pull's one act) instead of `pullKnock`. Routes the same ops (fold 5) and `sweeps` (?: if it routes monitoring's ops); *the notice ops and public reads R20, R21, R10*. (?: CONTROL-PLANE's T22 question on capture's `pulled` arm without `within`, K1051, may add a capture entry.)
- **tasks** · N497.
- **queue-producers** · N483: `EXPORT_LOG_LIMIT_DEFAULT`, `exportLog` from corpus-export. R26 sweep CONDITIONs. *R27 notice CONDITIONs.*
- **queue** · Fold 8: R1/R5 over the `sweep-*` kinds; *the `notice-*` kinds*.
- **plane** · N483: the op map spreads `corpusExportOps` (K1024). *Composes `network-notices`.* N482: R13's test, parsing `wrangler.jsonc` and importing `SUBRESOURCE_CAP` (fold 2, K1113); an unrelated `stats.test.mjs` already names "R13", so the coverage check does not flag it: the START says so.

**Generated artifacts** · the plane bundle after each layer whose plane modules change; `agent-worker` bundle after skills (L6).

## Left out (one hard reason each)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | 61.3 MB bound |
| B3 | N34 (pdf-worker) | deployment | JPX bound; JBIG2 fixture encoder; 4,277 lines (P6) |
| B11, C9 | N461 release share; N471's release copies | deployment | the next signed release, Bob's act |
| B16 | N473 (`filing_templates` table) | deployment | migration run at every instance |
| C1 | office-readers R28/R29 retired | deployment | migrations at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | newgroup installer deployed, N336 | deployment | a signed release |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement | a measured recommender run (K488) |
| C8 | first profile's facts without a source | measurement | K925, K934, K941 |
| B4, B5 | N144, N232 | Bob's (UX) | K899 (2) |
| A54 | skills R10 | Bob's | N144 |
| B13 | N470 | Bob's | K943; DEC-116 answers it, off `main` (N491) |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A | Bob's | K1019: "nothing new" |
| H13 | DEC-105 audience guidance | Bob's | waits for its trigger |
| C5 | `PLN-` affordances, plan page, joint action | Bob's | K608 (4), K600 (c) |
| H5 | DEC-100 | Bob's | awaits Bob; DEC-116 (N491) off `main` |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| N481 | DEC-112 published case in three forms | Bob's | on the design branch, not `main` |
| N488 | DEC-113 litigation hold of transcripts | Bob's | on PR #7, not `main` |
| N489 | DEC-114 "Matters" | Bob's | on PR #7, not `main` |
| N490 | DEC-115 action redesign | Bob's | on PR #7, not `main` |
| N491 | DEC-116 withdrawal, docket | Bob's | on PR #7, not `main`; home BOB's once landed |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| S1 | T23's L3–L11 new or changed rows stamped | one job per module (P8) | promotion's one job is L2; T24's L2 |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |

**Left T22's table, no longer left out:** A27 (monitoring R17, carried in T22 L10, K1019), H8 (DEC-102, T22, K1019, K1031), H16b (DEC-108 hold, capture L3, K1023), A31 and H21 (now N486, carried: K1094, K1100). **Met in T22, not carried:** N480 (by its jobs; re-check at close), ratification R35 (K1031), bias R40 (plane R12, T22 L11, K1061).

**Inventory** · carried: twelve `next.md` entries (N482–N486, N492–N498) and two T22 reds that end at T23's L2 (the stamp, `MODULE_ORDER`), in 39 jobs (all unconditional, K1100); 57 T22 rows still left out plus N481, N487–N491, N493's member-facing part and S1.

## BOB's resolutions of the worker's open points (BOB #92, K1069)

1. N482: the deploy binding's property is plane's (`wrangler.jsonc` is plane's path); the cap is subresources'.
2. N484: `files`, `history` and `manifest` are record-core's (`bio-plane/src/record-core/schema.mjs`:36, :47, :59); corpus-export's Uses re-worded by BOB, no corpus-export job unless a test must name a contract.
3. N485: affordances carries the three new ops' grade (totality, R7/R27): counted as a job.
4. N493: the readers of "noticed" are found by grep at the opening (today under `bio-plane/src/`: queue, queue-producers, inquiry, publication, run-rules, contradiction, and the plane files `extractrun`, `queuestate`, `csv`); the list is fixed then. Scope (by BOB #93, K1099): the internal word only (code comments, identifiers); the member-facing translations are left out (Bob's: UX).
5. admission's Status line: stale wording, BOB's fold at the opening (no mark exists to strike).
6. signatures' network-notices folds are carried: Bob answered K1044 (3) (K1100).
7. capture-requests R45: carried in L6 (by BOB #93, K1099).
8. N483 stays in T23: T22's plan is fixed (P10); an entry that arose during T22 goes to the next plan.
9. control-plane's K1051 question is answered at its L11 QUESTION; any capture entry it owes goes to T23 then.
10. Every generated artifact in the manifest is regenerated at every layer close (§5.6), agent-worker's included.
