# calculations (T51)

**Status** · session_015P7YZfAbM7iah2fh9UyBGM · depth 2 · WAITING ON BOB (J6) · handled B4

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
