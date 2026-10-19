# Strings jobs judged no member reads, for UX-DESIGN's `unkeyed` list (K3944, K3957)

BOB batches these into one HANDOFF per R layer close. Each: module, file:line, the string, why (the job's words).

## R1
- connection-grammar `bio-plane/src/connection-grammar/conformance.mjs`:93 "next repeats a page already read"; :110 "two identical calls gave different answers"; :116 "an item is answered on two pages"; :142 "the other viewer's pages are not the complete set less the fenced item"; :157 "an owner of hunch kinds names a hunch and its working inquiry in its fixture"; :170 "the fixture's hub node is not answered as a hub". Why: `ownerConformance` is the battery each owner runs in its own job over its own fixture (R9); never called by a member-facing read; its failures go to the job and BOB (CONNECTION-GRAMMAR #5 J2).
- doctypes `doctypes/index.mjs`:48 "the types are already registered here"; :58 "every type was already held by this registry". Why: the `why` of `registerDoctypes`, read by the composition root at wiring time; no member sees it (DOCTYPES #5 J5).
- court-doctypes `court-doctypes/index.mjs`:24 "no register function was given". Why: `registerCourtTypes`' wiring `why`, read by the composing code (COURT-DOCTYPES #2 J2).
- jurisdictions `jurisdictions/index.mjs`: the 102 plain strings left after JURISDICTIONS #14 J4 (the `detail` of each `validate` refusal, R10, and `combine`'s `NOT_A_LIST` detail, :1653). Why: read by the author of a place's profile data, who fixes the file; no member or installer screen shows them (R10 names the author as reader) (J3). The list: run `node checks/words.mjs <bio> jurisdictions`.
- roster-reader `roster-reader/lines.mjs`:24 (`NOT_NAME_WORDS`), :40 (`UNIT_WORDS`). Why: recognition vocabulary, word lists the reader matches against, not sentences (ROSTER-READER #3 J2).
- subresources `bio-plane/src/subresources.mjs`:402, the render companion's Content-Security-Policy string. Why: wire grammar read by the browser (SUBRESOURCES #5 J4).
- file-scanner `file-scanner/container/renderer.mjs`:105 "route must be pdf or office". Why: the renderer's refusal of a route `render.mjs` never sends; not passed to a member (FILE-SCANNER #7 J4).
- docprofile `docprofile/doctypes/registry.mjs`:54 "a content type is registered by its key, and this one carries no key". Why: `registerDoctype`'s refusal to the plane's wiring (`wiring.mjs` `registerReaders`) (DOCPROFILE #6 J1).
- pdf-pixels `pdf-worker/src/pagepixels.mjs`:119 and `picturepixels.mjs`:60 "an image past the memory bound". Why: a codec mapping key, not a sentence (PDF-PIXELS #6 J1).

## Rows asked of the design (R1)
- image-cover: `refusal.NOT_A_COVERABLE_FORMAT`, `refusal.UNSUPPORTED_JPEG_PROCESS`, `refusal.PNG_INTERLACED`, `refusal.AREA_MALFORMED` have no member row; the module's `COVER_REFUSALS` English stands until they exist (IMAGE-COVER #3 J1).
- Spelling for the design's review of code rows (SETUP-WORDS #7 J3): `odf-reader.odf.content_xml_with_text_list` and `roster-reader.org-chart.labelled_line_s_name_a` spell "labelled" (DEC-221: "labeled"); the table wins once reviewed (K3930).

## Rows asked of the design (R2)
- member-roster (new, K3972): `words-reads.json` has no `member-roster` entry; the keys it reads are on `membership`'s `reads` list (its `WORD_KEYS` lists them); please add the entry (MEMBER-ROSTER #1, finding 2).

## R3
- capture `index.mjs`:699 (the 500 internal fault: the incremental and block hash of the same bytes differ) and :1832 (the render allowance `why`, naming D-492): builder diagnostics no member reads (CAPTURE #37 J2, K3982).

## R5
- events (EVENTS #9 J1): `ownerRead`'s `OWNER_HOST_UNKNOWN` / `OWNER_HOST_AMBIGUOUS` whys (wire diagnostics on a mis-wired host), the `ListenerFailure` message prefix, `checks.mjs` `where`; developer Errors stay as they are. Rows asked of the design: `label.connectionkinds.event_*` (events' kinds read its own `events.*` rows meanwhile, R54 (2)).
- money (MONEY #5 J1): `money/index.mjs`:956 "events is not wired here, so no event the fact concerns is read" (a wiring diagnostic); `words-reads.json`'s "never drawn by the shell" list for money's refusal details has old line numbers, and R13 now keys them.
- retrieval-browse (RETRIEVAL-BROWSE #2 J2): `retrieval-browse.findin.read_another_shape`'s en names "events R49"; reword for members.
- observation-log (OBSERVATION-LOG #15 J4): `observation-log.vocabulary.condition_governor_holding_host` beside the row `machinery-producers.summary.pacing_holding_captures` (same meaning?); `observation-log.index.who_s_lead_is_recorded` beside `observation-log.says.lead_recorded_somewhere` ("op=leadlook" in member text).
- lines (LINES #5 J1 (4)): rows orphaned once `rows.mjs` is regenerated: `lines.text.date_read`, `lines.text.lines_hold_post`, `lines.text.lines_read_holds`, `lines.text.line_naming_office`, `lines.undetermined.line_covers_date`; about 50 new `lines.index.*` refusal details for review.
- local-facts (LOCAL-FACTS #9 J1): refusal `detail`s beside the keyed `translation` in `index.mjs`/`rules.mjs` (e.g. "the act is one of confirm, correct, dispute."), for review.
- retrieval (RETRIEVAL #22 J4): "a registration names its module and its function" (`retrieval/index.mjs`:293, 306, 318, 331, 367; a start-up registration diagnostic; the list holds only its prefix, so the full text is asked).

## R6
- run-rules (RUN-RULES #19 J3): `bio-plane/src/run-rules/checks.mjs`:259, :321, the `where:` field of two refusal rows (the source site that mints the refusal); `deployment.mjs`:71, :213, :230, :296, :300, the deployment gate's mode-record fields (`role`, `means`, `when`, `why`) read by a reviewer changing a deploy flag. Why: developer text, never rendered to a member.
- reading-guides (READING-GUIDES #7 J1): `registerConductCheck` and `registerGuideChannel` refusal `detail`s (`PROVIDER_MALFORMED`, `PROVIDER_DECLARED`); `library.mjs` `civicsmithGuideProblems` strings and `freezeLibrary`'s TypeError. Why: start-up and release-time diagnostics.
- answers (ANSWERS #12 J1): `bio-plane/src/answers/check.mjs`:59 "the summary names the sentences it rests on, as s<i>"; `sentences.mjs`:92 "a sentence's support names holdings, rule items or looks as h<i>, r<i>, l<i>". Why: ANSWER_MALFORMED details naming the model contract's wire tokens; the member reads only the row's translation.
- agent-harness (AGENT-HARNESS #11 J2): `harness.mjs`:320, 321, 329, 344, 349, 355 (CONTROL_FLOW `does`/`judged`) and :1042, 1061, 1080, 1085 (PLAN_FLOW): instructions composed into the model's step prompt; `subsession.mjs`:116–119 (REPORT_STATES values; only the keys travel) and :581 (documentHoldings' `identity` method description). Why: model-facing or developer text no member reads.
- citation (CITATION #13 J1): the 61 citation strings on words-reads.json's `unkeyed` list that a member reads (refusal details, session-log lines) are converted by its job (K4010): please drop each converted one from the unkeyed list (the job's record names them).
- agent-runner (AGENT-RUNNER #14 J3 (2)): `agent-runner/src/entry.mjs`:97, :111; `manifest.mjs`:16, :18; `runner.mjs`:36–48, 75–76, 90, 106, 146–147, 155, 199, 201; `signin.mjs`:125; `worker.mjs`:122. Why: wire grammar, release-time and SDK diagnostics, details the plane replaces by its own row; the image cannot import the word table (R41).
- capture-requests (CAPTURE-REQUESTS #22 J2 (1)): words-reads.json's unkeyed entries for capture-requests still say "your group's Civicsmith" where the source and rows say "your team's" (K3472): please update them.
- strength (STRENGTH #16 J3, J4): `method.mjs` V1_LINES / V2_LEGS (:279–326), the three published signed grading-method texts bio-grading/1–3, pinned bytes (K1333); `index.mjs` `appendSessionLog`'s `## Session Log` marker and the session header's glue. Why: signed pinned versions and document grammar.
- contradiction (CONTRADICTION #11 J2): `contradiction.mjs`:31 JUDGEMENT_PROMPT, :99 RECOMMEND_PROMPT, :84 `renderJudgementInput`'s pair line. Why: the model's input, pinned by digest (R2, R41, R57); a row must not override the measured text.
- citation (CITATION #13 J3): `splice.mjs`'s frontmatter wiring line (`- rel: ... target: ... status: ...`): record grammar.
- basis-versions (BASIS-VERSIONS #20 J5): the 15 `where` strings of `checks.mjs` (source locators read by control-plane's region checks).
- contradiction (CONTRADICTION #11 J3): besides the three pinned prompts, `contradiction/index.mjs`:361, :364 (run-gate registration diagnostics), :2001 ("contradiction {}: candidate {}", an internal label), `text.mjs`:43 (the `## Session Log` marker).
- skills (SKILLS #25 J5): the seven strings its record names, already on the design's unkeyed list.
- agent-worker (AGENT-WORKER #33 J3): `agent-worker/src/ops.mjs`:26, :27, :50, :53, the `why` descriptions of the worker's op table. Why: developer descriptions no person reads.

## R8 (for R8's batch HANDOFF)
- publish-schedule (PUBLISH-SCHEDULE #3 J1): `index.mjs`:82, PROVIDER_MALFORMED's detail "the scheduled publisher gives the door publishScheduled": a wiring diagnostic, no member reads it.
- case-inputs (CASE-INPUTS #5 J5 (1)): the signed case-input document's lines stay code-keyed with the code's own text (K1333); the design rows spelled "acknowledgment" under other ids (`case-inputs.acks.rows.map.participant`, `.given_draft`, `.document.list_stops_acknowledgments`, `case-inputs.listed.*`, `case-inputs.why.case_document_authored`) are not read by those lines: the design says whether they are orphans to drop.
- case-catalogue (CASE-CATALOGUE #3 J3): `SEARCHED_SUBJECT_SOURCES.case_basis` and `CASE_DOCUMENT_FAMILY[*].what` in `checks.mjs`: developer descriptions read by no screen (not counted by the check).
- case-account (CASE-ACCOUNT #5 J1): `index.mjs`:523, :526, the MALFORMED and REVIEW_COMMENTS_DECLARED details of `registerReviewComments` (R17: start-up wiring errors).
- ratification (RATIFICATION #27 J1 (4)): the MALFORMED details in `ops.mjs` (`caseratify requires caseId, edition ...`, `ratify requires bundleId, expectedSha, and sig ...`, `publishat requires ...`) and `index.mjs`'s `registerApprovalReader`/`registerHoldReader` details: API text for a developer caller (not counted by the check).
- public-read (PUBLIC-READ #25 J6): `index.mjs` `registerGroupIdentity` PROVIDER_MALFORMED/PROVIDER_DECLARED details, `registerEvidenceBlock` (~242–246) and `registerPublicReads` (~378–386) registration details: start-up wiring; `door.mjs` 42, 67, 110 `requiredArgument` strings, `index.mjs` `publishededitions`/`publishedfrozen` NO_ID details, `worker.mjs` `publishedcase` requires-argument (~604–607): API-caller text; the container manifest's `verify`, `layout.note` and the two in-band `over` strings: bytes inside a container a hash pins (K1333), code.
- case-disclosures (CASE-DISCLOSURES #13 J1): the signed case document keeps "acknowledgement" (K1333); the design's row `case-disclosures.document_case_findings` ("acknowledgment") is not read by it: the design says whether it is an orphan to drop.
- case-checker (CASE-CHECKER #15 J2 (3)): `spec.mjs` (27 findings: the readable specification of the case-file formats, pinned to format versions, wire grammar), `main.mjs`'s `usage:` line and `--lens names no lens` error, the `check`/`about` identifiers of an entry.
- case-grammar (CASE-GRAMMAR #18 J3, K4024 (a)): the signed case-document sentences of `complete.mjs`, `edition.mjs`, `standing.mjs`, `tensions.mjs`, `blocks.mjs`, `account.mjs`, `outcomes.mjs`, `index.mjs`, `words.mjs` (160 findings; its record's REPORT lists them): signed, pinned per format (K1333).
- case-disclosures (CASE-DISCLOSURES #13 J2 (1)): `BAD_COMPLETENESS` details describing an op argument's shape (wire grammar).
