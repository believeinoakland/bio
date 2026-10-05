Verified read-only on `/home/user/bio`, branch `tranche/T32` @ `31f30a6c7d`. The requirement copies in `src/req/` equal `build/requirements/*.md` apart from line folding (checked). **Many Status lines are stale**: rulings K938 (T21 L1), K1030/K1055/K1064/K1106 (T22) struck marks the Status prose still calls "not yet met". "Built" below is checked against the code, not the Status line. Line counts exclude tests. UI = `civicos-ui/app.html`, counting `op=<name>` plus quoted literals passed to `api`/`rec`/`recR`/`apiR`/`apiQ`/`intentAsk`/`intentPreflight`.

### jurisdictions (layer 1; 1,533 lines: `jurisdictions/index.mjs` 1,039, `profiles/oakland-alameda.mjs` 291, `profiles/test-port-ellery.mjs` 203)
- Purpose: every local fact as data with a basis; list/get/validate/combine; combine never chooses between profiles that disagree.
- Uses: record-grammar · Used by: id-spaces, docprofile (L1); acquisition, capture (L3); reading-pipeline, extraction (L4); entities (L5); local-facts, standards, action-grammar, actions, action-clocks, filing-templates, filings, escalation, action-plans (L9); monitoring (L10); affordances, instance-setup, installer (L11). **No layer 6–8 module (inquiry, ai-runs, skills, agent-worker, intent, reevaluation, publication…) has it in `uses`.**
- Relevant provides: TIME R7 (minutes_due), R26 (deadlines), R33/R43 (holidays, per office), R41 (time_zone), R42 (hours), R44 (status); ORGANISATIONS R4 (systems), R6 (bodies, member_titles), R24 (counterparties), R32 (legal organisations); LAW R3 (enactment space), R5 (crosswalks), R6 (codes, file numbers), R7 (records_laws), R23 (standard_sources), R25 (action_kinds), R31 (LAW_LEVELS), R39 (evidence), R40 (templates); COURTS R23 `court`, R25 venue `court`, R26 `claim`; QUESTIONS R7 (search_terms), R16/R27 (undetermined).
- Built: verified R40–R45 in code (`FACT_STATUSES` index.mjs:46; `HOURS_INVALID` :202–221; `time_zone` :431–437; templates :502–527; per-office holidays :621–651). The Status line's "not yet met" is stale (K938 struck the marks). **What the first profile actually holds** (oakland-alameda.mjs:176–290): `time_zone` America/Los_Angeles (researched, M-187); `holidays` for **2026 only**, three entries (the Superior Court venue M-189; Controller, City Council and City Auditor M-190; State Controller M-191), none for the Civil Grand Jury or the records portal, and none for 2027, so those counts are undetermined; hours for City Auditor (M-192) and the court venue (M-193) only; **one deadline rule**, `records_response`: 10 calendar days from `received`, +14 on extension, "Cal. Gov. Code § 7922.535", basis `UNMEASURED`; no `claim` deadline; 3 `standard_sources` (Oakland Municipal Code, the Council's ordinances/resolutions, Cal. Government Code); 5 counterparties; 13 action kinds, including `records_petition` (Tier 2, Alameda County Superior Court), `consent_decree_motion`, `taxpayer_action`, `assessment_challenge`, `constitutional_claim` (Tier 3); `legal_organisations` HJTA and First Amendment Coalition (so the K227 Status clause is superseded by K283/K303); `minutes_due_days` 21 `UNMEASURED`; `search_terms` "oakland", "police"; no template (K921 Q1). Code limits not in the requirements: none found; the gaps are in what the data model and profile hold (no fiscal year, meeting schedule, notice rule or effective-date facts).
- Reached: ops `profiles`, `profilesset` (op-declarations index.mjs:719–720, admin/member): UI 0 and 0. Otherwise reached only inside other modules' services (acquisition, extraction, entities' `idmatch`/`readingname`, the layer-9 ops).
- AI: agent-worker R51 (the action-plan run) reads "the profile's `deadlines`, venues and `legal_organisations` (`jurisdictions.combine`)" through declared ops; no other AI path.
- Deployment: T32 left-out C8, "first profile's facts without a source | measurement | K925, K934, K941".

### id-spaces (layer 1; 416 lines, `bio-plane/src/idspaces.mjs`)
- Purpose: judges whether one identifier in two captures is a shared identifier that counts.
- Uses: jurisdictions · Used by: record-core (L2), entities (L5).
- Relevant provides: LAW R1, R4, R5, R17 (enactment numbers, forms, crosswalks); TIME R6–R12 (reach floors, parcel roll years); ORGANISATIONS R13–R16, R19 (publishing systems, independence); ANALYSIS R18, R20, R22 (fund joins, near misses never counted).
- Built: verified (`spaces` :76, `recognise` :140, `reach` :206, `parcelStanding` :252, `systemOf` :299, `judgePair` :349; no "oakland" in the file). Nothing is marked not yet met. The Status wording ("names Oakland's systems in code") predates N2 and is stale.
- Reached: only through entities' `op=idmatch` (declared admin/member/probe): UI 0. **Built but unreachable by a member.**
- AI: none found.
- Deployment: none found.

### docprofile (layer 1; 3,170 lines: `pipeline.mjs`, `readtext.mjs`, `registry.mjs`, `doctypes/` with meeting-minutes, meeting-agenda, meeting-calendar, regulation, staff-report, staff-directory, generic)
- Purpose: content-type recognition, layered change assessment between two captures, and the one text entry point for extraction.
- Uses: jurisdictions, site-profiles · Used by: acquisition, capture (L3); reading-pipeline, extraction (L4); monitoring (L10).
- Relevant provides: TIME R15, R31 (temporal connections, `now`), R29 (monitoring contract); LAW/ORGANISATIONS R6 plus the Uses vocabulary (instrument numbers, code citations, bodies, staff directory).
- Built: verified `temporal()` (doctypes/index.mjs:423–431); meeting-calendar `connections` (meeting-calendar.mjs:261–303) emits `minutes_not_yet_published` with `expected_by` = meeting date + `minutes_due_days`, and `agenda_not_yet_published`. The readers emit reference kinds `instrument` (Ordinance/Resolution No.), `code_section`, `legislation` (file number), `meeting` and `contact` (regulation.mjs:254–258; staff-report.mjs:295–301; staff-directory.mjs:180). **Code limits not in the requirements:**
  - dates are parsed only from the English long form "Month D, YYYY", at UTC midnight (meeting-agenda.mjs:84–91; meeting-minutes.mjs:132–139);
  - the regulation reader "does not decide whether the instrument was ADOPTED ... `enacted` is not a fact here" (regulation.mjs:188–191);
  - temporal connections are produced only inside `assess` (change between two captures) and are not stored as connections (connections has no temporal kind).
- Reached: no op of its own; runs inside `op=acquire` (UI 7) and monitoring.
- AI: none.
- Deployment: none found.

### office-readers (layer 1; 3,520 lines: docx, pptx, formats-xlsx, csv)
- Purpose: DOCX/PPTX/XLSX/CSV into I2 structure and text, the DEC-5 envelope, and the shared IC-1 reference builders.
- Uses: subresources, ooxml · Used by: odf-reader, format-registry (L1), extraction (L4).
- Relevant provides: ANALYSIS R9–R14, R17–R18, R26–R27; LAW/TIME/ORGANISATIONS R10 (tracked changes, comments, core properties with authors and dates).
- Built: verified `rangeUnits` (formats-xlsx.mjs:341) and `MEASURED_CSV_TEXT_BOUND_BYTES = MEASURED_OOXML_TEXT_BOUND_BYTES` (csv.mjs:207). The envelope extent is now citable (content R33, content/extent.mjs:15, :51) but **still not indexed as text units**: no `envelope` in reading-pipeline's units, so the Suggestion at l.302–307 still holds for search.
- Reached: inside `op=acquire` and the format registry; no op of its own.
- AI: none.
- Deployment: T32 left-out B1 "DIST-14 (office-readers) | deployment | CSV bound measured on a deployed plane" and C1 "office-readers R28/R29 retired | deployment | migrations at every instance".

### odf-reader (layer 1; 2,258 lines, `bio-plane/src/odf.mjs`)
- Purpose: `.odt`/`.ods`/`.odp` into the same I2/DEC-5 shapes; a stable evidentiary digest for Drive exports.
- Uses: subresources, ooxml, office-readers · Used by: format-registry (L1), acquisition, capture (L3).
- Relevant provides: ANALYSIS R15–R19, R42, R44, R45; LAW R8; TIME R8, R9, R29.
- Built: verified `ODF_REPEAT_EXPANSION_MAX = 262144` (odf.mjs:221). Nothing is marked not yet met.
- Reached: inside acquire/capture.
- AI: none.
- Deployment: none found.

### extraction (layer 4; 2,679 lines: `extractrun.mjs` 342, `extraction/` 2,337)
- Purpose: makes and records readings (via reading-pipeline); the reading record and its read contract; the re-read; drift obligations; the EXTRACT role's vocabulary.
- Uses: record-grammar, jurisdictions, text-chain, format-registry, office-readers, docprofile, pdf-worker, ocr-worker, record-core, membership, capture-sources, capture, provenance, promotion, calibration, reading-pipeline · Used by: content (L4); entities, connections, progressions, observation-log, retrieval (L5); inquiry, basis-versions, contradiction, run-productions (L6); case-carriage, case-disclosures, case-authoring (L8); control-plane, plane (L11).
- Relevant provides: ORGANISATIONS/LAW R28 (readingref), R46, R58, R59; LAW R52 (agenda→file); QUESTIONS R36, R41–R43, R61–R62; TIME R19, R23, R34, R51.
- Built: R65–R68 are in the code (extraction/index.mjs header l.7–10; testimony projection :489–496; `registerCounts` :506–507; `indexTestimony` :863; N26/N439 migrations :118–314). The Status "not yet met (T19 layer 4)" is stale. **Code limit:** a reading's `at` is the capture's `retrieved` instant (reading-pipeline/index.mjs:741, :945). There is no document date, and progressions' "a reading's date" is in fact capture time.
- Reached: `reading` UI 1 (recR at app.html:17610), `readingref` 1, `acquire` 7; `textprovenance`, `pdfstructure`, `calibrationdrift` 0 (built, no screen).
- AI: the EXTRACT role (run-productions R10–R12 use `EXTRACT_RUN_MODE`, `proposalChain`, `proposedReadingGrade`); `extractpropose` is in op-declarations' `AI_RUN_ACTIONS`, and the agent worker calls `op=extractpropose` (2 sites). R32 refuses an `ai` credential on the OCR re-read.
- Deployment: only C1 above (the retirement of the migration helpers).

### content (layer 4; 3,526 lines)
- Purpose: the extent grammar, content addresses, mint/find with labels, transcriptions and attestations, citation checks for every citing module, stale marks, the graded version notice, `passageText`.
- Uses: record-grammar, text-chain, format-registry, pdf-pixels, record-core, membership, promotion, provenance, extraction · Used by: 22 modules, including inquiry, citation, basis-versions (L6), reevaluation (L7), case-checker (L8), standards, conformance, consequences, actions, filings (L9).
- Relevant provides: TIME R11, R22, R29–R31, R41; ANALYSIS R1/R7 (sheet extents), R46 (`passageText` → consequences R2); QUESTIONS R8, R16, R19, R27–R28; DOCTRINE R34–R37.
- Built: the envelope extent is verified (extent.mjs:15, :51, :102–135). `ATTEST_NO_NOTE` is enforced (index.mjs:364, :1069); its T22 mark is stale (K1030). `contentOps` is in ops.mjs. consequences really reads `passageText` (consequences/index.mjs:27–28, :247).
- Reached: `content`, `contentcrop`, `contentmint`, `textattest`, `attesttext`, `transcribe`, `transcriptionattest`, `transcription` all **UI 0**; `versionnotice` (reevaluation's) 1. Content's own services are built but no member screen calls them directly; they are reached only inside citing acts (inquiry, cases, actions).
- AI: run-productions uses `captureFor`, `mint` and the mint label (AI-minted rows are `machine_marked`).
- Deployment: none found.

### entities (layer 5; 1,326 lines)
- Purpose: the entity axis and Declared Bias's subject registry; resolution grades; `concerns`, `namingDocuments`, `idMatch`.
- Uses: record-grammar, jurisdictions, id-spaces, record-core, membership, provenance, extraction · Used by: connections, progressions, bias, observation-log, retrieval (L5); inquiry, basis-versions, contradiction (L6); intent (L7); docket (L8); actions (L9); scheduler (L10); affordances, control-plane, plane (L11).
- Relevant provides: ORGANISATIONS (kinds, relation kinds, R1–R17, R20–R24, R38); DOCTRINE R26–R28.
- Built: verified `ENTITY_KINDS` (index.mjs:28) and `RELATION_KINDS` = proxy_for, member_of, overlaps (:31). `ENTITY_NO_NOTE` is enforced (:321); its T22 mark is stale (K1030). `entitiesOps` and `registerCounts` are present. No code limits found beyond the requirement's closed vocabularies.
- Reached: UI `readingname` 6, `entitycreate` 1, `entityalias` 1, `relationdeclare` 1, `entity` 2, `entitybyalias` 3, `resolutions` 7, `concerns` 22, `resolve` 3, `resolvetestify` 1. **UI 0:** `relation`, `idmatch`, `aliaswithdraw`, `relationwithdraw`, `resolutiondefect`. `readingnameplan` is not declared as an op at all.
- AI: no AI run act touches it (`AI_RUN_ACTIONS` = airunopen/tick/close, suggest, capturerequest, extractpropose, contradictionpropose, contradictionrecommend). The agent worker reads its data indirectly through retrieval's `op=meaningrows` (21 call sites). intent R4 (L7) uses one hop of a declared relation to scope an objective's instances.
- Deployment: none found.

### connections (layer 5; 2,681 lines)
- Purpose: derived connections, portion grades, edges between bundles, member/source/containment connections, themes.
- Uses: record-grammar, subresources, text-chain, record-core, membership, promotion, provenance, capture, extraction, content, entities · Used by: 21 modules (inquiry, ai-runs, run-productions, reevaluation, publication, ratification, action-grammar, actions, queue…).
- Relevant provides: ORGANISATIONS R1–R2, R31, R34; LAW R19–R23, R30, R49, R55–R58; TIME R32; QUESTIONS themes R39–R48.
- Built: verified `CONNECTIONS_LIMIT_DEFAULT` 500 / `_MAX` 5000 (index.mjs:62–63). `out_of_view` is in the code (:898–927), so R20's T21 mark is stale. `registerCounts` is present.
- Reached: UI `connect` 3, `connections` 13, `connectionchoose` 1, `backlinks` 9, `linkproject` 1, `themedeclare` 1, `themeplace` 3, `themepropose` 1, `themeread` 3. **UI 0:** `dangling`, `connectionassert`, `connectionsasserted`, `filemembershipstore`, `filemembership`, `filemembershipjudge`, `themewithdraw`. So the agenda→file containment (LAW) and member-asserted connections are built but unreachable by a member.
- AI: ai-runs and run-productions use `citesInto`. An assistant may propose a theme hunch (`class:ai/<tokenId>`, Terms). `themepropose` is declared for admin/member/probe and is not among the AI run acts.
- Deployment: none found.

### progressions (layer 5; 1,669 lines)
- Purpose: declared flows, threaded instances, missing/overdue/cardinality findings derived on read, the proposals feed.
- Uses: record-grammar, record-core, membership, promotion, provenance, extraction, entities, connections · Used by: inquiry (L6), intent (L7), scheduler (L10), affordances, queue-producers, queue, control-plane, plane (L11).
- Relevant provides: TIME R16, R17, R33; LAW R2, R4, R11, R14, R32; ANALYSIS R18, R31, R32.
- Built: verified `STAGE_REQUIREDNESS` (index.mjs:47) and `intervalDeadlineMs` (:103–115). `NO_BASIS` on a first declaration (:390) is enforced; its T22 mark is stale (K1030). **Code limits not in the requirements:**
  - days and weeks are fixed 86,400,000 ms spans; months and years are UTC calendar arithmetic;
  - the anchor is `readingOf(sha).reading.at` (the capture's retrieval instant), else the provenance registration (:861–870), never the document's own date;
  - no time zone, business days or holidays.
  R32 (junction checks) has no code.
- Reached: UI `progression` 3, `instance` 5, `proposals` 7, `captureprogressions` 2, `proposedispose` 10; `progressiondefine`, `thread`, `discharge` through `intentPreflight`/`intentAsk` on the progression screen (app.html:17783, :18046–18076); `exceptions` 0.
- AI: none directly. intent (L7) and the queue read its findings.
- Deployment: T32 left-out A37, "progressions R32 | dependency not yet built | no amounts or funds as values".

### bias (layer 5; 1,847 lines)
- Purpose: Declared Bias sets, adoption, the effective lens and its hash, the policy inhale, the bias debt on work products.
- Uses: record-grammar, record-core, membership, promotion, entities, credentials · Used by: inquiry, ai-runs (L6), case-authoring (L8), scheduler (L10), affordances, queue-producers, queue, control-plane, plane (L11).
- Relevant provides: DOCTRINE R5, R27, R28; QUESTIONS R33, R40 (AI runs and findings as work products); TIME R33 (lens then vs now).
- Built: R24 and R25 are in the code (index.mjs:504–560: `interactions`, `unregistered_subjects`), so the "not yet built" heading is stale. R40 is met (K1106; plane/store.mjs:179 registers inquiry findings; ai-runs/index.mjs:111 registers ai-run work products). `BIAS_ADOPTION_NO_REASON` is enforced (:335; K1055). R26 is still not built (K102 trigger).
- Reached: `biasmanifest`, `biasadopt`, `biasinhale`, `biasdebtresolve`, `biasdebt` all **UI 0**. "bias" appears in app.html only as a bundle type (l.1778–1791). **Built but unreachable by a member** from civicos-ui.
- AI: ai-runs records the lens per run, and the run's bias block calls R18. agent-worker R17 refuses a spawn payload carrying `bias` (`SPAWN_PAYLOAD_CARRIES_LENS`).
- Deployment: T32 left-out A8, "bias R26 | dependency not yet built | K102's trigger".
