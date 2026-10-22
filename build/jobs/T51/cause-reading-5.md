# cause-reading-5 (T51)

**Status** · session_01Geu3LKFz56mqtHSGZirZg9 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

COMPLETE · cause-reading-5 · entry 14 (R38) applied.

**Root cause.** `reading-pipeline/index.mjs` (readInner, the structure branch, was line 1633-1635): `const st = await entry.structure(bytes); if (st && st.ok) {...}` kept the entry's answer only when `ok`. pdf-reader R42's `{ok:false, reason:"TOO_LARGE_TO_READ", failure:"final", pages, bytes, need_mb, limit_mb}` was dropped and the reading fell to the generic "the pdf entry produced no text from these bytes". The same held for a `text` entry answering `ok:false`. Tests missed it because no test fed `read` a PDF the reader refuses before its text (the refusal did not exist until pdf-reader R42, K4504).

**What changed.**
- `bio-plane/src/reading-pipeline/index.mjs`: new `refusalOf(answer)` (before `read`): for an entry answer `ok:false` with `failure:"final"` and a string `reason`, returns `{reason, pages?, bytes?, need_mb?, limit_mb?}` (only finite figures). In the wired branch the refusal is taken from both the `text` and the `structure` entry's answer, and carried onto the failed reading (`if (refusal && !wired) Object.assign(reading, refusal)`, after R37's failure marking). The reading stays `found:false`, `failure:"final"`; the generic sentence is kept (nearest held row `reading-pipeline.index.entry_no_text`; no new `localize` row, none owed). New data only (R-OLD): a stored generic failure is not rewritten. No other reading gains a key.
- `bio-plane/test/m/reading-pipeline/r38.test.mjs` (new, 2 tests, named R38): through `read`, pdf-reader's `dense.mjs` 3,500-page synthetic (17.x MiB): red before (`reason` undefined), green after: `failure "final"`, `reason TOO_LARGE_TO_READ`, `pages 3500`, `bytes` = the file's, `need_mb > limit_mb` integers. Controls: a 1 MB 40-page PDF carries none of the five keys; non-PDF bytes are final with no `reason`.

**Tests.** `memory.test.mjs` alone (BUDGET volumes, 20 MB synthetic, digests pinned): 4/4 pass, unchanged. Module tests (`test/m/reading-pipeline/` less memory, `d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`): 182 tests, 182 pass, 0 fail. `test/m/extraction/` (the user): 235 tests, 234 pass, 1 fail, see below. `build/plan/impact.mjs origin/tranche/T51 HEAD`: 108 of 175 modules (transitive); I ran the direct user `extraction` only since the change adds keys to failed readings only.

**Checks.** `format`: 175 modules, 0 failures. `architecture reading-pipeline`: 0 failures. `coverage reading-pipeline`: 38 of 38 live ids named, 0 failures. `ownership` (process repo, `reading-pipeline`): 3 files changed, 1 FAIL on `build/jobs/T51/cause-reading-5.md` as outside the module's record; the cp-close version with `reading-pipeline` says the same, and with `cause-reading-5` as the id answers "no such module": the diff is only `index.mjs`, `r38.test.mjs` and my record, so I read it as the tool's cause-job naming, for BOB. cp-close `run.mjs`: words 18421 (no finding in my files; unkeyed 1982, dev 268), coverage 0 failures, channels 0; architecture 1 failure in `bio-plane/test/m/tasks/seam-r25.test.mjs` (tasks imports provenance-routes' fixture without declaring it), not mine.

**Found in another module (for BOB).**
1. extraction: `test/m/extraction/c5b-memory.test.mjs`'s "R80 R45 (C5b, L): readHeld of a 21 MB three-part PDF ... peak memory above idle under 128 MB" fails (`actual false, expected true`); it fails identically with my change reverted (index.mjs at the tranche's version), so it predates this job.
2. tasks: the architecture failure above (a test imports provenance-routes' fixture, not in `uses`).

**Proposed R38 line (BOB writes requirements).** R38 stands as written, met: "A PDF refused `TOO_LARGE_TO_READ` (pdf-reader R42) is recorded as a `final` failed reading carrying the refusal's `reason`, `pages`, `bytes`, `need_mb` and `limit_mb` as data the document page can state; any other entry refusal carrying `final` and a `reason` is carried the same way. New data only." Drop "(not yet met: T51)". Note for the page's owner (D5, "the page says so"): wording waits for T52; the reading's sentence is unchanged, the page states the size from these fields.

Size (session_01Geu3LKFz56mqtHSGZirZg9): test runs 9, module lines 2151
