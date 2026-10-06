# consequences (T33)

**Status** · session_01RYCDtWu8Z5BpxAe2DjCh9W · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Six points; I carry on with each on my best reading.
(1) The START question (Suggestions, T33-71): stored float values. Reading: no row is rewritten (R6, R13). On every read a stored JSON number is answered as the exact decimal of its shortest round-trip form, read through calc-grammar's parseFigure; new inputs may give a value as a decimal string or a JS number, both read through calc-grammar (a number through its shortest decimal form; an exponent form such as 1e21 is MEASURE_INVALID). Values are held and answered as decimal strings ("1200.50"). escalation, filings and affordances pass numbers today and keep working.
(2) Uses. modules.json's consequences row lacks calc-grammar, money, calculations and people, which the requirements' Uses gain. R10 also needs `entities`: `readEntity`, for AFFECTED_NOT_A_PERSON and for the person's label and aliases. Reading: the uses become record-grammar, record-core, membership, promotion, provenance, content, entities, inquiry, strength, conformance, calc-grammar, money, calculations, people. Please add `entities` to Uses and these five edges to modules.json; my COMPLETE states the final list.
(3) calculations.read is async, and consequences' acts and reads are synchronous; escalation, filings and affordances call them synchronously. Reading: consequenceRecord and consequenceRevise answer a Promise only when a calculation operand is named, and otherwise stay as they are. Reads must stay synchronous, and R15 then needs a synchronous answer to "may this viewer see calculation X". strength already codes against `calculations.gradeFactsOf` for the same reason. Proposal: calculations gains a synchronous read, such as `read` made synchronous or a `gradeFactsOf({calcId, viewer})` that answers found/visibility. Until it exists I use it when present; otherwise a calculation operand is withheld from every member viewer (fail closed, `out_of_view: true`), and its value and grade stand.
(4) people: R16's "withheld from every viewer the link's sight does not admit" needs to know whether a person has any source link at all. `sourceLinksOf` answers only to a listed member, so "no link" and "a link that does not list me" read alike. Proposal: people gains an internal synchronous `sourceLinkSight(person)` → `null` or the list of members, never answered to a viewer. Until then I use it when present; otherwise a person is shown only to a viewer `sourceLinksOf({person, viewer})` lists (fail closed), so R16's first sentence waits on it.
(5) Details I take as mine unless you say otherwise. A calculation operand is `{calculation, key}`, `key` a step name in its results (or `output`), its figure calc-grammar's. A money operand is `{money: MNY-…}`. A content operand stays `{content, figure}`. `named_in` holds the person when its passage text (content.passageText), whitespace-folded and case-folded, contains the entity's label or a live alias. `ratio` divides with calcs' RATIO_DEFAULT (12 places, half_even), stated on the part. New rows: C-114.21 AFFECTED_PERSON_NOT_NAMED and C-114.22 AFFECTED_NOT_A_PERSON. C-114.5 AFFECTED_INDIVIDUAL is retired and its number not reused. UNIT_MISMATCH and SUM_MIXED_* pass through with their owners' codes and no C-114 row, as calculations passes them.
(6) Generated artifacts this may make stale (not mine): `test/m/control-plane/rows-before-r43.json` and `test/fixtures/row-census-1.60.0.jsonl` name C-114.5. control-plane's families test is already a named red until T33-89.

## J2 · REPORT

Findings outside consequences, for routing. None of them blocks this job.
(1) plane: the tracked bundle `bio-plane/dist/bio-plane.bundled.mjs` is plane's generated artifact. This job makes it stale: consequences now imports money, calculations, entities, people and calc-grammar, and `figures.mjs` is deleted. It needs regenerating at plane's next build (§5.6, as at the L8 close). I did not touch it (mechanics §14).
(2) K1619 against the architecture check: my fixture still migrates connections' tables through `inquiry.connections`. Building connections on the host directly means importing `connections`, which is not consequences' use, so architecture refuses it (it does so for events, lines and duties too, which I no longer build). Everything else is built on the host directly: entities, money, calculations, people. connections can leave inquiry's getter only once a module I use exposes its migration, or the plane composes a test host.
(3) calculations (N576): a synchronous sight and read of a calculation (strength's `gradeFactsOf` shape answering `found`). Until then R15 withholds a calculation operand from every member viewer, even the part's author, and its value and grade stand. The answer to the act that records it also withholds it from its own author.
(4) people (N600): `sourceLinkSight(person)`. Until then R16 shows a person only to a viewer some link lists. My tests stand it in over people's own table, and the fail-closed fallback is tested against the real people.
(5) calc-grammar R3 is proved by its own figures test (its one stated difference: "(-5)" is refused as two signs, which the deleted parser read as -5). No consequences caller depended on that form.

## J3 · COMPLETE

**Entries applied.** T33-71 in full.
- B1b.6 and C:A-11, R2: `figures.mjs` is deleted. Figures are read by calc-grammar's `parseFigure`, and sum, difference, product and ratio are calc-grammar's `add`, `subtract`, `multiply` and `divide`. A ratio uses RATIO_DEFAULT (12 places, half even), and the part states it. Operands are `{content, figure}`, `{money}` (`money.readFact`, the amount as held, its reading grade) and `{calculation, key}` (`calculations.read`, a step of its results or `output`, the capture axis of its grade facts). calc-grammar's `UNIT_MISMATCH` and money's summation codes (`summable`, asked for sums and differences over two or more facts) pass through with their owners' codes, and nothing is written.
- Terms and R1: values are exact decimal strings. A string or a JS number is read through calc-grammar; `MEASURE_INVALID` covers values that do not read, and reversed ranges compared exactly. Stored numbers are read as exact decimals and never rewritten (K1649 (1)).
- R10: kind `person` with `{entity, named_in}`. `AFFECTED_NOT_A_PERSON` is C-114.22 and `AFFECTED_PERSON_NOT_NAMED` is C-114.21; a passage names the person when it holds the label or a live alias, folded. `AFFECTED_INDIVIDUAL` (C-114.5) is retired.
- R16: a person is withheld whole (`{kind: person}`, `out_of_view: true`) from a viewer who may not see the passage's capture, or whom a protected source's link does not admit. That is fail closed until people's `sourceLinkSight` (N600). The person never enters the CONS- document or title.
- R15 covers money and calculation operands; a calculation is fail closed until calculations' synchronous read (N576).
- An act naming a calculation operand answers a promise, which the plane frame awaits. Every other act and read stays synchronous.
- Schema: `consequence_operands` gains `kind`, `result_key` and `exact`, added by ALTER to existing tables.

**Final uses:** record-grammar, record-core, membership, promotion, provenance, content, inquiry, strength, conformance, entities, calc-grammar, money, calculations, people (as modules.json, K1649).

**Deferred:** none in consequences. The fail-closed arms of R15 and R16 lift when N576 and N600 land; each has a test for today's behaviour and one for the service.

**Found elsewhere:** J2 (plane's stale bundle; K1619 against the architecture check for connections; N576, N600; calc-grammar R3's "(-5)").

**Tests and checks**
- `node --test test/m/consequences/`: tests 38, pass 38, fail 0 (six files; `person.test.mjs` is new).
- The suites of consequences' users (filings, escalation, affordances, control-plane, plane, actions, op-declarations): 656 tests, 12 fail. All 12 also fail on `tranche/T33` @ ac0df40 and are named reds; none is new.
- format: 126 modules, 125 requirements files; 0 failures.
- architecture: 11 product files, 49 relative imports; 0 failures.
- coverage: 1 module, 16 of 16 live requirement ids named by a test; 0 failures.
- ownership: 12 files changed by consequences between tranche/T33 and HEAD; 0 failures.

Size (session_01RYCDtWu8Z5BpxAe2DjCh9W): test runs 17, module lines 1438
