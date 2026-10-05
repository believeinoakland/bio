# Plan T33

**Status** · OPEN · BOB #114 · session_01MWqyw89yDMqxpG2iqqSom6 · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #8 session_013Mm1CuEimicgaJCPS4wXSM; jurisdictions: JURISDICTIONS #6 session_016rKi7FqGrzSeDuh4w2sUJ7; civil-time: CIVIL-TIME #1 session_01NSP5WdNfdnMBpVCnGYLjPh; calc-grammar: CALC-GRAMMAR #1 session_01C7SS6rSXVbm5YnkpKzX2FE; connection-grammar: CONNECTION-GRAMMAR #1 session_01HtVdRtx6MjGMmTyLt1m2Ai; runtime-limits: RUNTIME-LIMITS #4 session_01MsnfffgQ6VggcGRSweB1wW; signatures: SIGNATURES #9 session_01Rj1YY4SJGHnLERzjPXfZoY; id-spaces: ID-SPACES #3 session_015zS8AH6HPe7cvTXdZEZsTf; office-readers: OFFICE-READERS #5 session_01QtEmE6Gh2wQSGswWajw28K; odf-reader: ODF-READER #4 session_01Ybi2T2Cypoam3N29qB6CKE; docprofile: DOCPROFILE #4 session_01HaSoeitaf5svNuEMw8yMQN; doctypes: DOCTYPES #1 session_01XZrZmtoRays9vT3h9cANPd; legistar-reader: LEGISTAR-READER #1 session_01Mr47bi897kmqem6V1yfAdg; roster-reader: ROSTER-READER #1 session_01Qp9gyE9dgpPJuAa5rXEJrc; court-citations: COURT-CITATIONS #1 session_01RW5iwkQepeVVJUAjHfuPiQ; court-doctypes: COURT-DOCTYPES #1 session_01UL3CanLegQc1bhXUiyGG9N; budget-doctypes: BUDGET-DOCTYPES #1 session_01KjUzvZtRDGcKxhimDx7Tpo; sheet-worker: SHEET-WORKER #1 session_01DytKFDiU55w9sQyB8CR7kJ; bundler: BUNDLER #7 session_01DSV3uLxG8oafXGYk7RWyay

**Sources** · BOB's scope decisions `plan/draft-T33-scope.md` (they win over the drafts, then the rulings); the entry drafts `draft-T33-entries-A.md` ("A", cited by construct and module, e.g. "A TIME jurisdictions"), `-B.md` ("B", ids B0.n, B1a.n, B1b.n, B2b.1) and `-C.md` ("C", ids S0-n, C-n, Q0-n, C:A-n, Q1-n, C:B-n; the `C:` prefix marks C's own A-/B- ids); the canon audit's 20 requirement changes ("audit", `draft-T33-canon-audit.md`, "Requirements whose meaning changes"); T32's carried table (`archive/T32.md`); rulings K1429–K1501. A job's START expands each entry from the draft ids it cites.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T33 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX): K633; design paused (K1475). Its half of §7 item 8 (`app.html:19983` sends `{state:"named", name}`) goes to UX-DESIGN by NOTICE; `actions` (T33-61) makes the refusal reach the caller visibly. |

**Measured GO (K1506).** Every conditional row reads GO and is in T33 with its conditions: `sheet-worker` ships inactive until the release, builds its own IronCalc wasm with the `xlsx` feature, holds a size and time limit, refuses external links, and records a failed workbook as "not recomputed here", never as a gate; `court-doctypes` reads the CourtListener docket page and the CPUC card, takes Alameda eCourt only as a member's own capture (K1492) with its row shape provisional, and keys the row diff per register; `court-citations` translates reporters-db and courts-db (BSD-2) to JS at build; `budget-doctypes` reads ACFRs from their text layer and budget books with chart labels skipped and image tables through the OCR path or marked unread.

## Rules at the opening

1. T32's rules hold. Merge order within a layer is `modules.json` order, except where the Roster says otherwise: an upstream engine merges first, and a split's new module merges before its source's deletion job (K1347, K624 (1)).
2. **The module order (R83), in one commit by BOB at the opening** (K1438, K1439, K1470; scope §2). These are BOB's edits, P17. Each is made in `modules.json` (new modules with `paths`, `tests` and the `uses` named in their entries; moves), in `layers.md` (the rows of layers 1, 5, 6, 8, 10 and 11, layer 5's contract gaining "law and local facts held over captured content", K1438, and a section per split), in `membership`'s `MODULE_ORDER` (R83), and in K11's module list. Membership's R83 list is changed by its own job, T33-19a (K1504; P7), its listener-order test with it; until that job merges, membership's order test is an accepted red naming T33-19a. New modules are registered with empty `paths` and `tests` and get them at their merge (K1336's pattern).
   - **L1:** record-grammar → jurisdictions → **civil-time** → **calc-grammar** → **connection-grammar** → test-support → runtime-limits → signatures → bundler → [**court-citations**] → id-spaces → subresources → ooxml → office-readers → odf-reader → pdf-reader → format-registry → text-chain → site-profiles → docprofile → **doctypes** → **legistar-reader** → **roster-reader** → [**court-doctypes**] → [**budget-doctypes**] → image-codecs → pdf-pixels → pdf-worker → ocr-worker → [**sheet-worker**].
   - **L5:** entities → **events** → **lines** → local-facts *(from L9)* → connections → observation-log *(moved after connections)* → standards *(from L9)* → progressions → **money** → **money-checks** → **duties** → **people** → **explore** → bias → query-language → retrieval → **calculations** → [**workbooks**].
   - **L6:** inquiry-grammar → accepted-work → **leg-earning** → inquiry → **hypotheses** → citation → basis-versions → strength → contradiction → run-rules → ai-runs → run-productions → capture-requests → skills → **answers** → **agent-harness** → **agent-model** → **agent-runner** → agent-worker.
   - **L8:** … case-carriage → **case-tensions** → publication → docket … (the rest unchanged).
   - **L9:** loses local-facts and standards. The order is otherwise unchanged.
   - **L10:** monitoring → **following** → link-sweep → scheduler.
   - **L11:** … queue-producers → **notice-producers** → queue … (the rest unchanged).
   - [bracketed] modules enter `modules.json` only when their measurement reads GO (rule 5). Otherwise their row in the Left-out table carries that file's NO-GO as the reason.
3. **New modules, with their purpose and `uses`.** Each new module's requirements are drafted before the opening (§5.9) and reviewed by BOB. Their meaning is the ladders' and the rulings'.

| module | L | purpose | uses |
|---|---|---|---|
| civil-time | 1 | pure time engine: local day, precision, EDTF bands, time rules, RRULE subset, fiscal periods, `validAt`, trace (K1439, K1444) | record-grammar, jurisdictions |
| calc-grammar | 1 | figure parser, exact decimals, closed recipe grammar and evaluator, summation refusals, recorded random draws (K1448, K1463, K1471) | record-grammar, civil-time |
| connection-grammar | 1 | connection shape, kind registry, **owner registry** (option (ii)), walk bounds and semantics, owner conformance battery (K1470, K1486, K1487) | record-grammar, civil-time |
| court-citations | 1 | reporters-db and courts-db as data, for the citation recogniser | — |
| doctypes | 1 | the seven doctypes, split from docprofile by copy (K617) | docprofile, and docprofile's current uses that the doctypes need |
| legistar-reader | 1 | Legistar Web API JSON as content: bodies, persons, office records (seats only), events, items, votes | docprofile |
| roster-reader | 1 | roster, org-chart and staff-directory readers (C2 row 12) | docprofile |
| court-doctypes | 1 | the three court-register doctypes and the register row diff | docprofile, id-spaces |
| budget-doctypes | 1 | budget and financial-report readers | docprofile, office-readers, pdf-reader |
| sheet-worker | 1 | IronCalc wasm fleet Worker: recompute a workbook | runtime-limits, bundler, test-support |
| events | 5 | dated facts, `EVT-`, participants, `when_cache`, relations, timeline and sequence, Legistar following | record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, promotion, provenance, reading-pipeline, extraction, content, entities, legistar-reader |
| lines | 5 | `LIN-` dated lines (structure, people, party and proceeding families), `structureAt`, `holderAt` (its one home) | record-grammar, civil-time, connection-grammar, record-core, membership, promotion, provenance, entities, events |
| money | 5 | `MNY-` facts, parties and funds, `MSR-` trails, `reconcile`, `committedAgainstPaid`, `authorityChain` | record-grammar, civil-time, calc-grammar, connection-grammar, record-core, membership, promotion, provenance, content, extraction, entities, events, lines, standards, progressions |
| money-checks | 5 | amount checks, the machine's money detectors (K1491), progressions R32's junction check | record-grammar, calc-grammar, record-core, membership, progressions, money |
| duties | 5 | `DUT-` held obligations, occurrences on read, recorded transitions, `powersOf` (K1440, K1453, K1466) | record-grammar, civil-time, connection-grammar, record-core, membership, promotion, provenance, content, entities, events, lines, local-facts, standards, progressions, money |
| people | 5 | `IDC-` identity claims, `PFA-` person facts, the identity cluster, `MTI-` ties, `CHK-` interest checks, `personAt`, `careerOf`, `staffingAt` | record-grammar, civil-time, connection-grammar, record-core, membership, promotion, provenance, content, sources, entities, events, lines, money, duties |
| explore | 5 | bounded walk over the owner registry, presets as kind sets (B2b.1) | connection-grammar, observation-log, civil-time, entities, events, lines, standards, progressions, money, duties, people, connections |
| calculations | 5 | `CALC-` objects over declared tables, results by key, money ingest writer, patterns and rankings (C:A-2) | record-grammar, calc-grammar, civil-time, id-spaces, record-core, membership, promotion, provenance, content, entities, events, lines, standards, money, duties, people |
| workbooks | 5 | the workbook path: binding, recompute, lint, method note, second member's check, export | calculations, calc-grammar, office-readers |
| leg-earning | 6 | the earned registry and resting-on reads, split from inquiry by copy | inquiry-grammar, and inquiry's current uses that these reads need |
| hypotheses | 6 | `HYP-` rows held and labelled, hunch hops, store-side refusals (K1467, K1487) | record-grammar, record-core, membership, inquiry, connection-grammar |
| answers | 6 | the ask contract and checks, Q3 rule services, standing questions (K1450, K1474, K1481) | retrieval, query-language, observation-log, strength, inquiry, skills, run-rules, ai-runs, calculations, standards, lines, events, money, duties, people, explore, jurisdictions |
| agent-harness | 6 | `harness.mjs` and `subsession.mjs`, pure (Q0-1) | runtime-limits |
| agent-model | 6 | model providers: API key and subscription container, caching, usage (Q0-2) | runtime-limits |
| agent-runner | 6 | the Agent SDK container image, a new fleet member with no tools and no persistence (Q0-3) | — |
| case-tensions | 8 | the case relation and revision flags and observation attribution, split from publication by copy | publication's current uses that these reads need |
| following | 10 | following bodies and registers, `per_meeting`, named register queries, portal snapshots | monitoring, capture, acquisition, events, legistar-reader, jurisdictions, civil-time |
| notice-producers | 11 | the new FINDING producers: interest checks, money detectors, standing answers, duty occurrences, dated waits | queue-producers, people, money-checks, duties, answers, inquiry |

4. **Requirement texts.** Each new module's requirements are drafted before the opening (`plan/draft-T33-req/`, settled by K1505) and become `build/requirements/<module>.md` with its `modules.json` row; every entry's changes to an existing module, the audit's 20 included, are folded into that module's file before its layer starts (§5.3, §5.9). A module created by a copy-split numbers its requirements afresh from R1, each moved one marked `(was <source> R<n>)`, and the source marks the moved ids retired, naming the new home (the link-sweep precedent; K1505).
5. **Measurements** (see Measurements): every conditional row read GO before the opening (K1506); their sub-items in T33-26 and T33-79 are in.
6. **Table classes (S0-14).** `record-core` keeps `declarePurge` as the default-class form of `declareTable`. A module with a T33 job declares its tables explicitly. Every other module keeps the defaults until its next job, so no sweep job runs (P8). Census: 52 modules, 280 tables (`measures-T33/assistant-substrate.md` #6).
7. **Gates built switched off.** Interest checks, money detectors, the sequence-anomaly, lateness and revolving-door patterns are all shown only after their false-alarm rate is measured on a gold set (K1491, K1473), with the gate value set before measuring. The AI half of standing questions is off until the 150-question bar is met (K1481).
8. **Canon item 12 (C-12).** If K1500 did not already amend TAD §8.3 and §9 ("spreadsheets only as OUTPUT"), BOB makes that canon edit at the opening, citing X113 and X135.
9. **Accepted reds, by name, at the opening:**
   1. Coverage: every id marked `*(not yet met: T33)*`, until its module's merge.
   2. membership's R83 test (`module-order.test.mjs`), for each module listed but not yet built, until that module's job merges.
   3. case-checker R13's program SHA test, until case-checker's job (T33-73) regenerates `program.mjs` after case-grammar's (S0-12, C:A-12).
   4. Importers of a copy-split's source read through its re-export until they are re-pointed. The source's deletion job then removes the copy (docprofile, inquiry, publication, agent-worker).
   5. The UI's DEC-88 tests (Bob's), carried.

## Roster (by layer)

**L1** · 19 jobs (bundler added, K1513). Merge order: record-grammar → jurisdictions → civil-time → calc-grammar → connection-grammar first, because every later entry reads `ID_TABLE`, the profile, or the three engines. Then `modules.json` order, except **doctypes before docprofile** (the copy before the deletion).
**L2** · 3 jobs: record-core first (the id allocator and `declareTable`), then membership, then credentials.
**L3** · 2 jobs: acquisition, then sources.
**L4** · 2 jobs: reading-pipeline (the `onRead` hook), then content.
**L5** · 18 jobs. Merge order: entities → **events → lines → money → money-checks → duties → people → explore**, then local-facts, connections, observation-log, standards, progressions, bias, query-language, retrieval, calculations, [workbooks]. standards merges before money. All L5 jobs run at once (P10); a downstream job codes against approved requirements and merges after its upstream.
**L6** · 15 jobs. Merge order: inquiry-grammar first; **leg-earning before inquiry** (the copy before the deletion); hypotheses after inquiry; strength and contradiction next; run-rules → ai-runs; skills → answers; **agent-harness → agent-model → agent-runner before agent-worker** (the copies before the deletion; answers before agent-worker's `/ask`).
**L7** · 2 jobs: intent, reevaluation.
**L8** · 10 jobs. Merge order: case-grammar first (C:A-12, the timeline shape), corpus-export, **case-tensions before publication** (the copy before the deletion), docket after publication, then public-read, case-checker, case-import, case-disclosures, case-authoring.
**L9** · 8 jobs, `modules.json` order: conformance → consequences → action-grammar → actions → action-clocks → filings → escalation → action-plans.
**L10** · 3 jobs: monitoring → following → scheduler (scheduler registers the new consumers, so it merges last).
**L11** · 11 jobs: queue-producers → notice-producers → queue first; then wizard-scripts, affordances, tasks, instance-setup, op-declarations; then control-plane; plane; installer last.

## Entries

Each line is one job (P8): every T33 entry for that module. Fields: what (draft ids) · rulings · est. requirements new or changed · new `uses` edges · depends on.

### L1

- **T33-1 · record-grammar** · One `ID_TABLE` (prefix → owner, form): counters `\d{4,}`; opaque 16-char `[a-z0-9]` tails for `EVT- LIN- MNY- PFA- IDC-`; `MTI- CHK- MSR- HYP- DUT- CALC-` reserved; `ENT-` widened; `idPattern(prefix)`; `isHypothesisId`; R1 (`BUNDLE_ID_RE`) and R3. `OBJECT_TYPES` gains `calculation` and the new objects (B0.1, S0-1, C:A-6) · K1470, K1467 · est 10 · uses — · depends —.
- **T33-2 · jurisdictions** · R26 widened as data: units, direction, roll, closures, tolling, computed `extension`, anchors (`entered`, `served`, `hearing`, `act`, `known`), `received` defined once (§7 item 1), `weekend`/`computation` citing CCP §§12, 12a (item 2), channel `cutoff`/`outages`, `fiscal_year`. R28 codes. R44's UNMEASURED extended to `deadlines`. Oakland's `records_response` and its five counterparties sourced (§7 item 7, C-7). The first sourced rule set: CPRA, Brown Act, OMC 2.20.070, Claims Act, FOIA. `law_ranks`, copy status, amending vocabulary, instrument-key pieces. `proceeding_kinds`/`proceeding_flows`. Fiscal-year keys, classification and identifier schemes per site. The K1493 lawful-demand kinds (Gov. Code 7928.215). The test profile supplies each (A TIME, A LAW, A COURTS; B1b.4) · K1431, K1444, K1445, K1446, K1493 · est 24 · uses — · depends T33-1. **K1504:** each rule's closures selector and the conventions of K1504 as profile data with citations (`measures-T33/time-law.md` §1); Oakland's `minutes_due_days` corrected to OMC 2.20.160 (10 business days) and the Immediate Disclosure Request (OMC 2.20.230) added; the 15 usable worked examples and their negative controls as fixtures.
- **T33-3 · civil-time** *(new)* · The pure engine of A TIME `civil-time`: local day; precision and zone; EDTF level 1; time rules (hours, business hours, forward and backward, roll, extension, tolling, close of business); basis kinds `rule|commitment|dependency|window`; direction-aware uncertain dates; bounded RRULE; fiscal periods; `validAt`; inclusive ranges; calendar validation; trace; `span`; and the zone-less `EventDate`+time join (legistar-events M-V2). Never reads `Temporal.Now`. The 20 worked examples, each with a negative control, are its tests (C-2, C-4) · K1431, K1439, K1444, K1464 · est 22 · uses record-grammar, jurisdictions · depends T33-2.
- **T33-4 · calc-grammar** *(new)* · C:A-1: the figure parser moved from `consequences/figures.mjs`; exact decimals; the closed recipe grammar (`select … compare, round, join`, sort by a stated quantity); `bio-calc/1`; result key; the summation refusals by name; no eval. Plus recorded random draws with an exact interval (C §(c)). `join` takes its id-space resolver from the caller (no edge to id-spaces, which comes later; Choices 4) · K1447, K1448, K1463, K1471 · est 20 · uses record-grammar, civil-time · depends T33-3.
- **T33-5 · connection-grammar** *(new)* · B1a.1: the shape, the kind registry with the members' words, the **owner registry** `registerOwner({owner, kinds, neighbours})` that every owner at any layer registers into (B §(b) option (ii)), bounds (depth 8, at most 10; fan-out 1,000; 5,000 nodes; time budget), walk semantics (weakest hop; as of a date; truncated plus undetermined; a "lead" label), derived ids, hub contract, the exported owner-conformance battery · K1442, K1470, K1486, K1487 · est 18 · uses record-grammar, civil-time · depends T33-3.
- **T33-6 · runtime-limits** · `INSTANCE_CLAUDE_TOKEN` retired: R13 and R17 are amended, and the copy binds no Claude credential (K1502) · K1502 · est 2 · uses — · depends —.
- **T33-7 · signatures** · S0-13/B0.2: `sshsig.mjs:357` and `sign-release.html:466` read `ID_TABLE` · K1470 · est 1 · uses **record-grammar** · depends T33-1.
- **T33-8 · court-citations** *(new; GO, K1506)* · reporters-db (1,236 reporters and 2,369 variants as pinned, `courts-workbooks.md` §2) and courts-db as versioned data, with their licence and source named (A COURTS 2a) · K1449 · est 5 · uses — · depends —.
- **T33-9 · id-spaces** · B1b.3: spaces `account`, `object`, `vendor`; person schemes (Legistar `PersonId`, filer id, licence, bar number); the profile `proceeding` space (case-number forms; K1452); the **citation recogniser** (C1), reading court-citations when present · K1441, K1452 · est 7 · uses court-citations *(if GO)* · depends T33-2, T33-8 *(if GO)*.
- **T33-10 · office-readers** · C:A-3: typed cells (value, type, cached value and formula kept; R10 never recalculates). Office metadata (author, created, modified) exposed for edit acts (B §(d) EVENTS 3). P6: wiring only (Notes) · K1448 · est 4 · uses — · depends —.
- **T33-11 · odf-reader** · C:A-4: typed cells, the same contract · K1448 · est 2 · uses — · depends T33-10.
- **T33-12 · docprofile** *(split source)* · Deletes its copies of the seven doctypes. Keeps the pipeline, readtext, the shared helpers and the registry seam. The static imports in `doctypes/registry.mjs` become a registration wired by `plane` (A §(c)). No meaning changes · K617 · est 1 · uses — · depends T33-13.
- **T33-13 · doctypes** *(new, by copy)* · The seven doctypes. The `regulation` reader gains section paths and headings (`portion` extents), and definitions and exceptions (A LAW 1a, 2) · K617, K1446 · est 8 · uses docprofile · depends T33-2.
- **T33-14 · legistar-reader** *(new)* · Legistar JSON as a generic content type: `bodies`, `persons`, `officerecords` (seats only; contact fields dropped, K1485 row 9; paged at 1,000), `events`, `eventitems`, `votes`, the posting times (`EventAgendaLastPublishedUTC`), and the matter enactment fields. Output is a system-rule assertion (DEC-52; K1443). Tested against captured fixtures (A ORG 1b doctypes; B §(d) EVENTS 2a; legistar-events) · K1443, K1468 · est 8 · uses docprofile · depends T33-12.
- **T33-15 · roster-reader** *(new)* · Roster, org-chart and staff-directory readers, feeding `people.staffingAt` through `registerRosterSource`. A staff-directory name is read as a grade-C person reference (C2 row 12; B §(d) PEOPLE 2b) · K1452, K1484 · est 6 · uses docprofile · depends T33-12.
- **T33-16 · court-doctypes** *(new; GO, K1506)* · The three register doctypes (Alameda eCourt, a CourtListener docket page, a CPUC card) and the register row diff (A COURTS 2a) · K1443, K1480 · est 8 · uses docprofile, id-spaces · depends T33-9, T33-12.
- **T33-17 · budget-doctypes** *(new; GO, K1506)* · Budget and financial-report readers; departments as dated groupings, keyed on org and fund codes (legistar-events, budget codes) (C §(c) ANALYSIS L4) · K1468, K1471 · est 8 · uses docprofile, office-readers, pdf-reader · depends T33-10, T33-12.
- **T33-18 · sheet-worker** *(new fleet Worker; GO, K1506)* · IronCalc wasm. Recomputes a workbook and returns values with the engine version. Inert until the release (the ocr-worker precedent). Built with bundler's `writeMember` as ocr-worker is (C §(c) ANALYSIS L3) · K1448 · est 12 · uses runtime-limits, bundler, test-support · depends —.

- **T33-18a · bundler** *(added under P10's exception, K1513)* · A test-only change: `fleetbundles.test.mjs`'s pinned member list gains `sheet-worker` and `GUARDED_FLOOR` goes to 4, merged right after sheet-worker (T33-18), so the new fleet member is guarded from its merge. No requirement changes meaning.

### L2

- **T33-19 · record-core** · S0-2/S0-3/B0.12: `allocId` from `ID_TABLE` (no ceiling; opaque tails). `declareTable` with purge, expunge, export (`yes|admin-only|never`), sight, `derive` and version chain; `declarePurge` is kept as its default form (Rule 6). The derived-cache convention (rebuild and byte-compare helper; read fail-closed). The store-gate hook for one-home checks. Expunge with a tombstone (K1493). Tests mint the 10,000th id of every prefix · K1470, K1489, K1493 · est 10 · uses — · depends T33-1.
- **T33-19a · membership** · B1a.12/A LAW membership: R83 `MODULE_ORDER` re-pinned to the order of Rules (2), with its listener-order test (R-2 L-E7); modules listed but not yet built are tolerated by name until their job merges (Rules (2), item 2). P7: module code changes only in a module job (K1504) · est. 1–2 · uses: — · depends: none (the order is fixed at the opening).
- **T33-20 · credentials** · Q0-7 re-scoped (K1502): **member-level references only**, either the member's own subscription token (`claude setup-token`) or their own API key, `{kind}`. Each is held by the member's own act, sealed at rest under that member, never shown or exported, and usable only for that member's asks, runs and standing questions. A member with neither has no assistant. The suggestions switch (K1479) and the standing-question switch (K1500) are the member's own. There is no group or project level. Q1-3: a short-lived read-only `ai` grant minted at the member's act, writing no run row. The group's keyed-service references, off by default (K1449) · K1450, K1479, K1481, K1502 · est 9 · uses — · depends T33-6.

### L3

- **T33-21 · acquisition** · Memento asked for a past date (`index.mjs:291–293`; A TIME 3). The keyed-service fetch path, built in and off by default with the group's own key; CourtListener Citation Lookup is its first client (K1449; A COURTS 3) · K1449 · est 4 · uses — (credentials already used) · depends T33-20.
- **T33-22 · sources** · A member-keyed outside source (paid people-search, by a member's own act on their own account): cited at a lower grade, marked not reproducible by the public, never bulk-imported (K1492 (3), K1449) · K1449, K1492 · est 3 · uses — · depends —.

### L4

- **T33-23 · reading-pipeline** · B1a.4: the opt-in after-read hook `onRead(module, fn, {captureClasses})`, run after commit in `MODULE_ORDER`, refusing through `listenerRefusal` · K1468, D177 · est 4 · uses — · depends —.
- **T33-24 · content** · C:A-5: a cell's or range's value is readable through its table (`heldTextAt`). P6: wiring only · K1448 · est 2 · uses — · depends T33-10, T33-11.

### L5

- **T33-25 · entities** · B1a.3 and A ORG: scheme identifiers `{scheme,id,valid?,basis}` resolving at grade A; kinds `program`, `place`, `proceeding`; closed `sector`; R26 reworded (audit; K1487); `neighbours` for declared relations. **C1 proceeding facet**: forum, `forum_kind`, `number` as an alias in the profile `proceeding` space, `kind`, label, the caption as alias (K1452), and machine registration from a captured caption (K1443). S0 `ENT-` width · K1441, K1443, K1452, K1453, K1487 · est 14 · uses connection-grammar, civil-time · depends T33-5, T33-9, T33-19.
- **T33-26 · events** *(new)* · B1a.2 whole (dated facts, `EVT-`, `when_cache`, participants with K1465's roles, `onWhenChanged`, `ACT-` aliases and `eventForAct`, `neighbours`, table declarations, store checks). Then 2a, 2b and 3: `timeline`; three-valued `sequence`; the two lanes; `registerEventSource`; relations `authorises`, `answers`, `amends`, `reverses`, `stated_cause`, `within`; `whoWasSent` and statements in order; edit acts from office metadata. **Legistar following**: machine-written events, participants and votes for a followed body, with posting times as `publication` events, fed by legistar-reader. Proceeding status as of a date (`proceedingStatusAt`, through `validAt` and the profile flows). The connection owner is registered. CONDITIONAL sub-item (courts-workbooks GO): a register row becomes a `filing` or `order` event (B §(d) EVENTS; A COURTS 2a) · K1443, K1444, K1465, K1468, K1470, K1494 · est 35 · uses (new module) as in Rule 3 · depends T33-3, T33-5, T33-14, T33-19, T33-23, T33-25.
- **T33-27 · lines** *(new)* · A ORG `lines` and B1a.5. Row shape, bounds and `bound_cache`. **Every closed kind now**: structure, people (K1453, K1455), and the party and proceeding families `party_to{role}`, `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from` with reads (C1). Two-axis grade. `structureAt`, `holderAt` (its one home), `neighbours`, both-end indexes, one-home checks, table declaration. Legistar seats are machine-attributed and dated "as recorded by Legistar", with a staleness rule (legistar-events M-P2). No `chain` walker · K1441, K1443, K1453, K1455, K1470 · est 45 · uses (new) · depends T33-26.
- **T33-28 · local-facts** *(moved L9 → L5)* · R3 horizons on the local day (§7 item 3). R6 `factPath` follows `part_of` lines, with the profile `offices` kept as fallback (A TIME, A ORG) · K1438, K1444 · est 3 · uses **lines, civil-time** · depends T33-27.
- **T33-29 · connections** · S0-7/B0.4 (`ID_TABLE`); B1a.6 (co-mention as the derived kind "mentioned together"; a capped read answers `truncated`; hubs per X110 and the M-P4 thresholds) · K1470 · est 5 · uses **connection-grammar** · depends T33-1, T33-5.
- **T33-30 · observation-log** *(moved within L5)* · S0-8/B0.5 · K1470 · est 1 · uses — · depends T33-1.
- **T33-31 · standards** *(moved L9 → L5)* · A LAW `standards`: instrument key, `portion`, `requires`, `copy`, `current_through`, `period_basis`; `inForceAt` through `validAt` (R7 widened); `inForce` kept as an alias (Choices 18); `standardsFor`; `STANDARD_NO_TEXT`. B1a.7: the connection owner, and "in force at an event's date". **Member-recorded law relations** (temporal and referential, kept apart, D192), `validAt` across standards, tenures and relations, recodification across addresses. The **citation resolver** ("verified" only for a held capture stating the citation; CourtListener lookup through T33-21 when switched on). **L4 links held as data** (`interprets`, `applies`, `holds_invalid`, treatment rows, still standing on a date) · K1438, K1442, K1446, K1447, K1449 · est 45 · uses **entities, events, connections, civil-time, extraction, connection-grammar, acquisition** · depends T33-26, T33-30.
- **T33-32 · progressions** · R16 counts through civil-time units. R16 runs on the event's own date, and the out-of-order shape is added (audit; K1444 (ii)). A flow basis may name a held standard. B1a.8: "placed on a declared flow". The listener-order test after the re-pin (R-2 L-E7). R32 moves to money-checks (Choices 11) · K1444, K1446 · est 8 · uses **civil-time, standards, local-facts, events, connection-grammar** · depends T33-28, T33-31.
- **T33-33 · money** *(new)* · B1b.2: the full `MNY-` row, summation refusals, interfund, `source` never a `CALC-`, no "ours", one op family, `neighbours`. Then L2–L3: `MSR-` trails and attribution sets, `reconcile`, `committedAgainstPaid`, change orders linked by `amends`, `authorityChain`, settlements as money facts concerning a proceeding (A COURTS A6) (B §(d) MONEY) · K1443, K1463, K1468, K1470 · est 50 · uses (new) · depends T33-4, T33-27, T33-31, T33-32.
- **T33-34 · money-checks** *(new; split at creation)* · Amount checks over money facts. The machine's money detectors: data-defined, each with its denominator and derivation, results in a table, built with display gated (Rule 7). progressions R32's junction check, moved here (T32 A37) · K1471, K1473, K1491 · est 15 · uses (new) · depends T33-33.
- **T33-35 · duties** *(new)* · The core per scope §1: `DUT-` with modality, obligor (a body, or a person where a law binds them; K1453), source at its version, trigger, exceptions, enforcer, `arising_in`, `reported_status[]`; occurrences derived on read; recorded transitions (via scheduler T33-79); `registerTriggerSource` and `registerOccurrenceEvidence`; `powersOf`; the connection owner. Also: person duties (filer, registrant); `pay` duties, restrictions, thresholds and transfer authority citing money facts; and C2 duties from orders, decrees, grand jury and audit recommendations (933.05 vocabulary). A computed or proposed duty is adopted by one member act (K1440) (A ORG O2; B §(d) MONEY, PEOPLE; A COURTS C2) · K1440, K1442, K1443, K1453, K1466 · est 70 · uses (new) · depends T33-33.
- **T33-36 · people** *(new)* · B1b.1 (`IDC-` claims graded per K1488, the cluster, `PFA-` facts, `personAt`, `careerOf`, `identityOf`, candidates explained field by field, sight per K1489, `neighbours`). Then 2b and 3: `credentialsOf`, `interestsOf`, `statementsOf`; Form 700 interests entered by a member from cited extents; member ties `MTI-` (K1490); the protected source↔person link (export `never`); `CHK-` interest checks run by a scheduler consumer (display gated); revolving-door patterns behind the K1473 gate; `staffingAt` with `registerRosterSource`. Removal with a marker only for the K1493 classes; imports never bulk-copy addresses or phones (audit). M-P5 and M-P6 run in the job · K1452, K1473, K1483–K1493 · est 55 · uses (new) · depends T33-35, T33-22.
- **T33-37 · explore** *(new)* · B2b.1: `explore({from,to?,kinds?,at,depth})` over connection-grammar's registry, with absence levels from observation-log; it writes nothing and logs no one. Presets as kind sets: org chains, flow walks, overlaps and `pathBetween`, relation kinds. Owners after it register by themselves (contradiction, hypotheses). M-X1a, the synthetic test at real volumes, runs in the job · K1442, K1470, K1486, K1487 · est 30 · uses (new) · depends T33-36.
- **T33-38 · bias** · S0-9/B0.6 · K1470 · est 1 · uses — · depends T33-1.
- **T33-39 · query-language** · C-5a (`overdue:` with an `asOf` note); C-5b (inclusive local-day ranges); fields `standard:`, `cites:`, `person:`, `holder:`, `post:`, money fields, `event:`, `occurred:`, `obligor:`, `owed_to:`; the saved-query form for standing questions (A TIME, A LAW, A ORG; B1b.7; C §(c) L5) · K1444, K1481 · est 16 · uses **civil-time, standards, lines, events, money, duties, people** · depends T33-37.
- **T33-40 · retrieval** · The R2 projection for T33-39's fields. The saved query is the member's own object, seen only by its owner (K1481) · K1450, K1481 · est 6 · uses **standards, lines, events, money, duties, people** · depends T33-39.
- **T33-41 · calculations** *(new)* · C:A-2 whole; C:B-1 (money totals as recipes; the money ingest writer at a member's request; B1b.5); C:B-2 (person-keyed joins only through an id space or crosswalk). Fills `registerOccurrenceEvidence` and the roster source. Counts over the record. `buys`, unit cost, budget against actuals across years, and rankings (K1471). Sequence-anomaly and lateness patterns, and patterns about an office and across proceedings with denominators (display gated). Dataset vintages through `validAt`. Recorded draws through calc-grammar · K1447, K1448, K1468, K1471, K1491 · est 50 · uses (new) · depends T33-4, T33-35, T33-36, T33-40.
- **T33-42 · workbooks** *(new; GO, K1506)* · Binding, recompute through sheet-worker, lint, method note, the second member's check (disclosed, never a gate), export recipe→XLSX (C §(c) ANALYSIS L3) · K1448 · est 15 · uses calculations, calc-grammar, office-readers · depends T33-18, T33-41.

### L6

- **T33-43 · inquiry-grammar** · S0-4/B0.3; C-6 `DATE_RE` through civil-time; the R4 leg arm admits a held standard (K1447 (iii)); C:A-7, the `calculation` leg kind; the duty-occurrence leg kind (K1447 (i); Choices 16) · K1447 · est 8 · uses **civil-time, standards** · depends T33-31, T33-35, T33-41.
- **T33-44 · leg-earning** *(new, by copy from inquiry)* · The earned registry and resting-on reads (`legCapped`, `earned`, `earnedForDoc`, `cyclePath`, `basisFor`, `restingOn`, `earnedBasis`, `restsOnLive`, `projectsDrawingOn`). The job's START confirms the seam against the code. Then R13's `earned`/ceiling for an `STD-` target and the occurrence leg · K617, K1447 · est 3 · uses as Rule 3 · depends T33-43.
- **T33-45 · inquiry** *(split source)* · Deletes the moved code. R4 wording (audit). C:A-8: accepts the `calculation` leg. **Dated waits on an inquiry**: recheck dates read by a scheduler consumer, raised by notice-producers (A TIME ext.) · K1447, K617 · est 6 · uses **leg-earning, calculations, civil-time** · depends T33-44.
- **T33-46 · hypotheses** *(new)* · B1a.13: `HYP-` rows (cause, identity, relation, flow, other) with their project's sight. Hunch hops registered as a connection owner, scoped to the working inquiry; a chain through one is labelled a lead. Store-side refusals in a leg, total, check or absence level (`isHypothesisId`); a leg may not cite a derived id whose chain carries a declared or hunch hop · K1467, K1473, K1487 · est 8 · uses as Rule 3 · depends T33-45.
- **T33-47 · strength** · C:A-9 (calculation leg grades). R12: one issuing source (lines). INT C-18: independence fails on a shared person, event origin, ledger table, or an `acts_for`/`within` tie. The occurrence leg's derivation · K1447, K1470 · est 9 · uses **calculations, lines, events, money, people, duties** · depends T33-43.
- **T33-48 · contradiction** · `registerConnectionOwner`; the key "two amounts for one transfer"; contradiction on documents' own dates (B §(d)). P6: 3,256 lines, no other additions · K1470, K1487 · est 6 · uses **connection-grammar, events, money** · depends T33-47.
- **T33-49 · run-rules** · Q0-5 (`plan` deployed only by its own flag; the ceiling refusals; per-ask bounds; the `verification_recorded` act); Q1-2 (mode `ask`); the K1481 exception for a member-authored standing question, read-only and bounded (audit) · K1450, K1481 · est 8 · uses — · depends —.
- **T33-50 · ai-runs** · Q0-6: usage per model call, the `ai_usage` table (`admin-only`), a ceiling **per member**, set by the member, which an administrator may set lower for the copy's own load (K1502); `op=aiusage`. The standing question's run counts within its member's ceiling · K1450, K1481, K1502 · est 8 · uses **civil-time** · depends T33-49.
- **T33-51 · capture-requests** · Audit (K1492 (2), (4)): a personal site or a login-gated platform is captured only by a member's own act in their own browser; a request for one is refused by name or routed to the member · K1492 · est 2 · uses — · depends —.
- **T33-52 · skills** · The `legal_lookup` skill text (A LAW). Q1-5: the pack's `ask` layer. The suggestions switch read (audit; K1479) · K1474, K1479 · est 7 · uses — · depends T33-49.
- **T33-53 · answers** *(new)* · Q1-1 (the answer contract, the asking scope as K1450 lists it, the four refusals, the closed book and labels, `registerRuleService`, tallies `admin-only`). C:B-3 (money facts; person entities in scope; ties, the source link and hidden rows out). **Q3 rule services**: law (including R39's standard of proof per venue), time, organisations, holders (`holderAt`, `careerOf`), figures, duties and occurrences. The widened reads `timeline`, `eventsFor`, `moneyOf`, `committedAgainstPaid` and `explore` (audit R37). **L5 standing questions**: saved search, cadence, end date, change detection; the AI-on-new-finds half built and off (Rule 7) · K1450, K1474, K1479, K1481, K1502 · est 55 · uses (new) · depends T33-40, T33-41, T33-50, T33-52.
- **T33-54 · agent-harness** *(new, by copy)* · Q0-1 seam (ii): `harness.mjs`, `subsession.mjs` (R13–R16, R20, R41, R50 moved) · K617, K1439 · est 1 · uses as Rule 3 · depends —.
- **T33-55 · agent-model** *(new, by copy)* · Q0-1 seam (iii) plus Q0-2: provider per **member's** reference (API key: the Messages API with `cache_control`; subscription: Claude Code unmodified in the container through the Container DO binding, token per call, never stored); `usage` returned; the model per mode chosen by measurement (R40 amended) · K1429, K1502 · est 6 · uses as Rule 3 · depends T33-54.
- **T33-56 · agent-runner** *(new fleet container)* · Q0-3: Dockerfile and a Node entry over `@anthropic-ai/claude-agent-sdk`, with built-in tools off (not bare mode), no settings sources and no persistence (K1502). Tool calls relay to the Worker through an in-process MCP stub (assistant-substrate M-Q4: GO, relay). An image pinned by digest. It reaches only `api.anthropic.com` · K1429, K1474 · est 7 · uses — · depends T33-55.
- **T33-57 · agent-worker** *(split source: the shell)* · Deletes the moved code. Q0-4 (one truth for model turns; R35 for the Container DO binding; R53 plan's deployment as an explicit act). Q1-4 (`POST /ask` through the grant and `answers`' checks; R37 `PLANE_OPS` widened, audit). R32: the cascade becomes the member's own reference only (K1502). R35 and R40 per audit. The member's suggestions switch is honoured · K1429, K1450, K1479, K1502 · est 12 · uses **agent-harness, agent-model** · depends T33-53, T33-56.

### L7

- **T33-58 · intent** · The amount filter (intent R4) over money facts (C §(c)) · K1471 · est 2 · uses **money** · depends T33-33.
- **T33-59 · reevaluation** · B1a.11 (`event_changed`: "participant re-resolved", "when moved"; depth per Choices 19). C:A-10 (`calculation_input_changed`). X73: version notices across addresses through instrument keys, including recodification. M-V5 (fan-out of a Legistar re-import, synthetic) runs in the job · K1470, K1446 · est 7 · uses **events, calculations, standards** · depends T33-26, T33-31, T33-41.

### L8

- **T33-60 · case-grammar** · S0-12/B0.7 (`NOTICE_REFERENCE_PATTERN`). C:A-12 (calculations in the case file). PROV-O for inputs and outputs. The published timeline's shape: two lanes never mixed, each item with its source (C11) · K1448, K1494 · est 7 · uses **calc-grammar** · depends T33-1, T33-4.
- **T33-61 · corpus-export** · S0-15/B0.13: every declared table by class, paged with a sha256 per page; `never` named in the manifest; import verifies pages; the entities tables exported. Renderings: FtM `Event`, OCEL 2.0, Popolo (persons, organisations, memberships), FtM people, FtM, OCDS and Fiscal Data Package for money. Paging cost measured on a large fixture in the job · DEC-112, K1489 · est 14 · uses **events, lines, money, people, entities** · depends T33-19.
- **T33-62 · case-tensions** *(new, by copy from publication)* · The case relation and revision flags (`caseTensions`, `caseRelation`, `flagCasesOnRevision`, `dischargeCaseFlags`, `caseFlags`) and observation attribution (`attribution*`, `attributeObservation`). The START confirms the seam · K617 · est 0 (moved) · uses as Rule 3 · depends —.
- **T33-63 · publication** *(split source)* · Deletes the moved code. K1480's edition stamp for a court order (remove, redact, seal, unseal). C11: the timeline frozen into the edition at signing (K1494) · K1480, K1494 · est 5 · uses **case-tensions** · depends T33-60, T33-62.
- **T33-64 · docket** · K1480's compliance path: the order captured, a signed docket entry names it, the edition stamped; sealing and unsealing likewise (audit; A COURTS). Docket's own dates as events, and `registerEventSource` for "what we did" · K1480, K1493 · est 8 · uses **events** · depends T33-63.
- **T33-65 · public-read** · C:A-15 (calculation outputs with denominators and the "computed fact" label); the published timeline shown (C11) · K1448, K1494 · est 4 · uses **calculations** · depends T33-63.
- **T33-66 · case-checker** · C:A-13: recomputes recipes; calc-grammar bundled into `program.mjs` (R13 kept) · K1448 · est 2 · uses **calc-grammar** · depends T33-60.
- **T33-67 · case-import** · C:A-14: recreates calculations and never trusts them · K1448, DEC-112 · est 2 · uses **calculations** · depends T33-60.
- **T33-68 · case-disclosures** · B1a.9: the DR6 filter per K1483, with a recorded basis per named person and an unrecorded basis refused pre-flight (a new C-120.x row); addresses and phones never published. The C7 pre-flight attestation of no undeclared tie, vendors in the money included (K1490). Timeline people as DR6 allows (K1494) · K1483, K1490, K1493, K1494 · est 13 · uses **entities, events, lines, money, people** · depends T33-63.
- **T33-69 · case-authoring** · C:A-15: pre-flight refuses only an undisclosed differing or unbound load-bearing calculation (DEC-76.4) · K1448 · est 2 · uses **calculations** · depends T33-68.

### L9

- **T33-70 · conformance** · Actors carry an `entity_id`. R3 reads `inForceAt`. B1a.10: `determine` takes `act:{event}`, `ACT-` is an alias, the person actor is retired for the record (audit Terms). The conformance act in full (EVENTS 2b) · K1465, K1485 · est 10 · uses **entities, events** · depends —.
- **T33-71 · consequences** · B1b.6 (money operands through calc-grammar). C:A-11 (R2 accepts calculation outputs; its own parser deleted). R10 per audit (a person a document names may be a harmed party; published only with consent or as DR6 allows) · K1448, K1484 · est 8 · uses **money, calc-grammar, calculations** · depends T33-70.
- **T33-72 · action-grammar** · S0-10/B0.8 · K1470 · est 1 · uses — · depends —.
- **T33-73 · actions** · S0-5/B0.9. C-3: R12 on the local day (audit). R15's calendar dates. An addressee suggested from `custodian_of`/`responsible_for`. R9 narrowed: addressed to an office by role and body, showing the holder on the date, never a person (B1a.14; K1484 row 5); `entity_id` filled from the bridge. C-8 plane half: the refusal reaches the caller visibly. A governing law and a records-request law may name a held standard (K1446). The `proceeding` link (C1). `registerEventSource` ("what we did"). Fills duties' `registerTriggerSource` · K1444, K1446, K1484 · est 16 · uses **civil-time, lines, events, standards, duties** · depends T33-72.
- **T33-74 · action-clocks** · C-1 (`received` from `sent`; `clocks.test.mjs:166–179` corrected). C-2 and C-4: `computeDeadline` delegates to civil-time (roll, weekend from the profile, extension, hours). R7: basis kinds; a deadline may name a held standard. A computed deadline is adopted in one member act. The `.ics` one-off download (K1451). The cross-action lateness index over the group's own clocks, never a finding about government (D234) · K1431, K1440, K1444, K1446, K1451 · est 11 · uses **civil-time, standards, calc-grammar** · depends T33-73.
- **T33-75 · filings** · The chronology as a timeline read (events; B §(d)) · K1494 · est 2 · uses **events** · depends T33-74.
- **T33-76 · escalation** · R12 targets follow `oversees`/`appoints` lines, with the profile flag as fallback. R4's actor resolved to its entity. `registerEventSource` · K1442 · est 3 · uses **entities, lines, events** · depends T33-75.
- **T33-77 · action-plans** · A step may be conditioned on a duty occurrence's state (met, met late, overdue, undetermined), so an overdue response activates the next step; the group's own missed checkpoint stays never a finding (R23) · K1466 · est 3 · uses **duties** · depends T33-76.

### L10

- **T33-78 · monitoring** · S0-6/B0.10. C-3: R34 on the local day. R15 reworded: a watch may follow a named register query for a person, never an unattended crawl of a person (audit; K1484 row 11). No following code is added (P6) · K1444, K1484 · est 3 · uses **civil-time** · depends —.
- **T33-79 · following** *(new; monitoring's split)* · Following a body via Legistar (scheduled reads; the live acquisition waits for the release). `per_meeting` captures at meeting time minus the notice period, from profile recurrences and observed meetings. Register following: re-render on the tick, a member switching a watch on (R-2 C-E1), and the member's own act for account-gated registers (K1449; the court register path CONDITIONAL on courts-workbooks GO). The named register query for a person. Watching Legistar enactments for version notices (Choices 17). Portal snapshots and keyed field diffs · K1444, K1449, K1468, K1484 · est 15 · uses as Rule 3 · depends T33-78.
- **T33-80 · scheduler** · R9 registers the new consumers of earlier modules: duty transitions (K1466), interest checks, money detectors, standing questions, dated waits, following · K1466, K1481, K1491 · est 5 · uses **duties, people, money-checks, answers, inquiry, following** · depends T33-79.

### L11

- **T33-81 · queue-producers** · C-3b: the five UTC-day sites delegate to civil-time; R25 `due` is the local day. R2 names notice-producers for the new FINDING kinds (audit). Nothing new is added (P6) · K1444 · est 3 · uses **civil-time** · depends —.
- **T33-82 · notice-producers** *(new; queue-producers' split)* · The new FINDING producers: interest-check and money-detector "Noticed" items (labelled as the machine's, in the hypothesis layer, with denominator and derivation, switchable off per project, display gated); the standing-question answer (labelled as the assistant's, told once); duty occurrences (`temporal-expectation-due`); dated waits due · K1466, K1473, K1481, K1491 · est 10 · uses as Rule 3 · depends T33-81.
- **T33-83 · queue** · The snooze-by-date and `:246` on the local day. R1 `classOfKind` for the new kinds (audit). The `due` sort is already built (§7 item 13) · K1444, K1481, K1491 · est 5 · uses **civil-time, notice-producers** · depends T33-82.
- **T33-84 · wizard-scripts** · Q1-7: the wizard registry form (the library is the design stream's) · K1430 · est 2 · uses — · depends —.
- **T33-85 · affordances** · B1a.15: the new closed vocabularies with the members' words (K1486). C:A-16. Q1-7: refusals explained from translations and dry runs. P6: data and wiring only · K1486 · est 5 · uses **events, lines, money, people, connection-grammar, calculations** · depends —.
- **T33-86 · tasks** · S0-11/B0.11 · K1470 · est 1 · uses — · depends —.
- **T33-87 · instance-setup** · A ORG 1a bridge: profile offices seeded as `office` entities with `post_in`/`part_of` lines, matched after normalisation (legistar-events: 3/5). 1b seat seeding (B1b.8): Council and committee seats, holders as `person` entities with `PersonId`, `holds` with `capacity`, dated "as recorded by Legistar". Q0-9 (K1502): records that the assistant is enabled for the copy, and each member's disclosure (D311) shown when they connect their own account, with who and when; asks and runs are refused while the assistant is off · K1443, K1468, K1478 (i), K1502 · est 8 · uses **entities, lines, people, legistar-reader** · depends —.
- **T33-88 · op-declarations** · `op=clockpropose` (§7 item 2); the ORG and LAW reads and acts; the op families of events, money, people, duties, explore, hypotheses, calculations and answers (`ask`, `aiusage`, account references); one append site each, stamped (B1a.16, Q0-10, Q1-6, C:A-16) · K1122 · est 8 · uses — · depends —.
- **T33-89 · control-plane** · Wiring only: the route arms published by their owning modules (K1122). Grows by under 50 lines · K1122 · est 2 · uses **the new arms' owners (events, lines, money, duties, people, explore, hypotheses, calculations, answers)** · depends T33-88.
- **T33-90 · plane** · The composition root wires the new modules, docprofile's doctype registration (T33-12), the new arms, and the screens registry (`SCREENS`, Q1-7) · K1122 · est 5 · uses **every new module** · depends T33-89.
- **T33-91 · installer** · Q0-8 shrunk (K1502): no `instanceClaude`, and the copy binds no Claude credential. The setup offers the assistant as optional (K1478 (i)); the per-member disclosure is at connect time (T33-87; NOTICE to UX-DESIGN). The fleet step learns the container member agent-runner and, if GO, sheet-worker. newgroup's OAuth gains the Containers Write scope, each group re-consents, and Workers Paid is required (assistant-substrate §3, M-Q8) · K1478 (i), K1502 · est 4 · uses — · depends T33-90.

## Measurements

**Desk, before the opening** (`build/plan/measures-T33/`):
- `assistant-substrate.md` (exists) feeds T33-1 (16-char tail), T33-6, T33-20, T33-53 (the 150-question set and bar), T33-55, T33-56 (M-Q4: relay), T33-91 (M-Q8: scope), and Rule 6 (the table census). Its M-Q5 verdict was settled by Bob's K1502.
- `legistar-events.md` (exists) feeds T33-3 (zone join), T33-14, T33-26 (M-V1, M-V2, M-V3), T33-27 (dated seats), T33-29 (M-P4 hubs), T33-87 (bridge rate), and T33-17 (budget codes).
- `courts-workbooks.md` (GO, K1506) decided T33-8, T33-16, T33-18 and T33-42, the CONDITIONAL sub-items of T33-26 and T33-79, and half of T33-17. It covers the three registers captured whole with their number forms, and IronCalc's functions, agreement and wasm size over the 288 workbooks.
- `money-people.md` (to come) decides the rest of T33-17 (M-55). It feeds T33-33 (M-M0a–c, M-M2, M-M3, and the M-M1 fixture), T33-36 (M-P1, M-P3, M-P7) and T33-41 (the dataset census and recipe coverage).
- `time-law.md` (exists) feeds T33-2, T33-3 and T33-74 (the 20 worked examples, primary sources, C-7). It feeds T33-13 (section-boundary accuracy on 50 OMC pages) and T33-31 (codifier lag, how the code is served).

**Inside jobs (they need T33-built code):** the 10,000th-id tests (T33-1, T33-19); the derived-cache rebuild-and-compare (T33-19); exactness against a decimal reference (T33-4); M-M1 on the 200 figures (T33-33); M-P5 and M-P6 (T33-36, with the gate set first); M-X1a (T33-37); M-V4, the cost of writing dated facts (T33-23/T33-26; it gates only a later move into the promote transaction); M-V5 (T33-59); corpus-export paging (T33-61); the listener order (T33-32); the line-grade distribution and the exact bridge rate (T33-27, T33-87; informational); M-C8 false-alarm rates on desk gold sets (T33-34, T33-36, T33-41; display gate, Rule 7).

## The release at T33's close (K1501)

After the last layer closes, BOB cuts one release, then runs the deployment-gated measurements at once, so T34 carries the work they unlock. BOB does this on its own initiative and does not ask Bob to approve it (K1501).
1. **Full regression** (§11; the `regression` workflow).
2. **The signed release and distribution.** This covers the new fleet members (agent-runner's image, and sheet-worker if GO), the regenerated bundle (§7 item 13's `LAW_LEVELS`), N461's release share and N471's release copies (B11, C9), the newgroup installer (C3, N336), `MODES.plan` deployed (C2), and the migrations at every instance (B16 N473, C1 office-readers R28/R29).
3. **Deployment-gated measurements, run at once:**

| measurement | unlocks in T34 |
|---|---|
| VF-4 (= M-Q3), CHECK's first live run; Q0-11 ends in `verification_recorded` | investigate's own live verification, then Q2 and Q4 |
| M-Q1, one model turn through each path | the model per mode; the rate-limit tier confirmed |
| M-Q2, container reliability | the member subscription path's go/no-go |
| M-Q6, the default use ceiling | the ceiling's default value (T33-50 ships a provisional one) |
| M-Q7, per-ask bounds | the bounds' values (T33-49) |
| M-Q9, the 150-question set on two models | switching on the AI half of standing questions; Q3 rule services shown; the Q2 bar's baseline |
| N540, live acquisition with the Civicsmith user agent | the sources measured before, re-read live; N540 closed |
| Legistar live acquisition | following a body live (T33-79); the seat seed refreshed live; Legistar enactment watching |
| everyday response budgets (K1432), before and after T33's code | budget regressions found and fixed in T34 |
| M-X1b, Bob's chain on real data (after the first populated deploy) | explore's budget constant tuned |
| B1 DIST-14, B2 N75, B3 N34 bounds | office-readers' CSV bound, image-codecs, pdf-worker |

**Acts that may need Bob under §16 (K1501):** pushing the release tag (refused twice, K1433, K1436; never retried); the fast-forward of `main` (refused once, K1454); a signature only Bob's key can make (the `bio-release` key through `sign-release.html`, if only he holds it). For each, the one act is named to Bob, never worked around. Also Bob's, for the measurements: his own Claude sign-in or API key connected as a member of the test copy (K1502), Console credit, and enabling Containers on account `20b5…7f72` if it is not already on (C §(e)).

## Left out of T33 (one hard reason each; carried to `next.md`)

| row | item | hard reason | note |
|---|---|---|---|
| N540 | live acquisition after the user-agent deploy | deployment, held for the release at T33's close (K1501) | K1365 (8) |
| T33-D1 | VF-4, CHECK's first live run; M-Q1, M-Q2, M-Q6, M-Q7, M-Q9 | deployment, held for the release at T33's close (K1501) | the release section |
| T33-D2 | Legistar live acquisition | deployment, held for the release at T33's close (K1501) | the reader and following are built against captured JSON (T33-14, T33-79) |
| T33-D3 | EXTRACT proposals of every construct (dated facts, lines, holders, duties, people, money, column roles, trail inclusions) | deployment, held for the release at T33's close (K1501) | gold-set precision needs extract deployed |
| T33-D4 | Q2 (CREATE, conducted acts, panel-started runs, translation, suggestions on) | deployment, held for the release at T33's close (K1501) | investigate verified live; Q1's bar met in use. The B17 switch is built (T33-20) |
| T33-D5 | Q4 (the question-to-run hand-off) | deployment, held for the release at T33's close (K1501) | investigate live; run cost measured |
| T33-D6 | ANALYSIS L5 assisted proposals (`tabledeclarepropose`, `calculationpropose`, `workbookcheck`, EXTRACT tables) | deployment, held for the release at T33's close (K1501) | a propose-capable mode deployed |
| T33-D7 | register imports: CAL-ACCESS, NetFile, OpenFEC, DCA, OpenCorporates, Wikidata, OpenSanctions; OCD and Open States; Akoma Ntoso, USLM, eCFR; captured checkbooks, payroll and Forms 460/700/803 as tables; USAspending | deployment, held for the release at T33's close (K1501) | live acquisition |
| T33-D8 | LAW and COURTS assistance: `compliance_analysis`, explain-a-rule, requirement extraction, `court_reading`, contradiction's canon proposals | deployment, held for the release at T33's close (K1501) | investigate and extract live |
| T33-D9 | §7 item 13's release share | deployment, held for the release at T33's close (K1501) | a signed release |
| T33-D10 | switching on the AI half of standing questions | deployment, held for the release at T33's close (K1501) | M-Q9's bar (Rule 7) |
| B1 | DIST-14 (office-readers) | deployment, held for the release at T33's close (K1501) | CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment, held for the release at T33's close (K1501) | 61.3 MB bound |
| B3 | N34 (pdf-worker) | deployment, held for the release at T33's close (K1501) | JPX bound; JBIG2 fixture encoder; 4,277 lines (P6) |
| B11, C9 | N461 release share; N471's release copies | deployment, held for the release at T33's close (K1501) | the next signed release |
| B16 | N473 (`filing_templates` table) | deployment, held for the release at T33's close (K1501) | migration run at every instance |
| C1 | office-readers R28/R29 retired | deployment, held for the release at T33's close (K1501) | migrations at every instance |
| C2 | `MODES.plan` deployed | deployment, held for the release at T33's close (K1501) | K660 (5) |
| C3 | newgroup installer deployed, N336 | deployment, held for the release at T33's close (K1501) | a signed release |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement on a deployed copy | a measured recommender run (K488) |
| C8 | first profile's facts without a source | measurement on a deployed copy | K925, K934, K941 |
| T33-M1 | `Temporal` in place of `Intl` | measurement on a deployed copy | nothing to build until measured |
| T33-M2 | everyday response budgets' baseline (K1432) | measurement on a deployed copy | taken before T33's code lands, and again at the release |
| T33-M3 | M-X1b, Bob's chain on real data | measurement on a deployed copy | tunes the budget constant only; the substrate is met by M-X1a |
| T33-G1 | L5 network packs | real group | how many groups work on one body |
| T33-G2 | sharing packs (events, money trails, people facts, held standards) | real group | K1482: a receiving group |
| T33-G3 | a partner group's rerun (E3) | real group | — |
| T33-G4 | how many proceedings a group follows | real group | informational |
| T33-U1 | charts (B20) | Bob's (UX) | the design stream's; design paused (K1475) |
| T33-U2 | the timeline view (DEC-77.2) | Bob's (UX) | the published timeline's substrate is T33-60/63/65 |
| T33-U3 | the wizard library (DEC-120/121) | Bob's (UX) | the registry form is T33-84 |
| T33-U4 | the answer panel | Bob's (UX) | — |
| T33-U5 | legacy-ui's half of §7 item 8 | Bob's (UX) | NOTICE to UX-DESIGN (legacy census) |
| B4, B5 | N144, N232 | Bob's (UX) | K899 (2) |
| A54 | skills R10 | Bob's (UX): ruled, waits on the new interface | K899 (2), with N144 |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's (UX) | the design stream's DECs decide member wording (K1099) |
| T27-1 | a docket-signing step in the member interface | Bob's (UX) | K633; legacy-ui |
| C5 | `PLN-` affordances, plan page, joint action | Bob's (UX) for the plan page (K608 (4)); trigger for joint action (a coalition asks, K600 (c)) | nothing to ask Bob (K1266) |
| N521 | the litigation hold's device half (DEC-113) | dependency not yet built: no device-storage module | — |
| T33-X1 | outside alerts | dependency not yet built: an unattended alert source K1449 permits (a group-level paid account is rejected), so only the member-act path, built in T33-79 | — |
| A8 | bias R26 | dependency not yet built: evaluation findings to apply a lens to | K102's trigger |
| A21 | inquiry R31 | dependency not yet built: no opinion element (MK-5) | — |
| A22, A23 | installer R13, R24 | dependency not yet built: the new member surfaces | — |
| A41 | publication R30 | dependency not yet built: nothing publishes a rendering (D-246) | — |
| N538 (4) | the served addresses, the worker name, the process repository | dependency not yet built: Bob's domains | K1361, K1365 |
| T33-T1 | D-224 pair materialisation for offices | trigger: offices concerned by more than 32 documents in a deployed corpus | — |
| T33-T2 | the `proceedings` module | trigger: the facet needs its own acts and tables, or `entities` nears 4,000 (K1439) | — |
| T33-T3 | conformance's comparison split | trigger: a L5–L8 module must read a comparison in code (K1438) | — |
| T33-T4 | moving `onRead` into the promote transaction | trigger: M-V4's cost measured (D177) | the after-commit hook is T33-23 |
| J7 | DEC-81's Grade A (and its three decisions) | trigger: DEC-81 (4) | nothing to ask Bob (K1267) |
| H13 | DEC-105 audience guidance | trigger: a group asks, or a case is challenged | K1266 |
| T28-1 (rest) | DEC-96 (3) "meets standards"; the public list of acceptances and flags | trigger (Bob's, DEC-96) | nothing to ask Bob |
| T33-T5 | rule sets for further jurisdictions; Oakland's 2027 holidays | trigger: a primary source published for each rule (K1445) | ongoing desk research |
| T33-B1 | the backward question as a whole (D-165) | Bob's deferral, with its own trigger (K1500) | its procedural form follows COURTS, LAW, ANALYSIS and QUESTIONS L4 (T33-D5) |
| T33-C1–C5 | court-citations, court-doctypes, budget-doctypes, sheet-worker, workbooks (and the conditional sub-items of T33-26, T33-79) | *only if* courts-workbooks or money-people reads NO-GO: that file's named NO-GO (Rule 5) | otherwise they are entries |

T32's A37 (progressions R32) leaves the table. Money L2–L3 is built in T33, so R32 moves to money-checks (T33-34; Choices 11).

## P6 notes (about 4,000 lines; the guard each job keeps)

| module | now | T33 growth | guard |
|---|---|---|---|
| office-readers | 3,524 | typed cells, metadata (~+250) | if it would pass 4,000, `formats-xlsx` splits (BOB's, K617) before the job adds more |
| content | 3,533 | A-5 (~+100) | wiring only; report |
| affordances | 3,365 | vocabularies (~+100) | data and wiring only |
| control-plane | 3,735 | arms (<+50) | wiring only; arms published by their modules (K1122) |
| membership | 3,350 | R83 list (~+30) | the list only (T33-19a) |
| reevaluation | 3,042 | causes, X73 (~+300) | split if a draft passes 4,000 |
| jurisdictions | 3,175 path basis (1,533 source) | +700–1,000 with tests | re-measured after drafting. If the path passes 4,000, the profile data splits from the profile code (BOB's). reporters-db and courts-db never go here (T33-8) |
| inquiry | 3,903 | — | split first (T33-44) |
| publication | 4,625 | — | split first (T33-62) |
| docprofile | 4,969 path | — | split first (T33-13); later readers each in a sibling |
| monitoring | 3,366 | +3 reqs | following goes to T33-79 |
| queue-producers | 3,875 | delegation only | new producers go to T33-82 |
| calculations | new | ~2,500–3,500 | the workbook path in its own module (T33-42); measured at the job |
| contradiction | 3,256 | ~+200 | nothing else added |
| ratification 3,993, basis-versions 3,599, capture 3,464, promotion 3,334 | — | untouched | — |

## Totals

Jobs per layer: L1 18, L2 3, L3 2, L4 2, L5 18, L6 15, L7 2, L8 10, L9 8, L10 3, L11 11. **92 jobs** (every conditional row read GO, K1506). **About 950 requirements new or changed** (about 1,000 with the conditional rows); L5 carries about 450. **New modules: 23** (civil-time, calc-grammar, connection-grammar, doctypes, legistar-reader, roster-reader; events, lines, money, money-checks, duties, people, explore, calculations; leg-earning, hypotheses, answers, agent-harness, agent-model, agent-runner; case-tensions; following; notice-producers), plus up to 5 conditional (court-citations, court-doctypes, budget-doctypes, sheet-worker, workbooks). **Moves: 3** (standards and local-facts L9 → L5; observation-log within L5). **Splits: 7**. Four are by copy with a deletion job: docprofile→doctypes, agent-worker→agent-harness and agent-model, inquiry→leg-earning, publication→case-tensions. Three are new-module seams with no copy: money→money-checks, monitoring→following, queue-producers→notice-producers.

## Choices settled (K1504)

Every choice below is settled by BOB as proposed (K1504), except 13: membership has its own job (T33-19a), because only a module job changes module code (P7). Gate values (20): M-P6 a false-merge rate of at most 0.5% on the synthetic fixture; M-C8 a check or detector is shown only at a false-alarm rate of at most 20% on its gold set; the 150-question bar as `measures-T33/assistant-substrate.md` §7 proposes. Placed: promotion's stamp of T33's new catalogue rows is T34's (order: promotion precedes the jobs that add rows, P4, P10); bundler takes the new fleet members (agent-runner, and sheet-worker on GO) where its member list is code, a question its job's START names; whether admission gates the ask grant is a QUESTION for the credentials job. Canon item 12 needs no amendment: TAD v10's "never a spreadsheet" is about the bundle substrate, and its "spreadsheets" are outbound surfaces; workbooks as captured inputs contradict neither.

### The choices as proposed

1. `legistar-reader` as its own L1 sibling, not inside `doctypes` (A put the OfficeRecords reader in doctypes; P6 and scope §2's sibling rule).
2. The names `roster-reader`, `court-doctypes`, `budget-doctypes`, `court-citations`, `workbooks`.
3. `court-citations` placed before `id-spaces`, so the recogniser can read it.
4. `calc-grammar`'s `join` takes the id-space resolver from its caller, because `id-spaces` comes after it in scope §2's order. The alternative is to move `id-spaces` directly after `jurisdictions`.
5. The inquiry seam: `leg-earning` (the earned registry and resting-on reads), placed **before** `inquiry`, which uses it. `hypotheses` follows inquiry.
6. The publication seam: `case-tensions` (the case relation, flags and attribution), placed before `publication`.
7. Monitoring's split is a new module, `following` (new code; no copy unless the START finds a clean seam).
8. Queue-producers' split is a new module, `notice-producers`, placed after it.
9. The money/money-checks seam: facts and L2–L3 reads in `money`; amount checks, detectors and the junction check in `money-checks`. Restrictions, thresholds, transfer authority and `pay` duties go in `duties`.
10. The workbook path as its own conditional L5 module after `calculations` (P6).
11. progressions R32 (T32 A37) moves to `money-checks`, because progressions precedes money (P4).
12. The L6 order skills → answers → agent-harness → agent-model → agent-runner → agent-worker.
13. membership's R83 list edited by BOB at the opening, so membership has no T33 job. The listener-order test sits in progressions/standards.
14. S0-14: default table classes through `declarePurge`, with no per-layer sweep jobs.
15. legacy-ui's half of §7 item 8 goes by NOTICE to UX-DESIGN, with no legacy edit.
16. Duty-occurrence legs (K1447 (i)) are included in T33 (T33-43/44/47), because duties is in T33.
17. Included under P19 because their drafted conditions are now met: Legistar enactment watching (T33-79); `validAt` across relations and recodification (T33-31, T33-59); patterns about an office and across proceedings (T33-41).
18. `standards` keeps `inForce` as an alias of `inForceAt`, so its five callers need no jobs.
19. TAD §12's `event_changed` fan-out depth (B1a.11): proposed one level (direct dependants are noticed; each re-evaluates on its own), answered before reevaluation's drafting.
20. Gate values set before measuring: M-P6 (false merge), M-C8 (each check and detector), and the 150-question bar (assistant-substrate §7 proposes one).
21. Proceeding status as of a date lives in `events` (`proceedingStatusAt`), not in `entities`.
22. The paid people-search path: `sources` (the grade and marking) and `credentials`/`acquisition` (keyed services, off by default).
23. Dated waits: `inquiry` (after its split), with the consumer registered in `scheduler` and the item raised by `notice-producers`.
24. (Settled: `time-law.md` exists.)
25. Conditional modules enter `modules.json` only on GO (Rule 5).
