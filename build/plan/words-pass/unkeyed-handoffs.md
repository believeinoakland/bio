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
