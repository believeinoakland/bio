# bundler (T23)

**Status** · session_01NUc9jtCVoKc7BZNT8zXv6u · depth 2 · COMPLETE · handled B4

## Work

**Entry applied: N482 (K1020, K1113).** `bio-plane/test/system/deploybindings.test.mjs`, "D-54's live arms": the two source-text assertions retired (the reason comment before `"limits"` in `wrangler.jsonc`, and `SUBRESOURCE_CAP = 400` read from `subresources.mjs`' source), with a dated RETIRED note in the form of T22's, naming subresources R35 and plane R13 as where the properties are now stated (plane R13's test lands in L11, K1113). The behavioural arm (the real config's ceiling derived by `deriveLimits` as 10000) stays. The header's D-54 negative-control record (A) now says the reason arm retired; the T22 note's "D-54 arm (B) below" corrected to "the header's D-54 arm (B)" (the header is above). No requirement of mine changes; no product code changed; no bundle input touched (the test file is no member's input), so no generated artifact is stale.

**Read whole:** `roles/JOB.md`; bundler's requirements; subresources R35 and plane R13; the layer 1 contract; the plan's bundler and fold 2 entries; `deploybindings.test.mjs`, and the code it drives, `scripts/derive-bindings.mjs` and `scripts/jsonc.mjs`. The module's other scripts and tests were not changed by this entry and were not re-read.

**Deferred:** none. **Found in other modules:** none.

## Proof

- `node --test bio-plane/test/system/deploybindings.test.mjs bio-plane/test/system/fleetbundles.test.mjs`: tests 2, pass 2, fail 0, skipped 0 (deploybindings: 37 passed, 0 failed; fleetbundles: no SKIP).
- `node --test bio-plane/test/m/bundler/`: tests 45, pass 45, fail 0.
- `node --test bio-plane/test/m/`: tests 5008, pass 4992, fail 4, todo 12. The four are accepted by name: control-plane R36 `inbox-door` (red 9), membership R83 `module-order.test.mjs`, R79 `t9-notice-sight-bounds.test.mjs`, promotion R39/R45/R46 `registry.test.mjs` (red 2).
- Checks: format `87 modules, 85 requirements files; 0 failures`; architecture `19 product files, 45 relative imports (8 naming no tracked file, not judged); 0 failures`; coverage `1 modules, 23 of 23 live requirement ids named by a test; 0 failures`; ownership `1 files changed by bundler between tranche/T23 and HEAD; 0 failures`.

**After B2 (subresources merged, K1116), `tranche/T23` merged (c0aa0ef99e), re-run:** proof tests 2, pass 2, fail 0, skipped 0 (deploybindings 37/0); `test/m/bundler/` 45/45; `test/m/subresources/` 36/36 (R35's interface test present); `test/m/` tests 5009, pass 4993, fail 4 (the same four, accepted by name), todo 12. Checks: format `87 modules, 86 requirements files; 0 failures`; architecture `0 failures`; coverage `23 of 23 live requirement ids named by a test; 0 failures`; ownership `2 files changed by bundler between tranche/T23 and HEAD; 0 failures`.

Size (session_01NUc9jtCVoKc7BZNT8zXv6u): test runs 10, module lines 13

## J1 · REPORT

N482 applied and pushed (456bf4498e): deploybindings' two D-54 source-text arms retired with a dated RETIRED note naming subresources R35 and plane R13; the deriveLimits arm stays. Proof green (deploybindings 37/0, fleetbundles no SKIP; bundler 45/45); test/m 4992 pass, 4 fail, all accepted by name (red 9 control-plane R36; red 2 membership R83/R79, promotion registry). All four checks 0 failures. No bundle input touched; no generated artifact stale. Waiting on your word that subresources has merged; then I merge tranche/T23, re-run, and post COMPLETE.

## J2 · COMPLETE

N482 done. tranche/T23 merged (c0aa0ef99e) after subresources' merge; proof green (deploybindings 37/0, fleetbundles no SKIP, bundler 45/45, subresources 36/36); test/m 4993 pass, 4 fail, all accepted by name (red 9, red 2); four checks 0 failures. No bundle input touched. Record: build/jobs/T23/bundler.md.

## B3 · CHANGE (K1118): a test wrote the committed plane bundle

**Cause.** `bio-plane/test/fleetbundles.control.mjs` (in bundler's `tests`): arms 5 and 8 ran a real `npm run build` (agent-worker, pdf-worker, then the plane), which writes each committed `dist/` artifact and manifest through `writeMember`. With the plane's bundle stale on the tranche (accepted red 12), arm 8 rewrote `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`. A lone `fleetbundles.test.mjs` never writes (it verifies through `verifyStatic`/`verifyFresh`, R10).

**Fix.** Arms 5 and 8 now rebuild in memory: `buildMember(member, {write: false})` and `manifestFrom` (the pair `writeMember` writes), compared byte for byte with the committed artifact and manifest. They make the same over-strictness claim and write nothing, and they now say a stale artifact is stale ("DIFFERS from the committed …") where the old arm 8 hid it by rewriting it. The driver awaits each arm; the header states that nothing in it writes a committed artifact.

**Proof.** A full run of the set in one `node --test` (`test/m/bundler/`, `system/bundle`, `deploybindings`, `fleetbundles`, `resolveversion`, `fleetbundles.control.mjs`): tests 50, pass 49, fail 1, skipped 0, then `git status` shows only my edit to the control file (no `dist/` change). The one red is `fleetbundles.test.mjs`: 94 pass, 4 fail, all four `bio-plane:` staleness assertions, which is accepted red 12 until L1's close regenerates the bundle. Arms 5 and 8 alone: agent-worker and pdf-worker byte-identical; bio-plane DIFFERS (stale, as expected); tree unchanged. `tranche/T23` merged before this. `test/m/`: tests 5018, pass 5002, fail 4 (the same four, accepted by name), todo 12. Checks: format `87 modules, 86 requirements files; 0 failures`; architecture `19 product files, 46 relative imports (8 naming no tracked file, not judged); 0 failures`; coverage `23 of 23 live requirement ids named by a test; 0 failures`; ownership `2 files changed by bundler between tranche/T23 and HEAD; 0 failures`.

**Flaw left open, for BOB (not mine alone to settle).** The control file's other arms edit real sources (each restored by content and sha256). Its header says it must never be run by `node --test` beside the suites, because it rewrites the tree under them. But `modules.json` lists it in bundler's `tests`, so running the set in one `node --test` runs it in parallel with `fleetbundles.test.mjs`, which can then see an armed source. My proposal: drop `bio-plane/test/fleetbundles.control.mjs` from bundler's `tests` in `modules.json` (it is a negative-control driver run by hand, `node test/fleetbundles.control.mjs [arm]`, and names no requirement id), or keep it and have it refuse under `node --test`. `modules.json` is BOB's.

Size (session_01NUc9jtCVoKc7BZNT8zXv6u): test runs 16, module lines 68

## J4 · COMPLETE

B3 done. Cause: fleetbundles.control.mjs arms 5 and 8 ran a real npm run build (writeMember), rewriting the committed dist/ wherever stale. Fix: they rebuild in memory (buildMember write:false + manifestFrom) and compare byte for byte; nothing writes. Proof: the full set in one node --test, 49/50 (the one red is fleetbundles' four bio-plane staleness assertions, accepted red 12), then git status clean but for my edit. tranche/T23 merged; test/m 5002 pass, 4 fail (accepted by name); four checks 0 failures. Open, for you: the control's other arms edit real sources (restored), and its header says it must never run under node --test, yet modules.json lists it in bundler's tests, so a set run puts it beside fleetbundles.test.mjs. Proposal: drop it from bundler's tests (a hand-run driver naming no R id), or have it refuse under node --test. Record: build/jobs/T23/bundler.md.

## B4 · CHANGE (K1120): the control refuses under the test runner

`bio-plane/test/fleetbundles.control.mjs` stays in bundler's `tests`. Run by `node --test` (which sets `NODE_TEST_CONTEXT` in each file's process), it now exits 0 at once, after its imports and before making its pen or touching any file, printing one line: `fleetbundles.control.mjs: a hand-run negative control, not a test; run it alone: node test/fleetbundles.control.mjs [arm]`. The header says so too. `tranche/T23` merged first (f32dd9d74d).

**Proof.** `node --test bio-plane/test/fleetbundles.control.mjs` prints that line, pass 1, fail 0. The full set in one `node --test`: tests 50, pass 49, fail 1, skipped 0. The one red is `fleetbundles.test.mjs` (94 pass, 4 fail, all four `bio-plane:` staleness assertions, accepted red 12). `git status` after it shows only my edit to the control file. A hand run of arm 10b (`node test/fleetbundles.control.mjs 10b` in `bio-plane/`) still runs: the arm fires as declared ("no (j) assertion fired: true"), its restore is verified by content and sha256, the pen is removed, and the tree is unchanged. Checks: format, architecture, coverage (`23 of 23`) and ownership each report 0 failures (lines above in B3's, unchanged in form).

Size (session_01NUc9jtCVoKc7BZNT8zXv6u): test runs 20, module lines 77
