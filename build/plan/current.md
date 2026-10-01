# Plan: tranche T21

**Status** · OPEN · BOB #87 · session_01SxgYvH1iLUimhr8gRsNm2Z · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #4 session_011zouWbsKdokGSgTHZdNzmM; jurisdictions: JURISDICTIONS #5 session_014nagcRH9hTKVppmJyfbM18; signatures: SIGNATURES #4 session_01RVLyww2mbVhaNCnyJ1r3Vp; subresources: SUBRESOURCES #3 session_013wub6dXNauK3Eb12UzKxmu; pdf-pixels: PDF-PIXELS #3 session_01Se6xS58Nis2ohaMchdpduN; pdf-reader: PDF-READER #3 session_01FhgUeJoRWG4CGHy3n9dbCQ; ocr-worker: OCR-WORKER #5 session_01FFFeexzv4JahkZvFP77Y6p; pdf-worker: PDF-WORKER #5 session_01B6vMjCUja1qXTcpkSqYzuB; bundler: BUNDLER #4 session_01Qn6hiZsQ1MvFCad8SnL9UK; runtime-limits: RUNTIME-LIMITS #3 session_01QZhPT74LXukUHVTDZ8C1qw; test-support: TEST-SUPPORT #3 session_01Khzr9qLc3B6CdyeggE5ntx; record-core: RECORD-CORE #13 session_015o5zPpvnxZMQdCfaHQg4En; membership: MEMBERSHIP #15 session_01UPfhtBfCMAXM1TSrfENr6o; promotion: PROMOTION #22 session_019DDbAi6qXv77SjQcNNsRD3; provenance: PROVENANCE #10 session_01KT9cJX5DM9ZHLA7eKARs5v; acquisition: ACQUISITION #4 session_01Acv65uxLHFiE42yCXhKSYx; capture: CAPTURE #13 session_016dWEeR3ZoeXU1HhPQ8dpXs; capture-sources: CAPTURE-SOURCES #8 session_01QDj4FCYp9ZVbcHpGngkfgW; extraction: EXTRACTION #11 session_01UytfHxnxe2XiBtvoaKdHLw; calibration: CALIBRATION #6 session_01AhYpL2J9LWAd7Lz7PeLWAj; content: CONTENT #8 session_01DWist3yzoyMvJgNepzPwD4; connections: CONNECTIONS #9 session_01SjaX9oR1AMtsgg4jw4qwcL; bias: BIAS #7 session_01KciRDbs7ix9Xrdx5bdg4Yp; observation-log: OBSERVATION-LOG #7 session_013cUgWrip5dZGALsDxc2eyV; query-language: QUERY-LANGUAGE #5 session_01PXvHqUoNr5cngACTYbDozK; retrieval: RETRIEVAL #8 session_017EMv9TeFvu3SjUe4UdGAch; progressions: PROGRESSIONS #7 session_01VfFDjRjk7tRAKgKZ3VdJu7; inquiry-grammar: INQUIRY-GRAMMAR #3 session_01Cy3dA1Gy1X7veKwXKWiD8g; inquiry: INQUIRY #10 session_013dLfBDD5vd5k2Wu5bzVhD5; citation: CITATION #6 session_015Lw2eUqxdm1R3Ga3ikfBxs; basis-versions: BASIS-VERSIONS #8 session_01PhpTLeguue11UqsuKUrqaP; strength: STRENGTH #7 session_016S9APVD77hDCq9MtoPtEwc; contradiction: CONTRADICTION #6 session_016pynE6RnAHz677Ff5aA48x; capture-requests: CAPTURE-REQUESTS #6 session_01JL9Lx4gBJnTxwqg28ioRKt

Opened by BOB #87, 2026-10-01 ~17:10 UTC (PROCESS-MECHANICS §5), on `tranche/T21` from `main` @ 615672a1a0, T20 closed (K926), with `prep/T21` merged (K927, K928). The plan is `draft-T21.md` (K922), re-checked against K923–K928 (K929); the folds before each layer (rule 1) are done on this branch before that layer's jobs start.

**Changed at the opening (K930, K931)** · The conditions are settled by LEGACY-TESTS #18's record: `battery.mjs` is deleted, so ocr-worker, pdf-worker and bundler run in L1; `publishedcase.test.mjs` is deleted, so legacy-tests has no job (N461 moot). New entry **N469**: notes outside legacy-tests' paths that name a file T20 deleted as live (`build/jobs/T20/legacy-tests.md` "For BOB" item 5) are re-worded by their owners; it joins every job whose module is listed, and adds **pdf-reader** to L1 (`pdfstructure.mjs`:709, :2356 claim guards that no longer exist); other listed owners join only where a note is live, not provenance. N465, N467 (agent-worker's share) and N468 join their modules' jobs; N468's requirement clauses are struck before their layers. The first profile's measurements are filed as M-187–M-196. Folds are done before each layer (rule 1): record-grammar's (R35, R28, R40) before L1 (K930); the rest before their layers. STARTs: `build/plan/starts-T21/`. Added after the opening (K935): runtime-limits and test-support to L1 (N469); run-productions (N468) and, for N469, capture-sources, calibration, content, progressions, ai-runs, run-rules, public-read, publication, ratification, actions, instance-setup, legacy-tests to their layers; 60 jobs in all.

**Drafted as** · DRAFT for T21, written by a worker for BOB #86, 2026-10-01, from next.md @ 3583f43500 (`origin/tranche/T20`, K921; `next.md` unchanged since 52bd6d0292). T20 layer 11 running (K917–K920). Assumes T20 closes as `current.md` plans it: plane last but legacy-tests switches the held code and keeps `src/index.mjs` (K918); instance-setup re-points its four tests (K917); legacy-tests deletes the old suites and accounts for the release row (K879). A line marked *conditional* depends on T20's close. Supersedes BOB #85's `build/plan/draft-T21.md` (written before K882 moved most of it into T20).

Cut from: `next.md` whole (43 entries); rulings K860–K921; `current.md` (T20); `plan/triage-T20.md`; `plan/draft-T20-answers.md` A.3, B.6; `plan/draft-T20-dec36.md` §6; `plan/draft-filing-templates.md` §3, §5; `build/jobs/T20/*.md`; `modules.json`. Every file:line below was checked at 3583f43500.

**T21's priorities:** BOB's (P17): every entry that can safely be done (P19). Main content: Bob's filing templates and local facts (K921), "record" in members' text across layers 1–6 (N458), the project state's form (b) (N456, K904), DEC-36's last shares (N459, N462), and the leftovers T20's layer order blocked (N452, N453, N455, N463).

## Rules at the opening

T20's rules hold (merge early, §4; one file, one editor, §12.2; a job names each `not yet met` mark it meets, BOB strikes it at the merge, K775 (6); no layer closes red except a red accepted by name; owners export, plane composes, K861). Added:

1. **Folds before each layer (BOB, P18).** Before L1: `modules.json` gets `local-facts` (L9, first, before `standards`) and `filing-templates` (L9, after `action-clocks`, before `filings`), with their uses (below); `requirements/filing-templates.md` and `requirements/local-facts.md` written from `draft-filing-templates.md` §3 as §5 amends it; jurisdictions R40–R45 and record-grammar R42 (§3) folded; record-grammar `STATES.project` wording, form (b) (K904). Before L2: promotion R56 and its C-86.15 row text (`draft-T20-answers.md` B.6 (i), form (b)). Before L6: skills R30 (`filing_drafting`); inquiry-grammar R7's alias note struck (N452). Before L7: reevaluation R16's new source (N457, BOB's design). Before L9: action-clocks R10; filings: R26 retired with a pointer, the draft's R27–R30 **renumbered R28–R31** (R27 is DEC-36's, K906), R8 `counselPacket` at every tier (`NOT_TIER3` retired), `KIND_NO_TEMPLATE` retired (K921 §5); escalation R7, R8, R13 compatibility rule and R26 (N462); BOB's N460 review. Before L11: queue-producers R20, R21; affordances, op-declarations, control-plane, queue and plane clauses for the new ops and producers (K902's pattern).
2. **Merge early:** L2 membership, then promotion's stamp last. L9 local-facts first, then action-clocks and filing-templates, then filings (it reads all three). L11 op-declarations and affordances early; queue after queue-producers; plane after control-plane.
3. **Accepted red by name:** C-4.2 from record-grammar's L1 merge (N456's new edges) until promotion's L2 fence merges (B.6 (ii)). Totality on the new ops between L9's close and op-declarations' and affordances' L11 merges (K902's precedent).
4. **Stamp.** Promotion (L2) stamps T20's layers 3–11 (acquisition's C-68.1 `where`, K887; control-plane's C-68.1 region, K920; action-grammar C-117.20–.22, K912; intent's C-2.9/C-9.1 behaviour, K907; anything else T20's close names) and T21's layers 1–2 (record-grammar C-6.3, the slot's C-9.1 and `STATES.project`; jurisdictions' new codes; membership's N453 departures; promotion's own C-86.15). Rows changed in T21's layers 3–11 are `awaiting stamp` for T22 (P8): provenance C-53.13's translation (N458), every new row of filing-templates and local-facts, filings' C-115.31–.33 and .35–.38 moving to filing-templates (.34, .39, .40 stay; K927 notes 9) and its two retired codes.

## Roster (41 jobs; by layer 5, 3, 3, 1, 5, 9, 2, 0, 6, 1, 6)

- **L1** record-grammar (N456, N458, K921), jurisdictions (K921, N-A14), signatures (N458), subresources (N458), pdf-pixels (N455). *Conditional:* ocr-worker, pdf-worker, bundler (notes naming `battery.mjs`, if T20's legacy-tests deletes it)
- **L2** record-core (N458), membership (N453), promotion (N456, N458, the stamp)
- **L3** provenance (N458), acquisition (N458), capture (N458)
- **L4** extraction (N458)
- **L5** connections (N459, N464, N458), bias (N458), observation-log (N458), query-language (N458), retrieval (N458)
- **L6** inquiry-grammar (N452, N458), inquiry (N458), citation (N458), basis-versions (N458), strength (N458), contradiction (N458), capture-requests (N463, N458), skills (K921), agent-worker (N458)
- **L7** intent (N456's share), reevaluation (N457)
- **L8** none
- **L9** *local-facts* (new, K921), action-grammar (ACTIONS #7's comment), action-clocks (K921), *filing-templates* (new, K921), filings (K921, N460), escalation (N462, N460)
- **L10** scheduler (N463)
- **L11** affordances (K921), queue-producers (K921), queue (K921), op-declarations (K921), control-plane (K921, ACTIONS #7's comment), plane (N463, K921). *Conditional:* legacy-tests (N461's test share, if T20 keeps the suite and the module)

No module past the 4,000-line mark grows: extraction (4,002, K891) takes two re-worded strings; pdf-worker is touched only on the `battery.mjs` condition (a JSON note).

## STARTs, sketched (BOB writes the final ones)

**L1**
- **record-grammar** · N456 (form (b), K904): `bundle.mjs`:520–523 delete C-6.3's `workproduct_state` arm; :685 slot ids `['C-2.9']`; `document.mjs`:291–299 `STATES.project` legal `forming`, `closed`, legacy `investigating`, `matured`, edges `forming→closed`, `investigating→closed`, `matured→closed`, `closed→forming`. Intent's claim of `C-9.1` stays harmless (record-core R67 accepts ids outside a slot, `record-core/index.mjs`:1080). N458: `bundle.mjs`:250, :341. K921: R42 `template` in `PROPOSAL_STATES`. Proof: R28, R42 tests; fixtures re-keyed (`test/m/record-grammar/fixtures/`).
- **jurisdictions** · K921: R40 (template attribution, `TEMPLATE_UNATTRIBUTED`), R41 `time_zone`, R42 `hours`, R43 holidays' `offices`, R44 `status`; R45 the test profile (`profiles/test-port-ellery.mjs`). The first profile (`profiles/oakland-alameda.mjs`) takes the researched holidays, hours and time zone, each `researched` with its `M-<n>` measurement, **only if the research worker's result is in before this job's COMPLETE** (else T22, order P4). Proof: R40–R45 tests.
- **signatures** · N458: `src/sign-release.html`:138, :142, :144, :397, :398, :403; re-render `signpage.mjs` (`scripts/embed-signpage.mjs`). Stales plane and installer bundles (§14).
- **subresources** · N458: `subresources.mjs`:1378, :1381.
- **pdf-pixels** · N455: `pdf-worker/test/pagepixels-corpus.probe.mjs`:5, `test/agenda-scan-census.probe.mjs`:5 name the retired `coverage.mjs`; re-word. Comments only.
- *Conditional* **ocr-worker**, **pdf-worker**, **bundler** · `ocr-worker/fleet-member.json`:14, `pdf-worker/fleet-member.json`:13, `bio-plane/scripts/fleet-bundle.mjs`:68, :109, :134, :183 name `battery.mjs` as live (triage-T20 "Found while checking"); only if LEGACY-TESTS #18 deletes it (its COMPLETE lists them, K890).

**L2**
- **record-core** · N458: `record-core/index.mjs`:801, :802.
- **membership** · N453: delete `signerRegisterOwn` (`membership/index.mjs`:2667), `signerRevokeOwn` (:2725), `#signerMemberBar`, `#keyShaped`, `BAD_KEY` (C-96.8), its rows C-96.15–.17 (`checks.mjs`:89–:99; credentials keeps its own, `credentials/checks.mjs`:88–:98) and the `SIGNER_ENROLMENT_CHECKS` copy C-63 (`checks.mjs`:426). Ratification's test re-pointed (K910); re-scan finds no other caller at HEAD (control-plane dispatches to credentials, `dispatch.mjs`:209–210). Merge early.
- **promotion** · N456: R56, refuse a creation stating a project state other than `forming`/`closed` (`PROJECT_STAGE_COMPUTED`, C-86.15); fence the old project moves, `history.mjs`:217 `STATE_MOVE_FENCED_SINCE` gains `project`. N458: `gate.mjs`:743 and 14 more (A.3). **The stamp** (rule 4); `ROW_CENSUS` re-pinned. Proof: R56, R15, R50 tests; C-4.2 green again.

**L3**
- **provenance** 30 hits (`checks.mjs`:363–365 row C-53.13, `awaiting stamp` T22; `index.mjs`, `register-checks.mjs` as A.3) · **acquisition** `index.mjs`:667 · **capture** `index.mjs`:1690 · N458 each; each re-scans its paths first.

**L4**
- **extraction** · N458: `extraction/index.mjs`:866, :1283. No growth (P6, K891).

**L5**
- **connections** · N459: `backlinks` (`connections/index.mjs`:898) adds `out_of_view: true` when a citer was withheld (an ungated `EXISTS` beside the gated read), R20 re-worded per `draft-T20-dec36.md` §6. N464 with N458: :899 "bundle id" → "record id", and :955, :983, :984, :996, `themes.mjs`:98, :100. Proof: `test/m/connections/edges.test.mjs` hidden-citer arm and a no-key negative control.
- **bias** (`checks.mjs`:120, :142; `index.mjs`:302, :562, :617) · **observation-log** (`index.mjs`:633; `vocabulary.mjs`:1504) · **query-language** (`query.mjs`:555, :558, :1864) · **retrieval** (`frontier.mjs`:179, :182; `index.mjs`:530, :716, :737, :759) · N458.

**L6**
- **inquiry-grammar** · N452: delete `INQUIRY_GRAMMAR_ROWS` (`checks.mjs`:89, `index.mjs`:13) and its same-object test (`test/m/inquiry-grammar/grammar.test.mjs`:223–228); no reader left at HEAD (control-plane dropped its alias, K920; skills and inquiry re-pointed, K900). N458: `grammar.mjs`:76, :144, :397, :606, :1060.
- **capture-requests** · N463: `test/m/capture-requests/plane.test.mjs`:17–18 read `join(SRC, "index.mjs")` (:13): re-point to `src/plane/index.mjs`. N458: `index.mjs`:266.
- **skills** · K921: R30, the `authored` layer `filing_drafting` (its `load_when` and clauses). Proof: R30 test.
- **inquiry** (`index.mjs`:887, :1341) · **citation** (`index.mjs`:241, :440) · **basis-versions** (`grammar.mjs`:327; `index.mjs`:936) · **strength** (`index.mjs`:320) · **contradiction** (`index.mjs`:1338) · **agent-worker** (`src/harness.mjs`:291, `src/index.mjs`:950; text the assistant relays counts, K902; regenerates its manifest) · N458.

**L7**
- **intent** · N456's share (B.6): `PROJECT_GRAMMAR` (`intent/grammar.mjs`:30) claims `['C-2.9']` only, after record-grammar's slot dropped C-9.1. Proof: R29 test.
- **reevaluation** · N457: `wp_retraction` (`reevaluation/index.mjs`:311–315, `checks.mjs`:27) re-sourced from a case edition withdrawn or superseded (DEC-72), the field read deleted; R16 as BOB words it before L7. **The source must be read without using an L8 module** (publication, project-stage are later in the order, P4): from record facts through record-core, or by a registration L8 makes (K861's pattern). Proof: R16 tests.

**L9**
- **local-facts** (new) · R1–R5: `factConfirm`, `factStatus`, horizons, `factsDue`, append-only. Uses jurisdictions, membership, record-core, record-grammar (`proposalLabel`). Merge early. Proof: R1–R5 tests; rows new (stamp T22).
- **action-grammar** · ACTIONS #7's finding (not in `next.md`): `checks.mjs`:4 says `actions/checks.mjs` "goes in `actions`' job", deleted (K914); re-word as provenance. Comments only.
- **action-clocks** · K921: R10, a business count states the calendar's `status` from `local-facts` R2. Uses gains local-facts.
- **filing-templates** (new) · R1–R18 as amended by §5 (`use: file|brief`, `TEMPLATE_TIER3_FILE`, `profiles` or `general`, every approved version offered, latest by default). Takes over filings' `templateSave`/`templatesFor` (`filings/index.mjs`:1286, :1348; rows C-115.31–.37). Uses jurisdictions, record-grammar, record-core, membership, review (if R8 reuses its grant service), action-grammar. Merge early.
- **filings** · K921: R26 retired (code moved), R28–R31 (renumbered): approved versions only, the version recorded, a filing without a template (`template: null`), `counselPacket` at every tier with a `brief` template, calendar status from action-clocks R10. N460: whatever BOB's DEC-36 review finds in the stored packet sections.
- **escalation** · N462: evaluation trigger ids (`escalation/index.mjs`:251–252, `${e.id}/evaluation/${ev.seq}`) take an id that counts no other entry; recorded ids (R13, R18) read in the old form too. N460: the trigger's ledger reads, if BOB's review changes them. Proof: R7, R8, R13, R26 tests.

**L10**
- **scheduler** · N463: `test/m/scheduler/plane.test.mjs`:17–18 as capture-requests'.

**L11**
- **op-declarations**, **affordances**, **control-plane** · K921's ops (`templatedraft`…`factconfirm`): declared, graded, dispatched, families registered; control-plane also ACTIONS #7's comment (`families.mjs`:55 says `actions/checks.mjs` re-exports, deleted K914).
- **queue-producers** · K921: R20 `template-review-requested`, R21 `local-fact-due` (raised once, DEC-94). **queue** · `PRODUCER_DEPS` (`queue/index.mjs`:97) and kinds, as K919 for actions.
- **plane** · N463: delete `bio-plane/src/index.mjs` (plane R8) once capture-requests, scheduler and instance-setup read `src/plane/index.mjs`; compose the two new modules (tables, purge declarations K23, figures). Last in L11.
- *Conditional* **legacy-tests** · N461: `civicos-ui/test/publishedcase.test.mjs`:463 `VERIFY_DETAIL` "own bundle sha" → "record sha", only if LEGACY-TESTS #18 keeps the suite and BOB keeps the module (K879); else moot.

## next.md: every entry (43)

**CARRIED (12):** N452 (inquiry-grammar L6) · N453 (membership L2) · N455 (pdf-pixels L1) · N456 (record-grammar L1, promotion L2, intent L7) · N457 (reevaluation L7) · N458 (22 modules L1–6, above) · N459 (connections L5) · N460 (BOB's review before L9; escalation, filings L9) · N461 test share (legacy-tests L11, *conditional*; its release-bundle share is LEFT OUT, deploy) · N462 (escalation L9) · N463 (capture-requests L6, scheduler L10, plane L11) · N464 (connections L5). Not in `next.md` but carried: K921's filing templates and local facts, with N-A14 (local-facts, filing-templates, jurisdictions, record-grammar, skills, action-clocks, filings, queue-producers, queue, op-declarations, affordances, control-plane, plane); ACTIONS #7's comments (action-grammar L9, control-plane L11); the stamp (promotion L2).

**MOOT (21 whole, 3 in part):**
- "Local facts" line and REC-201 line: K899 (1) (`cpra_request` stays internal), K768 (outward text met).
- N71: K899 (1); its rewording is N458.
- N317: K899 (3), K904; carried on as N456, N457; intent's share met (K907).
- N320: K903 (4), met in T20 L9 (K916); connections' share is N459.
- N439: K870, K891. N443: K866 (signatures), INSTALLER #4 (`jobs/T20/installer.md`:34). N447: K914.
- Met by LEGACY-TESTS #18 at T20's close (K879, K890), *conditional* on its COMPLETE accounting for each; any left open rejoins legacy-tests in L11: N31, N57, N248, N279, N431, N434, N436, N438, N441, N442, N444, N448 (promotion's share moot, K795 (3)), N450.
- In part: N68 and N70 (their legacy-index, legacy-tests, affordances, membership, promotion, legacy-store shares met or with LEGACY-TESTS #18; N70's skills share met, triage row 10); N437 (agent-worker K897, control-plane K920, the rest K866, K868). Their legacy-ui shares are LEFT OUT below.

**LEFT OUT (7 whole, 4 in part):**
| entry | hard reason | note |
|---|---|---|
| N34 | deploy (the bound measured on a deployed plane); dependency not yet built (an encoder making a PPM/PPT JBIG2 fixture) | the refusal (`jpxdecode.mjs`:943, image-codecs R4) and the low-memory wavelet (K281) are met |
| N75 | deploy | code met (K281); the 61.3 MB bound is measured on a deployed plane |
| DIST-14 | deploy | the CSV bound measured on a deployed plane |
| N144, N232 | Bob's (K899 (2)) | wait for the new interface |
| N241, N371 | Bob's: UX (K633) | legacy-ui untouched until the new interface |
| N68's, N70's, N437's legacy-ui shares (`app.html`) | Bob's: UX (K633) | |
| N461's release share | deploy (the next signed release build, Bob's act) | `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` |

**Table rows carried over (not N entries), each LEFT OUT:** office-readers R28/R29 retired (deploy: each migration runs at every instance); `MODES.plan` deployed (deploy); newgroup installer with N336 (deploy, Bob's act); contradiction R41 and the K5 arms (deploy); `PLN-` affordances, plan-page surface, joint action (Bob's, K608 (4), K600 (c)); N389, N-A13 (Bob's: UX, K633); rows changed in T21 L3–11 (P8, rule 4). N-A19 is met (K899 (7), K916, K920).

## For BOB

1. **Dependency cycle in the filing-templates draft.** filing-templates R2 checks blanks against "a blank `filings` publishes" (`FILING_BLANKS`, `filings/index.mjs`:75) and R3 takes `from` an approved filing draft, while `filings` must use filing-templates (R28). Recommended (BOB's, P17): `FILING_BLANKS` and `FILING_TEXT_MAX` (:97) move to filing-templates (filings imports them); R3's `from: filing draft` becomes filings' act passing the draft's text and id to `templateDraft`. Word it at the fold.
2. **§3's list of eight misses modules.** The actionhold precedent (K902, K919) also needed op-declarations (ops declared) and queue (`PRODUCER_DEPS`); plane composes new modules' tables (`plane/store.mjs`). Included above; confirm.
3. **Folds before L1, not L9.** jurisdictions (R40–R45), record-grammar (R42) are L1 and skills (R30) L6, so their folds and the two requirement files' `uses` must be done at the opening (rule 1). If the opening cannot wait for them, those three shares go to T22 (order, P4) and filing-templates' L9 job cannot meet R15 (profile templates) or local-facts R1 (its paths name R41–R44 fields).
4. **The first profile's research** lands only through jurisdictions' L1 job. If it is not ready by then, it waits for T22 (order), and local-facts and action-clocks build against the test profile only.
5. **Approval of the clause text.** K921 approves the answers and the two modules; BOB's §5 readings are "stated so Bob can correct it". Read as approved unless Bob objects (P17); say so in the opening's report.
6. **N457's source** cannot use publication or project-stage (L8 after L7, P4). If BOB's design needs them, the event is registered by an L8 module into reevaluation (K861's pattern), or N457 waits on that design (P17 if it changes §5.4's meaning).
7. **N34 and K899 (5).** K899 (5) listed N34 among the order leftovers for this tranche; at HEAD only the measured bound (deploy) and PPM/PPT JBIG2 (a fixture encoder not built) remain. Recommended: record N34 as deploy and dependency, no job.
8. **New `next.md` entry wanted:** ACTIONS #7's stale `actions/checks.mjs` comments (`action-grammar/checks.mjs`:4, `control-plane/families.mjs`:55; `action-clocks/checks.mjs`:3 is provenance and may stay, `layers.md` rule 6). Placed above.
9. **`next.md` housekeeping at the opening:** every MOOT entry above and T20's carried entries to `archive/next-applied.md` (K424); `next.md`'s status line still describes T19.
10. **Sizes:** filings shrinks (R26 leaves, 1,893 lines today); filing-templates is new (~8 acts, 5 tables, §3); no split due. extraction stays at 4,002 (P6 review before a job that grows it).
