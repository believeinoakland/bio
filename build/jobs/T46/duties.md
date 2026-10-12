# duties (T46)

**Status** · session_0139ZFtgTvp1mhcekkFjucSn · depth 2 · WORKING · handled B1

## Completion (DUTIES #5)

**Entry applied.** T46-11 (N913; DEC-194): R32. In `src/duties/checks.mjs` a frozen `DUTIES_WORDS` holds `words.json`'s `refusal.RESPONSE_KIND_UNKNOWN`, `refusal.RESPONSE_EXTENT_NOT_IN` and `refusal.DUTY_SOURCE_NOT_HELD` verbatim (as on `main` @ 3f40899950, unchanged since), and rows C-133.41, .42 and .44 take their translations from it by key, as `membership`'s `HANDLE_WORDS`, `extraction`'s `TRANSCRIBE_WORDS` and `project-roster`'s `PROJECT_SCOPE_WORDS` do; `index.mjs` re-exports it. Codes, numbers, `where`s and behaviour unmoved. C-133.43 `PROMISE_DATE_UNREAD` keeps its present text (K2919). The other 39 rows are byte-identical (their canonical JSON's sha256 is the same before and after, pinned in the test). None of the three sentences names the Civicsmith bare, and each matches what its refusal does ("Nothing was written."; nothing is written).

**How the reading set was read (mechanics §17).** Read whole by this session: `build/requirements/duties.md`; every file of `src/duties/` and `test/m/duties/`; my entry and the plan's opening rules in `build/plan/current.md`; layer 5's contract in `build/layers.md`. The public parts of the 17 used modules (448,914 bytes) were read in full by a helper in this session, which wrote a digest citing each module's sections and requirement ids (K2032); the sources stay binding.

**Own code and tests read whole (P20).** No flaw was found that this job needed to fix; nothing deferred.

**Found in other modules.** None. Rows changed for the census, and generated artifacts made stale (both accepted reds, nothing for another module to do):
- `system/row-census.test.mjs` names exactly C-133.41, .42 and .44 as "changed with no record". This is the plan's accepted red rule 5 (2), until T47's promotion stamp.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), `release/` and `newgroup`'s bundle hold the duties source. They are stale by this change, which is accepted red rule 5 (4), regenerated at the layer close; none was touched.

**Tests and checks.**
- `node --test test/m/duties/`: tests 65, pass 65, fail 0 (baseline before the change 62/62). New: `t46-words.test.mjs`, three tests naming R32.
- Negative control: against the T45 rows, R32's two re-wording tests fail; restored, they pass.
- The other modules' tests that read `DUTIES_CHECKS` (`action-plans/duty-starts`, `affordances/t34`, `answer-envelope/families`): pass 35, fail 0.
- No layer tests are named in `build/manifest.md`.
- `format`: 0 failures. `architecture duties`: 0 failures. `coverage duties`: 32 of 32 live ids named; 0 failures. `ownership duties tranche/T46`: 4 files changed; 0 failures.

Size (session_0139ZFtgTvp1mhcekkFjucSn): test runs 9, module lines 2204
