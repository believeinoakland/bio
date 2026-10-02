# subresources (T23)

**Status** · session_01KN7hP9aoKoxenKuTv1wa7b · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** · N482 (K1020; fold 2, K1113): R35. The code already met it (`SUBRESOURCE_CAP` = 400, `captureSubresources`' default `cap`), so no source change; a new interface test, `R35: called without cap, …` in `bio-plane/test/m/subresources/subresources.test.mjs`, calls the service with no `cap` on a page naming 457 distinct same-origin body images (no reuse, no platform ceiling) and asserts exactly 400 distinct `fetchOne` calls, 57 records `{ok:false, reason:"CAP_REACHED", cap:400}` none of them fetched, `attempted` 400, `manifest.truncated` true, `manifest.limits.cap` 400, `manifest.complete` false. No source text is read. Mutation check: with the default changed to 450 the test fails (1 fail), restored.

**R35's mark** · `*(not yet met: T23)*` in `build/requirements/subresources.md` is BOB's to strike at the merge (not this job's path).

**Deferred** · none.

**Other modules** · none found. No bundle input touched (test only): nothing stale for `pdf-worker` or `ocr-worker`. bundler may now retire `deploybindings.test.mjs`'s source-text arm on `SUBRESOURCE_CAP` (plan L1, bundler).

**Tests and checks**
- `node --test bio-plane/test/m/subresources/`: tests 36, pass 36, fail 0.
- `node --test bio-plane/test/m/`: tests 5009, pass 4993, fail 4, todo 12. The four reds, all accepted: membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58 (accepted red 2, `MODULE_ORDER`); control-plane `inbox-door.test.mjs`:81 R36 (accepted red by name in its title, K1105, until capture's N499 merge in L3).
- `checks/format.mjs`: 87 modules, 85 requirements files; 0 failures.
- `checks/architecture.mjs … subresources`: 2 product files, 2 relative imports; 0 failures.
- `checks/coverage.mjs … subresources`: 35 of 35 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … subresources tranche/T23`: 1 file changed; 0 failures.

Size (session_01KN7hP9aoKoxenKuTv1wa7b): test runs 3, module lines 2069

## J1 · COMPLETE

N482 applied: R35 met. The code already had SUBRESOURCE_CAP = 400 as captureSubresources' default cap; a new interface test (R35, bio-plane/test/m/subresources/subresources.test.mjs) calls it without cap on 457 distinct references and asserts exactly 400 fetchOne calls, 57 CAP_REACHED records with cap 400, manifest.truncated true. No source change, no bundle input touched. Bundler may now retire deploybindings.test.mjs's source-text arm. Strike R35's 'not yet met' mark at the merge. subresources tests 36/36 pass; bio-plane/test/m 4993 pass, 4 fail, all accepted (MODULE_ORDER x3, control-plane R36 per K1105). format, architecture, coverage (35/35), ownership: 0 failures. Record: build/jobs/T23/subresources.md.
