# doorbell (T51)

**Status** · session_01C6MLP8YoCGd3BrWthJxfJ5 · depth 2 · COMPLETE · handled B0

## Completion (T51-182, the words pass; session_01C6MLP8YoCGd3BrWthJxfJ5)

**Entries applied.** T51-182 (the words findings in `build/plan/words-pass/doorbell.md`):
- The 13 `plain` findings, all judged member-readable (each a refusal's `detail`, a `basis`, an evidence sentence, a capture method label or a pseudonym's note), each now `localize("doorbell.<stem>.<slug>", en, vars)` in `src/doorbell/door.mjs` (1) and `src/doorbell/index.mjs` (12). No REPORT of a string no member reads: none was found.
- The 10 conversion findings (1 handlist, 9 test copies): `rows.test.mjs` hand-list of capture's codes now comes from `CAPTURE.CAPTURE_CHECKS`; the C-118 and C-85 expectations now read each row's translation as `EXPECT` (new `test/m/doorbell/expect.mjs`: `word(key)` or `localize(id, en)` per row, the product's own ids), compared by equality, not by copied text; `doorbell.test.mjs`, `t35.test.mjs` and `knock-origin.test.mjs` compare the same way; `knock-origin`'s signal fixture is now a neutral token (`origin member`); `t35`'s `these bytes` assertion compares with `localize` filled from the inbox row.
- The 5 `code` test copies: the same comparison, in the same files.

**Deferred.** `test/m/doorbell/knocker.test.mjs:205` holds a regular-expression fragment of the `these bytes were received` sentence. The words check does not count it (zero findings), so I left it; BOB may want it converted with the rest of R13's test copies.
**Not mine (seen in the repository-wide run).** `checks/run.mjs /home/user/bio` reports failures in other modules (wizard-scripts and others); none names doorbell. `setup-words/build.mjs --check` reports `rows.mjs` stale (the expected note); no refusal names doorbell.
**For BOB.** `expect.mjs` holds one `localize` id the product does not use (`doorbell.checks.group_can_see`), to name the sentence every refusal shares (R9). Its text is the product's own, so the test compares with it; a row for it would change nothing.

**Checks.** `node checks/words.mjs /home/user/bio doorbell`: 0 failures (was 27). `node checks/format.mjs /home/user/bio`: 0 failures. `node checks/architecture.mjs /home/user/bio doorbell`: 0 failures. `node checks/coverage.mjs /home/user/bio doorbell`: 25 of 25 live ids named by a test, 0 failures. `node checks/ownership.mjs /home/user/bio doorbell tranche/T51 job/T51/doorbell`: 0 failures. `node --test bio-plane/test/m/doorbell/`: 73 of 73 pass.

**Size (session_01C6MLP8YoCGd3BrWthJxfJ5): test runs 3, module lines 1144**
