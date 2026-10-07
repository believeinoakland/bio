# record-core (T35)

**Status** · session_017vQLzkn2zJ8X6s82ZjqvLM · depth 2 · COMPLETE · handled B1

## Completion (RECORD-CORE #18)

**Entry applied: T35-13** (N655, K1754, DEC-49; N664's sweep, DEC-149; R25 amended, R81 and R82 new, BOB's wording).

- **R81.** `ANONYMOUS_LEASE` (R10, R61) and the four `setSetting` refusals (R25) now answer `{ok: false, reason, code, check, translation, detail}` under this module's own rows, with DEC-49 regions `is-anonymous-lease` (`#anonymousLease`, the one function that refuses for both `acquireLease` and `releaseLease`) and `is-setting-refused` (`setSetting`). `ANONYMOUS_LEASE`'s detail is today's sentence, unchanged. Each `SETTING_*` detail is one fixed sentence naming what was missing or wrong and saying nothing was recorded; `SETTING_INVALID` keeps `name`. R25's refusal order and R11's `{ok: false, heldBy, until}` are unchanged.
- **Row numbers (the job's choice, K174: the next free numbers of C-102, which this module holds; no other T35 job's branch or requirements claims C-102.28 or later):** C-102.28 `ANONYMOUS_LEASE`, C-102.29 `SETTING_NAME_REQUIRED`, C-102.30 `SETTING_BY_REQUIRED`, C-102.31 `SETTING_VALUE_REQUIRED`, C-102.32 `SETTING_INVALID`.
- **R82.** All 26 sweep rows applied as the draft words them. `BUILD_FAULT` (`checks.mjs`:33) now reads "This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record changed.", which moves the sixteen translations. C-102.13 and C-102.14 now end with the same constant and read the same. C-59.6, C-59.8 and C-102.25 say "whoever hosts your group's Civicsmith". C-102.17 and C-102.18 say "its figures". `mintExhausted`'s detail (`index.mjs`:129) now begins "your group's Civicsmith could not find a free … id". A test checks that every translation and detail this module answers is free of copy, instance, plane and server. Comments, codes and field names are unchanged.

**Rows awaiting stamp (for promotion's T35 layer-2 stamp, T35-16):** C-102.28, C-102.29, C-102.30, C-102.31 and C-102.32 are new and awaiting stamp. These rows' translations moved and are awaiting stamp: C-59.6, C-59.7, C-59.8, C-59.9, C-102.1, C-102.2, C-102.13, C-102.14, C-102.15, C-102.16, C-102.17, C-102.18, C-102.19, C-102.20, C-102.21, C-102.22, C-102.23, C-102.24, C-102.25, C-102.26, C-102.27. C-102.3, C-59.5, C-75 and C-132 are unchanged.

**Deferred.** None.

**Found in other modules** (sent in the REPORT inside COMPLETE). I checked the tests of all 79 modules that use record-core on this branch and on `tranche/T35` @ `ef11113220`. Every fail below that is not listed here is red on the tranche too (accepted reds 2, 5, 6, 8, 14). Two tests are newly red. Both pin wording that R82 moves:
1. control-plane `catalogue-end.test.mjs` (R43, R22) pins the digest of each decorated code's translation (`rows-before-r43.json`). It first fails at `AUDIT_CHECK_DECLARED` C-102.1, and every row R82 moves will differ. Control-plane's own job (T35-72) has to re-pin it, as it does `lease.test.mjs` (red 7). `lease.test.mjs` itself is not red on this branch's run.
2. sources `contract.test.mjs`:108 (R1) pins `mintExhausted("SRC")`'s old detail "the plane could not find a free source id: …". Sources' next job needs to re-pin it to "your group's Civicsmith could not find a free source id: every one it drew was already taken. Nothing was written."
3. Generated artifacts made stale: `case-checker/program.mjs` and the plane bundle embed record-core (rule 7, regenerated at L2's close). `newgroup/src/release.mjs` is the frozen 0.79.0 release embed and is left as it is.

**Tests and checks**
- record-core `node --test bio-plane/test/m/record-core/`: tests 163, pass 163, fail 0 (new: `t35.test.mjs`, 32 tests, one per sweep row among them). Negative control: with `BUILD_FAULT` put back, `t35.test.mjs` gives 8 pass, 24 fail.
- `bio-plane/test/stats-disclosure.test.mjs`: 36 pass, 0 fail.
- Dependants (79 modules): baseline 17 fails, branch 19 fails. The only additions are the two tests in "Found" above.
- `checks/format.mjs`: 129 modules, 128 requirements files, 0 failures. `architecture.mjs record-core`: 0 failures. `coverage.mjs record-core`: 82 of 82 live ids named by a test, 0 failures. `ownership.mjs record-core tranche/T35`: 6 files, 0 failures.

Size (session_017vQLzkn2zJ8X6s82ZjqvLM): test runs 10, module lines 2291
