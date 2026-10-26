# Diagnosis of the BROKEN rows of walk-T51-final 07-money-time (K4426)

Record `origin/prep/final-07-money-time` (`build/plan/walk-T51-final/07-money-time.md`, read whole; script `scripts/07-money-time.test.mjs` read where a row's input mattered). Product read at `origin/tranche/T51` (`dafb6199eb`) in a detached worktree. Earlier diagnoses (diag-04, diag-09, diag-10a-05) cover no row of this record. `fix-round-10-T51.md` (whole) and `later-ux.md` read: they place nothing of this record except the two later-ux lines named in sections 3 and 9. Row KNOWN, skipped: R60 the kind box (E14, later-ux lines 94 and 109).

All paths are under `bio-plane/src/` (product) or `bio-plane/test/m/` (tests) of the worktree. "Platform: no" means nothing here depends on workerd or the deploy.

Fifteen BROKEN rows (7 MAJOR, 8 MINOR) fall into 13 causes. Summary:

| # | Rows | Verdict | Owner | One line |
|---|------|---------|-------|----------|
| 1 | R60 event never reaches a lane | DEFECT (MAJOR) | screens-investigate | "Record an event" sends one attestation with no date; the dated-fact act is deliberately apart; nothing joins them |
| 2 | R60 undated event's reason sentence | DEFECT (MAJOR) | events (then screens-investigate re-point) | events answers `grade_why` as a string; the screen draws only `{key, vars}` and shows the People stock sentence for anything else |
| 3 | R60 "· grade" with nothing after | DEFECT (MINOR) | screens-investigate | capture grade null drawn as `""` inside a fixed sentence |
| 4 | R62 undeclared-column sources accepted | SPECIFIED (MAJOR as walked) | calculations (only if BOB amends R1) | R1 refuses one-cell-per-line only; R45 pads short rows |
| 5 | R62 period "2026" accepted | DEFECT (MINOR) | money then calculations | `adoptBinding` checks only that a period value is a non-empty string |
| 6 | R62 repeat ingest writes every row again | DEFECT (MAJOR; requirement gap) | money then calculations | each fact gets a fresh minted id; nothing looks for the row already written |
| 7 | R62 re-declare with corrected roles answers `already: true` | DEFECT (MAJOR) | calculations | table key is the canonical bytes alone; roles and schema are not in it and the answer does not say they were dropped |
| 8 | R61 raw fingerprints in the SOURCE cell | ALREADY PLACED (later-ux line 84) | money / screens-investigate | `money.citation` builds the sentence with three raw hashes |
| 9 | R158 form asks for a fingerprint; plain text cited as a PDF page | DEFECT (MAJOR + MINOR, one cause) | screens-investigate | Explore's stepsource form is outside R34's list of screens that choose by title |
| 10 | Overlay 17 Timeline "Show me how" 94x24 | DEFECT (MINOR) | interface-shell | the phone rule does not name `.cs-wizmark` |
| 11 | Overlay 17 Explore six boxes 24x24 | WALKER-ERROR | none | the walker measured the input; the 44 px target is its label |
| 12 | Overlay 15/19 Document three unnamed buttons | NOT LOCATED | screens-inquiry | not reproducible on the scripted page; next step stated |
| 13 | Overlay 2/21 hidden project's money trail drawn | DEFECT (MAJOR) | money | `readSet` has no sight fence on the set's `concerns`; `moneySets` has |

---

## 1. R60 "an event recorded from a passage is placed on a lane with its date" - DEFECT (MAJOR)

### 1. Root cause, with evidence
The screen's act sends an event with one attestation that carries no date:
`screens-investigate/timeline.mjs:173` `return { body: { kind: String(cs.value("tl-kind") || "other"), attestations: [at] } };` where `at` is `view.parts.chosen(...)` = `{ captureSha, extent }` (`parts.mjs:148-157`).
The plane makes that an `extent` attestation with `value: null`: `events/index.mjs` `#attestationFrom` (the `a.captureSha !== undefined` branch) returns `{ form: "extent", ... value: null, precision: null, zone: null ... }`.
An event is dated only by its governing attestation, which is the latest choice or else the first attestation WITH a value: `events/index.mjs:646-660` (`#governingMany`: `AND a.serves='event' AND a.value IS NOT NULL`). With none, `#eventView` gives `when === null` and the event is listed in `placed_nowhere` (`events/index.mjs:1067`, `:1145`).
The other act the timeline offers, "Record a dated fact" (`timeline.mjs:178-186`, op `recorddatedfact` -> `datedfact`), writes a dated fact only. That is specified to be apart: screens-investigate R33 (5) "'Dated in the documents': a third list apart from the two lanes; it creates no event and is never merged into a lane". The two ops that would join them are `eventattest` (`events/index.mjs:1478`, `attest`) and `eventgovern` (`:1479`), and no screen sends either; `createevent` could carry `{ datedFactId }` as an attestation (`#attestationFrom`'s first branch) and the screen never sends that either. So every event a member records on screen is undated for good. The walker's lane case worked only because he used the door ops the screen does not offer (the row says so).
Not a walker error: the screen sends exactly what a member can send.

### 2. Why the module tests missed it
Every createevent test scripts the plane's answer and asserts only the body the screen sent: `fix2.test.mjs:23-26`, `fix3.test.mjs:63-66` (`assert.deepEqual(t.byOp("createevent")[0].body.attestations, [{ captureSha: SHA, extent: { kind: "pdf-page", page: 0 } }])`, which pins the undated shape), `fix2w2.test.mjs:202-227` (the stub records `shas` only). No test reads the timeline back from the real events module after a screen-made event. events' own tests build their dated events with a `value` in the call (`drawn.test.mjs`, `world.event({ value: ... })`), so the screen's shape never meets the governing rule.

### 3. Failing-first test
Through the real entry: press "Record an event" on the Timeline of a project holding a vouched document, then read the Timeline again, against the real plane. `bio-plane/test/m/screens-investigate/fix5-seam.test.mjs` (new; uses the module's own `real-plane.mjs`, as `fix4-seam.test.mjs` does): file a document, `recorddatedfact` "2026-03-03" from its passage, press `createevent` with the passage chosen, reload `/app/timeline/<project>`; assert the event is in the "What they did"/"What we did" lane (`world.items`) with March 3, 2026 and NOT in `placed_nowhere`. Red on the tranche: it is in `placed_nowhere`. (A door-only version, for BOB's choice of home: `bio-plane/test/m/control-plane/r8-timeline-event-lane.test.mjs` importing `r8-kit.mjs`; the screen version is the walker's case.)
Fix shape for BOB (a UX choice, since a member sees a new behaviour): either "Record an event" also reads the date field already on the form (`tl-date`), records the dated fact and sends `{ datedFactId }` as a second attestation; or a new act "Date this event" sends `eventattest` with that fact. The events module needs no change.

### 4. Owner
`screens-investigate` (`paths`: `bio-plane/src/screens-investigate/`; tests `bio-plane/test/m/screens-investigate/`). Depends on the platform: no.

---

## 2. R60 "an undated event is explained by a sentence a member can understand" - DEFECT (MAJOR)

### 1. Root cause, with evidence
Two modules disagree on the shape of `grade_why`.
events answers it as a finished English string: `events/index.mjs:1263-1265`
`...(placed ? {} : { grade_why: item.why && item.why.key === "events.why.cache_stale" ? word("events.why.grade_time_unread") : word("events.why.grade_placed_nowhere") }) };`
and `setup-words/index.mjs:32-36` `word()` returns a string (`fill(key, row[1], vars)`), here "placed nowhere: no attestation you can see dates this event, so none governs its time" (`setup-words/rows.mjs:5743`). (`events/index.mjs:1067` does the same with `word("events.why.placed_nowhere_attestation")` for the event view's `why`.)
The screen draws it with `P.why`: `timeline.mjs:124` `${x.grade_why ? ... P.why(cs, x.grade_why)}`, and `parts.mjs:53-56`:
`if (!(x !== null && typeof x === "object" && !Array.isArray(x) && held(x.key))) return cs.w("state.undetermined", { reason: { html: cs.w("people.why.owner_settle_validity") } });`
A string is not an object, so the screen draws the stock sentence "Undetermined, because its owner does not settle its validity" (`setup-words/rows.mjs:17116`). The screen was built for `{key, vars}` (its comment at `timeline.mjs:62`: "an event placed nowhere gives its `grade_why` as `{key, vars}`"; screens-investigate R44 and events R54 (1): "Every `why` this module answers with `undetermined` is `{key, vars}`, never English and never a string `word(...)` has already made"). R50 names `grade_why` ("saying no attestation dates it") and R54's list of keyed reasons does not name it, so events kept the string.
Note: `later-ux.md` line 38 ("Timeline · 'Undetermined, because its owner does not settle its validity' · E34") places this as a words item. It is not: the design's sentence for the case exists (`events.why.grade_placed_nowhere`) and is never reached. That line should be replaced by this cause.

### 2. Why the module tests missed it
Each half is green against its own stub: events asserts the string (`events/drawn.test.mjs:94` `assert.equal(it.grade_why, word("events.why.grade_placed_nowhere"))`, `:103`, `events/reasons.test.mjs:78`); screens-investigate feeds a hand-made `{ key: "events.why.placed_nowhere_event", vars: {} }` (`screens-investigate/fixtures.mjs:88`, `timeline.test.mjs:241-248`, whose control line even asserts that a bare string draws none of the module's English). No test draws the screen over the real events answer.

### 3. Failing-first test
`bio-plane/test/m/events/drawn.test.mjs` (R50 test, line 80): change the two `grade_why` assertions to `{ key: "events.why.grade_placed_nowhere", vars: {} }` and `{ key: "events.why.grade_time_unread", vars: {} }` (red: they are strings). And the walker's case through the screen: `bio-plane/test/m/screens-investigate/fix5-seam.test.mjs` - record an event on screen (undated, as in cause 1), reload; the undated section's text contains `word("events.why.grade_placed_nowhere")` and not `word("people.why.owner_settle_validity")`.

### 4. Owner
`events` (R50/R54 amended: `grade_why` and the event view's `why` are `{key, vars}`; `reasonText` in `events/reasons.mjs` gets both keys so callers that want English still get it). `screens-investigate` needs no code (it already draws a held key); check `WHY_KEYS` (`whywords.mjs`) carries both keys: it takes every `events.why.` row, so it does. Depends on the platform: no.

---

## 3. R60 "the dated-fact line reads '· grade' with nothing after it" - DEFECT (MINOR; null drawn as empty)

### 1. Root cause, with evidence
`screens-investigate/timeline.mjs:105` `cs.w(S + "dated.meta", { precision: ..., document: ..., grade: String(f.grade || "") }))`, and the design's sentence is `"{precision} · a dated fact, from {document} · grade {grade}"` (`setup-words/rows.mjs:5976`). A dated fact's grade is its capture's grade or null: `events/index.mjs:280-284` `#captureGrade` returns `g && g.grade ? g.grade : null`, written at `:#holdFact` (`grade: this.#captureGrade(sha)`). The walker's minutes were not graded, so `f.grade` is null, `String(null || "")` is `""`, and the sentence ends "grade ". The same screen draws an ungraded item with `cs.mark("gap", "unrated")` elsewhere (`timeline.mjs:64`); this line does not.
A null drawn as nothing is a defect, not a words item; the fix needs no new design word if the line draws the unrated mark in place of the grade.

### 2. Why the module tests missed it
The fixture only has graded facts: `timeline.test.mjs:200-201` draws `grade: "B"` and `grade: "C"`.

### 3. Failing-first test
`bio-plane/test/m/screens-investigate/timeline.test.mjs`, next to the R33 (5) test at line 200: a dated item with `grade: null`; assert the line does not end with `word("screen.timeline.dated.meta", ...)` filled with an empty grade (no trailing "grade"), and shows the unrated mark. Walker's own case also via `fix5-seam.test.mjs` (record a dated fact from an ungraded capture, read the line).

### 4. Owner
`screens-investigate`. Platform: no. (If BOB wants a design sentence for a fact with no grade, that is a words row for the UX stream; not needed for the fix.)

---

## 4. R62 "a source that does not split into the declared columns is refused naming the delimiter and the columns expected" - SPECIFIED (as walked)

### 1. Root cause / specification
The only refusal calculations R1 (G64 amendment) states is: "A source that is one cell per line against a declared header of more than one column is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`". The code does exactly that: `calculations/index.mjs:719-723` `if (names.length > 1 && widest === 1) return no("SOURCE_NOT_READ", ...)`. R45 adds "a short row is padded with empty cells and counted" (`tables.mjs` `tableBuilder`: "each row padded with empty cells to the header's width"). The walker's three inputs were:
- (a) a semicolon file whose lines have 3 cells against a 4-column header: delimiter found (`;`), `widest` is 3, not 1; rows padded, 2 rows with undetermined cells. Accepted per R1/R45.
- (b) comma, a 4-cell and a 1-cell line against 3 columns: refused `BAD_SCHEMA` by the wider-row rule (`tables.mjs` `take`: `data_row_cells`), which names the row and the widths, not the delimiter. The requirement does not ask the refusal to name a delimiter.
- (c) a prose letter: the comma in "Dear clerk, please send me..." splits line 1 into 2 cells against 3 columns; `widest` is 2; padded. Accepted per R45.
The sentence the walker checked ("refused naming the delimiter found and the columns expected (semicolon and pipe likewise)") comes from the coverage row, wider than R1's text. Not a defect against the requirement; the only one ever stated is one cell per line.
Observation for BOB, not a ruling: a table in which NO line reaches the declared width (c, and a) is accepted with every value undetermined, which a member probably did not mean. A narrow amendment would be R1: "a source in which no line splits into the declared number of columns is refused `SOURCE_NOT_READ {content_id, delimiter, columns_expected}`", leaving R45's padding of single short rows alone. A module-level rule for BOB (R45 pads on purpose), not Bob's.

### 2. Why the module tests missed it
`r7-delimiter.test.mjs:57` tests one cell per line only, as R1 states.

### 3. Failing-first test (only if BOB amends R1)
`bio-plane/test/m/calculations/r7-delimiter.test.mjs`: the walker's (a) (`payer;payee;amount\nCity of Oakland;Acme Paving;5\n` against a 4-column header) and (c) through `declareTable`; expect `SOURCE_NOT_READ` with `delimiter` and `columns_expected`; control: a table with one short row among full ones still pads (R45). Today (a) and (c) are accepted.

### 4. Owner
`calculations` (only on the amendment). Platform: no.

---

## 5. R62 "a binding whose period money cannot read is stated before the ingest runs" - DEFECT (MINOR)

### 1. Root cause, with evidence
`calculations/index.mjs:1833` accepts any `{ value: "<non-empty string>" }` for the roles kind, phase, stage, basis, currency and period: `} else if (!(plain(v) && typeof v.value === "string" && v.value.trim() && ["kind", "phase", "stage", "basis", "currency", "period"].includes(role)))`. Nothing asks money whether `"2026"` is a period. Money reads it only when a fact is recorded: `money/index.mjs` `#validate` -> `this.#period(input.period, view)` (line 269), refusing `MONEY_BAD_PERIOD` (`money/index.mjs:78-81`), so all 18,098 rows fail one by one at the ingest (342 of the first 400 shown, per the row). `#period` is private; money publishes no check a caller can use before writing.
The same applies to a binding value for kind/phase/stage/basis/currency that money's lists (`MONEY_KINDS`, `PHASES`, `STAGE_FAMILIES`, `BASES`) do not hold.

### 2. Why the module tests missed it
`money.test.mjs:93` and the g55 files adopt bindings with valid constants; no test adopts one money cannot read and expects it at adoption.

### 3. Failing-first test
`bio-plane/test/m/calculations/money.test.mjs` (the binding tests): `adoptBinding({ table, roles: { ...valid, period: { value: "2026" } } })` returns a refusal (a new code, e.g. `BINDING_PERIOD`, carrying money's `MONEY_BAD_PERIOD` reason) and writes no binding; control: `"2026-01-01/2026-12-31"` adopts. Today it adopts.

### 4. Owner
`money` first (publish a read-only `checkPeriod`/`checkConstant`, a provider job), then `calculations` calls it in `adoptBinding`. Both layer 5; calculations `uses` money. Platform: no. The wording of `MONEY_BAD_PERIOD` itself is already in later-ux line 68.

---

## 6. R62 "a repeat ingest of the same binding writes nothing twice" - DEFECT (MAJOR; a requirement gap, not a stated rule)

### 1. Root cause, with evidence
No rule makes it idempotent and the code makes it not so on purpose:
- `calculations/index.mjs:1956` `/* money is not idempotent by source: one running ingest to a binding */` guards only a RUNNING ingest (`ALREADY_INGESTING`).
- `ingestMoney` calls `money.recordFact(j.fact)` per row (`:~2000`) and `#write` mints a new id every time: `money/index.mjs:581` `const minted = this.#record.allocId("MNY", at.slice(0, 4));` with no look-up of an existing fact from the same `source_table`/`source_row`/`source_binding` (columns written at `:601`).
- calculations R14 says "each fact cites its canonical row as its source" and nothing about a repeat; money R7 makes a repeat `withdrawFact` idempotent, nothing else. "A repeat writes nothing twice" is the coverage row's expectation (`coverage/07-money-time.md`, R62), not a requirement.
So the second ingest wrote 15,512 new facts (new ids, as the row shows), and every figure of the register, and of a trail built from it, counts twice. A silent double count of money is a defect against the product's purpose even though no requirement names it; the missing sentence is calculations R14's.

### 2. Why the module tests missed it
All ingest tests ingest once per table (`g45-ingest.test.mjs`, `g55-ingest.test.mjs`, `money.test.mjs`); `g55-ingest.test.mjs:261` checks "every row once, none twice" within one act. No test ingests the same binding twice.

### 3. Failing-first test
`bio-plane/test/m/calculations/r14-repeat.test.mjs` (new; uses `g55-ingest`'s world): a 50-row table (inline path) and a 10,001-row table (background path), `ingestMoney` rows "all" twice (the second after the first is done); expect the second to write 0 and list each row `not_written` with a reason (e.g. `ROW_ALREADY_WRITTEN` naming the held fact), and money to hold N facts, not 2N. Control: a fact withdrawn after the first ingest does not block its row's rewrite (BOB's choice; recommended, since a withdrawn fact "never counts", money R7). Today the second writes N again.

### 4. Owner
`money` (an indexed read of a live fact by source row; `schema.mjs:24` holds the columns, no index) then `calculations` (R14 amended; `ingestMoney` and `ingestTick` skip rows already held). Platform: no, but the per-slice look-up must stay one query per slice for the 18,098-row background path (plane R105's speed rule; measured at the redeploy).

---

## 7. R62 "a payee registered between two ingests is seen by the second" (declaring again with corrected roles) - DEFECT (MAJOR)

### 1. Root cause, with evidence
`calculations/index.mjs:729-731`:
`const tableSha = built.sha; const held = this.#one(\`SELECT sha FROM calc_tables WHERE sha=?\`, tableSha); if (held) return { ok: true, already: true, ...this.#tableAnswer(this.#one(\`SELECT * FROM calc_tables WHERE sha=?\`, tableSha)) };`
`built.sha` is the SHA-256 of the header and the rows only (`tables.mjs` `tableBuilder`/`canonicalCsv`); `schema`, `roles` (the crosswalk names live in `roles`, `:690-698`) and `vintage` are not in the key. A second declaration of the same file with a crosswalk that now names the payee therefore answers `already: true` with the FIRST declaration's roles (`#tableAnswer` of the held row, `roles: parse(r.roles_json)` at `:779`), and the ingest resolves payees through the held row's roles (`#ingestCtx`: `declared: parse(t && t.roles_json)`, `:1935-1942`). Nothing in the answer says the new roles were not taken. R1 says the table is "keyed by the canonical bytes' sha256"; it is silent on a repeat with other roles, so keying is specified and the silence is the defect. (The vintage path, R3, is the only declared way to replace a table and it needs different bytes.)

### 2. Why the module tests missed it
`tables.test.mjs:120` declares the same file with the same roles and expects `already`; nothing declares it with different roles or schema.

### 3. Failing-first test
`bio-plane/test/m/calculations/tables.test.mjs`: declare a table with roles A, declare the same file with roles B (a different crosswalk table); expect either a refusal naming the roles that differ (e.g. `ALREADY_DECLARED_DIFFERENTLY {field}`) or a new declaration under a key that includes the roles; never `{ ok: true, already: true }` with roles A. Then the walker's two-ingest case through `ingestMoney`.
BOB to rule which: refuse (smallest; the member then supersedes by vintage or a new file) or key by bytes+roles+schema (a second table row with the same bytes; R1's key text changes).

### 4. Owner
`calculations`. Platform: no.

---

## 8. R61 "no raw fingerprint or id in the trail's words (the source cell)" - ALREADY PLACED: later-ux.md line 84

`later-ux.md` line 84 (fix round 5 §5, from re-walk B C59/C8): "Money · ... a raw capture fingerprint in SOURCE ...". Same cell, same cause.
Evidence for the update to that entry: the cell is `f.citation`, drawn as the link label at `screens-investigate/money.mjs:104` (`P.refOf(cs, f.source.capture_sha, f.citation || cs.w(S + "source"), ...)`); money builds `citation` at `money/index.mjs:723` from the design's row `money.citation` (`setup-words/rows.mjs:15680`: `"row {source_row} of the table {source_table}, read from capture {source_capture_sha} through the binding {source_binding}"`), filling three raw 64-character hashes (table, capture, binding). The entry names one fingerprint; there are three now. Raw ids in a member's sentence are a defect, so BOB may prefer to move it from later-ux to a job: the screen draws the document's title through `refOf` (it already can) and the row number, and drops the table and binding hashes; money's `citation` stays record data. Owner: `screens-investigate` (the draw) with `money` (the `citation` string and its word). Platform: no.

---

## 9. R158 "the form that attaches a source to a declared step chooses the document by title" and "the passage a step source cites is of the document's own kind" - DEFECT (MAJOR + MINOR, one cause)

### 1. Root cause, with evidence
Explore's "Attach a source to a declared step" draws two plain text fields: `screens-investigate/explore.mjs:114-115` `cs.field("explore-assert-sha", S + "assert.sha", { help: S + "assert.sha.help" }) + cs.field("explore-assert-page", S + "assert.page", {})` ("The document's fingerprint, as its page shows it."). `stepsource` reads them with `view.parts.passage(...)` (`explore.mjs:197`), which builds the extent from the page box alone: `parts.mjs:69-74` `return { captureSha: s, extent: Number.isInteger(n) && n > 0 ? { kind: "pdf-page", page: n - 1 } : { kind: "document" } };` - the walker typed page "1" for a plain-text memo and got `{"kind":"pdf-page","page":0}`.
Screens-investigate R34 ("Forms choose, they do not ask for a fingerprint", DEC-299 (8), (9)) names the screens that choose by title: "On `timeline`, `money`, `person`, `calculation`, `proceeding` and `standard`". `explore` is not in the list, though R17 says "a passage the member chooses". So the screen was never converted; the rule has a gap, and DEC-299 (9) applies to every form.
The plane does not catch the wrong kind: `connections/stepsources.mjs:81` `checkContentExtent(ext, CONTENT_EXTENT_DOCUMENT_ONLY)` where `content/extent-core.mjs:205` `CONTENT_EXTENT_DOCUMENT_ONLY = { known: false, chain: null, pageCount: null }` is a shape-only check (events, by contrast, checks the extent against the capture with `contentContextFor`, `events/index.mjs` `#extentRefusal`). With the picker (the passage chosen on the document's own words, `parts.mjs:148-157` `chosen`), the extent comes from the document's reading and fits its kind; the typed page box goes.
Hand-sent act correct, screen wrong: a hand-sent `{ kind: "document" }` for the memo is accepted; only the screen's page box makes the wrong kind.

### 2. Why the module tests missed it
`explore.test.mjs:166,183,222` fill `explore-assert-sha` with the digest and a page and assert the body; the R34 test covers the listed screens only; the words check does not read a field's label.

### 3. Failing-first test
`bio-plane/test/m/screens-investigate/explore.test.mjs` (R17/R34): the declared hop's form offers the project's documents by title (as `timeline.test.mjs`'s R34 test) and no field's label or help names a fingerprint or a page number; choosing the plain-text memo sends `extent: { kind: "document" }`. And the walker's case through the real plane in `fix5-seam.test.mjs`: attach the plain-text memo; the stored `step_source.extent` is `{"kind":"document"}`.
Needs BOB: an Explore screen has no project to list documents from (R34 picks "this project's documents first"): which documents the picker offers is a UX/design question for the design stream (the picker read is `heldcaptures` with `fields: "picker"`).

### 4. Owner
`screens-investigate` (R34 amended to name `explore`; explore.mjs). Optional second owner `connections` (R68: an extent kind the capture cannot have is `EXTENT_MALFORMED`). Platform: no.

---

## 10. Overlay 17 "Timeline at 390 px: tap targets at least 44 px" ("Show me how" 94x24) - DEFECT (MINOR)

### 1. Root cause, with evidence
The control is the wizard mark: `screens-wizards/guide.mjs:494` `<button type="button" class="cs-wizmark" data-guide="chip" ...>${head}</button>` with `head` = `wizard.marks.chip.one` "Show me how" (`setup-words/rows.mjs:920`). Its style is the design's: `civicsmith.css` `.cs-wizmark { display: inline-flex; ... padding: 3px 8px 3px 6px; ... font: 600 var(--t-xs)/1.2 ... }` (no height). The phone block of interface-shell raises the listed controls to 44 px and `.cs-wizmark` is not in the list: `interface-shell/index.mjs:360` `.cs-btn,button.mk-avatar,.cs-main a.cs-ref,.cs-main input:not([type=checkbox]):not([type=radio]),.cs-main select,.cs-tabs a,.cs-mast a,.cs-mast button{min-height:44px;min-width:44px}`. The same mark is on every screen with a wizard; the walker measured it on the Timeline.
Related, already placed: `later-ux.md` line 81 ("390 px · controls under 30 px ... the design stylesheet ask 2") covers other controls; it does not name this one.

### 2. Why the module tests missed it
`interface-shell/t50.test.mjs:488` asserts the `.cs-btn` rule is in the phone block; `b17.test.mjs:63` lists rules by text; `phone390.test.mjs` measures named screens' controls, not the wizard mark (drawn by screens-wizards, absent from interface-shell's fixtures).

### 3. Failing-first test
`bio-plane/test/m/interface-shell/phone390.test.mjs`: draw a screen with a wizard mark at 390 px (the harness for screens-wizards' chip) and assert `.cs-wizmark` has width and height >= 44. Cheaper first: `t50.test.mjs:488` pattern extended to require `.cs-wizmark` in the phone rule's selector list.

### 4. Owner
`interface-shell` (the phone rule in `index.mjs:360`; the design stylesheet is generated by `interface-assets` and is the design's). Platform: no.

---

## 11. Overlay 17 "Explore at 390 px" (six checkboxes 24x24) - WALKER-ERROR

### 1. Evidence
The six boxes are drawn by `cs.checks` as `<label><input type="checkbox" ...> <span>text</span></label>` (`interface-shell/browser.mjs:838-842`). The phone block deliberately keeps the box itself at 24 px (`interface-shell/index.mjs:361` `.cs-main input[type=checkbox],.cs-main input[type=radio]{width:24px;height:24px;flex:none}`) and makes the label the tap target: `:364` `:root:root .cs-main label:has(>input[type=checkbox]),:root:root .cs-main label:has(>input[type=radio]){display:flex;align-items:center;gap:8px;min-height:44px;box-sizing:border-box}`. The walker's script measured `input` elements ("every button, select, input and box"). A tap anywhere on the label toggles the box; the label is at least 44 px high. (Read from the code and the rule, not drawn in a browser here: if BOB wants it proved, one measurement of `label` boxes at 390 px closes it.)
Owner: none. Platform: no.

---

## 12. Overlay 15/19 "Document: three controls with no accessible name" - NOT LOCATED

The walker's list is `button[button]#.cs-btn` three times, with no `data-act`, and his test (`scripts/07-money-time.test.mjs:609`) counts a control unnamed when `aria-label`, `innerText`, `value` and `title` are all empty and it has no `labels`. Every `cs.act` button draws its label as its text (`interface-shell/browser.mjs:704-706`), so a `cs-btn` button with no text needs an act whose label word is empty or a button made elsewhere.
I drew the Document page over the scripted plane (`screens-inquiry/fixtures.mjs`) in two states (plain; with a person's mentions, a connection and a thread to a progression) with a probe test and listed every button/input/select/textarea with an empty name: no button; only labelled inputs (the walker excludes those). The 14 buttons the page draws all have text. So the three buttons appear only in the walker's state of the room (a document that is asserted/connected/threaded, with dated facts) and are not in the scripted pages. The walker's record does not give their `data-act` or text, so the cause is not stated.
Next step (one action): rerun that one check in the walker's room printing `e.dataset.act` and `outerHTML` of the three. Owner on finding: `screens-inquiry` (document.mjs) unless the act is another module's. Platform: no. MINOR, so BOB may hold it for the re-walk.

---

## 13. Overlay 2/21 "a member who cannot see the project opens its money trail" - DEFECT (MAJOR)

### 1. Root cause, with evidence
`money/index.mjs:942-957` `readSet`:
`const set = this.#one(\`SELECT * FROM money_sets WHERE set_id=?\`, setId); if (!set) return { ok: true, found: false, set_id: setId }; ... return { ok: true, found: true, set: { set_id, purpose, label, concerns: set.concerns, by, at }, inclusions, exclusions, proposals };`
Only the facts are filtered by the viewer's sight (`#factRow(p.fact_id, viewer)`, `#setState`). The set's own row (label, the project id in `concerns`, who and when) is answered to anyone who has the set's id. The sibling read has the fence R28 states: `moneySets` (`:970-976`) `const held = ...; const rows = held && !this.#visibleBundle(id, v) ? [] : ...` ("An id that names a bundle the viewer may not see is answered exactly as an id that names nothing"). The screen draws what `moneyset` answers: `screens-investigate/money.mjs:21` (`trail: { op: "moneyset", query: { id }, subject: true, empty: (v) => !v || v.found === false }`) and `place` (`money.mjs:~30`) reads `t.value.set.concerns` as the breadcrumb project, which is how the project's id (it carries its title) reaches max's screen. The screen already treats `found: false` as "Nothing is here", so the fix is entirely in `readSet`: a set whose `concerns` names a bundle the viewer cannot see answers `{ ok: true, found: false, set_id }`, exactly as an absent set.
Hand-sent act and screen alike: the plane gives the answer.

### 2. Why the module tests missed it
`money/moneysets.test.mjs:38` ("a project the viewer cannot see lists none and names none") tests the list read only; `sets.test.mjs`/`trail.test.mjs` read sets as the creating member. No test reads `readSet` as a viewer without sight of the concerned bundle.

### 3. Failing-first test
`bio-plane/test/m/money/moneysets.test.mjs` (next to the R28 fence test, same fixtures): start a trail in a fenced project; `readSet({ setId, viewer: OUTSIDER })` equals `readSet({ setId: "MSR-2026-9999", viewer: OUTSIDER })` in shape (`{ ok: true, found: false }` with only the asked id); control: the member with sight gets the set. The walker's case through the door and screen (member `ann` starts a trail, plain member `max` opens `/app/money/<trail>`): `bio-plane/test/m/control-plane/r8-money-trail-hidden.test.mjs` importing `r8-kit.mjs` (a through-the-door test belongs to control-plane), expecting `moneyset` as max `found: false` and the screen's "Nothing is here".

### 4. Owner
`money` (R12/R13 amended with R28's fence). Platform: no. Other callers of `readSet` without a viewer (`viewer ?? ""`) keep the internal reading; check them when the fence goes in.

---

Notes for BOB (not rows):
- Causes 1, 3, 9, 10 and 12 are `screens-investigate`/`interface-shell`/`screens-inquiry`, layer 11; 2, 5, 6, 7, 13 are layer 5 (`events`, `money`, `calculations`): the layer-5 fixes land first for 2, 5 and 6 (providers), then the screen re-point if any.
- Cause 1 and cause 9 each need a design decision a member will see (how a recorded event gets its date; which documents Explore's picker offers); they go to the UX stream with BOB's recommendation, the rest are technical.
- The second `bindingadopt`/`tabledeclare`/`moneyingest` rows of the record that were WORKS were not re-read.
