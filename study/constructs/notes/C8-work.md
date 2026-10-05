### MKD chunk 1-160
TIME
- [DESIGN] MKD §2 L73-78 — observation keeps two dates apart, as correspondence does: `observed_at` (authored, when member saw it) vs the record's own time of writing; observed_at REQUIRED, date or UTC instant, never later than record clock (decided 2026-09-18) — "**`observed_at` is REQUIRED** — a date or a UTC instant, never later than the record's clock (decided 2026-09-18 from MK-1's build; reversing it is small)."
- [DESIGN] MKD §2 L75 — an edit is a new bundle that supersedes, never a rewrite (version over time) — "an edit is a new bundle that supersedes, never a rewrite."
- [DESIGN] MKD §2 L80-82 — canonical header above the words carries testimony id + observed_at, making sha unique.
- [RULING] MKD §3 L121-122 DEC-102 — identity-level change propagates as re-evaluation notice to every finding resting on the testimony (temporal re-evaluation) — "the change in weight reaches every finding resting on the testimony as a re-evaluation notice, as for a source whose identity firms up (DEC-78 item 5 (e))."
- [DESIGN] MKD §4 L127-128 — attribution recorded per case edition (edition-keyed, later edition inherits per Status L8).
ORGS
- [EXAMPLE] MKD §3 L104-106 — "I saw the vendor's truck at the Clerk's house" bears on "the vendor was favoured" only by inference: a vendor–official (position) relation is the kind of proposition members test — "*"I saw the vendor's truck at the Clerk's house"* is testimony D either way, and bears on *"the vendor was favoured"* only by inference."
- [DESIGN] MKD §4.0 L145 — group-internal roles only: publication acts are the publishing project's owner's (#isProjectOwner, #caseAuthority); no government-org modelling in this doc.
QUESTIONS
- [BUILT] MKD §2 L57-59 — observation is content so passage search over capture_text, extents, op=cite, verify work unchanged.
- [OPEN] MKD Incomplete §3 L14 — bare `leg:testimony` in query language ambiguous (source or axis); refused arm dropped while rest runs so caller ignoring warning gets a superset; whether to refuse whole query is open for query-language owner — "a refused arm is dropped while the rest of the query runs, so a caller ignoring the warning receives a superset".
- [BUILT] MKD Status L5-6 — op=frontier&level=internet applies lead visibility before grouping (#leadReach, IC-143); leads are the "authored half" of the frontier (construct 10) L11.
- [GAP] MKD Incomplete §4 L16(b) — no read tells an author a prepared edition reaches their observation (out-of-band; surface/notification question).
- [OPEN] MKD Incomplete L16(d) D-598 — once observation published as case evidence, C-21.2 lets a new finding cite it only ungraded.
ANALYSIS
- [DESIGN] MKD §3 L113 — strength arithmetic DEC-32: weakest leg across AND, strongest branch across OR; sees a third axis — "DEC-32's weakest leg across AND, strongest branch across OR — and simply sees one more axis."
- [BUILT] MKD Status L5-6 — op=stats counts: leads published to no class; observationsNonLead to every class (counts as a disclosure-governed derived number).
DOCTRINE
- [RULING] MKD §1 L41-51 Bob 2026-09-14 — member eyewitness knowledge is evidence on member's trust; testimony D; attribution group·project·cover·name chosen by attesting member; off-the-record anonymity valid.
- [DOCTRINE] MKD §2 L75 — member's words as written; "Nothing paraphrases, summarises or cleans them" (no machine rewriting of authored evidence).
- [DOCTRINE] MKD §2 L71 — author server-stamped; caller naming author = signing as someone else.
- [DOCTRINE] MKD §3 L88-91 DEC-21 — grade axes kept apart (capture = act of reading a document in; testimony separate axis) — "grading an authored statement "capture D" would make one axis mean two things".
- [DOCTRINE] MKD §3 L107-110 — refusing a grade is the overclaiming direction: "a leg the bar cannot see is a leg it cannot fail."
- [RULING] MKD §3 L116-123 DEC-102 (Bob 2026-10-01) — testimony credited at group/project = anonymous tip, must be corroborated "to journalistic and legal standards before a finding may rest on it"; level→grade mapping and what counts as corroboration are BOB's to draft.
- [DOCTRINE] MKD §4 L131 — no default, never prefilled (DEC-69 "FORCED").
- [DOCTRINE] MKD §4 L136-138 — off-the-record source: no field that could hold source's identity; "Anonymity is structural, not a redaction: a column that exists can leak, and one that does not cannot."
### MKD chunk 161-313
TIME
- [DESIGN] MKD §4.3 L185-187 — a later edition inherits the prior edition's attribution choice until author changes it; more protective any time, less only by new act (state over editions).
- [EXAMPLE] MKD §5 L221 — lead: "I was told the contract was amended; look at the Clerk's March agenda." (amendment event + meeting-dated agenda as locator).
- [DESIGN] MKD §5 L223,227-230 — lead row carries `at`; sharing to a project is "an authored, dated act".
- [DESIGN] MKD §4.5 L204-206 — author who left: observation usable where they already chose, nowhere new (membership over time).
ORGS
- [EXAMPLE] MKD §5 L221 — "the Clerk's March agenda": a position (Clerk) owning a meeting agenda as locator.
- [EXAMPLE] MKD §6 L273-274 — "I believe the vendor was favoured": vendor-official favouritism as opinion, not finding.
LAW
- [EXAMPLE] MKD §5 L221 — "the contract was amended": contract amendment as a member's lead.
QUESTIONS
- [DESIGN] MKD §4.2 L176-177 — draft and review copy list every observation the edition reaches at any depth (`testimonyReach`) with state chosen/not.
- [DESIGN] MKD §5 L227-231 — lead visibility: author; project participants after share; machine credential only within member-minted scope, "never an unfiltered machine read"; everyone else "receives exactly the answer a lead that does not exist would receive".
- [BUILT] MKD §5 L262-267 — op=leadlook writes observation_log at level `internet` with lead words as subject; reader must gate lead rows and tally; "a lead that finds nothing records `LOOKED_ABSENT` against itself, which is the internet level of the frontier ... finally having a writer"; document/content/meaning readers never see these rows (four levels: document, content, meaning, internet).
ANALYSIS
- [RULING] MKD §5 L233-261 BOB #15 2026-09-18 — "A COUNT IS A DISCLOSURE OF EXISTENCE, so the rule above binds counters too"; leads leave op=stats for every class; observations counts non-lead rows; "A SIZE IS A SIGNAL TOO" (dbBytes admin-only).
- [RULING] MKD §5 L256-261 BOB #32 2026-09-24 (D-464, D-486) — scope: existence-private constructs (lead, hidden project); counts and frontier tallies served outside a hidden project's sight subtract its rows; other aggregates "naming no bundle, subject or address" are operator facts (REC-110).
- [DOCTRINE] MKD §5 L253-255 — "one name, one quantity" (BOB.md rule 7): a key keeps one meaning for every caller; wire key `observationsNonLead` "names its predicate".
DOCTRINE
- [DOCTRINE] MKD §5 L223-224 — a LEAD is never evidence, cannot be a basis leg; "A lead is a tip, and a tip leaked is a source exposed."
- [DOCTRINE] MKD §6 L271-274 — opinion is a case ELEMENT never a basis leg; stops "I believe the vendor was favoured" reading as a supported finding.
- [DOCTRINE] MKD §4.6 L210-212 — record holds no legal name ("it must not start to"); cover+handle only, "so a seized roster does not deanonymise the group"; `name` publishes handle (PROVISIONAL, BOB #34).
- [DOCTRINE] MKD §4.4 L192-199 — ratification refused while any reached observation unchosen (PROVISIONAL); veto over own words only.
- [DOCTRINE] MKD §7 L280-297 — refusal catalogue (authored/origin mismatch, capture grade on authored leg, attestation raising testimony, no level, off-record source identity, lead/opinion as leg, caller-supplied author, import/replay path around testimony, published part naming author, ratify with unchosen, name without handle).
### EBD chunk 1-95
TIME
- [DESIGN] EBD §2 L48 — agenda names what a body WILL consider, minutes what it DID; shared meeting identifier earns B connection; agenda→minutes = first progression (Part I §8.2) the record could close from its own readings — "an agenda names what a body WILL consider and the minutes what it DID, sharing the meeting identifier that earns a B connection".
- [BUILT] EBD §2 L46 — registered types `meeting_calendar`, `meeting_agenda` (measured), `generic` fallback (docprofile/doctypes/registry.mjs).
- [RULING] EBD §2 row 6 L63 BOB #32 2026-09-24 — financial report recogniser's last conjunct is "the GAAP statement spine together with A PERIOD THAT HAS ENDED" — plan (budget, money not yet spent) vs report of a closed period: fiscal-period reasoning in a recogniser.
ORGS
- [BUILT] EBD Status L8, §2 row 4 L60 — STAFF DIRECTORY type written by FW-20 (2026-09-23); directories are tier-2 docs; 56/57 read from text (M-121); counted ~395±272 (whole corpus ~607±184).
- [EXAMPLE] EBD §2 L69 — Oakland agenda packets contain an agenda, its staff reports and its draft resolutions; 52/600 docs multi-class.
- [DESIGN] EBD §2 L48 — "body" as the meeting holder whose agenda/minutes the readers parse.
LAW
- [DESIGN] EBD §2 L48, row 3 L59 — "a regulation (an ordinance or resolution's text)" is a candidate reader; ordinances/resolutions ~1,629±540 (M-18), ~1,850±314 over whole corpus (M-176), third in reader order; Legistar half: 21 of 48 sampled attachments are ordinances or resolutions (L67).
- [RULING] EBD §2 row 5 L61-62 BOB #32 2026-09-24 — "a budget is a plan and a statement reports actuals"; budget type excludes audited statements (ACFR/CAFR, Redevelopment Agency statements) → separate FINANCIAL REPORT type.
ANALYSIS
- [GAP] EBD §2 row 5 L61 — budget or dataset (Bob named it, D-66): ~520±238; two arms (budgets: money density; datasets: "a table of distinct, value-carrying records"); 6 of 10 datasets one series (parcel-exemption status CSVs); "The office entries read an `.xlsx` dataset (24 of 25 sampled) and read NO `.csv` or `.xls` at all"; "No reader is written".
- [GAP] EBD §2 row 6 L63, Incomplete L15 — financial report ~58±80 (~89±71 whole corpus); no reader; 2 of 13 calibration docs (`2024-Single-Audit-Report-PDF.pdf`, `CAFR-2020.pdf`) have NO TEXT LAYER and are invisible; scanned ones unbounded.
- [DESIGN] EBD §2 row 5 L62 — "a dataset is a FORM and the ruling is about a subject, so a workbook of audited figures is honestly both and is reported multi-class."
- [DESIGN] EBD §3.1 L79 — office container: cells ARE the structure (range of cells under `layer` step); PDF table = machine step `table(engine)`, a derivation calibrated like OCR; cells' text keeps page chain.
- [BUILT] EBD Status L5, §3.2 L86-90 — `sheet-range` {sheet, range} A1-style and `doc-table` {table, cell?} arms + `image` reference BUILT by FW-19 2026-09-18 (fw19-extent-arms.test.mjs); content table `cited_as`.
- [GAP] EBD Status L5 — "a workbook's defined tables and named ranges as units (D-415)" NOT built.
- [GAP] EBD Incomplete L16, Status L7 — PDF table recognition MEASURED NO-GO (M-55): geometric step recovered unruled table exactly, "the RULED one not at all"; no `table(engine)` step exists.
- [DESIGN] EBD §3.1 L80 — a chart/map cited AS ITSELF is bytes (`cited_as: bytes`), no extraction chain; text read off it is separate OCR content cap C.
DOCTRINE
- [DOCTRINE] EBD §2 L46 — "a type is written from a page that was actually fetched and read, because a type invented from what a document probably looks like reassures people about things it has not understood."
- [DOCTRINE] EBD §2 L69, L64 — "A filename is not evidence of a document's kind"; readers "must admit a document being more than one thing".
- [DOCTRINE] EBD §3.1 L80 — D-129: "an absence is never read as a value"; null chain ≠ undetermined; stated as a column.
- [DOCTRINE] EBD §2 L71 — Bob's 5.4: "specificity is worked for" — references content-grain from the start.
### EBD chunk 96-187
TIME
- [BUILT] EBD §5.1 L132, L137 — read-time re-extraction writes a content-level observation (authority_kind=extract, member as actor): "*this document was re-read on this date at this member's request under this engine* is a fact the record holds" (CPDF-19, IC-126, `ocr=1` on op=pdfstructure).
- [DESIGN] EBD §5.1 L131,133 — new chain stales prior content rows (REC-82), "nothing moves under them" (Bob's 5.8); frontier lists captures with "a chain older than its engine's calibration" (staleness relative to calibration date).
ORGS
- [BUILT] EBD §4 L117 — AI EXTRACT proposes "a reading — entities and facts the registered readers did not find" (SK-8, op=extractpropose in DEC-62 run); grade computed from what it names: "an identifier in the text earns B as today; a name C), never A"; held in own table, never counted as coverage.
LAW
- none in this chunk.
ANALYSIS
- [CONFLICT] EBD §3.3 item 1 L99 says sheet-range comes "where a defined table or a named range exists in the workbook, from it", but Status L5 says defined tables/named ranges as units NOT built (D-415).
- [DESIGN] EBD §3.3 item 3 L103 — until a table engine is measured "a table on a PDF page is a `pdf-page` rectangle whose text is the page's — content, honestly, without the structure claim."
- [DESIGN] EBD §4 L118 — "a proposed table structure on a PDF page (§3.3 once GO)": `table(engine)` derivation calibrated like OCR (AI/engine production, unbuilt).
- [DOCTRINE] EBD §5.2 L146-147 — two producers publish field `undetermined` counting different quantities (characters vs page markers) so a comparison "performs NO COMPARISON"; "an equality or an outcome that costs nothing to produce is not evidence"; "A same-named field is the likeliest place it fails, because the name is what makes the comparison look already checked." (applies to any derived-number comparison).
- [DOCTRINE] EBD §5.2 L147 — D-283's warning "a character count is not a quality measure"; guard only withholds.
QUESTIONS
- [RULING] EBD §4 L111 — DEC-24 names EXTRACT; Bob's 5.7 "the assistant may mark passages as citable on its own"; D-358 answered 2026-09-14: EXTRACT runs in DEC-62's RUN, not on pilot credential; "the pilot is read-only and writes nothing".
- [DESIGN] EBD §4 L111 — "an uncited machine-minted row is a proposal rather than coverage"; mints are a bound on the run.
- [DESIGN] EBD §4 table L115-119 — productions: proposed citable passage (SK-7; minted_by machine credential; labelled everywhere; never attested); on-point candidate for document-grain edge (member's choice is the authored act); proposed reading (SK-8 BUILT) with `ai(function, version)` step via textchain appendStep; proposed PDF table structure; cleaned/normalised text "NOT a transcription — a person supplies text, a machine only transforms it".
- [DOCTRINE] EBD §4 L121 — EXTRACT "never attests (C-35.10), never touches the provenance chain, never chooses the question, and its rows are part of a finding only when a member cites them."
- [DESIGN] EBD §7 item 7 L177 — AI-proposed readings emitted "by the assistant's EXTRACT on a member's objective".
- [DOCTRINE] EBD §8 L186 — "a proposed reading carries an `ai(function, version)` step and never a grade above B; strip the step and the row is refused".
DOCTRINE
- [DOCTRINE] EBD §5.1 L129-133 — re-extraction opt-in, never automatic; "re-extraction is a choice made from a list, informed once at the act (DEC-69), and never a silent sweep"; honest branch refuses by name with no OCR member.
- [DOCTRINE] EBD §5.2 L153-154 — only real instance was "a private individual's resume" → fixture synthesised; "No personal record is taken to answer it."
- [DOCTRINE] EBD §6 L162 — progressive/arithmetic JPEG refused by name: "a baseline parse of a progressive file is a plausible smear, which an OCR engine turns into fluent invention."
- [RULING] EBD §6 L158-159 DEC-74 decided 2026-09-14 BOB #11: external OCR above cap C not funded; reconsidered only when an image-only document is load-bearing in a real case and C is below that project's bar (DEC-35 governs spending). OCR chain `pixels → ocr(tesseract-wasm 0.11.0)` capped at C.
### DP chunk 1-130
TIME
- [DESIGN] DP Place L7 — docprofile serves construct 6 (meaning) "where its referential and temporal connections are emitted as different kinds".
- [GAP] DP Incomplete L11 — `resolveLinks`' contemporaneity bracket keys on raw `capture_sha`, so on a viewstate-churning page "every fetch mints a fresh row and the bracket is always null (D-59's "strongest arm can never fire")"; `compare()` has no caller in bio-plane/src. (Contemporaneity = as-of link resolution.)
- [BUILT] DP Status L4, Incomplete L11 — monitoring DISCHARGED 2026-09-23 (D-60): `op=monitor` compares evidentiary digest when both sides earned one and says which comparison it made.
- [GAP] DP Incomplete L13 — per-kind monitoring contract (`CONTRACT.SUBSTANCE`/`MEMBERSHIP`/`UNMONITORABLE`) BUILT in library, NOT REACHED: "the plane's monitoring tick does not ask what contract the document is under".
- [NEED] DP §requirements L54-57 — "The system must recognise when something meaningful in the evidentiary portions has changed, and equally must recognise when it has NOT." (change over time of a held document).
- [DESIGN] DP §Three digests L102-112 — identity/rendition/evidentiary digests; five verdicts `identical`, `unchanged`, `restyled`, `changed`, `undetermined`.
- [EXAMPLE] DP §measurements L82-84 — two Legistar fetches minutes apart differed in length: "the calendar's own content varies with the date window. That is a real change and no rule may hide it."
ORGS
- [BUILT] DP Incomplete L14,16 — `staff_directory` type written (FW-20, docprofile/doctypes/staff-directory.mjs) from real directories read at tier 2.
- [GAP] DP Incomplete L16-17 — directory recognised "by addresses at ONE organisation's domain, so a directory with NO email addresses (phone-only, or names and titles only — the Council's committee roster and the org charts are of this shape) is not recognised and falls to `generic`"; a 300-doc walk found NO directory vs ~3.8 expected (M-121, unresolved).
LAW
- [BUILT] DP Incomplete L14 — seven content types registered as of 2026-09-23: `meeting_calendar`, `meeting_minutes`, `meeting_agenda` (FW-15), `staff_report`, `regulation` (FW-18), `staff_directory` (FW-20), `generic`; budget/dataset owed and unmeasured.
- [GAP] DP Incomplete L14-15 — "THE ENGINE CANNOT REPORT A MULTI-CLASS DOCUMENT" (breaks on first CERTAIN detection); additive `also` pass in doctypes/registry.mjs; open whether engine should say it.
- [DESIGN] DP Incomplete L15 — "A CLASS'S SELF-NAMING IS A RATE, NOT A PRESENCE" (`selfNaming`/`FURNITURE_RECURS`), resisting M0-32's defect class "a REFERENCE read as MEMBERSHIP" (a document citing an ordinance is not an ordinance).
DOCTRINE
- [DOCTRINE] DP L59 — "Neither requirement can be met by comparing bytes."; L102-103 raw bytes never rewritten.
- [DOCTRINE] DP L124-125 — "A boundary that missed must never be read as a document with no content."
- [DOCTRINE] DP Incomplete L18 (D-167) — stack over extracted text is "ADVISORY context for the doctype pass, never a verdict about the document".
- [DOCTRINE] DP L71 — client-rendered capture: "a technically perfect capture that is evidentially worthless, and the only failure here that is silent".
- [GAP] DP Incomplete L19 — evidence base still "the same three sources" (46 days on).
### DP chunk 131-260
TIME
- [RULING] DP §Monitoring L181-182 Bob 2026-07-30 — "`index` versus `record` changes monitoring's BEHAVIOUR, not just which normalisation rules apply."
- [DESIGN] DP §Monitoring L195-213 — contracts substance / membership / unmonitorable; membership events ordered worst-first: removed (EVENT), altered (EVENT: "A meeting cancelled, an item's status moved, or a document swapped under a heading that did not move"), added (ROUTINE).
- [EXAMPLE] DP L215-219 — Calendar.aspx: 41 rows in <main>, 18 with stable MeetingDetail.aspx?ID=, five CANCELLED; "A member watching the Rules and Legislation Committee needs that cancellation."
- [NEED] DP L204-207 — removed: "A public record that was on a public list and is no longer on it. This is close to the reason this system exists".
- [DESIGN] DP L223-227, L252-257 — confirmation reported positively: "a dated first-party statement that nothing was quietly withdrawn"; L2 identical-bytes is a finding, "the primary contemporaneity route's raw material"; "A confirmation survives even a change".
- [GAP] (cross-ref DP Incomplete L13) — the membership contract is library-only; the plane's monitoring tick does not ask which contract applies.
ORGS
- [EXAMPLE] DP L187, L217 — "an index moves whenever the body it indexes does anything"; watching a named committee (Rules and Legislation Committee) as a unit of interest.
LAW
- [EXAMPLE] DP L184-185 — "A `LegislationDetail.aspx` page changing is an event somebody should look at" (legislation record change = event); item status moved; agenda replaced under unchanged title = "quiet substitution" caught via View.ashx links folded into row digest (L209-212).
ANALYSIS
- [DESIGN] DP L171 — `client_rendered` handler asked FIRST; "Carries a member-facing warning that the capture is a frame and not the figures" (cf. oaklandca.opengov.com L71; unmonitorable: "reports "unchanged" forever while the figures behind it move freely, which is the system lying quietly" L199).
QUESTIONS
- [DOCTRINE] DP L228-231 — "Extraction failure claims nothing. A member reader that finds no entries has failed; it has not discovered an empty list." failed read returns null + degraded; L233-234 fallback declares itself `degraded` "so the gap is visible rather than passing as coverage".
- [DESIGN] DP §LAYERS L238-250 Bob ruling 2026-07-30 — layers L1 stack, L2 bytes, L3 noteworthy, L4 content type, L5 meaning, L6 connections ("what does it imply?"; terminal); every result carries a `trail`, "because a verdict whose depth is invisible cannot be audited."
DOCTRINE
- [DOCTRINE] DP §failure asymmetry L127-148 — failing to report a real change "puts a false claim in the record"; unrecognised → conservative handler; without certainty → `undetermined`; "A family or rule is added only on **measurement**."; noise is a signal.
- [DESIGN] DP §Fidelity L158-162 — faithful / degraded / insufficient (render refused "because showing it would misrepresent the source").
### DP chunk 260-384
TIME
- [DESIGN] DP §Content type L267-269 — a content type answers `detect`, `parse` ("what is IN it, as entities with stable keys and named facts"), `assess`, `connections`.
- [EXAMPLE] DP §calendar L273-280 — Calendar.aspx 2026-07-30: range "This Month" 6/29/2026–7/31/2026 read from the range control; "The window is relative to now."; 18 meetings keyed by MeetingDetail ID; 8 CANCELLED; doc type codes M=A agenda (11), M=M minutes (10), AADA/MADA accessible versions.
- [DESIGN] DP §calendar L289-292 — "absence is a delisting only when the meeting's own date falls INSIDE the range the new capture shows"; outside, expected and silent; unreadable window → `possibly_delisted`.
- [DESIGN] DP §calendar L296-304 — events: delisted, cancelled/rescheduled/moved, minutes_replaced/agenda_replaced, minutes_withdrawn/agenda_withdrawn (events); renamed (notice); minutes_published/agenda_published, scheduled (routine).
- [DESIGN] DP §Referential and temporal L322-326 — "Temporal says one thing happened after another and the sequence matters. Strictly directional, followed to understand a STORY. Its most valuable form is an ABSENCE WITH A DUE DATE: minutes that have not appeared three weeks after a meeting are a fact about the body, not a gap in the record."; measured 39 referential + 11 temporal connections from one page.
- [DESIGN] DP L328-330 — cancelled meeting emits no missing-minutes fact; upcoming meeting with no agenda emits a different absence "with its own due date, the meeting date itself".
- [DOCTRINE] DP L332-334 — "The three-week minutes threshold is a threshold for RAISING A QUESTION and never for asserting a violation. Oakland's own practice is the thing to measure and it has not been measured."
- [BUILT — verified at code] docprofile/doctypes/meeting-calendar.mjs:34-38, 261-295 — threshold is the jurisdiction view's `practice.minutes_due_days`; no profile → `expected_by: null` and "when they are due is not known"; emits temporal `minutes_not_yet_published`, `minutes_published_after`, `agenda_not_yet_published` (expected_by = meeting date). jurisdictions/profiles/oakland-alameda.mjs:180 `minutes_due_days: { value: 21, basis: "UNMEASURED" }`; :184 `time_zone: America/Los_Angeles` "researched" (M-187). parseDate at meeting-calendar.mjs:41-45 reads only M/D/YYYY.
- [GAP — verified at code] bio-plane/src/monitoring/index.mjs:535 — the plane's monitor keeps only `connections.length` from assess(); the temporal/referential connections themselves are not persisted there.
ORGS
- [DESIGN] DP L318-320 — referential: "this agenda belongs to that meeting, these minutes record it, that meeting was held by this body"; code index.mjs:408-410 adds "this agenda item cites that ordinance … this staff member sits in that department"; code meeting-calendar.mjs emits `held_by` meeting→`body:<name>`.
- [DESIGN] DP L302, L308-311 — `renamed` (notice): "the body holding the meeting is named differently"; status word stripped from the body's name to avoid spurious rename.
- [DESIGN] DP L324-325 — late minutes are "a fact about the body" (pattern/conduct of a body).
- [EXAMPLE] DP L261-263 — Legistar (ASP.NET) and Granicus calendars "are the same kind of thing built two ways".
- [GAP] DP Known gaps L378-380 — only three stacks measured; Drupal, static HTML, Squarespace, Granicus, CivicPlus, NextRequest "in Oakland's orbit and none has been fetched twice and diffed".
LAW
- [GAP] DP L332-334 — the minutes due-time is a measured practice, not tied to any statute or notice rule; "never for asserting a violation".
- [DESIGN] code docprofile/doctypes/index.mjs:408-412 — temporal examples include "a title changed on a date; an item was withdrawn before it was heard".
ANALYSIS
- [GAP] DP Known gaps L374-377 — a JS shell "is recognised and not yet captured properly"; "JS-rendered content IS the content and must be captured at the same grade", needs the browser-rendering path.
- [GAP] DP Known gaps L358-363 — duplicate sweep intra-bundle only; "NO cross-bundle sweep exists anywhere".
QUESTIONS
- [DESIGN] DP L315-316 — "People reason about them differently and so do their assistants, so they are emitted as different kinds and shown apart."
DOCTRINE
- [DOCTRINE] DP L315 — referential and temporal "must not be collapsed into one edge type".
- [DOCTRINE] DP L306-308 — "A read that finds no meetings is a FAILED READER, never an emptied calendar".
### OF chunk 1-110
TIME
- [BUILT] OF Incomplete L15 — ODF entries emit "tracked changes with author/date/superseded wording, annotations as comments, formulas beside cached values, hidden sheets/rows/columns, speaker notes, hidden slides" (verified vs LibreOffice 26.8.0.3); ODF `meta.xml` core properties NOT read → named undetermined.
- [RULING] OF Incomplete L16 DEC-5 (Bob 2026-08-01) — "who edited a document and when IS evidence" (edit history/time as evidence).
ORGS
- [RULING] OF L16 DEC-5 — authorship/edit history of public documents is evidence (who in a body edited what).
LAW
- [OPEN] OF Incomplete L16 — DEC-5 did not settle restricted material; D-124 keeps three classes open on a trigger: "statutory redactions in a records-request response, member-origin or confidential-source material, and a document published in error then withdrawn".
ANALYSIS
- [BUILT] OF Status L3-4, L50-61 — FORMAT axis built end to end (COFF-1..7, COFF-9/10): registry `formats.mjs` (nine `registerFormat` entries since FW-23), `ooxml.mjs`, DOCX/XLSX/PPTX, ODT/ODS/ODP, `csv`.
- [BUILT] OF Incomplete L18 — extracted: text, links with element references, DEC-5 envelope "formulas beside cached values, tracked changes, comments, speaker notes, hidden rows, columns, sheets and slides, core properties".
- [GAP] OF Incomplete L18 — NOT extracted: tables and images as content ("a workbook's grid is reachable as cells and as text and never as a table"); "charts, drawings and other embedded media, which are not read at all"; embedded files' CONTENT never opened (sha256 `intra` links only). [CONFLICT/stale: EBD Status L5 says FW-19 (2026-09-18) built `sheet-range`/`doc-table`/`image` arms from the office entries.]
- [DESIGN] OF L97, L107-110 — XLSX element reference "sheet + cell (`Sheet1!B14`)"; "This is the first time the record can cite something finer than a document without inventing an anchor scheme."
- [GAP] OF Incomplete L11 — bound `MEASURED_OOXML_TEXT_BOUND_BYTES` 20 MiB declared uncompressed text bytes, passes 86/88; the two excluded are "the 2019/2020 police Stop-Data workbooks, which read `text-undetermined` honestly"; streaming extractor to 64 MiB DEFERRED, not built.
- [BUILT] OF Status L4 — `csv` entry 2026-09-24 (FW-23) from all 166 `.csv` keys of s3://cao-94612 (M-144); delimiter and encoding found by signature and recorded; "byte detection REFUSED because prose wears a CSV's shape"; dialect persisted as `reading.dialect` (REC-218, BOB #33, 2026-09-25).
- [GAP] OF Incomplete L20-30 — CSV size bound NOT SETTLED (node walk 254.5 MiB heap vs 128 MiB isolate limit; deciding measurement = deployed plane reading >20 MiB CSV); excludes 1 of 166; UTF-16 BOM/semicolon/tab/pipe arms fixture-only; D-593: "a `text/csv` body is read at intake as lossy UTF-8 and never through `csv.mjs`'s `text()`".
- [CONFLICT] EBD §2 row 5 L61 (M-126, 2026-09-24) "read NO `.csv` or `.xls` at all" vs OF Status L4 CSV entry landed 2026-09-24 (FW-23) — EBD's sample predates or ignores FW-23; `.xls` still unread.
- [GAP] OF Incomplete L12 — legacy OLE2 (.xls/.doc) prevalence 0.32% (COFF-6); deferral stands with trigger "a group actually needing one inspected".
QUESTIONS
- [RULING] OF L16 DEC-5 — office documents are "an evidence source to be extracted, projected, indexed and searched".
DOCTRINE
- [RULING] OF L16 DEC-5 — "these are public documents, there is no reason to redact anything from a public record".
- [DOCTRINE] OF Incomplete L15 — "a zero `intra` count means NOT LOOKED, never NONE PRESENT".
### OF chunk 111-332
TIME
- [DESIGN] OF L129-131 — `docProps/core.xml`: "creator, `lastModifiedBy`, revision count and created/modified instants — provenance-adjacent facts about a document that the publisher's own software recorded."
- [DESIGN] OF L123-125 — DOCX `w:ins`/`w:del` + comments "record who changed what and what a reviewer said. This is evidence a published PDF is specifically designed to remove."
ORGS
- [DESIGN] OF L152-155 — "`lastModifiedBy` names a member of staff. A tracked change attributes an edit to a person by name. A comment may be candid about a named individual." (staff identity in metadata; holders behind documents).
- [CONFLICT] OF §risk L157-160 says surfacing personal data is "Raised as a decision rather than settled here" (D-77/invariant-7), while Incomplete L16 and §What to build L325-329 say DEC-5 ruled "surface it all" (scope PUBLIC records).
ANALYSIS
- [NEED] OF L117-122 — "A formula is different evidence from its result. ... For accountability work the DERIVATION is frequently the finding — how a total was reached, which cells feed a projection, what a "budgeted" figure is actually computed from. ... The record should hold both and say which is which."
- [DESIGN] OF L127-128 — "A hidden XLSX sheet is a first-class finding, and it is invisible in every rendered form of the document."
- [DOCTRINE] OF L133-136 — "None of this is CAPTURE deciding what things MEAN ... A formula is structure; whether a formula matters is content."
- [DESIGN/GAP] OF L138-145 BOB #32 2026-09-23 (D-124) — envelope as content: ninth extent kind `envelope` (tracked-change, comment, core-property, speaker-note), capture's grade, passage arm indexes it LABELLED "so a search hit never presents a reviewer's comment as the document's text"; today extracted but "never projected or indexed"; NOT BUILT (RECORD, rowed).
- [BUILT] OF §CSV L217-234 — csv entry (bio-plane/src/csv.mjs): ONE sheet; "Row 1 is row 1 whether or not it looks like a header, because a header is a reading and is never assumed"; cells via `sheet-cell`/`sheet-range` 1-based; capture's grade; M-144: 166/166 text/csv, comma; 146 UTF-8 BOM, 18 ASCII, 1 UTF-8 by validity, 1 ENCODING UNDETERMINED; 778,830 cells read.
- [DESIGN] OF L236-245 — CSV not byte-detectable (5 of 8 planted prose bodies fired: "a minutes roll-call, an ini file, an apache log, a Markdown table"); `detect` returns null; claimed from declared content type; no CT → `undetermined` at FORMAT axis.
- [DESIGN] OF L247-251 — undetermined encoding: grid survives; only high-byte cells undetermined, named by `sheet-cell`, null text, "never mojibake" (`data/20230609update2.csv`, byte 0x96, 138 cells).
- [RULING] OF L265-276 BOB #33 2026-09-24 — `reading.dialect = {delimiter, encoding}` a key of its own; projection on the registry for any decoding-choice format; "A latin-1 body reads its ENCODING UNDETERMINED, never "latin-1"".
- [GAP] OF L278-286 D-593 — `text/*` body ≤8 MiB read at intake by lossy UTF-8; >8 MiB "read by neither path"; only `application/csv` reached the entry's `text()`; "the sheet's cells are not the units the reader sees" (rowed).
- [GAP] OF L288, L292-301 — 50 legacy `.xls` keys wait; OLE2 not designed; interim: capture bytes, state not inspected, "let the member open it in their own application. `undetermined` is first-class."
- [DESIGN] OF L305-310 — "A published budget workbook can be tens of megabytes and hundreds of thousands of cells"; full text/formula extraction not streamable; over-bound recorded `text-undetermined` "never silently truncated".
QUESTIONS
- [DESIGN] OF L143-144 — search hits must label envelope text distinct from body text (unbuilt).
DOCTRINE
- [DOCTRINE] OF L157-160 — "Capturing it is not in question ... stripping bytes would break the hash"; "SURFACING it is a different act, with effects on people outside this project — the D-77/invariant-7 neighbourhood."
- [DOCTRINE] OF L146-148 — D-124 restricted-material deferral CLOSED as STATED LIMITATION: "a row that stays open is a claim nobody can discharge."
- [DOCTRINE] OF L194-199 — detection magic bytes first, content type second (declared Content-Type "frequently wrong").
### CSD chunk 1-60
TIME
- [BUILT] CSD D-241 amendment L38 — entity arm's `derivation {state, cut, at, documents, derived, says}` from the LATEST meaning-level row; "`never_derived` only when the log carried the level over the subject's whole lifetime, else `pre_log` or `undetermined`" (as-of statement of what was derived when).
- [BUILT] CSD Status L5 — `capture_text` units "are replaced on a chain move" (text versioned by chain; REC-91, IC-104).
ORGS
- [BUILT] CSD L38 (D-241, IC-236) — `op=connections` entity arm states whether a subject's derivation was cut: "a subject derived over 32 of its 40 documents read back `truncated: false` over 496 connections" before the fix.
- [GAP] CSD Incomplete L46 — capture arm of op=connections states no derivation (rows span many subjects); per-row statement not designed.
ANALYSIS
- [DOCTRINE] CSD UI-62 amendment L12-13 — when a tally's bound bites: denominator named, word SAMPLE beside figures, captures past bound in NO bucket, "no proportion is shown anywhere, because a percentage over a sample presented against a scope is the invisible under-report this repository refuses everywhere else and, unlike a count, cannot be checked by eye."
- [DOCTRINE] CSD REC-115 L17-18 — second count was a TAUTOLOGY (`documents_with_rows === documents` always), "an equality that cost nothing to produce"; M-44 found it in `content:`, `leg:`, `resolves:`, `concerns:` arms: "IT WAS NEVER A PASSAGE-ONLY DEFECT — IT WAS A PASSAGE-ONLY SIGHTING."
- [GAP] CSD Incomplete L51 — "a workbook is searchable at document grain only, and the answer says so"; M-20: "288 workbooks in COFF-6's census hold 72,651,441 bytes of extracted text over 1,056 sheets and not one indexable unit between them". [Status-dated; EBD says `sheet-range` arm built 2026-09-18 by FW-19 — whether it is now an indexed unit is not stated here.]
- [DESIGN] CSD L31-32 REC-111 — stated unit budget `CAPTURE_TEXT_CAPTURE_UNIT_BOUND` 4,096; acquire wire max 4,064 units; INLINE_MAX 1,048,576 B; wire 524,288 B.
QUESTIONS
- [DOCTRINE] CSD Status L3 — rests on Part II §14.3 "the four-level search, Bob's correction of 2026-08-04" and M5's fence (2026-07-31): "document text is member-scope and the index never leaves the Durable Object".
- [BUILT] CSD UI-62 L12 (2026-09-17) — member surface: passage row with `ref` verbatim, jump into viewer, "cite this" carrying the extent, "the four-level absence statement with the five-bucket tally".
- [BUILT] CSD REC-115 L16 (IC-115) — `meaning({mode:"levels"})` scope built with the row's own arm STRIPPED; false absence "*0 hits over 0 captures*" closed.
- [BUILT] CSD REC-90 L6-7 (IC-98) — `content:` arm, `rows=content`; REC-92 L34 (IC-110) `passage:` arm, `rows=passage`, `snippet()`, content-axis tally (five answers of `contentAxisFor`) and arm-aware four-level statement; "the state of every capture promoted before REC-91 existed" is the fifth bucket.
- [BUILT] CSD REC-121/127 L24-29 — `chain` and `cap` filters have three answers {a step | undetermined | does-not-apply}; "Every row now answers exactly one of" them.
- [BUILT] CSD UI-95 L41 (2026-09-25) — member subject view renders `derivation.says` VERBATIM (DEC-8); "an entity-arm answer WITHOUT the key is stated undetermined rather than read as complete".
DOCTRINE
- [DOCTRINE] CSD UI-62 L14 — "DEC-8 forbids a surface rewording the record and a surface choosing between two of the plane's own numbers would be making a judgement it cannot support."
- [DOCTRINE] CSD REC-89 L8 — "a design that cites a debt row as a precondition inherits that row's staleness".
### CSD chunk 61-190
TIME
- [DESIGN] CSD §4.1 L181 — chain move replaces units; content rows go `stale` (REC-82); "The index holds the current chain's text only; the prior text is derivable from the bytes and the chain the content row recorded ... Text is a projection, and a projection is re-derived rather than versioned; the content row is the thing an edge depends on, and it is never rewritten." (no as-of search over prior readings).
- [DESIGN] CSD §1 L118 — content-axis state question (c) includes "extracted under an engine older than its calibration" (staleness against calibration time).
- [GAP] CSD §4.1 L178-179 (D-531) — units written before D-531 stand until re-promoted; how many the live record holds is UNDETERMINED (M-154).
ANALYSIS
- [DESIGN] CSD §4.1 L183 — "Workbooks are not indexed per cell — a 63 MB sheet inflates to millions of cells and a cell is not a passage"; sheet unit is `sheet-range`; until it exists "the per-capture `indexed` state says `none: no unit arm for this container` rather than staying silent."
- [GAP] CSD Incomplete L81-88 — "a deck's SPEAKER NOTES have no indexable unit, and they are the most candid text in a deck"; DEC-5 requires notes "DISTINGUISHABLE from slide text EVERYWHERE shown, cited or indexed, never merged"; wants an extent arm (grammar decision).
- [DESIGN] CSD §1 L117 — row-grain questions over the record's own grades: "every OCR'd region below cap C", "every stale row", "every machine-minted row no member has cited" (queries/counts over the record, not over data).
- [GAP] CSD Incomplete L52-72 — 2 MiB per-capture bound cannot fire (INLINE_MAX refuses whole promotion; M-32); "Bytes do not bound the unit count" (worst docx 20,571 units at 84.8 % of CPU window); unit budget chosen (REC-111).
- [GAP] CSD Incomplete L73-80 — text stored twice (capture_text + bundle image).
QUESTIONS
- [DESIGN] CSD §1 L112-120 — Part II §17's three questions are three capabilities: (a) "which passages mention X" (text at content grain; M5's rung); (b) "every leg citing page 14" etc. (rows; D-222 stage C); (c) content-axis STATE; "building them as one is how a search that returns documents gets called finished"; "an empty answer over an unindexed set is the false absence CLAUDE.md's sparse rule exists to catch".
- [DESIGN] CSD §2 L128-139 — constraints: D-15 one visibility gate (`viewerPredicate`, `GATE_MARK`); gate is WHERE not CTE (283 ms vs 5 ms at 20,000 bundles); REC-36 "even a nameless hit discloses that something mentioning the subject sits in a project the viewer was not invited to"; envelope never bare array, `limit` = cap applied; `MAX_COMPOUND = 4`; every arm keys on `bundles.fts_id`; D-225 caps 500/5000 (REC-60, IC-25); content rows minted lazily so "a text hit is an ADDRESS, never a row"; truncated index entry must SAY so (M5); text below OCR floor discarded.
- [RULING] CSD §2 L136 DEC-24 — "**The machine does the looking; the member does the concluding** ... a hit informs; a minted row is an act (a member's cite, or the assistant's labelled mint under 5.7)".
- [DESIGN] CSD §3 L143 — before REC-91, `bundles_fts` indexed only notes/frontmatter (TEXT_CAP 128 KB): "`text:` in the query language means *the group's notes*, not *what the documents say*".
- [DESIGN] CSD §3 L151-153 — option (iii) chosen: `capture_text` one unit per IC-1 element reference with FTS5 external-content; "The whole point of (a) is to find what nobody has cited yet — the content level of the four-level search, the one that grows the record when an objective goes looking."
- [BUILT] CSD §4.1 L159-176 — `capture_text` schema (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind); units per `pdf-page`, `doc-para`, slide (`slide-shape` shape omitted, DECIDED 2026-09-15); slide unit cannot be a reading POSITION, so deck-grain connections wait on per-shape text (FW-17).
- [BUILT] CSD §4.1 L178 D-531 — unit judged by `glyphCount(text) > 0`, never `text.length`; blank capture now reads `none` not `indexed_full`.
- [GAP] CSD §4.1 L185 — HTML has no `dom` producer, so not an indexed unit; page text reaches `bundles_fts` as before.
DOCTRINE
- [DOCTRINE] CSD §2 L130 — REC-36: candidate list withholds the whole row across the fence.
- [DOCTRINE] CSD §2 L138 — "a search that silently under-reports is the record claiming coverage it lacks".
### CSD chunk 191-300
QUESTIONS
- [BUILT] CSD §4.2 L191-197 — `content:` arm filters `kind`, `stale`, `minted` (member · plane · machine), `cap` ("undetermined stated as its own value, never folded into a letter"), `chain`, `cited`; `rows=content` ("*every OCR'd region below C* is `content:chain=ocr content:cap<C` + `rows=content`"); `passage:` arm (quoted phrases, prefix, `NEAR`, FTS5); `rows=passage` with `snippet()`; `rows=leg` gains `content_id`, `extent_kind`, `ref` — "*every leg citing page 14 of this document*" under "the whole-basis rule (a basis returned in part reads as a basis)".
- [DESIGN] CSD §4.2 L196 — passage rowGrain: "an ADDRESS, not a content row until a member cites it or the assistant proposes it".
- [DESIGN] CSD §4.2 L199 — "`text:` keeps its meaning (the group's own notes and frontmatter); `passage:` is what the documents say. The surface labels the two".
- [DESIGN] CSD §4.2 L201 — compound budget: four arms; "a member's query that needs five arms is refused with the reason".
- [BUILT] CSD §4.3 L214-234, L274-280 — operative bound `ACQUIRE_TEXT_UNITS_BUDGET` 524,288 B at the wire; over it capture reads `partial` and counts what it drops; unit bound 4,096 (REC-111); "the observation's sentence says WHICH bound bit: *too big* and *too many pieces* want different answers from a member".
ANALYSIS
- [DOCTRINE] CSD §4.3 L249-254 (D-391 part 2, BOB #32 2026-09-23) — a derived figure stated as a range when the inputs disagree: "The honest reading is UNDETERMINED between ~20% and ~85%".
- [DOCTRINE] CSD §4.3 L225-226 — "the question that SITES a bound is *what refuses BEFORE me*"; L272-273 "a control arm that can reach a branch the product's own route cannot is a finding about the ROUTE, not a passing control."
- [DOCTRINE] CSD §4.3 L290-293 — "a capture promoted with a half-written index and nothing saying so is the record claiming coverage it does not have."
### CSD chunk 301-458
QUESTIONS
- [BUILT] CSD §4.3 L332-337 — per-capture `indexed` state `full · partial · none (reason)` written as a content-axis OBSERVATION; "`partial` is the NORMAL outcome for a large document rather than an edge case, so the envelope in §4.4 is what keeps a partial index honest."
- [BUILT] CSD §4.4 L343-363 — every `passage:` envelope: `level: "content"`, `scope` {documents, documents_with_rows, documents_without_rows, captures_counted, captures_truncated, captures_bound, indexed_full, indexed_partial, indexed_none, not_extracted, undetermined}; tally capped at `MEANING_AXIS_CAP` (500): "a number that looks like a census and is a sample is worse than a smaller number that says what it is."
- [DESIGN] CSD §4.4 L369 — worked example: "*0 hits over 412 indexed captures; 38 in scope are unindexed (31 workbooks: no unit arm; 7 over the bound); 3 not yet extracted*" — "saying WHICH absence is true is a first-class obligation ... a content-level miss reads exactly like a document-level miss, and Part II §14.3 says those are different facts with different next moves."
- [EXAMPLE] CSD §4.4 L371 — the defect told a member "NO DOCUMENT WAS IN SCOPE and sent off to capture more material when what the record needed was for somebody to READ the capture nobody had read"; lesson: "a phrase can be load-bearing in a section and enforced in only one of the statements that section governs".
- [GAP] CSD §4.4 L399-406 — content axis crosses as AGGREGATE ONLY: REC-107's `not_ruled_out` / `evidence_one_sided` (never looked / log did not cover lifetime / purged) "do not cross this wire at all"; surface names the reads that carry it "and does not guess between them".
- [DESIGN] CSD §4.5 L410 — "Nothing is minted by searching": minting is a member's cite (UI-61) or "the assistant's proposal under Bob's 5.7, `minted_by` a machine credential, labelled everywhere it is shown, never attested by it, part of a finding only when a member cites it (SK-7). A search that minted rows would put derived things where authored ones go; DEC-24 forbids it".
- [DESIGN] CSD §6 L423 — not decided: ranking/presentation (Program B), workbook unit, HTML units, stemming beyond `unicode61`, cross-instance search; "whether the assistant's FIND uses `passage:` — it does, as one of the four levels, and the assistant's document (construct 11) says how it names the level it searched."
- [BUILT] CSD §7 item 6 L442-445 (UI-62) — finder third route; "a bare word asks BOTH grains at once and the three answers are reported apart"; absence statement "on a HIT as well as on a miss"; "Cite this" carries the passage, "prefills nothing (DEC-69), and sends it on the QUESTION arm only — a case's edge has no slot for a part of a document and `op=cite` refuses one by name"; `member-respect.test.mjs` caught DEC-68/DEC-69 defects.
- [GAP] CSD §7 item 2 L433 — pre-existing defect found: "`leg:grade>=B` had compiled to `grade = 'GRADE>=B'` since PL-8, silently, on every arm" (fixed at REC-90); `content:cited` 31.6 s unindexed vs 9 ms indexed (M-21).
- [DESIGN] CSD §8 L453-455 — negative controls: hidden passage hit withheld whole, "`total` does not move (hidden and absent answer identically)"; unindexed vs fully indexed empty answers distinguishable by envelope alone; "searching mints nothing".
ANALYSIS
- [DOCTRINE] CSD §4.4 L380-397 UI-62 four rules for any bounded figure ("the next surface to show a bounded figure inherits it"): (1) denominator named in the HEADING; (2) "NO PROPORTIONS, EVER — no percentages, no bars, no "most of". A percentage computed over a sample and shown against a scope is the invisible under-report"; (3) SAMPLE beside figures, past-bound captures in NO bucket; (4) bucket sentences are the plane's vocabulary, "NEVER A COPY".
- [DESIGN] CSD §5 L418 — storage curve: 176,657 B per bundle marginal; 10 GB per-object claim ≈ 60,800 bundles; shard point to be measured (M6).
DOCTRINE
- [DOCTRINE] CSD §8 L453 — hidden and absent answer identically (REC-36).
- [DOCTRINE] CSD §7 item 6 L443 — DEC-69: composer "prefills nothing".
### SCH chunk 1-205
TIME
- [BUILT] SCH Decision L31-36 — "The plane's periodic work runs on ONE reconciling Durable Object alarm, not on a Worker cron trigger"; registry of consumers `{name, due(now), wake(now), tick(now)}`; alarm reconciled to EARLIEST wake, DELETED when none.
- [DESIGN] SCH L51-56 — granularity from a 1-second task drain (`TASK_DRAIN_DELAY_MS`) to "a daily ageing clock"; cron floor one minute rejected.
- [DESIGN] SCH L40-42, L115-119 — consumers on the same course: monitoring, "the archive-fallback eligibility clock, per-document cadence and M4 ageing"; new clock = append entry, arm from producer or self-perpetuating `wake`; "Do NOT add a second alarm or a cron".
- [BUILT] SCH Status L4 (N225, K528, 2026-09-30) — registry now `bio-plane/src/scheduler/index.mjs` (`SCHEDULER_ORDER`, R5), FIFTEEN consumers (`intent-age`, `notice-sweep` after `bias-debt`). [CONFLICT — verified at code: scheduler/index.mjs:44-49 lists NINETEEN: selection-sweep, task-drain, archive-monitor, connection-derive, overdue-scan, queue-renotify, monitor-cadence, gathering-sweep, ai-run-reap, capture-request-drain, ai-run-wake, calibration-reprobe, group-domain-recheck, bias-debt, intent-age, notice-sweep, deadline-recheck, working-on-seal, working-on-attest; ALWAYS_DUE = the five named in L91-92.]
- [BUILT — verified at code, beyond src] monitoring/index.mjs:2740-2790 — `deadline-recheck` marks each `pending` action-clock entry `overdue` ("an entry dated D is past from D + 1"), computed on the UTC day (`new Date(nowMs).toISOString().slice(0, 10)`; wake = "the start of the UTC day after the earliest date"), then asks `escalation` which stages' triggers are met, "it advances none". (UTC day, not the profile's `time_zone`.)
- [DESIGN] SCH Place L7 — TAD v10 §10.7 interruption model is the rule: "recover by re-deriving outstanding conditions from durable state, never by trusting a signal".
- [DESIGN] SCH §eleventh L131-134 — "a fidelity letter is a MEASUREMENT of a named engine AT A DATE; engines move. With no clock, the record's grades rest on a measurement that silently ages and nothing is looking." (grade ageing over time).
- [DESIGN] SCH L137-143 — `CALIBRATION_CADENCE_MS` THIRTY DAYS, declared in one place (calibration.mjs), "CHOSEN rather than measured", "revisable by measurement".
- [DESIGN] SCH L162-167 — tick runs no probe; marks a subject OWED "and says so in words"; treating elapsed cadence as grounds to refresh "would be the claim-versus-measurement failure".
- [BUILT] SCH §twelfth L171-184 (D-86, 2026-09-23) — `bias-debt` = overdue-scan's other half ("bias debt and ageing are one mechanism", Content Framework §13); raises ONE OBLIGATION per AI run whose lens `moved`; "Disclosed, never blocking (DEC-20)".
ORGS
- none in SCH; [terminology] "OBLIGATION" in SCH L175 is a NOTIFICATIONS-catalogue queue item for members (bias-debt), not a public body's legal obligation.
ANALYSIS
- [DESIGN] SCH L145-160 — cost statements: one probe per registered engine per cadence (twelve a year); zero on an instance with nothing registered (no alarm held).
QUESTIONS
- [BUILT] SCH L175-177 — bias-debt reads `aiRunRead`'s lens block per AI run; items served on `op=queue` (AI-run provenance over time).
DOCTRINE
- [DOCTRINE] SCH L150-154 — runs "ON THE INSTANCE'S OWN ACCOUNT, against the free allocation. Never a vendor key and never a second account ... a capability that required somebody else's credential is not one this project can ship (D-115's class, DEC-35's own argument)."
- [DOCTRINE] SCH L58-64 — sovereign instance per group, most on Free tier; idle instance must hold no timer (D-118).
- [DOCTRINE] SCH L127-129, L137-140 — pin counts in a test, not prose; "a number carried by hand into a second file is this repository's most-repeated finding".
