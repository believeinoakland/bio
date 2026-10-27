# provenance (T52)

**Status** · session_018BhcegeZLSnAJh5Ey7J1cm · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# provenance, T52, report

**Entry applied: T52-9 (W5, B-K1), R81.**
- New `bio-plane/src/provenance/releasable.mjs`, exported from `index.mjs`: `releasableBundle({md, doc, locator, snapshots, indent})`. Pure, never throws. It answers `{ok, files, contentHash, dataset}`: `bundle.md` with `content_hash: sha256:<digest of the dataset>` set in its front matter, `data/provenance.json` (the document's chain), `data/dataset.json` (record-grammar `canonicalJson` of `{documents: [{bytes, locator, sha256}]}`, `screens-intake` R23's shape), then the snapshot files. Refusals `{ok:false, reason, code, detail}`: `NO_DOCUMENT_DIGEST`, `NO_CHAIN`, `NO_SNAPSHOT`, `NO_FRONT_MATTER`. They carry no catalogue row (no C-number minted): BOB decides whether they need one.
- The testimony filer (`testify`) now files through it. A testimony bundle gains `data/dataset.json` and a `content_hash`; its other files are unchanged.
- `screens-intake/capture.mjs` and `ratification/release.mjs` untouched.
- Tests: new `test/m/provenance/releasable.test.mjs` (dataset byte-equal and hash, pulled knock / unpacked member / upload shapes through the helper, refusals and purity, testimony filed with all four entry requirements). `ratification` is a higher layer, so the test reads `release`'s entry requirements off the filed bundle; the through-`release` test (testimony vouched, then released eligible; upload control) belongs to W22/W33's and ratification's seams.
- Two existing tests pinned the testimony bundle's file list; updated for the new file (`convert-testimony-digest.test.mjs`, `register.test.mjs`).

**For BOB, the helper's inputs for R81's wording (K3268):** `md` (the filer's own bundle.md), `doc` (its row of data/provenance.json with `capture.sha256`, `capture.bytes`, `provenance_chain`), `locator` (default `doc.locator`), `snapshots` (its files under `snapshots/`, as `promote` takes them), `indent` (default 2; screens-intake writes 1).

**Found in other modules:** `setup-words/words-unreviewed.json` is stale against source (three new `localize` ids, `provenance.releasable.*`); regenerate at merge (`node bio-plane/src/setup-words/build.mjs`). Downstream tests that read a testimony bundle's file list (extraction, content, observation-log) were not run by this job.

**Met** · R81

Tests: 202/202. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegeZLSnAJh5Ey7J1cm): test runs 1, module lines 3391
