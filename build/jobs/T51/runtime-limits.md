# runtime-limits (T51)

**Status** · session_01Bbx2ng6oqCwJyEKMZdPRg2 · depth 2 · WORKING · handled B1

## Completion (RUNTIME-LIMITS #6, fix round 7, G83)

**Entries applied.** R27 and R28 in the new file `bio-plane/src/store-place.mjs` (exports `STORE_HINTS`, `storeHint`, `storeGeneration`, `storeId`, `storeStub`); pure over `env`, nothing at load but the frozen list. Three new provided ids at most (K3294 respected: five exports, two requirement ids). Tests: `bio-plane/test/m/runtime-limits/store-place.test.mjs`, seen red first (file absent), then green.

**Rules stated.** Generation grammar `/^[1-9][0-9]*$/` with value 2 or more; `"02"`, `"2.0"`, `" 2"`, `"0"`, `"-2"`, `"1"`, a number type, and a digit string beyond a safe integer all give 1 (leading zeros: not a second room, K4754). An invalid hint is passed as none (no second argument). The suffix `~g<n>` is on the object's name only.
**Tests (K4426).** (1) allow-list table, `storeGeneration` table, exact `idFromName`/`get` arguments through a recording namespace (no second argument without a hint; `{locationHint}` with one; `bio~g2`, `scratch~g2`), `storeId` equal to what `storeStub` used. (2) Why missed: no test recorded `get()`'s arguments; the recording-namespace tests are the gap's fix at this level (plane's T1 census and T2 cover the sites). (3) **L**: one Miniflare run, `storeStub` with `wnam` on the real binding returns a working stub; local workerd places nothing, so that is all it proves. (4) **N**: placement is read by BOB at P after the redeploy.

**Census ops owned (K4208).** None: the census (T1) is plane's.

**For BOB.**
- `modules.json`: add `bio-plane/src/store-place.mjs` to runtime-limits' `paths` (the ownership run lists it; it is new and untracked by the module until then). Regenerate `order.mjs` if `modules.json` changes.
- Generated artifacts made stale by my change: none now (no existing file changed); every bundle that includes the plane will contain `store-place.mjs` once the users import it.
- `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale at word 19790 (`calculations.index.the_source_reads_as_one`): another job's new `t()` call (calculations G64), not mine; `store-place.mjs` has no words. The `setup-words` module's own tests show 3 failures for the same reason (18 pass); not touched.
- Proposed wording: none. R27/R28's "(not yet met: T51)" tags can drop.

**Deferred.** None. **Found in another module.** None.

**Run.** `node --test bio-plane/test/m/runtime-limits/`: 32 tests, 32 pass, 0 fail, 0 skipped. `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 176 (no existing file changed). Checks from the process repository: format `176 modules, 176 requirements files; 0 failures`; architecture `4 product files, 6 relative imports (1 naming no tracked file, not judged); 0 failures`; coverage `26 of 26 live requirement ids named by a test; 0 failures`; ownership `1 files changed by runtime-limits between tranche/T51 and HEAD; 0 failures`.

Size (session_01Ha6MYafmZ1NtDAwR8FeQEx): test runs 4, module lines 36

## J1 · COMPLETE

R27 and R28 met in bio-plane/src/store-place.mjs (new; add to runtime-limits paths in modules.json). 32 module tests pass, format/architecture/coverage/ownership 0 failures, impact 0 of 176. Notes in my record: setup-words build --check is stale from calculations' new word (not mine).

## J2 · QUESTION

QUESTION (best reading given; I carry on with it, none of it blocks the files). Three things the R30/R33/R34 text leaves to a figure I must not guess (R-GATE):
1. capFor(N): I read R33 as capFor(N) = max(0, floor(isolate_memory_bytes/2^20 - idle_bytes/2^20 - N)), i.e. 256 - 50 - N = 206 - N with today's entries, one formula for PDF and sheet runs (it replaces plane's 128-N and the sheet 128+39-N; those are test-support's and plane's to repoint, I only report). Tell me if a share per object of a class (the isolate is shared by up to five) must enter the formula.
2. standard column of the heavy-kind rows R30 gives no standard for (pdf bytes, xlsx declared, ods content, worker bytes, need_mb, cover_bytes, clean_bytes, grade_read, ocr frame...): I set standard = max(alpha, 50 MB = 52,428,800) for byte rows, standard = alpha for count/protective rows with no separate figure (so alpha never above standard holds), and protective = the figure R30 names, else = standard. Wrong figures are one-line edits of one file; say which.
3. PLATFORM_FIGURES `source` strings: R34 says `K4838 (<n>)` but gives no n; I write `K4838` for the four Stage-0 figures and `K4616` for idle_bytes, and the test pins the shape /^(K[0-9]+( \([0-9]+\))?|PLATFORM\.md P-M[0-9]+)$/.
Also: the render DOM row is "the figure the capture-sources job proposes"; I add no row for it (that job adds it, R30).
