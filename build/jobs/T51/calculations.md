# calculations (T51)

**Status** · session_015P7YZfAbM7iah2fh9UyBGM · depth 2 · WORKING · handled B14

## J1 · REPORT

Completion of T51-192 (calculations, words). Branch job/T51/calculations @ 635ae7444c (merged tranche/T51 first, no rebase).

**Entries applied.** The 17 findings of build/plan/words-pass/calculations.md, each by the words rule:
- Copies of an existing row now read through word(): calculations.body_measured (application.mjs), calculations.why.entity (index.mjs), calculations.obligor_office and calculations.proceeding_arose (patterns.mjs), calculations.says.per_period_measured (application.mjs; the design row's spelling "labeled" now applies), calculations.why.capture_alone_reads (index.mjs, grade filled).
- Plain or inline sentences with no row are localize(id, en): calculations.application.the_share_of_each, calculations.index.an_id_space_normalises, calculations.index.an_organisation_and_a_date, calculations.index.the_change_is_a_held, calculations.tables.a_table_schema_is.
- R3 (tablesAt, and rosterRows' not-read reason): a keyed civil-time why is read through reasonText, so the vintage reason names its cause in words (was "[object Object]"). R3's test is green.
- Test copies: four assertion messages that restated a product sentence were dropped (analysis x2, money, registrations, application); the copied NO_EVIDENCE_STORE detail in tables.test.mjs compares with localize(id, en) by equality, as connection-grammar's tests do.
- Wording choice for BOB to confirm: the NO_CHANGE detail was "the change is {standard} or {date: YYYY-MM-DD}"; localize fills {standard} as a placeholder, so it now reads "the change is a held standard's version or a date (YYYY-MM-DD)". No row existed; no test asserted the old text.

**Deferred.** None within T51-192.

**Found in another module.** None to route. Two words-check hits in case-checker and case-grammar are their modules' (not touched).

**Red, not in the entry, pre-existing at baseline.** R32 freezeUses (application.test.mjs:73, "relationships names the direct ties valid at the act's when"): expected "contract;former_employment" for the act's relationships, got "" (no tie found). Same failure before my change. Not named in rule 5; I did not diagnose it (the fixture uses connection-grammar's default registry, so the cause may sit in lines' owner registration or #ties). BOB to route.

**Checks (civicos-process checks, product /home/user/bio).**
- format: 175 modules, 174 requirements files; 0 failures
- architecture calculations: 15 product files, 70 relative imports; 0 failures
- coverage calculations: 41 of 41 live requirement ids named by a test; 0 failures
- ownership calculations tranche/T51 job/T51/calculations: 10 files changed by calculations (nine sources and tests, plus the job record); 0 failures
- words calculations: 0 failures (was 17)
- setup-words build --check: rows.mjs is stale (expected; BOB regenerates at layer close); no refusal naming calculations
- run.mjs (whole repo): no failure naming calculations; the others are other modules' words findings (3784 across 174 modules, not mine)
- module tests, test/m/calculations (57): before 55 pass, 2 fail (R3, R32); after 56 pass, 1 fail (R32, the baseline red above)

Size (session_01Tcs5UBSYhkZ5nthcyxpECc): test runs 3, module lines 3403

## J2 · COMPLETE

T51-192 calculations complete at 635ae7444c (job record J1 is the REPORT). Words check 0 failures; format, architecture, coverage, ownership 0 failures; calculations tests 56 of 57, the one red (R32 freezeUses relationships) was red before this job and is reported in J1. Merge decision and the R32 red are yours.

## J3 · REPORT

Answer to CHANGE B2 (R32 red, application.test.mjs:73). Diagnosed; the cause is in another module, lines. Calculations is not changed for it.

Evidence. A temporary probe of the test's world (since deleted) called the connection registry's neighbours with the test's own holds/contracts_with lines. For lines, two kinds answer a refusal instead of items:
- line:contracts_with -> {"refused":"OWNER_NONCONFORMING", "failures":[{"check":"at", "why":"LIN-… is marked undetermined, but its reason is not a key with the vars the word list fills, nor a localize id"}]}
- line:holds:employee -> the same refusal.
Every other kind answers {"items":[]}. The check that refuses is connection-grammar/src/reads.mjs:78 (reasonFills), which requires an undetermined `at` reason to be a {key, vars} row or a localize id.

Where lines makes such a reason. In bio-plane/src/lines/index.mjs: :351 `why: "cache stale"` (a plain string); :354 `why: String(e.message || e)` on a validAt throw; :360 `why: word(...)`, an English sentence, not a key, and the fallthrough `why` that the line holds; :600 `{undetermined: true, why: "cache stale"}`. An `at` answer from lines' validity reads gives a plain string that the neighbours contract refuses.

Effect. calculations' #ties (index.mjs:1816–1840) reads only `items` from neighbours; a refusal yields no ties, so relationships is '' for an act that holds a contract and a former employment. The calculations code matches R32 as written.

Route to lines' running job. Its undetermined `at` reasons should be keyed (civil-time reasons pass through as {key, vars}, as K3958 says), and the R32 test (which names relationships) then reads "contract;former_employment" as expected. No calculations change is needed.

On B2's NO_CHANGE wording: accepted, noted.

## J4 · COMPLETE

COMPLETE again after K3993 (B2). NO_CHANGE wording accepted as is. R32 freezeUses red is the lines module (its undetermined at reasons, lines/index.mjs:351-600, not keyed); reported in J3 for routing. Calculations module: words check 0 failures; the one red remains until lines fixes it.

## Round 6 · G24 (START B3, CALCULATIONS #7)

**G24, a pattern's denominator says when it is a sample (K4571, S14).**

1. **Root cause.** `patterns.mjs` gathered at most `UNITS_MAX` (2,000) units by `slice` (decided transitions :67, flow instances :85) or by stopping the loop (posting units :152), and the denominator's `n` was the count kept. The comment's "next run's cursor" did not exist: a run past the bound was a sample shown as a census. Also found in the same loop: the `break` at :152 left only the inner loop, so a later meeting could add units past the bound, and `eventsFor`'s own `limit: 500` answer `truncated` was dropped.
2. **Why the tests missed it.** No requirement said a bound must reach the member and no test took a pattern past 2,000 units. Gap closed by `bio-plane/test/m/calculations/patterns-bound.test.mjs` (R22).
3. **Failing-first, through `runPatterns` over real duties (declared and recorded in the duties module).** Red before the fix: 2,500 decided transitions, `duty_lateness` and `office_lateness` denominators `n: 2000`, `capped` undefined (assertion "stated as a sample": undefined, expected true). Green after: `capped: true`, `of_total: 2500`, `n: 2000`, on the run's denominator and on each group's own. Controls: 1,500 transitions, `n` 1500, no `capped`, no `of_total`. The same for the flow pattern over 2,500 and 1,500 open instances.
4. **Fix.** `decidedOccurrences` and the flow gather count the whole before the cut and state `capped: true` and `of_total` (the whole) in the denominator; the posting pattern states `capped: true` (with `of_total: null`, the whole is not counted without reading every meeting) when it stops at the bound or any body's meetings are listed only to `eventsFor`'s limit, and its loop now stops at the bound. A denominator never flagged when the gather was whole.
5. **Platform check.** N. **Stored data (R-OLD).** New runs only: a stored run or result keeps the denominator it was written with; the next `runPatterns` writes the stated one. Words: no new sentence. Census ops: no op's accepted keys change (`patternResults` answers two more keys inside `denominator`).
6. **Not met / deferred / open:** none.

Tests run: `node --test --test-force-exit bio-plane/test/m/calculations/` 65 pass, 0 fail (the R32 red of J3 now passes after merging `tranche/T51`). Checks (process repository `checks/run.mjs`): format, architecture, coverage, channels, words 0 failures; ownership 0 failures.
Users: `impact.mjs` names 78 modules through the shared table; no module outside calculations calls `runPatterns`, `patternResults` or `onPatternResult` in source or tests (searched), so no user's suite was changed by this job.

Size (session_013Qn9ospdGZ85m84zbBg6sF): test runs 6, module lines 3428

## J5 · COMPLETE

G24 done at 60e1b785bf. A pattern's denominator now says capped: true and of_total (the whole) whenever its gather stopped at the 2,000 bound (duty transitions, flow instances; posting says capped with of_total null, and its loop now stops at the bound). Failing-first through runPatterns over real duties: 2,500 transitions red (n 2000, unflagged), now capped/of_total 2500; 1,500 control unflagged; same for flow. Calculations 65/65 green (R32 red now passes after merging tranche/T51). checks/run.mjs and ownership: 0 failures. Platform N; new runs only; no new words, no census key change. Nothing deferred. Record: build/jobs/T51/calculations.md, section Round 6 G24.

## J6 · BLOCKED

BLOCKED · cause: provider not merged (your merge order); not tests, not Bob, not context (about 12 % used).

Read in full: the START's reading set (plan section 0 and G41, diagnosis-R6-g41, g40 sections 1-3, rulings K4630-K4642 via grep of the lines, my requirements, calculations/index.mjs sites). Merged tranche/T51 at 4dbc2cc2be into job/T51/calculations. No code changed yet.

What blocks the entry. On tranche/T51 (and on every provider's job branch, which differs from tranche only by mail commits, checked with git diff):
1. TEST-SUPPORT #9's preload is not on tranche/T51: bio-plane/test/platform-sqlite.mjs does not exist; it sits only on job/T51/test-support (5a7d10faee). The START says: if its file is not yet on tranche/T51, merge it first, and if still not there post BLOCKED naming it. I do not merge another job's branch.
2. content.cellsAt is still synchronous (content/index.mjs:1286, #officeOf :1273 reads reading.cells only); no cellsOf in extraction, no cells_held / inlineCellsMax anywhere in csv-reader, office-readers, reading-pipeline, extraction. The START says "providers content #18 and extraction #38 are merged"; they are not (their sessions CONTENT #19, EXTRACTION #38 have just started, only START mail commits so far).

So my failing-first tests (a)-(c) through the real merged content and extraction cannot be written red for the stated reason, and an await on a sync cellsAt would change nothing I can prove. I can write the code against the contract now (await content.cellsAt at :380, :688 and in #engineOf with its callers; cells_truncated and failed cellsAt answer an explicit undetermined engine; range over CELLS_RANGE_MAX stated), but I will not claim red/green without the providers.

Smallest thing I need: CONTENT #19 merged into tranche/T51 (with csv-reader, office-readers, reading-pipeline and extraction before it, per your order) and TEST-SUPPORT #9's preload merged. Tell me by CHANGE or RESUME when they are in; I will then merge tranche/T51 and do the entry. If you would rather I start the code now against the contract and add the real-path tests after the merge, say so in an ANSWER.

Record housekeeping: the Status line conflict from my mail start (a restarted job keeps its cursor) was resolved to handled B3 then advanced by mail done to B4.

## Round 6 · G41 (START B4, CALCULATIONS #8) — in progress, code and tests written, seam red by name

**What changed (`bio-plane/src/calculations/index.mjs`).** `#engineOf` (was sync, :327) is now `async #engineFor(row)`: it awaits `content.cellsAt` inside its try, memoises the mark per content id (`#engines`), and answers `UNDETERMINED_ENGINE` (`{name:"undetermined"}`, never null) on `cells_truncated` or a failed/rejected `cellsAt`; `#withEngine` turns that into `grade: null`, `engine: "undetermined"`, `engine_measured: false`, why a `localize` stand-in (`calculations.index.its_cells_could_not_be`; row owed). `#sourceRows` awaits `cellsAt` in its try and states a truncated answer as the table's fault (`SOURCE_NOT_READ`, `calculations.range_cells_held` with `cells_truncated`), nothing written. `#bind` awaits the figure's `sheet-cell` read (and warms its mark), warms a table's mark before `#tableGrade`, and warms a calculation input's inputs. `readTable` and `read` warm before grading. New helpers `#warmEngines`, `#warmTable`.

**Design point for BOB (QUESTION J7).** `#tableGrade` and `#gradeFacts` stay synchronous, because `gradeFactsOf` (R30, "answers synchronously") and the duties registration (R19, sync) call them and other modules (strength, duties) rely on that. So "carry the await up to the async entry of each caller" is done at every async entry (`declareTable`, `readTable`, `#bind` for create/evaluate, `read`), and the sync reads use the mark those entries last made. A table already records its engine at declaration (`source_json.engine`), so tables never need the sync fallback. A figure's mark lives in memory: after a restart, a sync `gradeFactsOf` of a figure input answers the explicit undetermined engine (fail closed, never null) until an async entry (create, read) re-makes it; `read` always does.

**Tests (`test/m/calculations/g41-cells.test.mjs`, `fixture.mjs` gains `cellsOf` forwarding).** Part 1 over a content provider that answers `cellsAt` as a promise (as merged CONTENT #19 will), seen red on the unchanged module (5 of 5; the control (d) is red there only because the provider is async) and green after: 5,000 x 4 formula workbook declared and graded with the file engine as a small one; a figure citing a formula cell; truncated and rejected `cellsAt` give engine "undetermined" in `read` and `gradeFactsOf` alike; a truncated range is a stated fault, nothing written; small sheet control. Part 2, the seam (a), (b): the 1 MB CSV read by the real extraction, a `sheet-range` of its last 100 rows declared, a last-row `sheet-cell` figure evaluated, through the real content. Today without the shim both are green (node:sqlite has no value limit); under TEST-SUPPORT #9's preload (a copy of `job/T51/test-support`'s `bio-plane/test/platform-sqlite.mjs`, used from scratch, not committed) both are red: `string or blob too big` from the 11 MB reading write. They stay red by name until CSV-READER, OFFICE-READERS, READING-PIPELINE, EXTRACTION, CONTENT and TEST-SUPPORT merge.

**Suites/checks.** calculations 72 pass, 0 fail (65 before + 7). Users run: strength, workbooks, public-read, hypotheses 513 pass; case-authoring/case-grammar calculations tests, consequences, reevaluation 237 pass. `checks/run.mjs`: format, architecture, coverage (43 of 43), channels, words 0 failures; ownership 0 failures. `impact.mjs` names 174 modules; no provided signature changed.

**Requirement lines I propose (BOB writes them).** R1: a source range whose cells the provider answers `cells_truncated` (over the cells limit) is refused `SOURCE_NOT_READ` naming it, nothing written, never a short table. R9: an input whose cells could not be read (a failed or truncated `content.cellsAt`) carries `engine: "undetermined"`, `engine_measured: false`, grade undetermined with why, never `engine: null`; the synchronous reads (R19, R30) answer the mark the last asynchronous entry made, and a sheet input not yet made answers it undetermined. Row owed: `calculations.index.its_cells_could_not_be`.

Size (session_015P7YZfAbM7iah2fh9UyBGM): test runs 9, module lines 3,473

## J7 · QUESTION

QUESTION (my best reading applied; details in my record, section "Round 6 · G41", pushed): G41 code and tests are written and green except the two seam tests, which are red by name until the providers and TEST-SUPPORT #9 merge (seen red with a scratch copy of its preload: "string or blob too big").

The question: the START says make #engineOf async and carry the await up to each caller's async entry. #tableGrade and #gradeFacts also serve gradeFactsOf (R30, "answers synchronously") and the duties registration (R19, sync), which strength and duties call, so I kept those synchronous and did the awaits at every async entry (declareTable, readTable, create/evaluate, read), keeping the engine mark in a small in-memory map. A table's engine is already stored at declaration, so tables are unaffected; only a figure input's mark is in memory: after a restart, a sync gradeFactsOf of a figure input answers the explicit undetermined engine (fail closed, never null) until create or read re-makes it. Is that acceptable? If not, the alternative is to persist the figure's mark with the calculation's inputs (a column in calc_inputs, written at create), which is more change; tell me and I will do it.

Also: please post CHANGE as each provider lands; I will merge tranche/T51 and re-run the seam tests under the real preload. I cannot COMPLETE before that (the seam must be green), and I am not carrying anything "not met".

B6 (K4647, ranged-cells numbering 1-based, inclusive): a seam test now asserts it at both ends through declareTable/readTable (row 1 is the CSV's header row, column 1 is A; the last row is row `lines`); green today on the inline cells, and it stays the check under the new providers. calculations 73 tests.

**B7 (K4650) applied: the figure's engine mark is persisted.** `calc_inputs` gains `engine_json` (`schema.mjs`, migrated like the other added columns; census table unchanged). `create` writes a figure input's mark (JSON `null` = no engine, `{name, version}`, or the undetermined mark) from the async `#engineFor` it made in `#bind`; `#gradeFacts` reads it through the synchronous `#figureEngine(calc_id, input)` (R19, R30 paths), a row without one answers the explicit undetermined engine. `read` (`#warmEngines`) makes the mark again and writes it where the row holds none or holds an undetermined one (R-OLD repair, new rows unaffected). `#tableGrade`/`#gradeFacts` stay synchronous. Tests added (`g41-cells.test.mjs`): fresh instance over the same database answers the stored mark (engine, and "no engine" stays null); an old row (mark removed) answers undetermined, then one `read` makes and writes it; an undetermined stored mark is repaired by a read. Calculations 75 pass, 0 fail; users (strength, workbooks, public-read, hypotheses 513; case-authoring and case-grammar calculations tests, consequences, reevaluation, duties, people 391) 0 fail; `checks/run.mjs` 0 failures. Proposed R9 line (BOB writes): a figure input's engine mark is stored with the calculation's inputs at create and read by the synchronous grade facts; a calculation stored before has none and answers the explicit undetermined engine until one `read` makes it and writes it. Seams still red by name under the preload: the two 1 MB CSV tests (providers unmerged).

## J8 · REPORT

REPORT: B7 (K4650) applied and pushed. A figure input's engine mark is persisted (calc_inputs.engine_json, written at create, read by the synchronous gradeFactsOf/duties paths); old rows answer the explicit undetermined engine until one read makes and writes it. Tests for restart and old rows added; calculations 75/75, users 904 pass, checks 0 failures. Detail in my record (section G41, "B7 applied"). Still waiting only for the providers and TEST-SUPPORT #9 (the two 1 MB CSV seam tests are red by name under the preload). Post CHANGE as each lands.

## Round 6 · G41 · COMPLETE (after B12; merged tranche/T51 at CONTENT #19, RETRIEVAL-BROWSE #4, with every provider and TEST-SUPPORT #9)

**What changed.** `bio-plane/src/calculations/index.mjs`: `#engineFor` (async, awaits `content.cellsAt` in its try, memo `#engines`), `#engineOf` (sync, memo), `#figureEngine` (sync, the stored mark), `#warmEngines`/`#warmTable` (the async entries make the marks; `read` writes a missing or undetermined one, R-OLD), `UNDETERMINED_ENGINE`, `#withEngine` (undetermined engine case), `#sourceRows` (awaits `cellsAt`; `cells_truncated` is the stated fault `SOURCE_NOT_READ` with `calculations.range_cells_held`), `#bind` (figure: await `cellsAt`, mark stored with the ref), `create` writes `calc_inputs.engine_json`; `readTable` and `read` warm before grading. `schema.mjs`: `calc_inputs.engine_json` (migrated). `#tableGrade`, `#gradeFacts`, `gradeFactsOf` stay synchronous (R19, R30).

**Failing-first (`test/m/calculations/g41-cells.test.mjs`).** Seen red: part 1 against the unchanged module (5 of 5 red; the control (d) red there only because the provider is async); the seam (a) last 100 rows of the 1 MB CSV and (b) last-row figure red under the preload with the providers unmerged ("string or blob too big", then `cells_not_held` as providers landed); the persistence tests (K4650) fail without the column. Now green with every provider merged: (a) the table's rows equal the generator's, last row `LASTROWMARK`; (b) the figure reads 1.00; (c) the 5,000 x 4 formula workbook grades with the file engine as a small one; truncated and rejected `cellsAt` give engine "undetermined" in `read` and `gradeFactsOf`; (d) small sheet unchanged; (e) a range over the cells limit is a stated fault, nothing written; K4647 numbering at both ends (row 1 header, last row); K4650 restart and old-row repair.

**Suites** (all under the preload `node --import $PWD/bio-plane/test/platform-sqlite.mjs --test --test-force-exit`): calculations 75 pass, 0 fail, 0 skipped. Users: strength, workbooks, public-read, hypotheses 513 pass; case-authoring and case-grammar calculations tests, consequences, reevaluation, duties, people 391 pass. `impact.mjs` names 78 modules; no provided signature changed. Seam tests still red: none.

**Checks** (`checks/run.mjs`): format, architecture, coverage (6,685 of 6,685), channels 0 failures. Words: one hit, `bio-plane/test/platform-sqlite.mjs:44` (test-support's file, not mine; reported). Ownership (calculations, tranche/T51, job/T51/calculations): 5 files, 0 failures. Measures this START names: none (rows 3 and 4 not opened by BOB). Census ops: no op's accepted keys change. Platform check (L, P): the redeploy's re-walk.

**Requirement lines I propose (BOB writes).** R1: a source range whose cells the provider answers `cells_truncated` (over the cells limit) is refused `SOURCE_NOT_READ`, naming it, nothing written, never a short table; a cell read is awaited, as `content.cellsAt` is asynchronous. R9: a figure input's engine mark is stored with the calculation's inputs at create and read by the synchronous grade facts (R19, R30); an input whose cells could not be read (failed or truncated `cellsAt`) carries `engine: "undetermined"`, `engine_measured: false`, its grade undetermined with why, never `engine: null`; a calculation stored before has no mark and answers undetermined until one `read` makes and writes it. Word row owed: `calculations.index.its_cells_could_not_be` (a `localize` stand-in; design asked via B491).

**Found in another module.** `bio-plane/test/platform-sqlite.mjs:44`, the words check's "plain" hit for the string "string or blob too big" (test-support): needs a `localize` id or a dev tag, TEST-SUPPORT's.

Size (session_015P7YZfAbM7iah2fh9UyBGM): test runs 20, module lines 3,495

## J9 · COMPLETE

COMPLETE: G41 (calculations) done at the tip of job/T51/calculations, tranche/T51 merged through CONTENT #19 and RETRIEVAL-BROWSE #4. cellsAt awaited at its reads; explicit undetermined engine on cells_truncated or a failed cellsAt (never null); a range over the cells limit is a stated fault; the figure's engine mark persisted (K4650); K4647 numbering asserted. Under the preload: calculations 75/75, users 904 pass, seam tests green (were red), no seam red. checks/run.mjs: format, architecture, coverage, channels 0 failures; ownership 0. One words hit is in test-support's platform-sqlite.mjs:44 (not mine). Proposed requirement lines, the word row owed and the Size line are in my record, section "Round 6 · G41 · COMPLETE".

## Round 6 · G45 (CHANGE B13, K4666) — in progress

Step 1 (what a throw leaves): `money.recordFact` runs and commits per fact before the `transact` that writes the ingest row, so the unfixed act's throw (seen: `string or blob too big` at 18,098 rows) left its money facts written and no ingest row. Those are true facts and are LEFT; no repair invents an ingest (K4669); test (h) pins that an injected throw leaves the facts and no row. Done and pushed (`d2d2ae87e6`): `calc_ingest_parts`, `INGEST_INLINE_MAX` 524,288, `INGEST_CHUNK` 256 Ki characters (no pair split), `INGEST_REASON_MAX` 2,000 (`BAD_REASON`), `ingestOf`, tests `g45-ingest.test.mjs` (10, green under the preload; (a) red on the unfixed code with `string or blob too big`). corpus-export: generic by declared class (`tables.mjs` pages every `export: yes` table by row, a row larger than a page travels alone), so the marker row and its piece rows are both exported; no change needed. Measure (probe `g45.probe.mjs`, node child capped at the real shape, fixture idle 41 MB + the plane's 40 MB headroom): 18,098 rows survive at cap 48; 30,000 at 82, 50,000 at 83, 100,000 at 86 (answer 13.4 MB); 333,333 rows (the most a 20 MiB table holds: 1,000,000 cells / 3 columns) die at 101 (answer 44.8 MB, heap peak 331 MB). Bracketing 150,000 and 200,000 now (session-tracked background runs), then `INGEST_ROWS_MAX` and `INGEST_TOO_LARGE` are set from the result.

## Round 6 · G45 · COMPLETE (CHANGE B13; RESUME B14 read)

**What changed.** `bio-plane/src/calculations/schema.mjs`: table `calc_ingest_parts (ingest_key, kind, seq, bundle_id, chunk)` declared with `calc_ingests`' class (export yes, sight source, keys bundle_id; purge as the row). `bio-plane/src/calculations/index.mjs`: `INGEST_INLINE_MAX` 524,288 B, `INGEST_CHUNK` 256 Ki characters, `INGEST_REASON_MAX` 2,000, `INGEST_ROWS_MAX` 100,000 (exports); `chunksOf` (never splits a surrogate pair), `ingestStored`; `ingestMoney` refuses `BAD_REASON` (before any fact) and `INGEST_TOO_LARGE {rows, bound_rows}` (before any fact), stores each of `rows_json`, `written_json`, `not_written_json` inline when at most the inline max (byte for byte as before) else as the marker `{"parts","bytes","count"}` plus pieces, all in the one `record.transact`, `INSERT OR IGNORE`; new sync `ingestOf(key)` joins the pieces exactly. The answer lists everything, cut nowhere. The op's accepted keys do not change (K4208: confirmed by the op test; `BAD_REASON` and `INGEST_TOO_LARGE` are new refusals of the same keys).

**Step 1 (what a throw leaves).** `money.recordFact` commits each fact before the ingest `transact`, so the unfixed act's throw left its money facts written and no ingest row. Those are true facts and stay; no repair invents an ingest (K4669). Test (h) pins that an injected throw leaves the facts and no row and no piece.

**Failing-first (`test/m/calculations/g45-ingest.test.mjs`, 11 tests, under the preload).** (a) 18,098 rows, mixed (302 written, 17,796 unwritten): red on the unfixed code with `string or blob too big` (seen), green: answer lists every row, largest stored value 262,144 B, `ingestOf` equals the answer, the stored text hashes to the sha of the answer's JSON, facts written equal the record's written. (b) controls (200 rows; 3,000 unwritten, 456 KB): row text identical to `json(...)` of the lists, no piece (red on the unfixed code only for the missing table). (c) boundary: a `not_written` of exactly 524,288 B is inline, one byte more is in pieces; non-ASCII and astral characters: no piece splits a pair, round-trips exactly (c2: second case). (d) a repeat call writes no second row or piece. (e) 90,000 explicit rows: `rows_json` in pieces, `ingestOf` returns the list. (f) a purge of the bundle removes the pieces. (g) 100,001 rows refused `INGEST_TOO_LARGE`, nothing written; exactly 100,000 read. (h) injected throw at the second piece: no row, no piece, facts remain. (i) a 2,001-character reason refused `BAD_REASON`, nothing written; 2,000 stored whole. Plus the op test.

**Measures (`g45.probe.mjs`, a node child capped at the real shape: fixture idle plus the plane's 40 MB headroom; no timing asserted).** 18,098 rows survive even at cap 48 (answer 2.4 MB, 10 pieces). 30,000 rows at cap 82, 50,000 at 83, 100,000 at 86: survive (answer 13.4 MB, 51 pieces, largest stored 262,144 B). 150,000 rows at cap 89 and 200,000 at 93: die (out of memory). 333,333 rows, the most a 20 MiB table can hold (1,000,000 cells over the 3 columns a binding needs): die at 101 (answer 44.8 MB; uncapped heap peak 331 MB). So the bound is set: **`INGEST_ROWS_MAX` = 100,000, refused before any fact is written; a protective bound, K1881, reported to BOB for Bob.** The member lists the rows in windows (rows: [..]), which R14 allows. A word owed: `calculations.index.one_act_reads_at_most` and `calculations.index.a_reason_is_at_most` (`localize` stand-ins, rows owed to UX-DESIGN, B491). Platform check L through Miniflare's real DO SQLite: the preload refuses any bound value over 2,098,176 B as the platform does; I did not run the act through Miniflare itself (named, not done).

**corpus-export (read, not mine).** It carries every declared `export: yes` table by row (`tables.mjs`, pages of 1,000 rows / 256 KiB, a larger row travels alone), so the marker row and the `calc_ingest_parts` rows are both exported; the exported row never carries a marker without its pieces. No change needed.

**Suites** (under the preload): calculations 86 pass, 0 fail, 0 skipped (75 + 11). Users: op-grades, money, strength, workbooks 0 fail; affordances 4 fail, the same 4 with the tranche's calculations code (act-help words of strength: `ACT_HELP`, `act.strengthbarset.does`; not mine, not in my files). `checks/run.mjs`: format, architecture, coverage (6,685 of 6,685), channels, words 0 failures; ownership 0 failures (5 files). Seam tests red by name: none.

**Requirement lines I propose (BOB writes).** R14: a value of an ingest's record (`rows`, `written`, `not_written`) is kept in the row while its UTF-8 length is at most 524,288 bytes, byte for byte as before; above it the column holds `{parts, bytes, count}` and the text is in chunks of at most 256 Ki characters that never split a surrogate pair, written with the row in one transaction; `ingestOf(key)` joins them exactly; the answer lists everything, cut nowhere; a reason is at most 2,000 characters (`BAD_REASON`, before any fact is written); an act of more than 100,000 rows is refused `INGEST_TOO_LARGE {rows, bound_rows}` before any fact is written, the member listing the rows in windows. Money facts a throw left earlier are left. Rows stored before are unchanged (new data only).

Size (session_015P7YZfAbM7iah2fh9UyBGM): test runs 33, module lines 3561
