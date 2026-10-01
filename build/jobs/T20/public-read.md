# public-read (T20)

**Status** · session_01XLWRBsRPw2zAufibUqk5eL · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (B1, K899 (1); `build/plan/current.md` T20 L8): "record" for "bundle" in text members read, identifiers unchanged.
- `src/public-read/index.mjs`:775, the loose edition's `detail`: "this is a RATIFIED RECORD that is not a member of any published case …". (That sentence is on `#looseEditionState`'s answer only; `publishedCase` picks its fields by name and does not serve it, so no answer changes.)
- `src/publication/worker.mjs`:526–528, `op=publishedcase`'s argument refusal: `shape` "id=<record id> (optional &edition=N) or sha256=<64 lowercase hex>"; `error` "publishedcase requires id=<record id> (with an optional &edition=N, latest by default) or sha256=<the record sha of an edition>".
- `src/publication/worker.mjs`:714, `verification.detail`: "… EACH FINDING's signature covers that finding's own record sha. …".

**Re-scan of `paths`** (every string literal holding the word, comments, SQL and identifiers aside): nothing else. The only other hits in served text are identifiers and stay: `publishedManifest`'s `production` (index.mjs:206, `` `bundle_sha` ``), the container manifest's `layout.note` (worker.mjs:307, `bundle_sha`) and `verify` (worker.mjs:321, `` `bundle_sha` ``); `bundle.md` paths and the `bundle` kind. `checks.mjs`, `door.mjs`, `container.mjs` and `inband.mjs` hold the word in comments only.

**Tests.** None of this module's tests pinned the old words. New `test/m/public-read/record-word.test.mjs` (R1–R4, K899 (1)): the argument refusal's `shape` and `error` and the verification sentence pinned exactly, and every sentence of the Worker's and the store side's answers (published case, loose edition, refusals, list, editions, manifest) holds the word only inside an identifier. Negative control: on the old text two of its three tests fail.

**Deferred:** none.

**Found in other modules** (also in a REPORT):
- `legacy-tests`: `bio-plane/test/system/d278-codeless-refusals.test.mjs`:205–206 pins the old `publishedcase` sentence (`PRE_ERROR.publishedcase`). The suite is already red on `tranche/T20` before this change (it imports the deleted `bio-plane/checks/bio-checks.mjs`, `ERR_MODULE_NOT_FOUND`), and legacy-tests deletes the old suites in L11 (K879); not re-keyed (K619: not mine to delete or edit).
- `legacy-ui` / `legacy-tests`: `civicos-ui/test/publishedcase.test.mjs`:463 `VERIFY_DETAIL` is a fixture copy of the old verification sentence ("own bundle sha"); it stubs the answer, so nothing fails, but the copy is stale.
- Generated artifact staled (mechanics §14): the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), whose inputs include both changed files; `release/bio-plane.bundled.mjs` carries the old strings too (cut at the next release).

**Tests and checks run**
- `node --test test/m/public-read/`: tests 70, pass 70, fail 0.
- Users of this module (no service changed; run for the changed text): `test/m/ratification/` 181 pass 0 fail; `test/m/filings/` 45 pass 0 fail; `test/m/control-plane/` 85 pass 0 fail.
- Layer tests: none (`build/manifest.md`).
- `checks/format.mjs`: 84 modules, 82 requirements files; 0 failures. `checks/architecture.mjs`: 24 product files, 67 relative imports; 0 failures. `checks/coverage.mjs`: 17 of 17 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … tranche/T20`: 4 files changed; 0 failures.

Size (session_01XLWRBsRPw2zAufibUqk5eL): test runs 8, module lines 2,159

## J1 · REPORT

Found in other modules (record, Completion): (1) legacy-tests: bio-plane/test/system/d278-codeless-refusals.test.mjs:205-206 pins the old publishedcase argument sentence; already red on tranche/T20 (imports the deleted checks/bio-checks.mjs), deleted in L11 (K879), so not re-keyed. (2) civicos-ui/test/publishedcase.test.mjs:463 VERIFY_DETAIL is a stale fixture copy of the old verification sentence (own bundle sha); stubbed, nothing fails. (3) Generated artifact staled: the plane bundle bio-plane/dist/bio-plane.bundled.mjs (+ .bundle.json), inputs src/public-read/index.mjs and src/publication/worker.mjs; release/bio-plane.bundled.mjs also carries the old strings.

## J2 · COMPLETE

K899 (1) applied at index.mjs:775 and worker.mjs:526-528, :714 (record id, record sha); re-scan of paths found nothing else (only identifiers: index.mjs:206, worker.mjs:307, :321). New record-word.test.mjs (R1-R4). public-read 70/70; ratification 181/181, filings 45/45, control-plane 85/85; format, architecture, coverage (17/17), ownership 0 failures. No row changed, nothing awaits a stamp. Branch job/T20/public-read.
