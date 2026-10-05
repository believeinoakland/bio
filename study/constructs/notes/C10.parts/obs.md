# working extraction: OBSERVATION-LOG-DESIGN.txt (to be merged into C10.md)

## chunk 1-130
TIME
- [DESIGN] Status header, src l.18 — §6 watermark rule: `observation_log.at` stays whole-second; inside the one-second band the readers STATE undetermined rather than picking (D-516, BOB #33 17:58Z) — "`observation_log.at` STAYS whole-second and inside that band the readers STATE undetermined rather than picking, through a third answer from the same one function and a fourth word (`watermark_band`)"
- [BUILT] Status, l.18 — watermark viewer-independent; both readers compare at one precision through `enteredAfterFirstRow` in airun.mjs; one-second band stated as a ceiling (D-500, BOB #32 05:04Z).
- [DESIGN] Incomplete §5.1 content level, l.50 — cause (2) excluded by comparing earliest row's timestamp against subject's registration time, "because nothing records that a purge happened" — temporal as-of reasoning on log; open whether that is the intended mechanism.
- [BUILT] Incomplete §7, l.65 — sweep volume measured M-14: naive rule 43,283 rows/day (15,798,295/yr) vs edge-triggered 15.14 rows/day over a 2,859-day span; busiest day 2,713 rows; figure is a FLOOR (`LastModified` keeps only latest write per key) — "the edge rule writes **15.14 rows/day** over the 2,859-day span — a **2,859x** reduction"
- [DESIGN] §2 table, l.107 — `captured_locators` keeps `first_retrieved`/`last_retrieved` (a cache of the log's document level) — time of looks per address.
- [DESIGN] Incomplete §5.1, l.32 — "What the log adds at this level is WHEN it was last verified, never WHETHER anybody looked." (document level)
- [BUILT] Incomplete §4.1, l.25 — a monitor `changed` tick CAPTURES the served bytes; monitor capture never becomes the baseline (D-455; BOB #34 2026-09-25 rulings (a)–(e)); advancing baseline on member ADOPT is REC-223's. (Version-over-time of a watched document.)
- [DESIGN] §3 l.129-130 — table columns `seq` monotonic store-wide, `at TEXT NOT NULL`.

QUESTIONS
- [DESIGN] Place in system l.22 — observation log serves construct 9 (retrieval, store as read-through cache) and construct 10 (standing intent and monitoring); feeds CONTENT-SEARCH-DESIGN §4.4 content-axis tally a search answer carries; feeds D-196 completeness statement.
- [DESIGN] §1 l.92 — an observation is an append-only event about looking: unchanged / changed / gone / could not tell / extracted half / no reference / "we searched for a thing a member named and found nothing"; absence is RECORDED not retried away.
- [DOCTRINE] §1 l.98 — absence vocabulary (D-129 widened by partial): NEVER_LOOKED · LOOKED_ABSENT · LOOKED_INDETERMINATE · PARTIAL · PRESENT; "Which absence is a stated fact, never a diagnostic detail."; NEVER_LOOKED is read under §5.1's order, not inferred from emptiness (CONDUCT #11 2026-09-15).
- [DOCTRINE] §1 l.99 — D-104: "Source unreachable" and "our governor held us" are different facts; definitive state on a governed row refused (C-22.2).
- [DOCTRINE] §1 l.100 — D-64: a client-rendered shell is LOOKED_INDETERMINATE, never PRESENT.
- [DESIGN] §2 l.112 — `heldMatch`'s discipline: "*not found* and *did not finish looking* are different facts" → `bound` and `terminal` columns.
- [BUILT] Status l.5 — `op=airunlog` STATES each row's coverage claim as `backed` / `none_owed` / `undetermined` (REC-113).
- [BUILT] Status l.12 — undetermined set stated per row (`not_ruled_out`) with `evidence_one_sided`; earlier rows enumerated two causes where live set is three (`never_looked` missing) — an overclaim fixed (REC-107, IC-114).
- [BUILT] Status l.15-17 — completeness statement `searched` section computed at AUTHORING, published in frontmatter (`searched`, `searched_levels`) and body `## What Was Searched` (REC-96); subjects come DOWN from the case (members → basis legs → content rows → captures → addresses); honest negatives `never_looked`, `undetermined`, `no_subjects` publish — "zero of zero is not 100%, which is the costs-nothing rule wearing a percentage"
- [BUILT] l.20 / l.61 — internet-level frontier read (REC-129, IC-143) over member's LEAD looks (MK-4 `op=leadlook`, `authority_kind = lead`, `subject_kind = description`, member's words as subject); every answer names `not_read`; a run's open-internet searches and acquire at unheld address have no internet-level frontier arm — GAP stated.
- [GAP] Incomplete §4.3 l.41-42 — third reader-run outcome "no reader is registered for this type" has no producer: fallback doctype `parse()` emits `{ entities: [], facts: {} }` identical to a reader that found nobody; no CONDITION word for it in queuestate.mjs.
- [GAP] Incomplete §5.1 l.43-45 — at two of the meaning level's three subject kinds (REFERENCE, ENTITY) pre-log evidence is ONE-SIDED: a resolution attempt that matched nothing writes no `resolutions` row; derivation that found no connections writes no `connections` row → cause (3) unreachable pre-log; answer is cause (2) `evidence_one_sided`.
- [GAP] Incomplete §4.2 l.51 — D-375: "document has no text" (LOOKED_ABSENT at content level) needs a CHARACTER COUNT the persisted reading does not carry; `found: false` means reader found no ENTITIES (meaning-level absence).
- [GAP] Incomplete §4.2/4.3 l.53 — per-capture `indexed` state half-answerable until REC-91 (`capture_text` unit index) lands; read returns a fifth value undetermined naming what it waits on.
- [OPEN] Incomplete §3 l.39 — `partial` coverage claim undecided (whether a referent is owed); REC-113 answers `none_owed`; handed for ruling.
- [OPEN] Incomplete §6 l.47 — meaning level ENTITY partition deliberately unfenced (subject registry instance-wide; `op=concerns`, `op=connections` already serve an entity and documents concerning it to any reader); raised for ruling.

ORGANISATIONS
- [DESIGN] Incomplete §6 l.47 — the entity subject registry is instance-wide; `op=concerns` and `op=connections` serve an entity and the documents concerning it to any reader, redacting only the bundle back-reference (relevant to org/entity reads).
- [DESIGN] Incomplete §3/§4.3 l.46 — resolution attempt over an ENTITY: failing attempt names no entity; `reference` landed as seventh `subject_kind` (raw unresolved `kind:key`) rather than spelling it into `entity` column — "would say the record keeps a registry entry for a name it has just established it does not."

ANALYSIS
- [DOCTRINE] Status l.16 — completeness percentage computed over log's own subjects "would read 100% searched BY CONSTRUCTION" — D-196 ancestor Blair & Maron ~20% recall measured vs believed 75% → subjects must come from the case, not the log (`SEARCHED_SUBJECT_SOURCES` in bio-checks.mjs).
- [DOCTRINE] l.17 — "zero of zero is not 100%"; `no_subjects` published where question not askable.
- [DESIGN] Incomplete §6 l.31 — unresolvable basis leg (nullable `inquiry_basis.content_id`) counted as `unidentified`, count published, level CAPPED at `partial` — derived coverage figure carries its own grade.
- [BUILT] Incomplete §6 l.28-29 — `op=provenanceroutes` census computed THROUGH the gate; count of withheld rows deliberately NOT published ("that count is the disclosure"); empty answer carries cause from four-member ladder `no_documents_visible` · `never_assessed` · `none_standing` · `page_exhausted`; `never_assessed` published with `complete`.
- [BUILT] Incomplete §6 l.58-59 — `truncated` claim on full raw fetch (D-389, REC-174): `gated.length > cap || raw.length === limit`; over-report is fail-safe direction (counts and coverage claims honest under fencing).
- [EXAMPLE] §7 l.65 — measured sweep volume instrument `tools/measure-office-corpus.py sweepvolume` over COFF-6 census corpus (43,283 keys) — an in-code measurement with stated floor.

DOCTRINE
- [DOCTRINE] l.3 — provisional: a member's unattributed search is never logged (§4.6), stated with reversal cost.
- [DESIGN] l.3 / §1 l.92 — THE RECORD AND THE OBSERVATION LOG ARE SEPARATE, WITH DIFFERENT LIFECYCLES (STORE-AS-CACHE); record write-once, content-addressed, never evicts.
- [DOCTRINE] §1 l.94 — observation is not a transcript (DEC-61: transcripts device-local, never in the store).
- [DOCTRINE] Incomplete §5.1 l.12/44 — two proxies refuted "because both conclude a look from an ABSENCE that cost nothing to produce" (costs-nothing rule).
- [DESIGN] Incomplete §2/§3 l.26-27 — provenance-route marker table (`provenance_route_marks`, finding LOOKED_INDETERMINATE | PRESENT) is a second observation-shaped store; its `by` is "the MEMBER who made the assessment. Never a machine" — member's standing assessment vs machine's look.
- [DOCTRINE] l.29 — "*the op returned nothing* and *no document carries a marker* are different facts".
- [DOCTRINE] Incomplete §6 l.33 — "*absent* and *empty* are the two facts this document exists to keep apart."
- [DESIGN] Incomplete §6/§8 row 4 l.30 — searched section computed at AUTHORING (op=publish) not signing (op=caseratify) because signature covers doc_sha; "alter the log after signing and the signed section does not move".
- [DESIGN] l.54 — leak measured: project bundle id published verbatim to uninvited member; fence now row-whole; resolver INVERTED so tenth `authority_kind` refused by default.
- [CONFLICT] l.56 — §6 row-whole withholding vs §7 purged annotation after per-bundle purge: fail-closed taken (REC-103).
- [CONFLICT] l.66 — §3 `subject TEXT NOT NULL` + refuses PRESENT w/o result_ref vs §4.4 fold unchanged: resolved conservatively (`unstated` sixth subject_kind; D-366).

## chunk 131-260
TIME
- [DESIGN] §4.1 l.174 — `last_verified` (which STORE-AS-CACHE says HTTP obsoleted and "we must own") lives on the frontier view: "it is the latest `PRESENT` row's `at`."
- [RULING] §4.1 l.176-187 — BOB #32 2026-09-23 (D-65): a monitor's `changed` tick CAPTURES the new bytes (own provenance, through governor); BUILT D-455 2026-09-25; one look, one document-level row; version filed at the address via `recordCapturedLocator`.
- [RULING] §4.1 l.189-194 — BOB #34 2026-09-25 03:05Z: (a) baseline stays the capture a PERSON accepted — "`changed` means changed since the version a member accepted"; (b) later different version captured once; (c) re-evaluation flag stays raised until member acts (REC-223 ADOPT or KEEP); (d) monitor capture gets no `documents[]` row in provenance.json; (e) advancing baseline on ADOPT is REC-223's. (Versions of a document over time; as-of = member-accepted version.)
- [DESIGN] §4.1 table l.170 — monitor sweep under `authority_kind = sweep`, authority = bundle whose `monitoring.enabled` the tick runs under (SCHEDULER.md) — recurring watch of a source.
- [DESIGN] §4.1 l.171 — ratify's re-fetch of reused parts: confirmed/changed/unreachable/not_attempted; budget that stopped it recorded on the ratification.
- [DESIGN] §5.1 l.240 — cause (1) uses `first_retrieved` predating the log's first row (time comparison to decide pre-log look).

QUESTIONS
- [DESIGN] §3 l.133 — `authority_kind`: run | sweep | link | ratify | acquire | extract | derive | lead | objective; `level`: internet | document | content | meaning (the four levels); `subject_kind`: address | capture | extent | entity | description (+ `unstated`, `reference` added by builds).
- [DOCTRINE] §3 l.151-158 — append-only never updated; never written into bundle.md (C-22.6); "`authority_kind` is never NULL — a look the record cannot say WHY it made is not recorded" (RFC 2308 rule: negative answer with no authority behind it not recordable); "`PRESENT` with no `result_ref` is refused" (WARC lesson); definitive state on governed row refused (C-22.2); client-rendered shell never PRESENT.
- [RULING] §3 l.155-156 — BOB #14 2026-09-18 (mechanism): ROLLUP's PRESENT refers to latest non-terminal PRESENT row of same authority (`result_kind = observation`); plane computes it, never the caller; "an exemption is a `PRESENT` with nothing behind it".
- [DESIGN] §4.2 l.198-206 — content-level outcomes: PRESENT whole doc; PARTIAL (pages below floor, per-capture index bound); LOOKED_INDETERMINATE (no text layer & no OCR, encrypted, over 20 MiB office bound); LOOKED_ABSENT (scan, tier 3 read nothing); read-time re-extraction to tier 3 under `authority_kind = extract`, actor = member who asked.
- [DESIGN] §4.2 l.208 — `indexed` state `full` · `partial` · `none (reason)` read through index predicate.
- [DESIGN] §4.2 l.210 — frontier = candidate list for re-extraction; makes D-319's opt-in re-read "a choice a member can make from a list rather than a fact they must remember."
- [DESIGN] §4.3 l.214 — meaning level rows: per reader run per capture (PRESENT with reference count, or LOOKED_ABSENT), per resolution attempt, per connection derivation; "So *nothing has been derived — which may only mean nothing was extracted* (Part II §14.3) becomes a query rather than a caveat."
- [BUILT] §4.4 l.220-221 — REC-100 (CONDUCT #4 authorization): agent-worker `stepLog`: "a model-judged `PRESENT` is recorded `LOOKED_INDETERMINATE` with the judgement stated" — a model-supplied capture sha "would be a referent that cost nothing to produce"; agent-worker reads `refused[]` rather than inferring success.
- [DESIGN] §4.5 l.225 — internet level: acquisition attempt for unheld address, run's open-internet searches, member's LEAD; D-194: the lead is the AUTHORITY that makes "*we looked and there is none* a finding with a name behind it".
- [DOCTRINE] §4.6 l.229-232 — "A member's ad hoc search, view or read is not an observation." Provisional by DEC-61 analogy; record reachable by legal process (Membership Architecture §Residual risk); member who wants a search on the record states it as a LEAD; conservative provisional is the reversible one.
- [DESIGN] §5 l.236 — frontier = latest row per (level, subject_kind, subject), a view not a table.
- [DOCTRINE] §5.1 l.240-241 — subject with no row has 3 causes: (1) log did not yet exist; (2) looked and purged; (3) nobody looked — honest only when record holds nothing else; else UNDETERMINED naming which not ruled out; "treating the empty set as a positive finding is the costs-nothing rule inverted".
- [DESIGN] §5.1 l.247-253 — evidence table: document·address `captured_locators` two-sided; content·capture `readings` two-sided; meaning·capture `readings` two-sided; meaning·reference `resolutions` NO; meaning·entity `connections` NO.
- [EXAMPLE] §5.1 l.257 — defect: "A member acting on such a row concluded the subject had been looked at and left it off the never-looked worklist."; undeclared sidedness takes WIDE set.
- [DESIGN] §5.1 l.260 — `resolveReferences({ captureSha, ref })` accepts a SINGLE ref (references resolved one at a time).

ORGANISATIONS
- [DESIGN] §4.3 l.214 / §5.1 l.252-253 — entity resolution and connection derivation (meaning level) are what the record knows about entities/relations; failure to resolve or derive leaves no artifact pre-log.

DOCTRINE
- [DOCTRINE] §4.4 l.220 — AI (model) judgement cannot supply a backed PRESENT; AI's judgement recorded as indeterminate with judgement stated (machine never attests).
- [DOCTRINE] §4.6 l.231 — record what legal process can reach: member search history kept out of the record.

## chunk 261-395
TIME
- [DESIGN] §5 l.264 — "`last_verified` is the latest `PRESENT` row's `at`; *source unreachable since* is the earliest `LOOKED_INDETERMINATE` after it" — derived durations/dates over the log.
- [DESIGN] §5.1 l.261 — pre-log window "stops growing rather than closing", bounded at top: subject entering record after log's first row at its level reaches cause (3) normally (as-of reasoning keyed on dates).
- [DESIGN] §6 l.355-359 — internet-level reader computes "every list, date, count, `truncated` and empty cause from what the viewer may read"; grouping first then gating would "remove or re-date what the viewer sees".

QUESTIONS
- [DESIGN] §5 l.263 — NEVER_LOOKED = subject with no row AND nothing else in record; `deferred` link partition supplies document-level subjects (authority_kind = link).
- [DESIGN] §5 l.265 — `surfaced_by` (`agent` / `human`) maps onto `actor_class`.
- [DOCTRINE] §5 l.266 — "a PLAN PROPOSAL ... is derived FROM the view and is never itself an observation — it is a proposal awaiting an authored act (D-82, D-90)."
- [DESIGN] §6 table l.270-276 — readers: frontier per level (candidate list for FETCH / EXTRACT / DERIVE; envelope-bounded REC-57; REC-36 withholding row-whole); per-capture content-axis state (CONTENT-SEARCH §4.4 tally; aggregate over bundle set for the search envelope); run's log; completeness statement's `searched` section (D-196: "which levels were searched for the case's subjects, under which authorities, with which outcomes and where each stopped ... the first thing behind a completeness claim that is not prose"; bio-case-document/1 signed); member-facing surface (Program B; "what the group has looked for and what it found, by level; where a lead stands").
- [RULING] §6 l.349-353 — BOB #15: everyone outside a lead's reach answered as for a lead that does not exist, "and that a COUNT is a disclosure of existence"; `tally_scope: "visible_to_viewer"` on internet-level answers (REC-129, IC-143).

ANALYSIS
- [RULING] §6 l.278-312 — REC-110 2026-09-17, D-386 CLOSED (a): tally UNGATED at three levels; four premises: (1) `op=stats` publishes log size (`observationsNonLead`, excludes lead rows; classes ["admin","member","probe"]) — gating tally would be "a fence with a documented hole beside it"; (2) `observation_log` has no bundle column; (3) amplification class (`derivation-bounds.test.mjs` names `frontier` among five methods legitimately holding unbounded scan while publishing a bound); (4) counting page states instead = silent value change (IC-118) and BREAK on IC-25. "if any one of them stops being true, this ruling is the thing to reopen."
- [DOCTRINE] §6 l.314-318 — tallies are "the per-level counts a completeness statement is computed from"; "A viewer-dependent tally would make a signed completeness claim depend on who computed it — two signings of one case disagreeing about what was searched." (reproducibility of a signed derived number)
- [GAP] §6 l.321-326 — `searchedSection` in airun.mjs takes its `levels` FROM THE CALLER and does not read the tally: "no live consumer depends on the tally's viewer-independence today" — design intent only.
- [DESIGN] §6 l.328-336 — residual: tally finer than op=stats (decomposes by level and state); "If that decomposition is ever judged to be the leak, REOPEN THIS RULING — do not gate the field quietly"; section J of all three observation suites fails loudly.
- [BUILT] §6 l.345-347 — I3 unchanged; proof: comments stripped from HEAD and landing hash identically (`19cdc8d2bbecf173`, 945,145 B).
- [RULING] §6 l.368-391 — BOB #32 2026-09-24 02:30Z, BUILT D-486 (IC-258, M-131): "a hidden project's run output is the PROJECT'S THINKING until something outside uses it; the bytes stay shared, only the run's ATTRIBUTION is withheld" → every tally plus op=stats' `observationsNonLead` and `aiRunLog` drop rows of `authority_kind=run` whose run context is a project caller cannot see; one predicate `Store#hiddenSets` for all five readers; tally now viewer-dependent for this row class; "If a consumer is ever built that DOES compute D-196's `searched` section from this tally, this narrowing must be reopened".

ORGANISATIONS
- none in this chunk.

DOCTRINE
- [DOCTRINE] §6 l.297-299 — two ops answering differently about one fact is "the mirror-and-drift class"; one rule with three spellings refused (l.342-343).
- [DOCTRINE] §6 l.334-336 — "An undocumented change of mind on a disclosure question is the thing REC-110 existed to prevent".

## chunk 396-529
TIME
- [OPEN→RULED] §6 l.401-409 — D-486 routed: `#missingContentCause`/`#missingMeaningCause` classify an absent look "by comparing a subject's entry date against `MIN(at)` over the WHOLE log at that level"; hidden project run writing earliest row re-dates the watermark, flips `purged`↔`never_looked`; INTERMITTENT because causes normalise to the SECOND while `register.registered` carries milliseconds.
- [RULING] §6 l.411-416 — BOB #32 2026-09-24 05:04Z (D-500): watermark STAYS VIEWER-INDEPENDENT; hidden run's reclassification is accepted cost "ONLY IF DETERMINISTIC".
- [DESIGN] §6 l.418-424 — one function `enteredAfterFirstRow` (src/airun.mjs); "Both sides of the comparison are read at one precision, milliseconds, and the coarser side is read as the INTERVAL it actually denotes."; `register.registered` and `entities.at` carry milliseconds, `observation_log.at` whole seconds — stored `…:15Z` asserts only `[…:15.000Z, …:16.000Z)`; "That one second of uncertainty is in the stored value and no comparison can remove it — a comparison can only PLACE it".
- [DESIGN] §6 l.426-432 — placement options; adopted: band at 1–2 s before first row, off every same-second pair; REC-94's tie (same-second entry reaches cause 3, a reason about SIMULTANEITY since content writer runs inside promote's transaction) read at data's precision (l.434-440).
- [RULING] §6 l.449-456 — BOB #33 2026-09-24 17:58Z (D-516): `observation_log.at` STAYS whole-second — "that is the record's convention (`ISO_TS_RE`, `ISO_INSTANT`, about thirty gate checks)"; "*did the log carry this level over the subject's lifetime* is not a sub-second question"; inside the band reader STATES undetermined: "A rule with two answers over a value that admits three was the record choosing between two claims it cannot tell apart, which `CLAUDE.md` §2 refuses".
- [DESIGN] §6 l.458-474 — three answers against an interval: AFTER (cause 3 reachable), BEFORE (cause 2 bucket), WITHIN THE BAND (cause word `watermark_band`, content axis `CONTENT_AXIS_UNDETERMINED`, `why` names stored whole-second precision); `ALL_MISSING_ROW_CAUSES` still THREE; `watermark_band` a fourth WORD not a fourth cause.
- [DESIGN] §6 l.481-486 — proof: AFTER and BEFORE separated by interval of width `u`; "No pair can ever flip between `never_looked` and `purged` again" (M-131's measured failure, arm M2).
- [GAP] §6 l.488-493 — cost: band still entered/left as second moves; "a claim WEAKENING to *this record cannot tell*, never a claim swapping for its opposite"; closing needs millisecond watermark Bob ruled against.
- [EXAMPLE] §6 l.495-500 — finding: comparing epoch milliseconds via `Date.parse` vs `String(v).slice(0,19)` is a NO-OP on whole-second watermark — "the shape of a repair that repairs nothing" (time-precision pitfalls).
- [DESIGN] §7 l.505 — growth bounded by EDGE-TRIGGERED rule: first looks and transitions logged; steady-state unchanged revisit updates `captured_locators.last_retrieved` and `observations + 1`, writes no row; monitor sweeping census corpus daily would be 43,282 rows/day, ~16 million/yr.
- [DESIGN] §7 l.504 — purge of a bundle leaves its observations; `result_ref` to purged capture annotated `purged` at read time, never rewritten; whole-store purge clears table (D-113).

QUESTIONS
- [DESIGN] §8 l.512-517 — decomposition: item 1 table/refusals/frontier/document writers/run-log fold (I5 additive); item 2 content-level writers + content-axis frontier (I3); item 3 meaning-level writers; item 4 completeness `searched` section (D-196; bio-case-document/1 additive minor) — "a case whose subjects were never looked for at the content level says so in the signed document".
- [DESIGN] §9 l.521-529 — negative controls: unchanged acquire writes PRESENT unchanged with sha; governed hold `governed = 1`; shell LOOKED_INDETERMINATE; "a member's `op=search` writes nothing (the row count is unchanged after any search)"; NEVER_LOOKED set for doc with three deferred links has three subjects; pre-log capture reads UNDETERMINED not NEVER_LOOKED; steady sweep over N unchanged writes zero rows; airunlog byte-identical; alter log after signing → signed section unchanged.
- [BUILT] §6 l.393-399 — D-486 defect fixed: `#frontierMeaning` published a hidden project's run rows WHOLE (`authority`, run id, `ran_and_found_nothing`) to uninvited member because `#aiRunAppend` stamps `subject_kind = 'unstated'`; now delegated to `aiRunLog`.

ANALYSIS
- [DOCTRINE] §6 l.454-456 — reader states undetermined rather than choosing between claims it cannot tell apart (applies to derived classifications).
- [BUILT] §6 l.438-440 — reproducibility check: driven answers (`observation-content`, `observation-meaning`, `project-sight`, `frontier-chunk`, `frontier-internet`, `casesearched`) "byte-for-byte what they were".
- [DESIGN] §7 l.505 — volume sizing by measurement (M-14), sized on busiest day (2,713 rows).

ORGANISATIONS / LAW / COURTS
- none in this chunk.

DOCTRINE
- [DOCTRINE] §6 l.454-456 — CLAUDE.md §2 refuses "the record choosing between two claims it cannot tell apart" ahead of any missing feature.
- [DOCTRINE] §7 l.506 — "Nothing is ever deleted from the log except by whole-store purge".
