# lines (T51)

**Status** · session_01Cf5du72PJUM1L7TgvEqDz1 · depth 2 · COMPLETE · handled B6

## J1 · REPORT

Findings for BOB, none in my module's files.

1. **holderAt's shape changed (R11/R24), and two users read the old one.** An office with no line `in`, or with disagreeing lines, now answers `{holder: null, undetermined: true, why: {key, vars}, lines}`; before, `undetermined` held the English sentence. This is my best reading of R11 ("answers `undetermined` with `why` the key"); if you meant the reason to sit in `undetermined` itself, say so and I change it. Users: `actions` (`index.mjs` ~2673 passes `h.undetermined` on as text; its test t33.test.mjs:105 "R9 R25 the read shows who held the office on the action's date" is red now and compares `undetermined` with the old sentence) and `duties` (`index.mjs` ~1451-1453 builds a message from `h.undetermined` through `said()`, which is false for `true`, so the message loses its reason; no test fails). Both need to read `why` by key (`reasonText`, exported from lines) in their own entries. Every other user's tests (answers, local-facts, escalation, strength, people, explore, connections, retrieval, case-disclosures, query-language, plane) show no new failure against the tranche.
2. **A nested reason does not render through `word`.** `lines.why.stated_current_through` carries civil-time's reason inside its fills (`vars.why` is itself `{key, vars}`, as R24 says, never flattened). `word(key, vars)` then writes "[object Object]" for `{why}`. Lines' `reasonText` renders it (it reads the inner reason first); the screen that draws such a reason must do the same, or the word needs a way to fill from a reason. A decision for you and the design stream.
3. **Item reasons in `neighbours`.** R24 says the sentence is read from the key "beside `why_key`", but connection-grammar R6 and its battery (already on the tranche) require the item's `undetermined.why` itself to be `{key, vars}`. I followed connection-grammar: `undetermined: {why: {key, vars}}`, no string and no `why_key`. A hub keeps its string `why` (the battery wants a filled string) with `why_key` beside it. R24's wording could be brought in line.
4. **New word ids** (generated rows are yours to regenerate; `build.mjs --check` reports them as stale): `lines.why.cache_stale`, `no_line_covers`, `lines_disagree`, `read_truncated`, `date_unreadable`, `date_unjudged` (new); `stated_current_through` and `entity_lines_kinds` (existing rows, now reasons); about 50 `lines.index.*` refusal details. Orphaned by this job once regenerated: `lines.text.date_read`, `lines.text.lines_hold_post`, `lines.text.lines_read_holds`, `lines.text.line_naming_office`, `lines.undetermined.line_covers_date`.
5. **Words judged no member reads (left as they are):** the `Error` thrown at boot when a registration is refused (`migrate`, a wiring defect), and the table and code identifiers (kinds, capacities, roles, ends: values the code compares). Everything else the words check counted, and every other refusal `detail` and `why`, is now a `localize` call.

## J2 · COMPLETE

CR-7 (lines part) applied.

**Entries applied.**
- R24 (and R7, R10, R11, R21): every reason is `{key, vars}`: stale cache `lines.why.cache_stale`; holderAt `lines.why.no_line_covers`, `lines.why.lines_disagree` (`{lines}`), `lines.why.read_truncated`; R21 `lines.why.stated_current_through` (`{why, day}`, civil-time's reason carried inside); `date_unreadable`, `date_unjudged` for the rest. New file `reasons.mjs` (`reason`, `reasonText`, `REASON_KEYS`); `reasonText` is exported from the index. structureAt/partiesOf/readLine/neighbours answer the keyed reasons; a neighbours item's `undetermined.why` is the `{key, vars}` (connection-grammar R6).
- Words: the 3 conversion findings and the 25 plain findings, and every other refusal `detail` and `why` (about 50, all `localize('lines.index.<slug>', en, vars)`); citations; the kind words read by `label.linekinds.<kind>` and the capacity words by `label.linecapacities.*` (vocab.mjs, English unchanged). `{statement}` in the basis sentence became "(a statement)" so it is not read as a fill.
- K3958 reds: R10, R11, R21 tests read the keys (R10 `reads.test.mjs`, R11 `holderAt`, R21 `current.test.mjs`); all green.

**Deferred.** None. See the REPORT (J1) for the shape change in holderAt that `actions` and `duties` must follow, the nested-reason rendering, and the word ids.

**Tests and checks.** `node --test test/m/lines/*.test.mjs`: 35 pass, 0 fail (new `reasons.test.mjs` names R24, with a control). Users' tests against the tranche: one new red, `actions` R9 R25 (t33.test.mjs:105, the old sentence), reported. `checks/run.mjs`: format 175 modules 0 failures; architecture 0 failures; coverage for lines 24 of 24 ids named, 0 failures; words: no finding in lines. `setup-words/build.mjs --check`: stale rows only (expected). `ownership.mjs lines tranche/T51 job/T51/lines`: 1 file changed by lines... 0 failures.

Size (session_011tEinGypkcSqPRxnLKHDvq): test runs 14, module lines 1009

## J3 · COMPLETE

B2 (K3995) processed: the plain-text undetermined reasons are already keyed in my J2 COMPLETE (cache stale, validAt throw, current-through, and the readLine valid.why). Confirmed on my branch after merging tranche/T51: node --test bio-plane/test/m/calculations/application.test.mjs: 9 pass, 0 fail (R32 included). No code change needed. Size (session_011tEinGypkcSqPRxnLKHDvq): test runs 15, module lines 1009

## J4 · COMPLETE

B3 (K3997) processed: merged tranche/T51; lines tests 35 pass, 0 fail; coverage 24 of 24 ids, 0 failures. No code change. R24's nesting kept. Size (session_011tEinGypkcSqPRxnLKHDvq): test runs 16, module lines 1009

## Fix round 10, Wave A batch 3 (LINES #6, B4)

- **Published** `linesWorld` in `bio-plane/test/m/lines/fixtures.mjs` (new): the real `recordLine` over this module's real world answers UNKNOWN_LINE_KIND, NO_SUCH_ENTITY, SEAT_ON_ENDS, HOLDER_NOT_A_PERSON, UNKNOWN_CAPACITY, BAD_CAPACITY, MACHINE_NEEDS_IDENTIFIERS; `fixtures.test.mjs` calls it and checks each answer's `reason` and that no line is written. Its user (instance-setup 7) re-points in its own job.
- **Own line** promotion/makePromotion (fixture.mjs:57): FIX-E, `promotionStub()` removed, `world()` takes `makePromotion().p` from `../promotion/fixtures.mjs`. `checks/fixtures.mjs . lines --list`: 0 failures. No `fixtures-own` or `fixtures-generic` marker added.
- **Refused by architecture** (1 failure): `bio-plane/test/m/lines/fixture.mjs` imports promotion's `fixtures.mjs`, and `promotion` is not in lines' `uses` in `build/modules.json` (not my file). Needs BOB: add `promotion` to lines' `uses` (a test-only use), or rule otherwise.
- Tests: lines 37 pass, 0 fail. Checks: format 0 failures; coverage 25 of 25 ids, 0 failures; architecture 1 failure (above). `impact.mjs`: 0 affected modules.
- Size (session_019gxu97eKA9S3uaxE9npToS): test runs 3, module lines 0 (test files only: fixtures.mjs 23, fixtures.test.mjs 14, fixture.mjs net -3)

## J5 · BLOCKED

BLOCKED (cause: needs BOB, a file outside my paths). Done and pushed: linesWorld published with its test (37 lines tests pass); promotion stub in fixture.mjs:57 replaced by makePromotion() (fixtures check: 0 failures for lines). Refused: checks/architecture.mjs lines fails once, because lines/fixture.mjs imports ../promotion/fixtures.mjs and 'promotion' is not in lines' uses in build/modules.json. Please add promotion to lines' uses (test-only) and say CHANGE/RESUME; I then re-run the check and post COMPLETE. No fixtures-own/generic markers added.

- **B5 applied:** merged `origin/tranche/T51` (promotion now in lines' `uses`). `checks/architecture.mjs /home/user/bio lines`: 0 failures; format 0; fixtures (lines) 0; lines tests 37 pass, 0 fail. The one failure noted above is cleared. No `fixtures-own`/`fixtures-generic` markers added.

## J6 · COMPLETE

COMPLETE (B4+B5). linesWorld published (fixtures.mjs, tested); fixture.mjs:57 promotion stub replaced by makePromotion(). After merging tranche/T51: architecture 0 failures, format 0, fixtures(lines) 0, lines tests 37 pass/0 fail, impact 0 affected. No fixtures-own/generic markers added. Record: build/jobs/T51/lines.md.

## J7 · REPORT

Findings outside my paths (K5175: REPORTed the day found).

1. Generated word row missing. `lines.declared.linewithdraw` (bio-plane/src/lines/index.mjs:846) is a new `localize` id, the description of linewithdraw's DECLARED_OPS row. Its row is not in bio-plane/src/setup-words/rows.mjs; that file is setup-words' generated artifact, so I did not edit it. It needs regenerating at layer close (`node bio-plane/src/setup-words/build.mjs`). The `lines.declared.recordline` row is the pattern.

2. Full product run (`node checks/run.mjs /home/user/bio`) shows failures in other modules' tests that name lines' ops, which I did not cause and did not establish as pre-existing: screens-investigate organization.test.mjs:78 (recordline stub, "-> lines"), organization.test.mjs:134 (linewithdraw stub, "-> lines"), fold.test.mjs:54 (partiesof stub, "-> lines"). The fixtures check counts 1712 failures across the product and coverage 3 failures, all outside lines. My change adds a declaration row and no op behaviour, so the cause is for those modules' owners to place.

## J8 · COMPLETE

R26 applied (K5182; amends R25).

**Changed (file:line)**
- bio-plane/src/lines/index.mjs:845-847: `linewithdraw` declared beside `recordline` in DECLARED_OPS. Class `["admin","member","probe"]` and mutating true from the `open` grade (op-declarations); weight `reasoned` and description from op-grades t33 (lines 32, 195), the description as `localize("lines.declared.linewithdraw", …)` at its use. Fields: accepts and requires `lineId`, `reason`, the two the arm reads (index.mjs:828; screens-investigate person.mjs:355 sends body `{lineId}`).
- bio-plane/test/m/lines/declared-ops.test.mjs:37-43: the R26 test, named R26. Its setup records a real line first, so the requires alone withdraw a real line.

**Failing-first.** Before the row, the R26 test was red: `declared op "linewithdraw": the declaration has no fields.accepts and fields.requires arrays`. After the row, both R25 and R26 pass.

**Suites.** `node --test bio-plane/test/m/lines/*.test.mjs`: 38 pass, 0 fail. interface-shell `declared.test.mjs`: 9 pass, 0 fail; the census reads `declared 390 of 395 ops` (was 389).

**Met.** R26 (R25 already met). Coverage: 26 of 26 live ids named by a test.

**Checks (ABSOLUTE root /home/user/bio).**
- format: 0 failures.
- architecture lines: 0 failures.
- coverage lines: 26 of 26, 0 failures.
- fixtures lines --list: 0 failures.
- ownership lines (merge-base..HEAD, committed): 0 failures.
- words (`checks/run.mjs`): no finding in lines; the word total is unchanged at 19239.
- impact `origin/tranche/T51 HEAD`: 0 of 178 affected modules.

**Fixtures markers added:** none.

**Outside my paths:** see REPORT (J7) for the missing generated word row and the other modules' failures that name lines' ops.

Size (session_01Cf5du72PJUM1L7TgvEqDz1): test runs 7, module lines 1019
