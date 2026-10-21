# doorbell (T51)

**Status** · session_01M3qW5twDUffgj9DdAeC1Tc · depth 2 · WORKING · handled B2

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

## J1 · COMPLETE

T51-182 done: the 13 plain findings and the 10 conversion findings are fixed (commit e8ac15435f on job/T51/doorbell). words check 0 failures (was 27); format, architecture, coverage and ownership 0 failures; doorbell tests 73 of 73 pass. Open for BOB: knocker.test.mjs:205 holds a regex fragment of a product sentence (not counted by the check, left as is); expect.mjs uses one localize id not used by the product (doorbell.checks.group_can_see). Record: build/jobs/T51/doorbell.md, Completion section.

## CHANGE (K3982) · re-completion

Merged `tranche/T51`. Both open points closed:
1. `knocker.test.mjs`: the regular-expression copy of the `these bytes` sentence is now an equality with the product's own `localize("doorbell.index.these_bytes_were_received_at", en, vars)`, the vars read from the inbox row and the pull's inputs.
2. `expect.mjs`: the minted `doorbell.checks.group_can_see` constant is deleted. The tests that held it now read `EXPECT[code]` (the product's own key per row) by equality; the shared sentence is no longer asserted on its own.
Also `rows.test.mjs` uses a plain token ("changed translation") in place of the deleted constant.

**Checks:** `node checks/words.mjs /home/user/bio doorbell`: 0 failures. `node --test bio-plane/test/m/doorbell/`: 73 of 73 pass. format, architecture, coverage (25 of 25) and ownership (8 files, 0 failures) all 0 failures. `setup-words/build.mjs --check`: the stale-rows note only, no refusal naming doorbell.

**Not mine (seen in the repository-wide run, reported to BOB under P9):** `provenance/register-checks.test.mjs:186,196` copies the doorbell's sentences; `control-plane/doorbell.test.mjs:296,514` and `screens-entry/front.test.mjs:55` hand-list ops and keys.

**Size (session_01C6MLP8YoCGd3BrWthJxfJ5): test runs 4, module lines 1144**

## J2 · COMPLETE

CHANGE K3982 done (commit d09363a33a on job/T51/doorbell, tranche/T51 merged). (1) knocker.test.mjs:205 now compares asserts by equality with the product's localize call, vars from the inbox row. (2) expect.mjs's minted doorbell.checks.group_can_see is deleted; tests read EXPECT[code] by equality. words check doorbell: 0 failures; doorbell tests 73/73; format, architecture, coverage, ownership 0 failures; setup-words check: stale-rows note only. Reported under P9, not mine: provenance/register-checks.test.mjs:186,196 copy doorbell sentences; control-plane/doorbell.test.mjs:296,514 and screens-entry/front.test.mjs:55 hand-list keys/ops. Record: build/jobs/T51/doorbell.md, CHANGE section.
