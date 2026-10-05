# M4 working extracts (per file, as read)

## retrieval.txt (170 lines; read 1–170 complete)
What: layer 5 requirements, APPROVED K102. Runs query-language over the record, says what it could not see; projection + FTS index (bundles_fts); search at bundle grain and meaning grain with four-level absence statement; selections (server-side sets, handle, drift); contentAxis; frontier (per level what was looked for, what came of it, never-looked). ~3,000 lines moved (1,370 non-comment). Gated bundle roster ops list/index/image/file (R63–R66, not yet met T19 per status line).

TIME
- [DESIGN] R2 L21 — projection carries `source_retrieved`, monitoring cols, re-evaluation cols, six action cols with `action_clock_overdue` judged at `nowMs` — "only for a bundle whose type normalises to `action`, the six action columns, `action_clock_overdue` judged at `nowMs`."
- [DESIGN] R53 L22 — action cols (kind, risk_tier, counterparty_state, resolution, clock_next, clock_overdue) supplied by layer-9 `actions.actionFacts` via registration; retrieval holds no clock rule — "This module holds no copy of the clock rule (`actionClockNext`, `actionOverdue`); with nothing registered the six columns are null (K75 (2), K92 (5))."
- [DESIGN] R18/R19/R51 L58–63 — selection lease 300 s from last use; sweepWake = now+300s+30s for scheduler.
- [DESIGN] R36/R40 L81 — frontier entries carry `last_verified`, `unreachable_since`, `at` (observation-log R10).
- [DESIGN] R26 L73 — as-of reading of index: capture promoted before D-672 read "as it was indexed then, until it is re-promoted".
- [DESIGN] R64 L111 — index answer carries `generated` instant; R63 rows carry `last_updated`.
- GAP (inferred) — no date-range search, effective-date or as-of query in retrieval's own terms; fields come from query-language (check there).

ORGANISATIONS
- [DESIGN] R45 L96 — meaning-level frontier subject kinds capture/reference/entity: "`reference` (did anything try to match this name) and `entity` (did anything derive connections over this subject)".
- [DOCTRINE/RULING] R38 L83 — K102: "an entity is not gated (K102)".
- [DESIGN] R46 L97 — entity with no row entered at creation; evidence for entity = `connections` table (not declared use, K75 dropped it, L130).
- [DESIGN] R2 L21 — `source_authority` projection column; R53 `counterparty_state` action column (actions layer 9).
- none on bodies/positions/obligations.

LAW
- none in retrieval.txt (no statute/standard field; `schema_id` only).

COURTS
- none in retrieval.txt.

ANALYSIS
- [DESIGN] R6 L37 — modes page/ids/count; `total`; ids capped at `IDS_MAX` with `truncated`.
- [DESIGN] R7 L38 — facet counts per field `{value, n}`, scan vs groupby identical.
- [DESIGN] R9 L40 — empty conjunction widened to OR reading, offered only if it finds something.
- [DESIGN] R14 L47 — content-axis tally per state, ≤500 captures counted, truncation stated.
- [DESIGN] R39 L84 — frontier tally counts per state over whole level, names no subject.
- [DESIGN] R60 L105 — counts(hid) {indexed, selections, selectionItems} for queue.
- [DESIGN] R18–R20, R59 L58–65 — selections: query selection stores criterion + digest; enumeration stores items with sha; drift reported (hidden, purged, revised class); `SET_MOVED` refusal; answerChanged — reproducibility of a set an action refers to. "A query selection is re-run and its digest compared: `added`, `removed`, `digestChanged` and the sentence that which rows moved is not recoverable."
- [DESIGN] R25 L72 — workbook text found by `passage:` at sheet grain, one unit per sheet, `sheet-range` extent (D-672).
- [GAP/RULING] Suggestions L163 — "A workbook's named tables and ranges are not their own search hits for now ... revisit when a member asks (K102)."
- [DESIGN] R12 L45 — leg grade resolved against earned capture-axis grade (`grade_authored`, `grade_why`).
- GAP (inferred) — no sum/average/group-by-over-values; counts and facets only.

QUESTIONS
- [DESIGN] R13 L46 — four-level statement: internet undetermined in this read, document counted, content/meaning counted at arm's level else undetermined; `says` "one sentence distinguishing no document in scope, no row of this kind in any document, and rows the filters excluded."
- [DESIGN] R14 L47 — `says` leads with coverage; never_looked vs undetermined split; "`says` states that nobody has read a number of them only from the `never_looked` count (K102)."
- [DESIGN] R15 L48 — text found only inside a captured doc found by `passage:` not `text:`; searching mints no content row.
- [DESIGN] R54 L49 — NEAR within one unit only (K105).
- [DESIGN] R16 L52 — searchFields publishes vocabulary + syntax sentences; "`content:` searches what has been cited or marked citable and never a document's text."
- [DESIGN] R35–R49 L80–102 — frontier per level: "what have we looked for at this level, and what came of it" (K78 (5)); internet level reads leads' looks gated to viewer (R47), `empty` causes `never_followed`/`no_leads_visible`.
- [DESIGN] Purpose L13 — "It mints nothing: a hit is an address." (DEC-24, L157)
- GAP (inferred) — input is query-language statements; no natural-language entry in this module.

DOCTRINE
- [DOCTRINE] R28 L138 — no search statement runs without the gate's mark; every statement from query-language.
- [DOCTRINE] R29 L139 — "Hidden answers as absent everywhere: no total, tally, cursor or byte count includes what the viewer may not see"; exception frontier tally (REC-110 ruling).
- [DOCTRINE] R32 L142 — "Nothing here mints, cites or promotes".
- [DOCTRINE] R34 L144 — "No place is named in this module's behaviour or outward text."
- [DOCTRINE] R2 L21 — unparseable frontmatter gives null, "never a guess".
- [DOCTRINE] R30 L140 — projection and index derived, never a record; rebuildable.
- [RULING] K102 (Open for Bob L170) — all questions answered.
- [DOCTRINE] R13 — undetermined as first-class level answer.

CROSS
- Layer-9 action clock facts reach layer-5 search only by registration (R53) — the pattern by which lower layers expose higher-layer TIME/LAW-derived facts without a use; K75 (2), K92 (5).
- Registrations: R55 (inquiry leg grades), R56 (decorations from actions/inquiry/ai-runs), R57 (ai-runs hidden run tail), R62 (registerField: inquiry legs, strength capture/connection).

## query-language.txt (82 lines; read 1–82 complete)
What: layer 5, APPROVED K102; the one grammar a member types to search the record and the compiler (`bio-plane/src/query.mjs`, 2,665 lines, 922 non-comment) to SQL statements retrieval runs; pure (no db, clock, network); gate is membership's viewerPredicate. Not yet met: none (T10, K332).

TIME
- [DESIGN] R1 L19 — range syntax "`field:>v`, `>=`, `<`, `<=`, and `field:a..b` on a time or number field".
- [DESIGN] R3 L21 — time-bearing fields in FIELDS: `created updated retrieved checked since due overdue` (+ `frequency`, `monitored`, `reeval`) — "`id type group title state prior created updated criticality sha schema mode tier locator authority retrieved status hash monitored frequency checked annotations reeval since reevalsource capture connection legs actionkind risk addressee resolution due overdue`".
- [DESIGN] R10 L28 — default order `updated` descending.
- [DESIGN] R17 L35 — cached columns marked `asOf`; `cachedNotes` publishes `as_of`, deriving authority and a sentence — as-of honesty for derived values.
- [DOCTRINE] R20 L57 — "Pure: no store, no clock, no network" (no now in the compiler; `overdue` is a stored column judged elsewhere).
- GAP (inferred) — dates are only bundle metadata (created/updated/retrieved/checked/due); no dates-in-text, effective/in-force date, fiscal period or business-day notion in the grammar.

ORGANISATIONS
- [DESIGN] R3 L21 — `authority` (free text, from `source`), `group`, `addressee` (action field) are the only org-bearing fields.
- [DESIGN] R5 L23 / Uses L53 — meaning arm `resolves` reads `resolutions` (entities); `concerns` arm; reference→entity resolution searchable by grade (`resolves:>=B`).
- GAP (inferred) — no field or arm for an organisation's type, role, position-holder, reporting line or obligation.

LAW
- none in query-language.txt (no field for standard, citation of law, provision; `schema` only).

COURTS
- none in query-language.txt.

ANALYSIS
- [DESIGN] R14 L32 — bundle-grain shapes `page`, `count`, `ids`, `snapshot` (id and sha), `facets`, `facetScan`.
- [DESIGN] R16 L34 — `meaning({mode:"levels"})` counts documents in scope and those holding a row; `axis` lists per-capture observations ≤500+1; "a miss never empties its own denominator".
- [DESIGN] R12 L30 — bounds: limit 1–500 (default 50), IDS_MAX 50,000, meaning rows 1–1,000.
- [DESIGN] R4 L22 — `capture:` and `connection:` two fields "never one composed strength (DEC-21)".
- [DESIGN] R6 L24 — `content:` sub-fields `cap` (letter grade; `undetermined` null cap; `does-not-apply`), `chain`, `minted`, `cited`/`uncited`.
- GAP (inferred) — counting and faceting only; no arithmetic over values (sum, mean, budget figure) in the grammar.

QUESTIONS
- [DESIGN] Purpose L12 — "the one grammar a member types to search the record"; structured syntax, not natural language.
- [DESIGN] R1 L19 — AND default, OR/AND/NOT capitals, phrases, prefix, field:value, has:, fm:path, text:, sort:.
- [DESIGN] R2 L20 — unknown field read as free text with warning; R5 L23 dropped arms "widen the answer; no spelling compiles to a predicate that matches nothing".
- [DESIGN] R13 L31 — widenable conjunction; OR reading as wider reading.
- [DESIGN] R11 L29 — relevance over viewer-visible rows; "only the order is published, never a score" (D-447, K102).
- [DESIGN] R24 L37 — NEAR proximity (K105).
- [DESIGN] R18 L36 — meaningVocabulary published per arm; ambiguousBareWords.
- [DESIGN] R15 L33 — `rows=<arm>` returns the whole set of each bundle (a basis returned whole; INVESTIGATIVE-SESSION §14c L66).
- [DOCTRINE] Satisfies L70 — "DEC-24 (the machine looks, the member concludes)".

DOCTRINE
- [DOCTRINE] R7 L25 — no member input enters SQL text.
- [DOCTRINE] R8/R21 L26, L58 — one compilation point for visibility (D-15); absent viewer → deny predicate.
- [DOCTRINE] R22 L59 — "A vocabulary is read from its owner, never restated".
- [DOCTRINE] R23 L60 — "No place is named in this module's behaviour or outward text."
- [RULING] DEC-21 two axes never composed; DEC-24; K102; K105.

CROSS
- [DESIGN/OPEN-ish] Suggestions L76 — later layers' vocabulary (leg:, content:cited, capture, connection, legs, actionkind…overdue) read projection columns written by strength, inquiry (6) and actions (9); a registry "would keep the grammar unchanged and the order intact. BOB decides (P17)". R26 (registerField) is the realised part. — the established pattern for exposing higher-layer constructs (e.g., deadlines `due`/`overdue`) to the lower search grammar.

## observation-log.txt (115 lines; read 1–115 complete)
What: layer 5, APPROVED K102; records looking: each time the record looked for something, at which of four levels (internet, documents, content, meaning), under what authority, and what it found (incl. nothing / could not tell). Append-only, separate from the record. Holds the one append site `observe`, vocabulary, writers on other modules' events, missing-row rules, row-whole visibility fence, and the member's lead ("somewhere to look and never evidence"). ~3,120 lines move. Not yet met: R20 (D-681), R21 (D-682); R30, R31 (T19 L5); R16, R17 (T22, DEC-88); R33 (T23 L5).

TIME
- [DESIGN] R4 L30 — each row has store-wide only-increasing `seq` and `at` "(the writer's instant, else now, to the second)".
- [DESIGN] R29 L63 — `at` is "whole-second UTC".
- [DESIGN] R9 L40 — `firstRowAt(level)`: earliest `at` at a level.
- [DESIGN] R10 L41 — `verification`: "`last_verified`, the latest `PRESENT` row's `at`, and `unreachable_since`, the earliest `LOOKED_INDETERMINATE` after it".
- [DESIGN] R11 L42 — missing-row cause by time: `pre_log`, `purged` (entered before first row), `watermark_band` "when it entered within the one clock second before the first row's", `never_looked` only when it entered after — as-of reasoning about the log's own start.
- [DESIGN] R14 L51 — lead id `LEAD-YYYY-MMDD-<12 hex>`, recorded with instant.
- [DESIGN] R33 L21–23 — condition kinds incl. `notice-lapse-near` (network-notices) and `sweep-silent`.
- [DESIGN] Suggestions L110 — growth edge rule: "a steady-state unchanged revisit writes no row".

ORGANISATIONS
- [DESIGN] R1 L20 — subject kinds `entity`, `reference`; authority kinds incl. `objective`.
- [DESIGN] R8 L37 — meaning-level rows per reader run, per resolution attempt (`entities.onResolveAttempt`), per connection derivation over an entity (count, documents, truncated).
- [DESIGN] R11 L42 — evidence for reference and entity is one-sided (`DOCUMENT_EVIDENCE_IS_ONE_SIDED`, K331).
- none on bodies/positions/obligations beyond entity-as-subject.

LAW
- none in observation-log.txt.

COURTS
- none in observation-log.txt.

ANALYSIS
- [DESIGN] R32 L70 — figure source `counts(hid)`: `observations`, `leads` (purge proof only).
- [DESIGN] R6 L34 — extraction outcome per tier; `{written, states, refused, reextraction, unclassified}`; a document with `text_chars` 0 and no unread pages is `LOOKED_ABSENT` (K328).
- [DESIGN] R7 L36 — index `derive` row: PRESENT/partial (with bound)/LOOKED_ABSENT/LOOKED_INDETERMINATE when "the container has no unit arm".
- none on calculation.

QUESTIONS
- [DESIGN] Purpose L13 — "so an absence is recorded rather than retried away, and a later reader can say which absence is true."
- [DESIGN] R1 L20 — four levels and states `LOOKED_ABSENT`, `LOOKED_INDETERMINATE`, `partial`, `PRESENT`, `NEVER_LOOKED`; published "with a sentence per member".
- [DESIGN] R3 L29 — NEVER_LOOKED never stored as a look, except a run's terminal rollup (ai-runs R14; K148).
- [DESIGN] R11/R12 L42–44 — `causesNotRuledOut`; content axis `undetermined` naming the cause.
- [DESIGN] R14–R21 L51–60 — the lead: something a member was told; leadShare with reason (DEC-88, K1025); leadLook with detail "the looker's words on where they looked and what they found"; leadRead; leadList (R20 not yet met D-681); R21 member-facing words for every state (not yet met D-682).
- [DOCTRINE] R24 L90 / Satisfies L103 — "a member's own searching, viewing or reading writes nothing (§4.6)"; "a member who wants a search on the record writes a lead and records the look" (K102).
- [DOCTRINE] R25 L91 — "A lead is never evidence: nothing here mints a bundle or a content row".
- [DOCTRINE] Satisfies L104 — BIO_Design_Requirements_v2: "absence is stated at the level it was found; undetermined is first-class."
- [DESIGN] R13 L47 — row visibility for `run` authority via ai-runs resolver: "whether the viewer may read the run" — assistant/AI run looks enter this log.
- [DESIGN] Suggestions L109 — run's log (`#aiRunAppend`, `op=airunlog`), capture-request drain looks, monitor's and ratification's looks call `observe`; "The case's `searched` section is `publication`'s, computed from R9."

DOCTRINE
- [DOCTRINE] R22 L88 — append-only.
- [DOCTRINE] R23 L89 — nothing in log written into a bundle (C-22.6).
- [DOCTRINE] R5 intro L32 — writers derive actor class "never naming a member who did not look".
- [DOCTRINE] R13 L47 — "A row is withheld whole, never with a column blanked."
- [DOCTRINE] R27 L93 — "One judgement, one place".
- [DOCTRINE] R28 L94 — no place named.
- [RULING] K102 L102 — after purge a row naming the purged capture stays withheld from every member; "a purge being the group choosing to forget".
- [RULING] DEC-88/K1025 — reasons for lead shares and detail for looks.

CROSS
- QUESTIONS×TIME: verification instants (last_verified, unreachable_since) and the log's first-row watermark give the "as of when did we look" basis that monitoring and the frontier read.
- QUESTIONS×DOCTRINE: four-level absence doctrine lives here (states + causes) and is read by retrieval; the case's `searched` section (publication) is computed from it.

## intent.txt (127 lines; read 1–127 complete)
What: layer 7, APPROVED K102; new module (Content Framework §12): aspirations (standing, set priority), goals (bounded pursuits), objectives (project aim with satisfaction condition); progress computed from record never reported; gaps are the work list; discovery loop (proposals adopted/questioned/deferred/dismissed only by a member). Met: all live ids by INTENT #2 in T8 (K239); R27, R28 folded N178 (K228); bounds N323 met (K433); R2/R18 reason (DEC-88) not yet met T22.

TIME
- [DESIGN] R2 L24 — setCondition writes a new revision of project doc "carrying the condition (or its removal), its reason, author and time; the earlier revision stays in history".
- [DESIGN] R3/R4 L28–30 — `progress` answers `computed_at`; "derived on read and never stored".
- [DESIGN] R8 L46 — `linkObjective` "records the decomposition as the author's dated claim".
- [DESIGN] R11 L51 — `recordDeadEnd` "appends a dated, authored entry that is never removed".
- [DESIGN] R12 L54 — aspirations "in force" (held, less departures) — an in-force notion without dates.
- [DESIGN] R17 L63 — ageing: machine-surfaced question no member acted on within the ageing interval moves to `deferred` with reason "surfaced by an assistant; no member acted within N days".
- [DESIGN] R27 L66 — `ageDue(now)`, `ageWake(now)`: ageing instant = last entry's time + ageing interval; for scheduler; ≤1,000 questions read.
- [RULING] Decided by BOB L126 / Suggestions L114 — "The ageing interval is an instance setting, default 30 days" (the staleness age C-10.1 uses).
- [DESIGN] goal `bounds` L17, R8 L46 — a goal is a "bounded pursuit"; bounds are a free statement required non-empty (`PURSUIT_UNSTATED`, K238); no date/deadline shape.
- GAP (inferred) — goals/objectives carry no target date or deadline field; "bounds" is text.

ORGANISATIONS
- [DESIGN] Terms L17 — aspiration `{..., entities, progressions, ...}`; condition `{progression, entity, relation, filter, required:{grade, stages}, satisfied:{share}}`.
- [DESIGN] R4 L29 — matched instances = progression instances "whose entity is the condition's entity or stands in its `relation` to it (`entities`)"; filter key evaluated only `entity_kind` (entities R5); other keys → undetermined (K198).
- [DESIGN] R7 L37 — watchSet: condition's entity "and related entities, its progression, and the captures placed in matched instances, so `monitoring` watches exactly those".
- [DESIGN] R13 L55 — `contacts`: pairs of held aspirations naming a common entity or progression; "It never says two aspirations contradict."
- [DESIGN] Uses L79 — `entities`: `readEntity`, "the constitutive relations (R4, R7, R28)" — intent traverses entity relations for a condition (cf. Declared Bias safeguard 4 — check).
- [DESIGN] R9 L49 — scopes group/project/member; group aspiration only by active administrator (`membership.notAnAdmin`).
- GAP (inferred) — an objective's subject is an entity+progression; no obligation (who owes what by when) construct.

LAW
- none in intent.txt directly; (progressions' stages and grades may encode a legal process — not stated here).

COURTS
- none in intent.txt.

ANALYSIS
- [DESIGN] R4 L30 — `satisfied` true when `meeting / matched` reaches `share`, false when unreachable even if all undetermined met, else null — a computed proportion with three-valued result.
- [DESIGN] Bounds L38 — "past 1,000 matched instances `satisfied` is null with its reason".
- [DOCTRINE] R19 L90 — "Progress is derived, never reported: no service accepts a progress figure, count, share or completion, and nothing stores one".
- [DESIGN] R14 L56 — pursuitOf "carries no completion figure"; R8 goal "carries no progress figure".

QUESTIONS
- [DESIGN] R6 L34 — gaps as proposals (Interaction Constructs PROPOSAL), queue kind `objective-gap`, ordered via R28.
- [DESIGN] R15/R16 L59–60 — discovery loop; machine may `question` only; others refused `MACHINE_CANNOT_TRIAGE`.
- [DESIGN] R18 L69 — `workObjective`: member's act only (`MACHINE_CANNOT_CHOOSE_THE_QUESTION`, DEC-24 rule 2) with reason; opens an ai-runs run with the objective and gaps as instructions; looks under authority `objective`.
- [DESIGN] R17 L63 — assistant-surfaced questions age out to deferred.
- [DESIGN] R28 L42 — servesOf "is read as the plane, orders work only and is never shown: no read of evidence uses it (R21)".
- [DESIGN] R3 L28 — no condition → "progress cannot be computed ... it never reads as zero".

DOCTRINE
- [DOCTRINE] R20 L91 — "An assistant proposes at any point and adopts at none".
- [DOCTRINE] R21 L92 — "Aspirations and goals set priority and never filter evidence ... a proposal that cuts against a goal is offered on the same terms as one that supports it (Framework invariant 7, §12.2)".
- [DOCTRINE] R4 L30 — undetermined instances "never as meeting or short"; unevaluable filter "undetermined, never excluded".
- [DOCTRINE] R12 L54 — "No precedence is stated or implied, and nothing is resolved between them."
- [DOCTRINE] R23 L94 — hidden answers as absent; R25 L96 no place named.
- [RULING] K102, K198, K200, K239, K238, DEC-24 rule 2, DEC-88/K1025, DEC-36, K391, N327/K463.

CROSS
- TIME×QUESTIONS: ageing interval (30 days default) bounds how long an assistant's surfaced question waits; scheduler wakes at ageWake.
- ORGANISATIONS×ANALYSIS: progress share computed over entity relation traversal + progression grades — the only "obligation-like" satisfaction measure in these modules; but no deadline.

## reevaluation.txt (180 lines by wc; Read showed 181 numbered; read 1–181 complete)
What: layer 7, APPROVED K102. "When something a finding rests on changes, this module says which findings are affected and how, and changes nothing itself" (Content Framework §18.1; State Rules §5.4). Derives the re-evaluation obligation on read from causes (supersession, edition, deferred, reopened, dismissed, corrected, source, attribution, withdrawal, contested, acceptance, cited_case_moved); version notices (newer capture affects a passage) and the member's adopt/keep choice; changedFromAudit; onBasisChanged listeners for later modules. Many arms not yet met (R8, R9, R14, R15, R16 parts, R17, R25, R28, R29, R30 (T27), R31/R32 (T28/T29), R33 (T31 L7)).

TIME
- [DESIGN] Terms L19 — every cause carries `since` (instant); cause list "`supersession`, `edition`, `deferred`, `reopened`, `dismissed`, `corrected` ..., `source` ..., `attribution` ..., `withdrawal` and `contested` ..., `cited_case_moved`".
- [DESIGN] R2 L23 — `supersession` since the latest superseder's `last_updated`; `edition` per leg when target's latest edition exceeds the edition the leg names ("`cited_edition`, `latest_edition` and `latest_ratified_edition`") — version-in-force reasoning for findings.
- [DESIGN] R12 L41 — changedFromAudit checks "changed from" sentences against `provenance.versionChain` (predecessor right/wrong/undetermined, `no_prior_version`).
- [DESIGN] R14 L45 — newer capture of a pinned reference graded affected/undetermined raises a notice per (holder, reference, newer capture) — document versions over time.
- [DESIGN] R15 L46 — adoptVersion writes a new version; keepVersion records "stays on the earlier version" with who, when — as-of choice kept.
- [DESIGN] R16 L57 — recordReevaluation closes a cause "until the target moves again (a later `since`)"; `wp_retraction` since latest edition's ratification; withdrawal since signing instant.
- [DESIGN] R17 L59 — `weakened` when derived pair now weaker than "that edition's frozen pair" — as-of comparison against a published edition.
- [DESIGN] R25 L54 — notice sweep pending/due/wake; sweep delay 1,000 ms or `REEVAL_NOTICE_DELAY_MS`.
- [DESIGN] R28 L75 — source rung moved "after the dependent's last write (`bundles.last_updated`)", detail includes "the move's instant".
- [DESIGN] R29 L78 — level moved: compared with "the one in force at the case's previous ratified edition"; after dependent's last write.
- [DESIGN] R33 L102–110 — cited edition moved: edition move m>n, withdrawal naming n or `all` at seq s unless later edition move; detail includes `date`, `seq`.
- [DESIGN] R22 L142 — C-10.1: `reeval_pending` `true` needs "an ISO-8601 UTC `since` (error) and, older than the policy age (30 days unless set), is reported (info)".
- [DESIGN] Uses L123 — `record-core.stampInstant` "spells every whole-second stamp this module writes, none spelled by hand (N239, D-543)".
- [DOCTRINE] R21 L141 — "Silence is earned: no answer reads "nothing newer" or "unaffected" unless the record read it; what could not be read is undetermined, by name (§18.1)."

ORGANISATIONS
- [DESIGN] R28 L75 — `source` cause: a capture's source (`sources`' `source_knocks`) "moved rung" — firmer identity of a source reaches dependents as notice "never a silent regrade" (DEC-78 item 5(e)).
- [DESIGN] R29/R32 L78, L116 — `attribution` cause: testimony credit level changed (ratification R36); for off-the-record capture's attesting member "It names no member" (DEC-102, DEC-119 (3)).
- [DESIGN] R31 L91–97 — another group's accepted work withdrawn (`accepted-work`, `case-import`); detail names "the source group, case and edition".
- [DESIGN] R33 L101–113 — another group's (publisher's) cited edition moved on its docket.
- [DESIGN] R26 L48 — tells owners of a case's project (membership) once per affected cited part.
- [DESIGN] R16 L57 — §5.4 cascade events include "an Information `source_status` change" (monitoring raises it, Suggestions L165).
- none on government bodies/positions/obligations.

LAW
- [DESIGN] Suggestions L165 — "`conformance` and `consequences` fill R8 and read R9" — layer-9 law/calculation modules hear basis changes through registration (listeners) and recovery read.
- none otherwise (no statute/version-in-force of law; versions here are document captures and case editions).

COURTS
- [DESIGN] R30 L81–88 — docket (layer 8, the group's own publication docket, DEC-116): `withdrawal` and `contested` causes; "`contested`: each member finding of an edition a contesting record entry names carries it, `since` the filing instant".
- [DESIGN] R33 L102 — "Only a verified `edition` or `withdrawal` entry on the publisher's docket is a move" (K1339, K1366 F1).
- NB: "docket" here is the publication docket of cases (Civicsmith's case), not a court docket; no court-case construct in reevaluation.txt.

ANALYSIS
- [DESIGN] R4 L25 — obligation carries `strength` pair per axis "unaltered"; `stored` triple "never merged".
- [DESIGN] R13 L42 — changedFromAudit "three totals count every affected bundle"; "undetermined is never evidence the sentence was right".
- [DESIGN] R6 L27 — `count` of obligations.
- none on calculation; `consequences` (calculation, layer 9) is a listener (Suggestions L165).

QUESTIONS
- [DESIGN] R11 L38 — versionNotice answer: `wrote: false`, `proposal_only: true`, "the sentence that the chains are those visible to the viewer, and the sentence that nothing was moved".
- [DESIGN] R3 L24 — severed leg listed "because the connection still informs a second look (DEC-70)".
- [DESIGN] R9 L34 — `changesOf` recovery read.
- [DESIGN] Suggestions L165 — publication reads R1, R9 "for which findings still stand"; queue renders R14.

DOCTRINE
- [DOCTRINE] Purpose L15 — "changes nothing itself".
- [DOCTRINE] R18 L138 — "The obligation is a query: nothing is stored for it" (P-64); State Rules §5.4 amended (K102) L159.
- [DOCTRINE] R19 L139 — "Nothing here alters a strength, re-points a reference or moves a leg; only a member's act (R15) moves a reference" (DEC-12, §14.4, §18.1).
- [DOCTRINE] R15 L46 — machine refused adopt/keep; `VERSION_ADOPT_NO_REASON` (DEC-88, K1025); case notice: adopt refused (K359), re-pin is publication's new edition.
- [DOCTRINE] R20 L140 — hidden withheld whole; `out_of_view: true` only (K903 (4), DEC-36).
- [DOCTRINE] R21 L141 — silence is earned.
- [DOCTRINE] R28/R29 — "it never regrades".
- [DOCTRINE] R24 L144 — no place named.
- [DOCTRINE] R32 L116 — names no member (attesting member).

CROSS
- LAW×TIME×ANALYSIS: the listener seam (onBasisChanged, R8) is how layer-9 `conformance`/`consequences` learn that the facts under a computed conclusion moved — reverse-direction registration.
- COURTS (publication docket) and other groups' editions (accepted-work) are already modelled as time-stamped moves with seq and date; a court docket would be a similar move stream but none exists.

## monitoring.txt (217 lines by wc; Read showed 218 numbered; read 1–218 complete)
What: layer 10, APPROVED K102. "The daemon's watch over what the group's standing intent names": checks each monitored document at its cadence, records looks and mechanical ticks "never deciding what a change means"; archive fallback; Drive shells; gathering grammar (C-18.5); named requests (standing intent); docket watch of other groups' editions (R67–R68); action clock overdue mark (R34, R44, R50); escalation trigger ask (R35). Not yet met: R17, R18, R23, R25, R28–R34, R45, R50, R52, R65–R68 (various T22/T23/T24/T31). Link sweep split to `link-sweep` (N506).

TIME
- [DESIGN] R14 L40 — frequency words and intervals: "hourly 1 h, daily 24 h, weekly 7 d, monthly 30 d; `per_meeting` and `none` have no interval." Contract defaults: membership daily, substance weekly, unmonitorable none.
- [GAP] R14 L40 — `per_meeting` (a meeting-driven cadence) exists as a word but has no interval: no meeting calendar drives it.
- [DESIGN] R16 L42 — plan: due when last check + interval ≤ now, `next`; "Due subjects run longest-overdue first".
- [DESIGN] R17/R52 L43–45 — address's own frequency, reasoned act; canned reasons incl. "`legal_deadline_approaching` "A legal deadline that depends on this source is approaching."" — set by hand; no link to an actual deadline record.
- [DESIGN] R18 L46 — volatility lengthening: after 10 unchanged checks, one step up (daily→weekly→monthly), never past monthly; K1051 (not yet met).
- [DESIGN] R19/R20 L49–51 — cadence wake now+1 s while due; archive interval 1 h; `waitingSince`.
- [DESIGN] R21 L53 — epochs and claims (idempotence), one hour for cadence.
- [DESIGN] R34 L138 — "A `pending` clock entry of an action whose date has passed is marked `overdue` by a mechanical promotion `deadline-recheck` (only `clock[].status` and `last_updated`)" (State Rules §4.4, I-11); telling via queue-producers R15 `action-clock-overdue`.
- [DESIGN] R44 L139 — mark only pending→overdue; "never adds, removes or re-dates an entry"; met/waived/overdue untouched.
- [DESIGN] R50 L141 — "`deadlineRecheckWake(now)` answers the start of the UTC day after the earliest date among `pending` clock entries" — deadlines are calendar dates judged at UTC day boundaries; failed mark retried once a day (N429, K719).
- [GAP] R50 L141 — overdue is judged at the UTC day boundary, not the jurisdiction's local day, business days or holidays (no time zone or calendar in monitoring).
- [DESIGN] R67/R68 L105–117 — docket watch due when never read or `last_read.at` + 24 h ≤ now; `waitingSince: last_read.at + 24 h`.
- [DESIGN] R8 L30 — tick sets `monitoring.last_checked`, `last_updated`, `reeval_pending.since`.
- [DESIGN] Uses L148 — `record-grammar.ISO_TS_RE`; `record-core.stampInstant`.
- [DESIGN] Satisfies L190 — "Roadmap v5 principle 3 ("the clock runs")"; State Rules §4.4 (the clock).

ORGANISATIONS
- [DESIGN] R33 L137 — sources of a live objective or published finding known to monitoring; unmonitored source "proposed for monitoring to the members who own the objective or finding, never enabled by the daemon".
- [DESIGN] R28 L71 — named requests captured "the authoritative publisher first" — publisher authority ranks locators.
- [DESIGN] R67 L105 — watching other groups' published editions (case-import).
- [DESIGN] R52 L44 — `NOT_A_SOURCE_OWNER`: project ownership (membership) governs who sets frequency.
- none on government bodies/positions/obligations.

LAW
- [DESIGN] R52 L44–45 — canned reason `legal_deadline_approaching` (the only explicit mention of law in these modules' time handling).
- [DESIGN] R34/R44 L138–139 — action clock entries (State Rules §4.4; action-clocks layer 9) — "every deadline names the statute, order or commitment it comes from" is layer 9's contract (brief); monitoring only marks.
- [DESIGN] R35 L140 — "monitoring asks `escalation` whether a stage's trigger is met, so the next stage is proposed; monitoring never advances a stage."
- none on statutes/codes.

COURTS
- [DESIGN] R67 L105–116 — "docket watch": the publisher group's case docket (DEC-101 (3), Publication §5A, §5D), "a docket entry is never evidence (DEC-116 item 1)". Not a court docket.
- none on court cases.

ANALYSIS
- [DESIGN] R46/R51 L61–62 — counts of three tables.
- [DESIGN] R26 L65 — driveShells counts per class.
- [DESIGN] R19 L49 — tick answer counts (`ticked`, `skipped`, `failed`, `gathered {due, captured, failed}`).
- none on calculation.

QUESTIONS
- [DESIGN] R31 L123–129 — queue items: `source-modified`, `source-removed` (FINDING), `archive-fallback-eligible`, `monitoring-recheck-due` (CONDITION), five sweep conditions; published by queue-producers.
- [DESIGN] R32 L130 — `monitoring({viewer})` every monitored address "so a document that is not being checked is visible without waiting for a tick".
- [DESIGN] R30 L74 — the due slate "is exported as quoted data inside fixed instruction framing" (for an AI/daemon reader).
- [DESIGN] R5 L27 — rendered capture content "stated undetermined on every tick".

DOCTRINE
- [DOCTRINE] R37 L175 — "Detecting change is mechanical; what a change means is not ... a change raises a flag for a member (Intake Doctrine §6; State Rules §8)."
- [DOCTRINE] R36 L168–174 — daemon fetches only what store state authorizes; "No caller names what is fetched".
- [DOCTRINE] R38 L176 — "An equality that costs nothing is not evidence".
- [DOCTRINE] R39 L177 — governed refusal is a fact about the instance (D-104).
- [DOCTRINE] R40 L178 — "Bias never shapes what is monitored: no service here takes a lens".
- [DOCTRINE] R43 L181 — no place named.
- [DOCTRINE] R33 L137 — proposal adopted by member is the ratification; daemon never enables.
- [DOCTRINE] R45 L56 — monitoring runs everywhere a document asks; "asking is the group's standing intent".
- [DOCTRINE] R28 L71 — what lands "no higher than its verification earns"; never verified (member's act).

CROSS
- TIME×LAW×ORGANISATIONS: monitoring (layer 10) is where the clock "runs" for layer-9 action deadlines (overdue marks), and where an escalation trigger is asked — the only active time-keeping in the system; its granularity is a UTC calendar day; it reads action-clocks.pendingClocks (layer 9) as a machine viewer.
- TIME×QUESTIONS: frequency reasons (incl. legal deadline approaching) are member-stated, not derived from a deadline record — a link between a deadline and source watching is absent.

## scheduler.txt (102 lines by wc; Read showed 103 numbered; read 1–103 complete)
What: layer 10, APPROVED K102. "The plane's periodic work runs on one reconciling Durable Object alarm, never on a cron"; registry of consumers {name, key, due(now), wake(now), tick(now)}; runs due ones on alarm, keeps alarm at earliest wake, deletes when none (idle instance holds no timer). Holds only the 250 ms grace; every cadence is the owner's. Not yet met: R3, R9 (four producers), R10 (K102), R11, R12 (D-583); T23 consumers.

TIME
- [DESIGN] Purpose L13 / R14 L68 — one alarm, no cron: "the deployed configuration declares no cron trigger, and no consumer sets an alarm of its own."
- [DESIGN] R1 L20 — runs consumers whose due ≤ now + grace (250 ms); alarm at smallest non-null wake.
- [DESIGN] R5 L28–29 — consumers incl. `overdue-scan` (`progressions` R17), `intent-age`, `notice-sweep`, `deadline-recheck` (monitoring R34/R35/R50), `working-on-seal` ("network-notices' weekly seal") and `working-on-attest` ("`monthly`, `closed` and `lapsed` attestations").
- [DESIGN] R7 L31 — "Every cadence, batch and delay is its owning module's ... (P-87: re-notify at the stage's own interval, never a global one)."
- [DESIGN] R9 L37 — producers arm on idle instance incl. "an action holding a `pending` clock entry".
- [DESIGN] R10 L41 — rank: objective gap, then aspiration in force, then longest-waiting; "any work that has waited longer than one whole cadence of its own goes first, so priority orders the work and never starves it".
- [DESIGN] R11 L45 — recovery: reconcile at start re-derives alarm from durable state (Technical Architecture v10 §10.7).
- [DESIGN] R12 L48 — suspended run woken when its request reaches `expired`, exactly once (D-583, not yet met).
- [GAP] (inferred) — scheduler has no calendar (no business days, holidays, time zones, recurring meeting rules); all timing is instants/ms intervals supplied by owners.

ORGANISATIONS
- none in scheduler.txt (ranking by intent's objectives/aspirations only).

LAW
- none in scheduler.txt (deadline-recheck consumer only runs monitoring's mark).

COURTS
- none in scheduler.txt.

ANALYSIS
- none in scheduler.txt (answer counts only: swept, drained, created, ...).

QUESTIONS
- [DESIGN] R5 L28 — `ai-run-reap`, `ai-run-wake` (ai-runs R15, R16), `capture-request-drain` before `ai-run-wake` "so a request that completes on an alarm wakes its run on the same alarm" — the assistant's unattended runs are driven by this alarm.
- [DOCTRINE] R19 L73 — "It raises no queue item and holds no notification kind of its own".

DOCTRINE
- [DOCTRINE] R14–R17 L68–71 — one alarm; self-terminating; no starvation; arming only schedules.
- [DOCTRINE] R10 L41 — no aspiration ranks above another (intent R12; K228).
- [DOCTRINE] R20 L74 — no place named.
- [DOCTRINE] R9 L37 — later-module producers arm through R8 (K93 (5)); earlier producers via notices — P4 order preserved.

CROSS
- TIME: the scheduler is the substrate for every clock (action deadlines via monitoring's deadline-recheck, progressions' overdue-scan, intent ageing, network-notices weekly/monthly attestations); a richer TIME construct (business days, local day boundaries) would sit in owners' due/wake functions, not here.

## acquisition.txt (126 lines by wc; Read showed 127 numbered; read 1–127 complete)
What: layer 3, DRAFT (split from capture by K617, K649 (1); "Open for Bob: None: the split is BOB's"). The acquisition act: fetch from public address (direct, Drive export, web archive, rendered), hash/store content-addressed, receipt, profile, supporting files, co-attestation; returns provenance document; writes no bundle. Code `bio-plane/src/capture/acquire.mjs` (~1,015 lines) + ~300 from catalogue. Not yet met: R31, R32 (T23 L3).

TIME
- [DESIGN] R7 L31 — render locale from `capture-sources.renderLocaleFor`; "timezone stays UTC".
- [DESIGN] R16 L45 — first hop asserts "these bytes were served for <locator> at <retrieved>"; `retrieved` "(this instance's clock, to the second)"; document captured before T31 keeps its `who` (DEC-124).
- [DESIGN] R15 L43 — content authority determined or undetermined, each "with a dated basis".
- [DESIGN] R22 L59 — conditional fetch with validators `ETag`/`Last-Modified` → `If-Modified-Since`, recorded "address, capture sha, etag, last-modified, time"; 304 files nothing (source asserts, does not serve).
- [DESIGN] R32 L66–71 — archive lookup through Memento: "the lookup asks the TimeGate with `Accept-Datetime` (`acceptDatetime`) ... or reads the TimeMap" — date-targeted retrieval of an archived version (as-of capture); refusals `MEMENTO_NO_DATETIME`, `MEMENTO_BAD_DATETIME` (N492, K1032; not yet met T23).
- [DESIGN] R3 L25 — `web.archive.org` held to 24 requests a minute; CDX row chosen by `capture-sources.selectCapture`.
- [DESIGN] R5 L28 — render allowance per day ("the day's allowance committed").
- GAP (inferred) — dates printed in a document (publication date, effective date) are not read by acquisition (R8: "`acquire` does not read the document").

ORGANISATIONS
- [DESIGN] R15 L43 — "a non-empty `authority` in the body is `authority_state: "determined"` with a dated basis naming the asserting member or caller; none is `"undetermined"` ..., never refused"; undetermined enqueues `authority-undetermined` task (AUTHORITY-AND-TRUST: "authority is three-valued and undetermined is a task", L114).
- [DESIGN] R16 L44 — archive arm capture carries `authority: "Internet Archive"`.
- [DESIGN] R23 L60 — credentialed fetch records `supplied_by`, `scope`, `project`; `reproducible_by_public: false`.
- none on government bodies/positions/obligations (authority is a free string about who published).

LAW
- [DESIGN] R17 L46 — `doctypeFor` "with the combined view of the instance's active jurisdiction profiles (`jurisdictions.combine` of record-core's `jurisdiction_profiles`)" — document type (incl. any legal instrument type a profile declares) identified via profile data.
- [DOCTRINE] R30 L104 — "local vocabulary reaches profiling only through the profile view (R17)".
- none otherwise.

COURTS
- none in acquisition.txt.

ANALYSIS
- [DESIGN] R17 L46 — `format` from `format-registry.detectFormat` "read back whole up to `ODF_DIGEST_MAX` ... so an office file's format and container digest are judged from its bytes; K659" — spreadsheets identified at intake.
- none on calculation.

QUESTIONS
- [DESIGN] R8 L32 — "`acquire` does not read the document ... Reading from the stored capture is `extraction`'s (K49)".
- [DESIGN] R11 L37 — `existed` three-valued: "Several parts never answer `false`."
- none on NL questions.

DOCTRINE
- [DOCTRINE] R25 L98 — "No intake path writes live state ... the caller promotes".
- [DOCTRINE] R26 L99 — raw bytes primary evidence, never rewritten.
- [DOCTRINE] R27 L100 — "A provenance fact a caller can hand in is one a caller can invent".
- [DOCTRINE] R28 L101 — "Fetching is policy-governed, never caller-governed" (Intake §4).
- [DOCTRINE] R30 L104 — no place named.
- [DOCTRINE] R20 L54 — co-attestation (trusted timestamp, co-archive) at every capture (Bob, K60).

CROSS
- TIME×LAW: Memento Accept-Datetime gives a mechanism to fetch a public document as it stood at a date (e.g., a code or ordinance page as of an event date) — a potential as-of LAW support at intake; today used only as archive fallback for unreachable sources (R3 runs only when fallback-eligible).

## sources.txt (86 lines by wc; Read showed 87 numbered; read 1–87 complete)
What: layer 3, APPROVED K509 (1) (new product module after capture). Holds each source (knocker, person who handed material over, later the person revealed behind them) "as a dated, attributed history of disclosures, never as one overwritten field (DEC-78 item 5)"; answers what of a source may be published and to whom. Met in T16 (SOURCES #1, K541). Code: new (sources/ paths).

TIME
- [DESIGN] Purpose L12 — "a dated, attributed history of disclosures, never as one overwritten field".
- [DESIGN] R1 L19 — sourceOf answers "the source as it stood when the capture was received (the capture's own `source`, verbatim) and, beside it, the source's current history"; "A capture's stated source never changes." — as-of vs current.
- [DESIGN] R2 L22 — entry appended with `by` and the instant, never edited; "a later entry supersedes it on read".
- [DESIGN] R3 L23 — hostile disclosure read as "named by <claimed_by> on <date>; not confirmed by the group".
- [DESIGN] R7 L31 — consent "stated as permanent for anything published under it. A withdrawal binds only later publications".
- [DESIGN] R8 L34 — `publishableAt({source, audience, at?})`: basis `consent` "not withdrawn at `at`" — an explicit as-of query.
- [DESIGN] R5 L25 — read log `{source, entry, reader, at}`.
- [DESIGN] R15 L42 — `source_knocks` `(knock_id, source_id, capture_sha, bytes, received)`.

ORGANISATIONS
- [DESIGN] R2 L22 — disclosure kind `attribute` "(occupation, employer, role)" — a person's employer and role held as a dated disclosure (a person–organisation–position link, for a source only).
- [DESIGN] R6 L28 — linkClaim: two sources one person; "The claim does not merge the sources: each keeps its own history." — identity claims kept as evidenced claims, not merges.
- [DESIGN] R9 L35 — rung ladder `unknown`, `same_knocker`, `partly_known`, `known_to_group`, `publicly_known`.
- [DOCTRINE] R12 L55 — "The capturing member is never recorded as the source of what someone else gave them (Membership v2 §1.2)".
- GAP — sources are private persons (whistleblowers/knockers); no organisation model here.

LAW
- none in sources.txt (consent is the group's policy, not law).

COURTS
- [DESIGN] R2 L22 — `how` includes `filing` (a detail revealed through a filing) and `hostile` — no court construct otherwise.

ANALYSIS
- none in sources.txt.

QUESTIONS
- [DESIGN] R8 L34 — "Every other entry is left out, and nothing is said about it." (silence by design for unpublishable details).
- [DESIGN] C-121 translations L63–68 — member-facing sentences, each ending "Nothing was written."

DOCTRINE
- [DOCTRINE] R8 L34 — "The group is never the first to make a detail more public (item 5(a))."
- [DOCTRINE] R3 L23 — hostile disclosure `confirmed: false` always; confirmation needs consent (DEC-78 item 5(b)).
- [DOCTRINE] R4 L24 — "known to the group, not recorded" (item 5(c)).
- [DOCTRINE] R13 L56 — "A value is never written to a log, an error or a listener payload"; tables exempt from purge.
- [DOCTRINE] R14 L57 — no place named.
- [DOCTRINE] private individuals: sources are the main private-individual construct; their identity is protected by sight lists and consent (relevant to Actions R9 doctrine on private individuals, but not cited here).

CROSS
- TIME×ORGANISATIONS: sources is the one place in these modules where a person's attributes (employer, role) are held as a dated, superseding history with evidence and an as-of read (`publishableAt at`) — the shape Bob's "positions vs holders over time" would need, but scoped to private sources and their protection, not to public officials.
- sources→reevaluation (R10 onDisclosure → reevaluation R28 `source` cause): a change in what is known about a source reaches findings as a notice, never a regrade.
