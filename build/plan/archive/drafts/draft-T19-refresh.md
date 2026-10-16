# Plan: tranche T19 (refresh)

**Status** · DRAFT refresh of `draft-T19.md` (adopted K653), by a worker for BOB #78, 2026-09-30. Read on `tranche/T18` @ ba630ce2da (layers 1–7 closed, K686; layer 8 running, K694; public-read, case-grammar, project-stage, review merged or COMPLETE). Layers 8–11 are taken as `current.md` plans them; an entry marked **⚑L8–11** depends on a T18 outcome still to come and is re-read at T18's close (K424). Sources: `draft-T19.md`, rulings K650–K694, `next.md` (to N425), `build/jobs/T18/*.md`, `current.md`, `layers.md`, `modules.json`, the tree (grep for catalogue importers). Marks: **kept** · **amended** (how) · **done in T18** (ruling) · **moot** · **new** (from `next.md` or the tree).

## What changed versus draft-T19.md

1. BOB-1–BOB-6 ruled (K653); Q1 done (planning skill approved K660, folded into T18 K662); Q2 moot (N345 built in T15–T16, K656).
2. K653 BOB-1 withdrew K635's last clause, so the old-suite-only exports (`contentIdFor`, `isSufficiencyClaimed`, `isMachineMinted`) go in legacy-checks' L1 job; that deferral row is moot.
3. Done in T18, taken out of T19 jobs: strength's store cache (K675 (2)); record-core's `op=stats` disclosure and purge call (K650); N405 (inquiry R49); N406 (R66); N407 wording (K692); N409 and N418 (K655, ai-runs); N411's strength, run-productions and basis-versions shares; N415 (K638, K657); N417 (K691); N400 (K692).
4. Four jobs added (63 → 67): acquisition (L3), case-grammar and project-stage (L8), op-declarations (L11). All are T18's new modules and still import the catalogue (`acquisition/index.mjs`:15, `case-grammar/{index,blocks,tensions}.mjs`, `project-stage/index.mjs`:24). Up to two more (action-clocks, action-plans, L9) if T18's copies import it ⚑L9.
5. site-profiles' file list corrected: `docprofile/registry.mjs` re-exports `pipeline`, `readtext` and `doctypes/`, so it stays docprofile's facade. Its three importers (acquisition, extraction, monitoring) need no re-point.
6. record-grammar also takes `EXTENSION_ARMS` with `checkBundle`, and record-core's `registerGrammar` re-points its validation (L2).
7. New next.md entries placed: N420 (plan reads) in L11 with agent-worker's share deferred; N421 at agent-worker L6; N422 at record-core L2 and inquiry L6; N423 at review L8; N424 at case-authoring L8; N425 at promotion L2. N136's rest goes to inquiry and contradiction L6.
8. membership L2 gains `MODULE_ORDER` for T19's five new modules (K657's standing rule; the opening fold carries it).
9. The legacy-checks L1 deletion list now names every copy T18 recorded as held. Four of them wait on L8–L10 re-points ⚑.
10. public-read and publication L8 re-read against K656: the Worker files are re-assigned at T18 publication's merge, and the case-grammar re-points (`caseTensionsOf`, `caseDocumentBlocks`) are added.
11. legacy-store L10 is narrowed: T18's L10 job already writes the four dispatch spreads (K671) and re-points `airun.mjs` (K682).
12. ratification L8 gains refuse-gate's retire-arm convert (K674 (4)). The stamp list gains the T18 rows the job records name.
13. Deferrals: planning-skill row replaced by `MODES.plan` deployed (f) and N420's agent-worker share (a). 19 hard deferrals, one conditional on T18 layer 9.
14. Housekeeping: 29 next.md entries are met or moot by T18's close; they move to `archive/next-applied.md` at T19's opening (list at the end).
15. Sizes today: catalogue 8,963 lines, `store.mjs` 2,940, `src/index.mjs` 539, `tools/` 69 files (25,780 lines).

## Priorities, finish report, rules

- **Priorities (K648):** legacy removal in full; the Action layer's remainder. **kept.** The Action remainder's "planning skill is not here" note: **done in T18** (K660, K662).
- **Finish report (1):** its conditional clause on K635 is **moot** (K653 BOB-1): T19 deletes the catalogue whole. **(2)** is **kept**.
- **Rule 1 (catalogue empties):** **kept.**
- **Rule 2 (`checkBundle` in L1, `LEGACY_GRAMMARS`):** **amended**. BOB-6 adopted it (K653). T18's legacy-checks already built `checkBundle(input, {grammars})` with `EXTENSION_ARMS` (C-2.7, C-18.6/.7, C-2.8, C-2.9/C-9.1). record-grammar moves `EXTENSION_ARMS` with it. C-2.7's arm is already capture's (registered in T18) and goes from the list.
- **Rule 3 (splits):** **kept** (BOB-2, K653). site-profiles' list is amended at L1.
- **Rule 4 (merge early):** **amended**. Add L1 site-profiles before docprofile (already listed); L6 inquiry early for contradiction as well (N136); L8 case-grammar and project-stage have no T19 dependants.
- **Rule 5 (`store.mjs` edits):** **amended**. T18's L10 job adds the spreads for `publicReadOps`, `projectStageOps`, `actionClocksOps` and `actionPlansOps` (K671) ⚑L10.
- **Rule 6 (P18 wordings before each layer):** **kept.** Add: N420's read requirement before L11; N425's wording before L2 (BOB's, P17).
- **Rule 7 (stamp):** **amended**. It also names the T18 rows its records list (see promotion).
- **New rule (K657):** the opening fold that adds site-profiles, credentials, inquiry-grammar, action-grammar and plane carries their `MODULE_ORDER` entries in the same act. Failing that, membership's L2 job adds them and L1's close accepts the red by name.

**Roster (67 jobs; +2 conditional ⚑L9):** L1 record-grammar, legacy-checks, text-chain, site-profiles, docprofile, bundler, signatures, office-readers, ocr-worker (9) · L2 record-core, membership, credentials, promotion (4) · L3 provenance, acquisition, capture, sources (4) · L4 calibration, extraction, content (3) · L5 entities, connections, progressions, bias, observation-log, query-language, retrieval (7) · L6 inquiry-grammar, inquiry, citation, basis-versions, strength, contradiction, run-rules, ai-runs, run-productions, capture-requests, skills, agent-worker (12) · L7 intent, reevaluation (2) · L8 case-grammar, public-read, project-stage, publication, ratification, case-authoring, review (7) · L9 standards, conformance, consequences, action-grammar, actions, [action-clocks], filings, escalation, [action-plans] (7+2) · L10 monitoring, legacy-store (2) · L11 affordances, tasks, queue-producers, queue, instance-setup, op-declarations, admission, control-plane, plane, legacy-index (10).

## Layer 1

- **record-grammar** · **amended**. As drafted, plus `EXTENSION_ARMS` moving with `checkBundle` (record-core re-points, L2). C-2.7's slot is capture's (T18).
- **legacy-checks** · **amended**. As drafted: the `SUGGEST_LEVELS` line (K679), the wrapper and copy deletions. Additions and changes:
  - `contentIdFor`, `isSufficiencyClaimed`, `isMachineMinted` deleted (K653 BOB-1; LEGACY-CHECKS #12 deferred `contentIdFor` here).
  - The copies T18 recorded as held, each deleted once its importers re-point: C-2.7 arm (capture; inquiry passes grammars, T18); C-22 (observation-log and run-rules); C-80.3 (content, K685); C-83, C-48.1–.7, C-28.13, `CIVICOS_CONTACT_URL`/`civicosUserAgent` (acquisition; the user agent ⚑L10–11, monitoring and instance-setup re-point); `MECHANICAL_FIELD_SETS` (⚑L10, monitoring's tests); `STRENGTH_STATES` (⚑L8, ratification); C-48.8/.9 and `DRIVE_CAPTURE_CHECKS` (⚑L10, monitoring). `LEAD_ID_RE` stays for inquiry-grammar, as drafted.
  - A copy whose re-point slips is held for its owner's T19 job (rule 1).
  - N70's and N44's `where`s: **kept**.
- **text-chain** · **kept** (extent algebra; N416).
- **site-profiles** (new) · **amended**. Copies `index.mjs`, `recogniser.mjs`, `events.mjs`, `handlers/`. **Not `registry.mjs`**, which re-exports `pipeline`, `readtext` and `doctypes/`: it stays docprofile's facade and re-exports site-profiles' names. BOB re-reads the seam before the fold (P18).
- **docprofile** · **amended**. The split's deletion, with `registry.mjs` re-exporting site-profiles, so acquisition, extraction and monitoring (`*/…/docprofile/registry.mjs`) need no re-point; `civicos-ui/check-semantics.mjs`' path list is legacy-ui's (K633). N404, N21's share, N390's remainder and converts: **kept**.
- **bundler** · **kept** (BOB-5, K653; N31). `tools/` is now 69 files, 25,780 lines; the P18 read re-counts the release files.
- **signatures** · **kept** (conditional on the P18 read).
- **office-readers** · **kept** (N26).
- **ocr-worker** · **kept**. `test/ocr-worker.test.mjs`:36 still imports `BASIS_GRADES` from the catalogue.

## Layer 2

- **record-core** · **amended**. The `op=stats` disclosure (R64, R65), `registerStatsSource` and purge's call into record-core are **done in T18** (K650). Kept: `auditPass` moved (the store's `auditPass` at `store.mjs`:1222 is still its caller); the audit-finding and R45 registrations; the mint-ledger seeds; `RECORD_SCHEMA` first; `#migrate` share; routes in its ops map; `LEGACY_GRAMMARS` at construction. New:
  - `registerGrammar` validates against record-grammar's `EXTENSION_ARMS` (re-point from the catalogue, `record-core/index.mjs`:12).
  - **N422** record-core share: `registerGrammar`'s answer (`index.mjs`:970) classified for the DEC-49 guard.
- **membership** · **amended**. As drafted (seam, then the split's deletion, families, N70 bounds, converts). Plus `MODULE_ORDER` (R83) gains the five T19 modules, if the fold did not (K657). N415 is **done in T18** (K638, K657).
- **credentials** (new) · **kept.**
- **promotion** · **amended**. As drafted. Additions:
  - **N425** (new): `bundles.criticality` derived from the document's own front matter as well as the envelope, named by a test. BOB words R39 before L2 (P18); it matches ratification R22 (K692).
  - **N221**: its catalogue share is **done** (K575, T17); only confirm no per-member fallback remains in `gate.mjs`.
  - The stamp covers T18 layers 3–11 as the records name them: C-24, C-34, C-53, C-89, C-103 (provenance); C-85, C-2.7 (capture); C-83, C-48.1–.7, C-28.13 (acquisition); C-52, C-80.3 (content); C-74 (connections); C-33.25 (entities); C-22 (observation-log); C-22.5–.18 `where`s and C-109.2–.7 (run-rules); C-104 (run-productions); C-28 copy (capture-requests); ratification's, case-authoring's, monitoring's and control-plane's rows ⚑L8–11; the Action layer's tables ⚑L9; plus T19's layers 1–2.

## Layer 3

- **provenance** · **kept** (legacy-store's share, the testimony path). PROVENANCE #8 moved its catalogue families in T18 (K657).
- **acquisition** · **new**. Re-point `isPublicHttpsLocator`, `createSha256`, `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE` (`index.mjs`:15) and its four module tests to record-grammar. Its C-83, C-48.1–.7 and C-28.13 then become the only copy (after legacy-checks L1). **Size:** ~10.
- **capture** · **kept.** N418 is **done in T18** (K655 R74).
- **sources** · **kept.**

## Layer 4

- **calibration** · **kept.**
- **extraction** · **kept** (K666 re-points; N26's migration).
- **content** · **kept** (C-45, extent core). K663 and K665 were wording only.

## Layer 5

- **entities**, **progressions**, **bias**, **query-language**, **retrieval** · **kept.** retrieval's R62 `registerField` is **done in T18** (K668).
- **connections** · **kept** (C-49, C-81). C-74 is **done in T18** (CONNECTIONS #6).
- **observation-log** · **kept.** C-22 and `LEAD_ID_RE` are copied (T18); the catalogue's C-22 goes in L1.

## Layer 6

- **inquiry-grammar** (new) · **kept.**
- **inquiry** · **amended**. N405 and N136's `legs` registration are **done in T18** (INQUIRY #7). Kept: R11's R2–R3 arm (K681), C-66.5, the grammar face re-point. New:
  - **N422**: R42's `#raise` carries `raise`'s answer object itself, for `staled`, `dispose` and `divide` under a caller's transaction.
  - **N136's rest**: `inquiry_subject_entity` moves to `inquiry_bundle_facts` (K654 kept it on `bundles` for contradiction). Merges early for contradiction.
- **citation** · **kept.**
- **basis-versions** · **amended**. N411, N242 and N249 are **done in T18** (BASIS-VERSIONS #5). The catalogue share is kept; it merges early for inquiry-grammar, run-productions, agent-worker and skills.
- **strength** · **amended**. The legacy-store share (strength cache, columns, index loop, `#writeStrengthProjection`) is **done in T18** (K675 (2)); N411's share is done. Left: re-points only (`VERSION_*` to basis-versions, `INSTANCE_GROUP_CHECKS` to promotion, the rest to record-grammar). **Size:** ~10.
- **contradiction** · **amended**. Re-points as drafted, plus **N136's rest**: `inquiry_subject_entity` is read from inquiry's table after inquiry merges early.
- **run-rules**, **capture-requests**, **skills** · **kept.** (skills' R1 and R3 wording: K674 (1).)
- **ai-runs** · **kept** (delete the four re-exports, K676 (1)). ⚑L10–11: the four go only after legacy-store's `airun.mjs` re-point (K682, T18 L10) and control-plane's (T18 L11). N418 is **done in T18**.
- **run-productions** · **kept** (N155's last share). N411's share is **done in T18**.
- **agent-worker** · **amended**. Its product no longer imports the catalogue (K683). Tests still do: `wire-vocabulary.test.mjs`:68 (`VERSION_NAME_RE`, `isBoilerplate` to basis-versions), `plane-capturerequest.mjs`:27 (`CAPTURE_REQUEST_CHECKS` to capture-requests, `isPublicHttpsLocator` to record-grammar) and `plane-suggest.mjs`:86. Plus **N421**: interface arms for the older suites' source-text arms, and C-25.1's floor read from basis-versions' export. After basis-versions merges early.

## Layer 7

- **intent** · **kept** (C-2.9's rest and C-9.1, BOB-4 K653).
- **reevaluation** · **kept.** Its `VERSION_NOTICE_CHECKS` re-point is **done in T18** (K685).

## Layer 8

- **case-grammar** · **new**. `parseFrontmatter` re-pointed to record-grammar in `index.mjs`:13, `blocks.mjs`:23 and `tensions.mjs`:22. **Size:** 3 lines.
- **public-read** · **amended** ⚑L8.
  - Kept: rows C-44.2, C-68.5 and C-98.1–.9 into its `checks.mjs` (K651).
  - New: `caseTensionsOf` and `caseDocumentBlocks` re-pointed from publication's re-export to case-grammar (PUBLIC-READ #1 deferred them); the test `convert-d442…`:18 re-pointed.
  - The Worker files are re-assigned to its paths at T18 publication's merge (K656). What remains is the physical move into `src/public-read/`, with its re-points, if the files stay under `src/publication/` and `src/`.
  - `src/index.mjs`' `verify` and `publishedmanifest` are **done in T18** (K691). `caseflags` and `casedocument` are T18 publication's ⚑L8.
- **project-stage** · **new**. `parseFrontmatter` (`index.mjs`:24) re-pointed to record-grammar. **Size:** 1 line.
- **publication** · **kept** ⚑L8–9. The `registerEvidenceBlock` copy is deleted once T18 filings has re-pointed (L9). `INSTALLATION_CHECKS` is re-anchored. `attestingKeys` goes to credentials. Mint-ledger seeds. Re-point case-grammar's `SECTIONS` and `signedCitations` wherever T18 publication left them.
- **ratification** · **amended**. `op=retire` is kept (BOB-3, K653). New: refuse-gate's retire-arm convert (K674 (4)). N400, N407 wording and N417 are **done in T18** (K692, K691). Its C-32.1, C-33.10–.12 and C-102.10 copies ⚑L8.
- **case-authoring** · **amended**. As drafted, plus **N424**: `#reauthorAcknowledgements` reads case-grammar's `SECTIONS.acknowledgements`, and `document.mjs` imports case-grammar's `fmSafe`. `uses` gains case-grammar (BOB's edge, before the job).
- **review** · **amended**. **N423** (already drafted as the `isMachineIdentity` re-point) gains `record-grammar` in `uses` and in its Uses section (BOB's edge). R17's wording is **done in T18** (K688).

## Layer 9

- **standards**, **consequences**, **filings**, **escalation** · **kept.** Their N242 shares are T18's ⚑L9.
- **conformance** · **kept.** The K680 test re-point is T18's ⚑L9.
- **action-grammar** (new) · **kept** ⚑L9. It needs actions' size after T18's job; the split is dropped only if actions ends well under the mark (BOB at the fold).
- **actions** · **kept** ⚑L9–10. K625's `pendingClocks` deletion follows monitoring's T18 L10 re-point.
- **[action-clocks]**, **[action-plans]** · **new, conditional** ⚑L9. Catalogue re-points if T18's copies import it: actions' `checks.mjs` and `test/m/actions/fixture.mjs`:19 do today.

## Layer 10

- **monitoring** · **kept.** `MONITOR_FREQ` to capture and C-48.8/.9 are T18's ⚑L10.
- **legacy-store** · **amended** ⚑L10.
  - T18's L10 job deletes the dead lines and unread imports, writes the four dispatch spreads (K671) and re-points `airun.mjs` (K682).
  - T19 keeps: the explicit arms replaced by the owners' ops maps, the delegation lines, `#testimonyWithin`, `#observe`, `#capturedAt`, `#viewerSees`, `schema.mjs`' duplicates, and strength's leftover `isInquiry` (STRENGTH #5). `#surfacedIn` is **done in T18** (N405).

## Layer 11

- **affordances**, **tasks**, **queue-producers**, **queue**, **instance-setup** · **kept** ⚑L11. T18's L11 does N13, N410 and N412; queue's `schema.mjs` text only if T18 left it.
- **op-declarations** · **new** ⚑L11.
  - **N420**: declare the plane read carrying `jurisdictions.combine`'s `deadlines`, `venues` and `legal_organisations`, with its `ai` scope for plan mode. Requirement worded before L11 (P18).
  - Catalogue re-points if T18's copy of `ops.mjs` imports it.
- **admission** · **kept** ⚑L11. N407's `aiCred` stamp and N411's is-admission verdict are T18's.
- **control-plane** · **kept** ⚑L11. Plus **N420**'s serve side (the read over `jurisdictions.combine`). Already T18's: `CHECK_FAMILIES` (N245, N272, N337, N403, N414), R41 `fences`/`pack` (K664, K674), N413, N419, N336, the K669 envelope.
- **plane** (new) · **kept.**
- **legacy-index** · **kept** ⚑L11. `migrate/`, `coverage.mjs`, `declared-source.mjs` and the four probes are T18's (N401). `tools/` count as above.

## Deferred beyond T19

| entry | mark | reason | evidence |
|---|---|---|---|
| rows changed at T19 L3–11, stamped | kept | a, d | promotion stamps in L2 only |
| membership's `attestingKeys`, `aiCredentialLook` copies | kept | a, d | callers re-point L3–L11 |
| docprofile's `index.mjs` re-export | amended | a, d | now `registry.mjs` as facade; it stays by design, not as a copy (moot as a deferral if BOB rules it the facade) |
| old-suite-only exports, if K635 kept | **moot** | — | K653 BOB-1: deleted in L1 |
| battery and nine instruments, guard floors, `system` suites | kept | e | the release (K619, K633, K635) |
| N57, N248, N279, N68, N70's legacy-tests and legacy-index shares | kept | e | the release |
| legacy-ui, N70/N68 legacy-ui shares, N241, N371, N389, N-A13 | kept | e | K633; UX |
| `cpra_request` identifier | kept | e | N71's rule; legacy-ui writes it |
| N-A14 | kept | e, f | legal text; source |
| N-A19 | kept | e | K624 (5), DEC-61 |
| running the planning skill | **amended** | f | requirement approved and built (K660, K662). `MODES.plan` deployed once agent-worker runs model turns (K660 (5), run-rules R14) |
| N420's agent-worker share (`PLAN_READS.profile` reads the new op) | **new** | a | agent-worker (L6) precedes the op's L11 build; T20 |
| `PLN-` affordances, plan-page surface | kept | e | K608 (4) |
| joint action | kept | e | K600 (c) |
| N345 | **moot** | — | built in T15–T16 (K656) |
| N303's rest, N317, N320, N71, N144, N232 | kept | e | Bob's |
| N70's skills share | kept | e | Bob's skills question 1 |
| contradiction R41 and K5 arms, DIST-14, N75, N34 | kept | f (N34, N75 also b) | deployment or measurement; pdf-worker 4,075 |
| N22 | kept | f | non-root runner |
| N175 | kept | e | process repository (P3) |
| action-plans' unfinished Rs, if T18 L9 defers any (largest T18 job) | **new** ⚑L9 | d | join T19 L9 via BOB (P8) |

**19 hard deferrals** (19 − 2 moot + 1 new + 1 conditional ⚑L9).

## What T19 removes (re-measured)

| legacy | draft's "today" | today (`tranche/T18` @ ba630ce2da) | after T19 |
|---|---|---|---|
| `bio-checks.mjs` | 9,982 | 8,963 (T18 L8–11 still delete ratification ~80, control-plane ~43) | 0 (**kept**) |
| `store.mjs` | 3,102 | 2,940 (T18 L8–10: release ~210, dead ~490) | 0 (**kept**) |
| `schema.mjs` | 83 | 83 | 0 |
| `src/index.mjs` | 690 | 539 (the §4.4 moves, T18 L3–8) | 0 |
| `tools/` | 76 files, 26,235 | 69 files, 25,780 | ~0 (**kept**) |

## For BOB and for Bob (draft's section)

- **BOB-1 … BOB-6** · **done**: ruled as recommended (K653).
- **Q1** · **done in T18** (K660, K662).
- **Q2** · **moot** (K656).
- **New for BOB before the fold (P17, P18):**
  - site-profiles' file list (`registry.mjs`);
  - N420's read (owner control-plane, declared by op-declarations) and its R;
  - N425's R39 sentence;
  - the `uses` edges for N423 and N424;
  - `MODULE_ORDER` in the fold act (K657);
  - whether action-grammar still splits, given actions' size after T18 ⚑L9.
- **No new question for Bob.**

## next.md housekeeping at T19's opening (met or moot by T18's close)

N137 (K675), N157 (K683), N362 (K604), N372 (K575), N400 (K692), N405 (INQUIRY #7), N406 (K650, K685), N407 (K692 + admission ⚑L11), N408 (K650 + control-plane R39 ⚑L11), N409 (K655), N411 (the three shares + admission ⚑L11), N415 (K657), N417 (K691), N418 (K655, AI-RUNS #5), N420-mail (K659), N211 (⚑L8), N242 and N249 (the owners' T18 shares ⚑L8–10), N245, N272, N337, N403, N413, N414 (⚑L11), N336, N401, N402, N410, N412 (⚑L11). All 29 leave with T18's close.
