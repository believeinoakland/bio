# B541 triage: the 0.87.0 live walk's design items (DS1-DS35)

A reading worker's table (UX design #41, 2026-10-27), from `build/plan/walk-T51b-live/placement-design-unknown.md` §3 on `tranche/T51b`. Keys and English are from `bio-plane/src/setup-words/rows.mjs` there; widths are as §3 states them ("n/s" not stated; the walkers' `A.md`-`E.md` hold the rest). Severity is the worker's estimate unless §3 states one. Not yet acted on; wording is the design's.

Priority (B541): the five screen questions first (C-K2 a question's subject; C-K6 the team's fiscal year; B-K19 a handed-in file's source link; D-K9 the next-edition offer after publishing; E-K7 the counsel packet's version, link and export), then these by severity.

**Policy-gated (bring to Bob with options):** DS9 (a member cannot see their own photograph: file-safety R11), DS23 (the publish gate, BQ22), DS24 (signing-key re-registration items; the "keep on this device" default), DS25 (members see other projects' document names in pickers; `build/rulings-product/scope.md`).

| id | screen | sev | kind | keys and what is wrong |
|---|---|---|---|---|
| DS9 | Opening a file | blocks | WORDS+FLOW, policy | `screen.open-file.deeper.about` adds "The safe view needs no check." beside `refusal.NO_SAFE_VIEW`; a member cannot look at their own photograph (screens-intake/open-file.mjs:123) |
| DS28 | Action, file template | blocks | FLOW+WORDS | `refusal.TEMPLATE_NOT_NAMED` says name a template; no control names one (filings/checks.mjs:148) |
| DS1 | Members, administrator capability at two admins | misleads | WORDS | `screen.members.cap.administer.confirm|.yes|.head` say "makes {who} an administrator"; the act only proposes (member-roster R11: every administrator endorses) |
| DS16 | A hidden project's address, invitation waiting | misleads | WORDS+FLOW | `shell.unavailable.nothing` says nothing is here; an invitation waits and Join is on Home only |
| DS17 | Project AI | misleads | WORDS | `screen.projectai.purpose` reads as if the assistant is ready; only `instance.test.notice` says not |
| DS21 | Public case page | misleads | WORDS | `public-read.bar_recorded_case` (capitals, doctrine prose) and `screen.published.is.leg.4.which.supports` (machine-like) |
| DS23 | Question, Document, public page | misleads | WORDS, policy part | "Capture" names two quantities (`strength.arithmetic.unrated_*`, `screen.published.strength.unrated`, the Document page's "Capture B") |
| DS7 | Document page and refusals | misleads | WORDS | engineering words to members: `capture.authority_basis`, `reading-pipeline.why.reader_found_entities`, `textchain.say.push.page_re_read`, `reading-pipeline.scanned_page_transcribed`, `acquisition.authority_basis.assertion_supplied_mechanical`, `refusal.CO_ATTESTATION_UNACKNOWLEDGED` |
| DS14 | Timeline | misleads | WORDS | `following.why.placed_nowhere_attestation` ("attestation"); `screen.timeline.dated.meta` "· grade" with no value |
| DS13 | Plan | misleads | WORDS+LAYOUT | no suggestions tray and no sentence why; tier not in the option row (`screen.plan.support.hypothetical`) |
| DS18 | Project page | misleads | LAYOUT | `screen.project.closenow.head` section drawn before documents and the first question |
| DS8 | Find, what this search covered | misleads | WORDS | `observation-log.partial.looked_got_part` beside a bare count; no covered row for partly read documents |
| DS2 | Start a project | misleads | FLOW | journey step 8 "with an objective"; the form has none (title written as objective) |
| DS4 | Queue and Home, Forward | misleads | FLOW+WORDS | one act, two names (`act.taskforward.label.home|queue`); rung and weight drawn nowhere |
| DS35 | Action resolution | misleads | FLOW | five fixed words, no box for its own outcome |
| DS10 | Add | misleads | FLOW | no sentence that a document can be filed into a project later, or that Add opens from the project |
| DS33 | Matter | misleads | WORDS | `screen.matter.routes.none` gives no cause |
| DS34 | Find in | misleads | WORDS | `screen.find-in.notread|.one` name neither which documents nor why |
| DS30 | Plan | misleads | WORDS | `refusal.SUBJECT_IN_ACTIVE_PLAN` says "which is named" and names none |
| DS19 | Publication ceremony | misleads | WORDS+FLOW | `ceremony.gate.other` sends the member away; the stops are put right on the same screen |
| DS12 | Standard | awkward | WORDS | "Its words as written" shows one passage with no sentence that the rest is not held; `screen.standard.inforce.none`, `label.standardcopy.undetermined` |
| DS20 | Ceremony, signing dialog | awkward | LAYOUT | raw signed lines by design (R41/R47): a plain reading beside them? |
| DS22 | Review copy, reader's page | awkward | LAYOUT+WORDS | acknowledgement a drop-down starting "–"; heading in capitals; two save steps |
| DS26 | Matter | awkward | WORDS | `act.successrecord.label.matter` and a bare "Choose" |
| DS27 | Standard | awkward | WORDS | `screen.standard.through.none.summary` unclear |
| DS31 | Request | awkward | WORDS | `capture.fieldneeded` inserts a capitalized label mid-sentence |
| DS3 | Project, who can find it | awkward | WORDS | `act.projectvisibilityset.label.project` states no outcome |
| DS11 | Find, passage count | awkward | WORDS | no singular ("1 documents"); "200 of 1809 files shown." borrows a Held row |
| DS15 | Document, Money | awkward | WORDS | `document.unread.pages` no singular; `screen.money.didnotmove` reads oddly |
| DS25 | Document pickers | awkward | FLOW, policy | other projects' document names; raw ids as option values |
| DS24 | Queue, ceremony | awkward | FLOW, policy | one item per key re-registration?; the device box's default |
| DS5 | Wizards guide | awkward | LAYOUT | two wizards as bare buttons in a list (guide.mjs:488-490) |
| DS6 | More | awkward | WORDS | `screen.more.sub` "below" is wrong at 1280 |
| DS29 | Action | cosmetic | WORDS | `screen.action.pressuremark.reply` "arrived with reply {ord}" |
| DS32 | Plan | cosmetic | LAYOUT | sort headings not announced (accessibility) |

Patterns: engine and doctrine sentences shown verbatim (DS7, DS14, DS21, DS23: one plain-wording pass); a sentence that sends the member away, or says nothing exists, while the next step is on the same screen (DS10, DS16, DS19, DS28, DS30, DS33, DS34: each refusal names its cause and its next control); outcome-stating labels (DS1, DS3, DS26); plurals and inserted labels (DS11, DS15, DS31, DS34).

## The five screen questions: facts (a reading worker, 2026-10-27; code at `tranche/T51b`)

1. **C-K2, a question's subject** (MAJOR; causes-C.md:16, W29, BQ13). Stored as the question's front matter `subject_entity` (ENT-…), projected by `inquiry/index.mjs:918-924`; no screen writes it; `SUBJECT_REFUSED` when the entity is not held (:594-599). With no subject, citation and leg-earning skip the connection map and every leg reads "Unrated" on Connection (DEC-15). Creating a question with a subject works (inquiry R11); no op changes the subject of an existing question (a new op, inquiry's job). C-K24: `resolve` finds no names in free prose. **Decide:** where "what this question is about" is stated (pick a followed person or organization at opening, or later), and what a question with none is told. A new act and maybe a new op: a requirement question, likely Bob's (placement-boundaries.md:71).
2. **C-K6, the team's fiscal year** (MAJOR; causes-C.md:47, W8). Money's `mf-fiscal` (`screen.money.f.fiscal`, money.mjs:192) sends `period:{fiscal}` with no body; `money/index.mjs:282-288` reads only profiles' `fiscal_year` and prints the body "*" (rows.mjs:11601). No team-level fiscal-year fact exists; the precedent is `@team/time_zone` (local-facts R21, R22, K5292). **Decide:** where a team states its fiscal year (an `@team/` fact beside the zone, a setting, or profiles only), so whether Money offers the field; never print "*". A new fact: likely Bob's (`[ruling]` in the walk).
3. **B-K19, a handed-in file's source link** (MINOR; causes-B.md:147, W27, W29, BQ31). "Source" means a doorbell knocker, not a member's upload (uploads have route `UPLOAD_VIA`, no URL). Today only the inbox knock detail links "A source" (`screen.inbox.source.line`, inbox.mjs:102-103) to `about-knocker` (screens-intake R43, DEC-375), whose intro says only listed members can read it. Held (held.mjs:108) draws "From knock:KNOCK-…" and loses the file name; Document draws no link. **Decide:** whether Document and Held carry an "A source" link, for which viewers. Touches source confidentiality: Bob's.
4. **D-K9, after an edition is published** (MINOR; causes-D.md:117, W15, W31, BQ24). The editor keeps "Draft: …" and the stale bias line; the ladder's "Not checked yet" is case-check's wrong answer (W15, a code fix). "Start the next edition" exists on Docket (`casedraft` with the case id, docket.mjs:96-147, R52, DEC-374), and the question's reopen note already links there. **Decide (design's):** a published case's editor reads "Published: edition N", drops the draft lines, and links to Docket's "Start the next edition".
5. **E-K7, the counsel packet** (MAJOR; causes-E.md:60, W32). `counselpacket` (filings/index.mjs:2515-2535) returns `{id CPK-…, version, head, sections, marking, privileged, purpose, disclosure, reason, basis_changed, …}`; counsel.mjs draws none of id, version, head, reason or basis_changed; a second press makes version n+1 unseen; `counselpacketread` (id, version) and `counselpacketexport` exist with no caller. Filings R11: never published; read only by a member who may see the action and every determination's project; export hands the bytes. **Decide (design's):** a made line (id, version, reason, basis_changed), the sections drawn, earlier versions readable, Export for those R11 lets read (marking kept).
