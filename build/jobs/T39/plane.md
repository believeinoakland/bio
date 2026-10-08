# plane (T39)

**Status** · session_01FHJ4WgvZK4SkDMHVE5W2mn · depth 2 · RUNNING until 2026-10-08T23:47:27Z (node --test bio-plane/test/m/ (all module tests, after merging the tranche)) · handled B2

## Completion (PLANE #28, T39-20)

**Reading set (§17, K2304).** Measured about 2.5 MB: the public parts of the 97 Uses modules come to about 2.0 MB, plus the plane's code and tests (421 KB). That is over the 300 KB limit, so §17 step (3) applies. I read whole: `plane.md`, draft-T39-L11-shares §1–§3, K2304/K2346/K2377/K2381/K2383, layers.md (table and the layer-11 plane section), case-carriage's public part, and every plane file I changed or tested against: `docket.test.mjs`, `worker.test.mjs`, `disclosures.test.mjs`, `fixture.mjs`, and t36 :120–200. I also read the code paths I relied on (case-carriage `#onReceipt`, `copyBatch`, `#copyOne`, `#isPhoto`; scheduler `copies.test.mjs`). Three helpers read the other Uses public parts whole, in groups of about 650 KB each, and summarised them for this task. Nothing in their summaries changed the work.

**Entries applied.**
1. `test/m/plane/docket.test.mjs`:14 and :55 now compare against `[...CASE_CARRIAGE_MARK_TABLES, ...CASE_CARRIAGE_DOCUMENT_TABLES]`, and the comment is reworded (K2377). This clears the accepted red.
2. R7 (N810): `pdfjs-dist` `4.10.38`, exact, is now in `bio-plane/package.json` devDependencies, and `package-lock.json` is regenerated with `npm install`. The lock changes only pdfjs-dist and its optional `@napi-rs/canvas*` dependencies; the lock's stale root version 0.55.0 is synced to the package's 0.81.0. A new test in `worker.test.mjs`, "R7 (T39; N810, K2346)", checks three things: the pin is exact, the lock's root holds the same pin, and the lock resolves that version. Its negative control checks that ranges are not exact. `test/m/doc-clean/oracles.test.mjs`'s pdf.js test now runs and passes: "R5 a PDF copy opens in pdf.js …" ✔, 5 pass, 1 skipped. The skip is a different tool absent here.
3. R18 (T39 clause): no code change, as draft §3 item 3 expected. New file `test/m/plane/t39.test.mjs` with three tests:
   - (a) After construction, a `doorbell` receipt and an `unpacked` receipt through the plane's one provenance each queue once in `document_copy_queue`. A `direct` receipt queues nothing (`documentCopy` answers `public`), and a second receipt adds no row.
   - (a′) The scheduler reaches the same instance: `document-copy` is among its consumers, `faults()` is empty, and a second `onCopyWork("scheduler")` is refused `LISTENER_DECLARED`.
   - (b) For namespaces `bio` and `scratch`, with `CAPTURES` bound and a member PDF under `<ns>/captures/<sha>` queued, one `onAlarm` answers `doccopy` as `{ok:true, copied:1, clean:0, public:0, refused:0, failed:0, remaining:0}`. The copy lies at `<ns>/obscured/<copy sha>`, labelled with its original, and the original is unchanged. The negative control has no bucket bound, and there `doccopy` is `DOCUMENT_COPY_NO_STORE`.

**Deferred.** None.

**Found in other modules / generated artifacts.**
- The plane bundle `dist/bio-plane.bundled.mjs` is stale because of this job's lock change. `fleetbundles.test.mjs` is 116/1: "STALE BUNDLE — package-lock.json has changed since the bundle was built". On the tranche's lock it is green. This is a generated artifact (mechanics §14) and I did not write it. It falls under the plan's rule 3 item (7): rebuild it at L11's close with `node bio-plane/scripts/bundles.mjs`.
- Plane R7 and R18 still carry their `*(not yet met: T39)*` marks. Both are met now; the requirements file is BOB's to strike.

**Tests and checks.**
- `node --test bio-plane/test/m/plane/ bio-plane/test/system/migrate-released.test.mjs`: 156 tests, 156 pass, 0 fail, 0 skipped. The plane was 150/1 before.
- `test/m/doc-clean/oracles.test.mjs`: 5 pass, 0 fail, 1 skipped (not pdf.js).
- `test/m/bundler/thirdparty.test.mjs` and `bundler.test.mjs`: 46 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `architecture.mjs bio plane`: 0 failures. `coverage.mjs bio plane`: 29 of 29 live ids named, 0 failures. `ownership.mjs bio plane tranche/T39`: 6 files, 0 failures.
- I have not merged with the rest of L11 yet. I merge last, on BOB's CHANGE.

Size (session_01FHJ4WgvZK4SkDMHVE5W2mn): test runs 12, module lines 0

## J1 · COMPLETE

T39-20 done; record's Completion section. (1) docket purge list = MARK+DOCUMENT tables (K2377 red cleared). (2) R7: pdfjs-dist 4.10.38 exact + lock; R7 test asserts exact pin and lock; doc-clean's pdf.js oracle runs and passes. (3) R18: no code change; t39.test.mjs: non-fetch receipt queues, direct does not; scheduler holds onCopyWork and document-copy; onAlarm doccopy copied:1, copy at <ns>/obscured/<sha> (bio and scratch); no bucket gives DOCUMENT_COPY_NO_STORE. Plane 156/0; format, architecture, coverage (29/29) and ownership 0 failures. REPORT: the lock change stales dist/bio-plane.bundled.mjs (fleetbundles 116/1, STALE BUNDLE package-lock.json); a generated artifact, not mine: rebuild at L11 close (rule 3 item 7). R7/R18 T39 marks are met, yours to strike. Waiting for your CHANGE to merge last.
