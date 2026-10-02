# Plan: tranche T23

**Status** · Draft by BOB #92's worker, 2026-10-02; to be re-checked at T22's close. Written on `tranche/T22` @ 404390625d (K1067: T22 L7 running) from the work that remains (P19, PROCESS-MECHANICS §5.2): `next.md` N480–N496 and its 62 carried rows, `current.md`'s left-out table and accepted reds, rulings K950–K1067, every `not yet met` mark in `requirements/`, and the drafts `draft-monitoring-r29.md` and `draft-network-notices.md`. Anything T22 leaves unmet at its close (a `*(not yet met: T22)*` mark still standing, a re-opened job) joins its module below at the re-check. An entry I am unsure of is marked.

## Legacy census (§5.2 (2), K1007 (a))

| legacy module (`modules.json`) | in T23 | entry or hard reason |
|---|---|---|
| **legacy-ui** (index 83, `civicos-ui/`) | stays | Bob's: UX (K633; `layers.md` ruling 4; manifest "Parallel work"). Its shares wait on the UX stream: N68, N70, N241, N371, N437, N467, N475, N477, N389, N-A13, N487, the UI fixtures (D2). |

No other module is marked `legacy`; no module names a `from`, so no extraction is open.

## Folds before the opening (BOB, on the tranche branch, P18)

1. **Bob's three questions** (K1044; TRANSITION §6, page Rc6sFvha1gx89g36tVZC2a): fold his answers into `draft-monitoring-r29.md` and `draft-network-notices.md`, re-check the free ids (K1044), paste them into `requirements/`, add `network-notices` to `modules.json` after `project-stage` with its `uses` and the later modules' new edges, and add `monitoring` uses `project-stage` (N486). Everything marked *conditional* below waits on this.
2. **N482** (K1020): state the guarded properties as requirements: subresources' cap (`SUBRESOURCE_CAP`) and the deploy binding's comment property; the binding's owner is plane (`wrangler.jsonc` is plane's path) or bundler.
3. **N484** (K1024): state the export's read contracts in the owners' Provides: record-core (`bundles` title and sha columns, beyond R37), provenance (`register.bytes`, beyond R48), and the owners of `files`/`history`/`manifest` (owners to be named by BOB); corpus-export's Uses cites them.
4. **N492** (K1032): acquisition's requirement states the archive fallback's call of capture-sources R37's Memento services.
5. **N485's ops** (K1025, K1035, K1051; `op-declarations.md`:41): op-declarations and control-plane requirements name `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts` (declared and routed); affordances' NON_ACTS by R7's rule (?: whether affordances needs a job or R7 already covers them).
6. **N493** (DEC-110 (3), K1038): BOB picks the new internal name for the "noticed" disposition and lists every module that reads it (queue, queue-producers at least); the requirements re-worded.
7. **Wording** (BOB's, no change of meaning): acquisition's Status still says "Carried not yet met: R7 …", struck at T22's opening (`t22-check.md` A1); admission's Status "R13: its last sentence not yet met (D-586)" has no inline mark (?: re-check whether met or a lost mark).

## Rules at the opening

T22's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted).

**Accepted reds, by name, at the opening:**
1. `row-census.test.mjs`: every row T22's L3–L11 left `awaiting stamp` (C-52.10, C-54.11, C-54.12, C-91.8, C-26.21, C-107.3, C-110.29, C-92.13, C-82.8, C-112.20, C-115.44, capture's nine, C-58.4, C-58.5, and any later), until promotion's L2 merge (T22 accepted red 3, "until T23's L2 stamp").
2. membership's `MODULE_ORDER` tests (R83, R79, K936's set), until membership's L2 merge (T22 accepted red 4, K1058).
3. coverage: record-grammar R43/R44 (L1), skills R31 (L6), case-authoring R39 (L8), escalation R29 (L9), until each merge (K1025); each new N486 id until its module's merge.
4. the UI's DEC-88 tests (N487, K1030): stay red, Bob's.
5. the totality of affordances and op-declarations over a new op (N485's three; N486's notice ops), from its provider's merge until L11's (K902's precedent).
6. If N483's publication share is carried: conformance `record.test.mjs`:165 from publication's L8 merge until conformance's L9 merge, and plane and queue-producers until L11.
7. Rows a T23 job in L3–L11 changes or adds (N486's catalogue rows; acquisition's `SWEEP_*`) are `awaiting stamp` until T24's L2 (P8: promotion's one job is L2).

## Roster by layer (29 jobs, 8 layers: 4, 3, 4, 0, 0, 2, 0, 6, 2, 2, 6; 20 unconditional)

*Italic*: conditional on Bob's three answers and the drafts' paste (fold 1).

**L1**
- **record-grammar** · N485: R43, R44 (`edition_statement`, `escalation_reason` subjects; `proposalLabel` throws on an unknown subject) (K1025). N495: `labels.mjs`:198 names the removed `mintContent` (K1046). Merge first.
- *signatures* · N486: R37 `NS_NOTICE`, R38 `noticeStatement`, R1 amended "Four" (`draft-network-notices.md` folds) (?: independent of the open question, so carryable on the module's approval alone).
- **subresources** · N482: a test of the cap at its interface (fold 2). Merge before bundler.
- **bundler** · N482: retire `deploybindings.test.mjs`'s D-54 source-text arms once the requirement and its test exist (K1020).

**L2** (merge order: membership early, promotion last)
- **record-core** · N484: test the stated read contract of `bundles`' title and sha (fold 3).
- **membership** · `MODULE_ORDER` gains `corpus-export` (K1043, K1058) and *`network-notices`*; accepted red 2 cleared.
- **promotion** · the stamp: `CATALOG_VERSION` 1.52.0 → 1.53.0 over T22's L3–L11 rows, `ROW_CENSUS` re-pinned (R50), census fixture `row-census-1.53.0.jsonl`, the 1.52.0 fixture dropped, `AWAITING_STAMP` declarations retired (T22 rule 3; K1027's form). *R45 amended* (monitoring-r29's sweep arm).

**L3**
- **provenance** · N496: `mk6-bundle-names-no-author.test.mjs`:203 sends `reason` with `op=attribute` (K1058). N484: test `register.bytes`'s read contract. *R56 `instanceStatement`, `instanceSign`, `instanceKeys`* (network-notices).
- **acquisition** · N492: the archive fallback calls R37's Memento services (TimeGate/TimeMap, `mementoRow`, `selectCapture`, `mementoHop`) (K1032). *R31: a sweep-origin acquire carries `scope`; out-of-scope redirect refused* (monitoring-r29).
- *capture* · R82 `heldCount({sweep})` (monitoring-r29).
- **sources** · N494: `secret.test.mjs`'s two R11 rate tests re-worded to what they assert, no capture constants pinned (K1040).

**L4, L5, L7** · no entries.

**L6**
- *capture-requests* · R45, the AI's "relevant nearby" sweep arm (monitoring-r29; "T23, or a later tranche by BOB's placement") (?: BOB's placement).
- **skills** · N485: R1, R5's `edition_statement` arm, R31 (the layer) (K1025, K1035).

**L8** (merge order: corpus-export, publication, case-grammar, public-read, network-notices, ratification, case-authoring)
- corpus-export · N484: Uses re-worded (fold 3); a job only if its tests must name the contracts, so not counted.
- **publication** · N483: retire the `export`/`exportlog` delegates and constant re-exports (K1024) (?: carried with accepted red 6; else to T24 by the order, P4, since its callers are later).
- *case-grammar* · R10 `working_on` (a document version change is BOB's at the opening).
- *public-read* · R18, registered credential-free public reads.
- *network-notices* (new, DEC-111, K1019, K1031) · R1–R29 of `draft-network-notices.md`, created at `bio-plane/src/network-notices/`; its paths added to its `modules.json` entry by its job (K1043's form).
- *ratification* · R37: the ceremony calls `openSeals` after the commit; the "What becomes permanent" step states it.
- **case-authoring** · N485: R39 (`whatChangedPropose`/`whatChangedDrafts`) and R38's `draft` arm (K1025, K1058). *R41: `publishCase` writes `working_on`.*

**L9**
- **conformance** · N483: `record.test.mjs`:165 calls corpus-export directly (K1024).
- **escalation** · N485: R29 (the pre-assembled opening reason, DEC-89 with Bob's addition) and R25's `escalationreasondraft` arm (K1025, K1051).

**L10** (merge order: monitoring before scheduler)
- *monitoring* · R29 (amended), R31, R36, R53–R63: the link sweep (K1019, K1036, K1044; replaces T22 row A31).
- *scheduler* · R5 (`gathering-sweep`; `working-on-seal`, `working-on-attest`) and R9 (a sweep ratification leaves the alarm armed).

**L11** (merge order: affordances and op-declarations early, control-plane after; queue-producers before queue; plane last)
- **affordances** · N485's three ops' NON_ACTS or grade (R7, R27); *the notice ops*.
- **op-declarations** · N485: specs for `escalationreasondraft`, `whatchangedpropose`, `whatchangeddrafts` (`op-declarations.md`:41). *`noticeprepare`, `noticepost`, `notices`.*
- **control-plane** · routes the same ops (fold 5); *the notice ops and public reads R20, R21, R10*. (?: CONTROL-PLANE's T22 question on capture's `pulled` arm without `within`, K1051, may add a capture entry.)
- **queue-producers** · N483: `EXPORT_LOG_LIMIT_DEFAULT`, `exportLog` from corpus-export. N493: the internal "noticed" renamed. *R26 sweep CONDITIONs; R27 notice CONDITIONs.*
- **queue** · N493: the internal "noticed" renamed (DEC-110 (3)).
- **plane** · N483: the op map spreads `corpusExportOps` (K1024). *Composes `network-notices`.*

**Note on N483** · plane (L11), conformance (L9) and queue-producers (L11) have T22 jobs after corpus-export's L8 merge, so its stated hard reason ("no T22 job", P8) no longer holds for them: if BOB adds N483 to their T22 STARTs, it leaves T23 except publication's retirement.

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
| N486 | *the conditional rows above*, if Bob's answers are not in before their layer | Bob's | moved here at the layer's start, named |

**Left T22's table, no longer left out:** A27 (monitoring R17, carried in T22 L10, K1019), H8 (DEC-102, T22, K1019, K1031), H16b (DEC-108 hold, capture L3, K1023), A31 and H21 (now N486, conditional). **Met in T22, not carried:** N480 (by its jobs; re-check at close), ratification R35 (K1031), bias R40 (plane R12, T22 L11, K1061).

**Inventory** · carried: ten `next.md` entries (N482–N486, N492–N496) and two T22 reds that end at T23's L2 (the stamp, `MODULE_ORDER`), in 29 jobs (20 unconditional jobs; the rest on fold 1); 57 T22 rows still left out plus N481, N487–N491 and S1.

## BOB's resolutions of the worker's open points (BOB #92, K1069)

1. N482: the deploy binding's property is plane's (`wrangler.jsonc` is plane's path); the cap is subresources'.
2. N484: `files`, `history` and `manifest` are record-core's (`bio-plane/src/record-core/schema.mjs`:36, :47, :59); corpus-export's Uses re-worded by BOB, no corpus-export job unless a test must name a contract.
3. N485: affordances carries the three new ops' grade (totality, R7/R27): counted as a job.
4. N493: the readers of "noticed" are found by grep at the opening (today under `bio-plane/src/`: queue, queue-producers, inquiry, publication, run-rules, contradiction, and the plane files `extractrun`, `queuestate`, `csv`); the list is fixed then.
5. admission's Status line: stale wording, BOB's fold at the opening (no mark exists to strike).
6. signatures' network-notices folds stay conditional on Bob's three answers (K1044).
7. capture-requests R45: BOB places it at the opening.
8. N483 stays in T23: T22's plan is fixed (P10); an entry that arose during T22 goes to the next plan.
9. control-plane's K1051 question is answered at its L11 QUESTION; any capture entry it owes goes to T23 then.
10. Every generated artifact in the manifest is regenerated at every layer close (§5.6), agent-worker's included.
